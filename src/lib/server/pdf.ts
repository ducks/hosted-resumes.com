import { env } from '$env/dynamic/private';

const PDF_TIMEOUT_MS = 30_000;

// Posts HTML to the Rust PDF service and returns the response.
// Throws on network errors or non-200 responses from the service.
export async function generatePdf(html: string): Promise<Response> {
  const serviceUrl = env.PDF_SERVICE_URL;
  if (!serviceUrl) {
    throw new PdfServiceError(
      'PDF_SERVICE_URL is not configured',
      503
    );
  }

  let response: Response;
  try {
    response = await fetch(`${serviceUrl}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: html,
      signal: AbortSignal.timeout(PDF_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new PdfServiceError('pdf service timed out', 504);
    }
    throw new PdfServiceError(
      'pdf service unavailable',
      502
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown error');
    throw new PdfServiceError(
      `pdf service returned ${response.status}: ${text}`,
      502
    );
  }

  return response;
}

export class PdfServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PdfServiceError';
    this.status = status;
  }
}
