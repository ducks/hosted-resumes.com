import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
  getResumesByUserId,
  countResumesByUserId,
  deleteResume,
} from '$lib/server/queries/resumes';
import { getMaxResumes } from '$lib/tier';

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
};
