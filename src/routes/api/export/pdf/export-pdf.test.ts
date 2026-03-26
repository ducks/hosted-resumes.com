import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules before importing the handler
vi.mock('$env/dynamic/private', () => ({
  env: { PDF_SERVICE_URL: 'http://localhost:3001' },
}));

vi.mock('$lib/server/queries/resumes', () => ({
  getResumeById: vi.fn(),
}));

vi.mock('$lib/server/render-resume', () => ({
  renderResume: vi.fn(() => '<html><body>rendered</body></html>'),
}));

vi.mock('$lib/server/pdf', async () => {
  const actual = await vi.importActual<typeof import('$lib/server/pdf')>(
    '$lib/server/pdf'
  );
  return {
    ...actual,
    generatePdf: vi.fn(),
  };
});

import { POST } from './+server';
import { getResumeById } from '$lib/server/queries/resumes';
import { generatePdf, PdfServiceError } from '$lib/server/pdf';

const mockedGetResume = vi.mocked(getResumeById);
const mockedGeneratePdf = vi.mocked(generatePdf);

function makeEvent(options: {
  user?: { id: string; email: string; username: string; tier: string } | null;
  body?: unknown;
}) {
  const user = options.user ?? null;
  const bodyJson = JSON.stringify(options.body ?? {});

  return {
    locals: { user, route: 'app' as const },
    request: new Request('http://localhost/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyJson,
    }),
    params: {},
    url: new URL('http://localhost/api/export/pdf'),
  } as Parameters<typeof POST>[0];
}

const testUser = {
  id: 'user_1',
  email: 'test@example.com',
  username: 'testuser',
  tier: 'pro',
};

const testResume = {
  id: 'resume_1',
  userId: 'user_1',
  slug: 'my-resume',
  title: 'My Resume',
  theme: 'classic',
  isPublished: true,
  joblContent: {
    jobl_version: '1.0',
    person: { name: 'Test User' },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/export/pdf', () => {
  it('should return 401 when not authenticated', async () => {
    try {
      await POST(makeEvent({ user: null, body: { resumeId: 'x' } }));
      expect.unreachable('should have thrown');
    } catch (response) {
      // requireAuth throws a json Response
      const res = response as Response;
      expect(res.status).toBe(401);
    }
  });

  it('should return 400 when resumeId is missing', async () => {
    const response = await POST(
      makeEvent({ user: testUser, body: {} })
    );
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('resumeId');
  });

  it('should return 404 when resume does not exist', async () => {
    mockedGetResume.mockResolvedValueOnce(undefined);

    const response = await POST(
      makeEvent({ user: testUser, body: { resumeId: 'nonexistent' } })
    );
    expect(response.status).toBe(404);
  });

  it('should return 404 for resume owned by another user (tenant isolation)', async () => {
    // getResumeById with userId filter returns undefined for non-owner
    mockedGetResume.mockResolvedValueOnce(undefined);

    const response = await POST(
      makeEvent({ user: testUser, body: { resumeId: 'other_resume' } })
    );
    expect(response.status).toBe(404);

    // Verify that userId was passed for tenant isolation
    expect(mockedGetResume).toHaveBeenCalledWith('other_resume', 'user_1');
  });

  it('should return 502 when pdf service is unavailable', async () => {
    mockedGetResume.mockResolvedValueOnce(testResume);
    mockedGeneratePdf.mockRejectedValueOnce(
      new PdfServiceError('pdf service unavailable', 502)
    );

    const response = await POST(
      makeEvent({ user: testUser, body: { resumeId: 'resume_1' } })
    );
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error).toContain('pdf service');
  });

  it('should return PDF with correct headers on success', async () => {
    mockedGetResume.mockResolvedValueOnce(testResume);
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockedGeneratePdf.mockResolvedValueOnce(
      new Response(pdfBytes, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
    );

    const response = await POST(
      makeEvent({ user: testUser, body: { resumeId: 'resume_1' } })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain(
      'my-resume.pdf'
    );
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('should respect theme override', async () => {
    const { renderResume } = await import('$lib/server/render-resume');
    const mockedRender = vi.mocked(renderResume);

    mockedGetResume.mockResolvedValueOnce(testResume);
    mockedGeneratePdf.mockResolvedValueOnce(
      new Response(new Uint8Array([0x25]), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
    );

    await POST(
      makeEvent({
        user: testUser,
        body: { resumeId: 'resume_1', theme: 'modern' },
      })
    );

    expect(mockedRender).toHaveBeenCalledWith(
      testResume.joblContent,
      'modern'
    );
  });
});
