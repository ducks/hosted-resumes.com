import type { PageServerLoad } from './$types';
import { getPublishedResume } from '$lib/server/queries/resumes';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, setHeaders }) => {
  const { tenantUser } = await parent();

  const resume = await getPublishedResume(tenantUser.id);
  if (!resume) {
    throw error(404, 'No published resume');
  }

  setHeaders({
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  });

  return {
    resume: {
      data: resume.joblContent,
      theme: resume.theme,
    },
  };
};
