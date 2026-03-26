import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_fake',
    STRIPE_WEBHOOK_SECRET: 'whsec_fake',
    STRIPE_PRO_PRICE_ID: 'price_pro_123',
    STRIPE_BUSINESS_PRICE_ID: 'price_biz_456',
  },
}));

vi.mock('$lib/server/queries/users', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

const mockStripeInstance = {
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
  billingPortal: { sessions: { create: vi.fn() } },
  webhooks: { constructEvent: vi.fn() },
  subscriptions: { retrieve: vi.fn() },
};

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      customers = mockStripeInstance.customers;
      checkout = mockStripeInstance.checkout;
      billingPortal = mockStripeInstance.billingPortal;
      webhooks = mockStripeInstance.webhooks;
      subscriptions = mockStripeInstance.subscriptions;
    },
  };
});

describe('priceIdToTier', () => {
  it('maps pro price id to pro', async () => {
    const { priceIdToTier } = await import('./stripe');
    expect(priceIdToTier('price_pro_123')).toBe('pro');
  });

  it('maps business price id to business', async () => {
    const { priceIdToTier } = await import('./stripe');
    expect(priceIdToTier('price_biz_456')).toBe('business');
  });

  it('maps unknown price id to free', async () => {
    const { priceIdToTier } = await import('./stripe');
    expect(priceIdToTier('price_unknown')).toBe('free');
  });
});

describe('getOrCreateCustomer', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns existing customer id without calling stripe', async () => {
    const { getUserById } = await import('$lib/server/queries/users');
    vi.mocked(getUserById).mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'x',
      displayName: null,
      tier: 'free',
      stripeCustomerId: 'cus_existing',
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { getOrCreateCustomer, stripe } = await import('./stripe');
    const result = await getOrCreateCustomer('user_1', 'test@example.com');

    expect(result).toBe('cus_existing');
    expect(stripe.customers.create).not.toHaveBeenCalled();
  });

  it('creates customer when none exists', async () => {
    const { getUserById, updateUser } = await import(
      '$lib/server/queries/users'
    );
    vi.mocked(getUserById).mockResolvedValue({
      id: 'user_2',
      email: 'new@example.com',
      username: 'new',
      passwordHash: 'x',
      displayName: null,
      tier: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { getOrCreateCustomer, stripe } = await import('./stripe');
    vi.mocked(stripe.customers.create).mockResolvedValue({
      id: 'cus_new',
    } as any);

    const result = await getOrCreateCustomer('user_2', 'new@example.com');

    expect(result).toBe('cus_new');
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'new@example.com',
      metadata: { userId: 'user_2' },
    });
    expect(updateUser).toHaveBeenCalledWith('user_2', {
      stripeCustomerId: 'cus_new',
    });
  });
});
