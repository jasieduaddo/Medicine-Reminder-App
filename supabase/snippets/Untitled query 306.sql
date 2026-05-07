<<<<<<< HEAD
-- Smart Medication Reminder Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  unit TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medications" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medications" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,0}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view schedules for their medications" ON schedules FOR SELECT USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can insert schedules for their medications" ON schedules FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can update schedules for their medications" ON schedules FOR UPDATE USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can delete schedules for their medications" ON schedules FOR DELETE USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );

-- Dose logs table
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on dose_logs
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own dose logs" ON dose_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dose logs" ON dose_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dose logs" ON dose_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dose logs" ON dose_logs FOR DELETE USING (auth.uid() = user_id);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_stock INTEGER DEFAULT 0,
  doses_per_intake INTEGER DEFAULT 1,
  low_stock_threshold INTEGER DEFAULT 10,
  last_refill_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medication_id ON schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON dose_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medication_id ON dose_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_inventory_medication_id ON inventory(medication_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
=======
-- Smart Medication Reminder Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  unit TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medications" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medications" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,0}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view schedules for their medications" ON schedules FOR SELECT USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can insert schedules for their medications" ON schedules FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can update schedules for their medications" ON schedules FOR UPDATE USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );
CREATE POLICY "Users can delete schedules for their medications" ON schedules FOR DELETE USING (
    EXISTS (SELECT 1 FROM medications WHERE medications.id = schedules.medication_id AND medications.user_id = auth.uid())
  );

-- Dose logs table
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on dose_logs
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own dose logs" ON dose_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dose logs" ON dose_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dose logs" ON dose_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dose logs" ON dose_logs FOR DELETE USING (auth.uid() = user_id);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_stock INTEGER DEFAULT 0,
  doses_per_intake INTEGER DEFAULT 1,
  low_stock_threshold INTEGER DEFAULT 10,
  last_refill_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medication_id ON schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON dose_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_medication_id ON dose_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_inventory_medication_id ON inventory(medication_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
>>>>>>> fa538c90397a576dcc211c424729f5863ac90cf8
