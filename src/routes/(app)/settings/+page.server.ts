import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, Actions } from './$types';
import { getUserById, getUserByUsername, updateUser } from '$lib/server/queries/users';
import { canUseCustomDomain, canExportPdf } from '$lib/tier';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await getUserById(locals.user!.id);
  const tier = user?.tier ?? 'free';
  return {
    displayName: user?.displayName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    tier,
    stripeCustomerId: user?.stripeCustomerId ?? null,
    subscriptionStatus: user?.subscriptionStatus ?? null,
    stripePrices: {
      pro: env.STRIPE_PRO_PRICE_ID ?? '',
      business: env.STRIPE_BUSINESS_PRICE_ID ?? '',
    },
    canUseCustomDomain: canUseCustomDomain(tier),
    canExportPdf: canExportPdf(tier),
  };
};

export const actions: Actions = {
  profile: async ({ request, locals }) => {
    const form = await request.formData();
    const displayName = form.get('displayName');
    const username = form.get('username');

    if (typeof displayName !== 'string' || typeof username !== 'string') {
      return fail(400, { error: 'Missing required fields.' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedUsername) {
      return fail(400, { error: 'Username is required.' });
    }

    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(trimmedUsername) && trimmedUsername.length > 1) {
      return fail(400, {
        error: 'Username must contain only lowercase letters, numbers, and hyphens.',
      });
    }

    if (trimmedUsername.length < 2 || trimmedUsername.length > 63) {
      return fail(400, {
        error: 'Username must be between 2 and 63 characters.',
      });
    }

    const existing = await getUserByUsername(trimmedUsername);
    if (existing && existing.id !== locals.user!.id) {
      return fail(400, { error: 'That username is already taken.' });
    }

    await updateUser(locals.user!.id, {
      displayName: trimmedDisplayName || null,
      username: trimmedUsername,
    });

    return { saved: true };
  },

  customDomain: async ({ request, locals }) => {
    if (!canUseCustomDomain(locals.user!.tier)) {
      return fail(403, { error: 'Custom domains require the Business tier.' });
    }

    const form = await request.formData();
    const domain = form.get('customDomain');
    if (typeof domain !== 'string' || !domain.trim()) {
      return fail(400, { error: 'A valid domain is required.' });
    }

    // Domain persistence would go here once the column exists.
    return { domainSaved: true };
  },
};
