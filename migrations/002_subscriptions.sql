-- 002: Add subscription columns to users table
--
-- Adds tier CHECK constraint, stripe_customer_id UNIQUE constraint,
-- and subscription_status column for Stripe integration.

BEGIN;

-- Add CHECK constraint on tier column
ALTER TABLE users
  ADD CONSTRAINT users_tier_check
  CHECK (tier IN ('free', 'pro', 'business'));

-- Add UNIQUE constraint on stripe_customer_id
ALTER TABLE users
  ADD CONSTRAINT users_stripe_customer_id_unique
  UNIQUE (stripe_customer_id);

-- Add subscription_status column
ALTER TABLE users
  ADD COLUMN subscription_status text;

COMMIT;
