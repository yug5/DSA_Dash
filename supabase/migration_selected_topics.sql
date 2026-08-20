-- ============================================================
-- GOAL TOPIC FILTERING MIGRATION
-- Safe to run on existing Supabase databases (idempotent).
-- Adds selected_topics array column to goals table.
-- ============================================================

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS selected_topics TEXT[] DEFAULT NULL;
