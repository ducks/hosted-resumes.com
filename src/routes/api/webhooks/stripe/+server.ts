import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  stripe,
  constructWebhookEvent,
  priceIdToTier,
} from '$lib/server/stripe';
import { updateUser } from '$lib/server/queries/users';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return json({ error: 'missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return json({ error: 'invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price?.id;

      await updateUser(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        tier: priceId ? priceIdToTier(priceId) : 'free',
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price?.id;
      const status = subscription.status;

      const tier =
        status === 'unpaid' || status === 'incomplete_expired'
          ? 'free'
          : priceId
            ? priceIdToTier(priceId)
            : 'free';

      await updateUser(userId, {
        subscriptionStatus: status,
        tier,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await updateUser(userId, {
        stripeSubscriptionId: null,
        subscriptionStatus: 'canceled',
        tier: 'free',
      });
      break;
    }
  }

  return json({ received: true });
};
