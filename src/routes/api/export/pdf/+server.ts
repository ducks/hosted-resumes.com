import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, parseJson, logRequest } from '$lib/server/api';
import { getResumeById } from '$lib/server/queries/resumes';
import { renderResume } from '$lib/server/render-resume';
import { generatePdf, PdfServiceError } from '$lib/server/pdf';
import { canExportPdf } from '$lib/tier';

export const POST: RequestHandler = async (event) => {
  const user = requireAuth(event);

  if (!canExportPdf(user.tier)) {
    logRequest('POST', '/api/export/pdf', user.id, 403);
    return json(
      { error: 'PDF export requires Pro or Business tier.', code: 'PDF_TIER_REQUIRED' },
      { status: 403 }
    );
  }

  const body = await parseJson(event.request) as Record<string, unknown>;

  const resumeId = body.resumeId;
  if (!resumeId || typeof resumeId !== 'string') {
    logRequest('POST', '/api/export/pdf', user.id, 400);
    return json(
      { error: 'resumeId is required' },
      { status: 400 }
    );
  }

  const themeOverride = body.theme;
  if (themeOverride !== undefined && typeof themeOverride !== 'string') {
    logRequest('POST', '/api/export/pdf', user.id, 400);
    return json(
      { error: 'theme must be a string' },
      { status: 400 }
    );
  }

  const resume = await getResumeById(resumeId, user.id);
  if (!resume) {
    logRequest('POST', '/api/export/pdf', user.id, 404);
    return json({ error: 'not found' }, { status: 404 });
  }

  const themeId = themeOverride ?? resume.theme;
  const joblContent = resume.joblContent as Record<string, unknown>;

  let html: string;
  try {
    html = renderResume(
      joblContent as Parameters<typeof renderResume>[0],
      themeId
    );
  } catch (err) {
    console.error('render failed:', err);
    logRequest('POST', '/api/export/pdf', user.id, 500);
    return json(
      { error: 'failed to render resume' },
      { status: 500 }
    );
  }

  let pdfResponse: Response;
  try {
    pdfResponse = await generatePdf(html);
  } catch (err) {
    if (err instanceof PdfServiceError) {
      console.error('pdf service error:', err.message);
      logRequest('POST', '/api/export/pdf', user.id, err.status);
      return json(
        { error: err.message },
        { status: err.status }
      );
    }
    throw err;
  }

  const filename = sanitizeFilename(resume.title) + '.pdf';

  logRequest('POST', '/api/export/pdf', user.id, 200);

  return new Response(pdfResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
};

// Strips non-ASCII and filesystem-unsafe characters from the resume
// title. Falls back to "resume" if the result is empty.
function sanitizeFilename(title: string): string {
  const clean = title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return clean || 'resume';
}
