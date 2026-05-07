-- Run this in the Supabase SQL editor to add refill tracking columns.
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS refill_alert_days INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS needs_refill BOOLEAN NOT NULL DEFAULT FALSE;
