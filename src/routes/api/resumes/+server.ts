import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, parseJson, logRequest } from '$lib/server/api';
import {
  getResumesByUserId,
  createResumeWithVersion,
  countResumesByUserId,
} from '$lib/server/queries/resumes';
import { validateResume } from '$lib/jobl';
import { getMaxResumes } from '$lib/tier';

export const GET: RequestHandler = async (event) => {
  const user = requireAuth(event);
  const resumes = await getResumesByUserId(user.id);

  const summaries = resumes.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    theme: r.theme,
    isPublished: r.isPublished,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  logRequest('GET', '/api/resumes', user.id, 200);
  return json(summaries);
};

export const POST: RequestHandler = async (event) => {
  const user = requireAuth(event);
  const body = await parseJson(event.request) as Record<string, unknown>;

  const maxResumes = getMaxResumes(user.tier);
  const count = await countResumesByUserId(user.id);
  if (count >= maxResumes) {
    logRequest('POST', '/api/resumes', user.id, 403);
    return json(
      { error: 'Resume limit reached.', code: 'RESUME_LIMIT' },
      { status: 403 }
    );
  }

  const { title, slug, theme, joblContent } = body as {
    title?: string;
    slug?: string;
    theme?: string;
    joblContent?: unknown;
  };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    logRequest('POST', '/api/resumes', user.id, 400);
    return json({ error: 'title is required' }, { status: 400 });
  }

  const resolvedSlug = slug ?? title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!joblContent) {
    logRequest('POST', '/api/resumes', user.id, 400);
    return json({ error: 'joblContent is required' }, { status: 400 });
  }

  const validation = validateResume(joblContent);
  if (!validation.success) {
    logRequest('POST', '/api/resumes', user.id, 400);
    return json(
      { error: 'invalid jobl content', details: validation.errors },
      { status: 400 }
    );
  }

  const { resume, version } = await createResumeWithVersion({
    userId: user.id,
    title: title.trim(),
    slug: resolvedSlug,
    theme: theme ?? 'classic',
    joblContent: validation.data,
  });

  logRequest('POST', '/api/resumes', user.id, 201);
  return json(
    {
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      theme: resume.theme,
      isPublished: resume.isPublished,
      joblContent: resume.joblContent,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      version: version.versionNumber,
    },
    { status: 201 }
  );
};
