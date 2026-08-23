-- Migration: Streak Freezer & Milestone Tracking
-- Safe and idempotent: creates table if missing, or adds columns if table already exists.

-- 1. Ensure public.profiles table exists & has freezer columns (default 2 for new users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  dsa_experience TEXT CHECK (dsa_experience IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  available_freezes INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS available_freezes INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS last_freezer_milestone INT DEFAULT 0;

ALTER TABLE public.profiles 
  ALTER COLUMN available_freezes SET DEFAULT 2;

-- 2. Ensure public.streaks table exists & has freezer columns (default 2 for new users)
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_practice_date DATE,
  available_freezes INT DEFAULT 2,
  last_freezer_milestone INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.streaks 
  ADD COLUMN IF NOT EXISTS available_freezes INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS last_freezer_milestone INT DEFAULT 0;

ALTER TABLE public.streaks 
  ALTER COLUMN available_freezes SET DEFAULT 2;

-- 3. Enable RLS & set policy on public.streaks
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'streaks' AND policyname = 'Users can manage their own streaks'
  ) THEN
    CREATE POLICY "Users can manage their own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
