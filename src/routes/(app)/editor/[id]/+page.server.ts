import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getResumeById, updateResumeWithVersion } from '$lib/server/queries/resumes';
import { getAllThemes } from '$lib/themes';
import { canAccessTheme, getThemesForTier as getTierThemeIds } from '$lib/tier';

export const load: PageServerLoad = async ({ params, locals }) => {
  const resume = await getResumeById(params.id, locals.user!.id);
  if (!resume) {
    throw error(404, 'Resume not found');
  }

  const tier = locals.user!.tier;
  const allowedThemeIds = getTierThemeIds(tier);

  // Fall back to 'classic' for rendering if stored theme is not
  // allowed on the current tier. Does NOT change the DB value so
  // re-upgrading restores the original selection.
  const effectiveTheme = canAccessTheme(tier, resume.theme)
    ? resume.theme
    : 'classic';

  const allThemes = getAllThemes().map((t) => ({
    ...t.meta,
    locked: !allowedThemeIds.includes(t.meta.id),
  }));

  return {
    resume: {
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      theme: effectiveTheme,
      storedTheme: resume.theme,
      isPublished: resume.isPublished,
      joblContent: resume.joblContent,
    },
    allThemes,
    tier,
  };
};

export const actions: Actions = {
  theme: async ({ request, params, locals }) => {
    const form = await request.formData();
    const theme = form.get('theme');
    if (typeof theme !== 'string') {
      return fail(400, { error: 'Missing theme' });
    }

    if (!canAccessTheme(locals.user!.tier, theme)) {
      return fail(403, { error: 'Theme not available for your tier' });
    }

    try {
      await updateResumeWithVersion(params.id, locals.user!.id, { theme });
    } catch (err) {
      if (err instanceof Error && err.message === 'resume not found') {
        throw error(404, 'Resume not found');
      }
      throw err;
    }

    return { theme };
  },
};
