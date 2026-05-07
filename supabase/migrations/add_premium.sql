-- Add premium / Stripe subscription fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium              BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS premium_expires_at      TIMESTAMPTZ;

-- Allow the service-role key (used by the webhook) to update these fields
-- RLS is already enabled; the webhook calls supabase with the service role
-- so it bypasses RLS automatically — no extra policy needed.
