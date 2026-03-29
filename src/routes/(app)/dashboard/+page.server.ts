import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
  getResumesByUserId,
  countResumesByUserId,
  deleteResume,
  createResume,
} from '$lib/server/queries/resumes';
import { getMaxResumes } from '$lib/tier';
import { syncFromRepo, extractResumeTitle } from '$lib/repo-sync';
import { createId } from '@paralleldrive/cuid2';

export const load: PageServerLoad = async ({ locals }) => {
  const tier = locals.user!.tier;
  const resumes = await getResumesByUserId(locals.user!.id);
  const resumeCount = await countResumesByUserId(locals.user!.id);
  return {
    resumes,
    resumeCount,
    tier,
    maxResumes: getMaxResumes(tier),
  };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const form = await request.formData();
    const resumeId = form.get('resumeId');
    if (typeof resumeId !== 'string') {
      return fail(400, { error: 'Missing resume ID' });
    }
    await deleteResume(resumeId, locals.user!.id);
    return { deleted: true };
  },

  importFromRepo: async ({ request, locals }) => {
    const form = await request.formData();
    const repoUrl = form.get('repoUrl');
    const repoPath = form.get('repoPath');
    const repoBranch = form.get('repoBranch') || 'main';
    const theme = form.get('theme') || 'classic';

    if (typeof repoUrl !== 'string' || !repoUrl) {
      return fail(400, { error: 'Repository URL is required' });
    }
    if (typeof repoPath !== 'string' || !repoPath) {
      return fail(400, { error: 'File path is required' });
    }

    // Check if user is at their resume limit
    const tier = locals.user!.tier;
    const maxResumes = getMaxResumes(tier);
    const currentCount = await countResumesByUserId(locals.user!.id);
    if (currentCount >= maxResumes) {
      return fail(403, { error: 'Resume limit reached. Upgrade to create more resumes.' });
    }

    // Sync from repo
    const result = await syncFromRepo({
      repoUrl,
      repoPath,
      repoBranch: typeof repoBranch === 'string' ? repoBranch : 'main',
    });

    if (!result.success || !result.joblContent) {
      return fail(400, { error: result.error || 'Failed to sync from repository' });
    }

    // Extract title and create slug
    const title = extractResumeTitle(result.joblContent);
    const slug = createId();

    // Create the resume
    const resume = await createResume({
      id: createId(),
      userId: locals.user!.id,
      title,
      slug,
      theme: typeof theme === 'string' ? theme : 'classic',
      joblContent: result.joblContent,
      isPublished: false,
      sourceType: 'repo',
      repoUrl,
      repoPath,
      repoBranch: typeof repoBranch === 'string' ? repoBranch : 'main',
      lastSyncedAt: new Date(),
    });

    return { success: true, resumeId: resume.id };
  },
};
