import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createCheckoutSession } from '$lib/server/stripe';

const VALID_PRICE_IDS = new Set([
  env.STRIPE_PRO_PRICE_ID,
  env.STRIPE_BUSINESS_PRICE_ID,
]);

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, { status: 400 });
  }

  const { priceId } = body as { priceId?: string };
  if (!priceId || !VALID_PRICE_IDS.has(priceId)) {
    return json({ error: 'invalid price id' }, { status: 400 });
  }

  const baseUrl = env.PUBLIC_BASE_URL || 'http://localhost:5173';

  const url = await createCheckoutSession({
    userId: locals.user.id,
    email: locals.user.email,
    priceId,
    successUrl: `${baseUrl}/settings?checkout=success`,
    cancelUrl: `${baseUrl}/settings?checkout=canceled`,
  });

  return json({ url });
};
