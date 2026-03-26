import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getUserById } from '$lib/server/queries/users';
import { createBillingPortalSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await getUserById(locals.user.id);
  if (!user?.stripeCustomerId) {
    return json(
      { error: 'no billing account found' },
      { status: 400 }
    );
  }

  const baseUrl = env.PUBLIC_BASE_URL || 'http://localhost:5173';

  const url = await createBillingPortalSession(
    user.stripeCustomerId,
    `${baseUrl}/settings`
  );

  return json({ url });
};
