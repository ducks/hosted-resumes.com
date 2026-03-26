import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, parseJson, logRequest } from '$lib/server/api';
import {
  getResumeById,
  updateResumeWithVersion,
  deleteResume,
} from '$lib/server/queries/resumes';
import { validateResume, validatePartial } from '$lib/jobl';

export const GET: RequestHandler = async (event) => {
  const user = requireAuth(event);
  const { id } = event.params;

  const resume = await getResumeById(id, user.id);
  if (!resume) {
    logRequest('GET', `/api/resumes/${id}`, user.id, 404);
    return json({ error: 'not found' }, { status: 404 });
  }

  logRequest('GET', `/api/resumes/${id}`, user.id, 200);
  return json({
    id: resume.id,
    slug: resume.slug,
    title: resume.title,
    theme: resume.theme,
    isPublished: resume.isPublished,
    joblContent: resume.joblContent,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  });
};

export const PUT: RequestHandler = async (event) => {
  const user = requireAuth(event);
  const { id } = event.params;
  const body = await parseJson(event.request) as Record<string, unknown>;

  const existing = await getResumeById(id, user.id);
  if (!existing) {
    logRequest('PUT', `/api/resumes/${id}`, user.id, 404);
    return json({ error: 'not found' }, { status: 404 });
  }

  const { title, slug, theme, isPublished, joblContent } = body as {
    title?: string;
    slug?: string;
    theme?: string;
    isPublished?: boolean;
    joblContent?: unknown;
  };

  if (joblContent !== undefined) {
    const partial = event.url.searchParams.get('partial') === 'true';
    const validation = partial
      ? validatePartial(joblContent)
      : validateResume(joblContent);
    if (!validation.success) {
      logRequest('PUT', `/api/resumes/${id}`, user.id, 400);
      return json(
        { error: 'invalid jobl content', details: validation.errors },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) updateData.slug = slug;
  if (theme !== undefined) updateData.theme = theme;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (joblContent !== undefined) updateData.joblContent = joblContent;

  try {
    const { resume, version } = await updateResumeWithVersion(
      id,
      user.id,
      updateData,
    );

    logRequest('PUT', `/api/resumes/${id}`, user.id, 200);
    return json({
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      theme: resume.theme,
      isPublished: resume.isPublished,
      joblContent: resume.joblContent,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      version: version?.versionNumber ?? null,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'resume not found') {
      logRequest('PUT', `/api/resumes/${id}`, user.id, 404);
      return json({ error: 'not found' }, { status: 404 });
    }
    throw err;
  }
};

export const DELETE: RequestHandler = async (event) => {
  const user = requireAuth(event);
  const { id } = event.params;

  const existing = await getResumeById(id, user.id);
  if (!existing) {
    logRequest('DELETE', `/api/resumes/${id}`, user.id, 404);
    return json({ error: 'not found' }, { status: 404 });
  }

  await deleteResume(id, user.id);

  logRequest('DELETE', `/api/resumes/${id}`, user.id, 204);
  return new Response(null, { status: 204 });
};
