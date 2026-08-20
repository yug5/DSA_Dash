-- ============================================================
-- ONBOARDING STATE MIGRATION
-- Safe to run on existing Supabase databases (idempotent).
-- Adds onboarding tracking and daily target to profiles.
-- ============================================================

-- Add onboarding_completed flag (NULL = not started, FALSE = not finished, TRUE = done)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add daily_question_target so we have a fast denormalized read
-- without joining goals. The goals table remains authoritative.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_question_target INT DEFAULT 5;

-- Back-fill existing users who already have dsa_experience set:
-- treat them as having completed onboarding so they aren't forced
-- through the flow again.
UPDATE public.profiles
  SET onboarding_completed = TRUE
  WHERE dsa_experience IS NOT NULL
    AND (onboarding_completed IS NULL OR onboarding_completed = FALSE);
