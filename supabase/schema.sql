-- MediMind Database Schema for Supabase
-- Run this in your Supabase SQL editor to set up all tables, RLS policies,
-- triggers, and indexes for the MediMind medication reminder application.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- Mirrors auth.users — one row per authenticated user.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id                                     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
  whatsapp_phone                         TEXT,
  whatsapp_api_key                       TEXT,
  browser_notifications_enabled          BOOLEAN     NOT NULL DEFAULT TRUE,
  whatsapp_notifications_enabled         BOOLEAN     NOT NULL DEFAULT TRUE,
  role                                   TEXT        NOT NULL DEFAULT 'user'
  CONSTRAINT role_check CHECK (role IN ('user', 'admin'))
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: delete own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- medications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medications (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  dosage              TEXT        NOT NULL,
  unit                TEXT        NOT NULL,
  instructions        TEXT,
  pharmacy_name       TEXT,
  pharmacy_phone      TEXT,
  prescribing_doctor  TEXT,
  prescription_number TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medications: select own"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "medications: insert own"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medications: update own"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "medications: delete own"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- schedules
-- Each medication can have many schedules (e.g. "08:00 Mon/Wed/Fri").
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id  UUID        NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  time           TEXT        NOT NULL,           -- "HH:MM" 24-hour
  days_of_week   INTEGER[]   NOT NULL DEFAULT '{}',  -- 0=Sun … 6=Sat
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Access is determined by ownership of the parent medication.
CREATE POLICY "schedules: select own"
  ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
        AND medications.user_id = auth.uid()
    )
  );

CREATE POLICY "schedules: insert own"
  ON schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
        AND medications.user_id = auth.uid()
    )
  );

CREATE POLICY "schedules: update own"
  ON schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
        AND medications.user_id = auth.uid()
    )
  );

CREATE POLICY "schedules: delete own"
  ON schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
        AND medications.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- dose_logs
-- Records every dose event (taken, missed, skipped, still pending).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dose_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id   UUID        NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  schedule_id     UUID        REFERENCES schedules(id) ON DELETE SET NULL,
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time  TIMESTAMPTZ NOT NULL,
  taken_time      TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dose_logs: select own"
  ON dose_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "dose_logs: insert own"
  ON dose_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dose_logs: update own"
  ON dose_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "dose_logs: delete own"
  ON dose_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- inventory
-- Tracks pill counts and refill information (one row per medication).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id        UUID        NOT NULL UNIQUE REFERENCES medications(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_stock        INTEGER     NOT NULL DEFAULT 0,
  doses_per_intake     INTEGER     NOT NULL DEFAULT 1,
  low_stock_threshold  INTEGER     NOT NULL DEFAULT 10,
  refill_alert_days    INTEGER     NOT NULL DEFAULT 3,
  needs_refill         BOOLEAN     NOT NULL DEFAULT FALSE,
  last_refill_date     DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory: select own"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "inventory: insert own"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inventory: update own"
  ON inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "inventory: delete own"
  ON inventory FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure existing auth users also have a profile row.
INSERT INTO public.profiles (id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- ---------------------------------------------------------------------------
-- Indexes for query performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_medications_user_id
  ON medications (user_id);

CREATE INDEX IF NOT EXISTS idx_schedules_medication_id
  ON schedules (medication_id);

CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id
  ON dose_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_dose_logs_medication_id
  ON dose_logs (medication_id);

CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time
  ON dose_logs (scheduled_time);

CREATE INDEX IF NOT EXISTS idx_dose_logs_status
  ON dose_logs (status);

CREATE INDEX IF NOT EXISTS idx_inventory_medication_id
  ON inventory (medication_id);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id
  ON inventory (user_id);
