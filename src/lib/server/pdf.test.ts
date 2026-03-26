import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePdf, PdfServiceError } from './pdf';

// Mock $env/dynamic/private
vi.mock('$env/dynamic/private', () => ({
  env: { PDF_SERVICE_URL: 'http://localhost:3001' },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('generatePdf', () => {
  it('should post HTML to the pdf service', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockFetch.mockResolvedValueOnce(
      new Response(pdfBytes, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
    );

    const response = await generatePdf('<html>test</html>');
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/render',
      expect.objectContaining({
        method: 'POST',
        body: '<html>test</html>',
      })
    );
  });

  it('should throw PdfServiceError with 502 on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    try {
      await generatePdf('<html></html>');
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PdfServiceError);
      expect((err as PdfServiceError).status).toBe(502);
      expect((err as PdfServiceError).message).toMatch(/pdf service unavailable/);
    }
  });

  it('should throw PdfServiceError with 502 on non-200 response', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('bad request', { status: 400 })
    );

    try {
      await generatePdf('<html></html>');
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PdfServiceError);
      expect((err as PdfServiceError).status).toBe(502);
    }
  });
});
