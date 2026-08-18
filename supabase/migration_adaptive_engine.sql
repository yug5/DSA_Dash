-- ============================================================
-- ADAPTIVE DSA ENGINE — INCREMENTAL MIGRATION
-- Safe to run on an existing Supabase database.
-- Uses IF NOT EXISTS / DO $$ blocks to stay idempotent.
-- Does NOT recreate existing tables, policies, or data.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. questions: add leetcode_id (unique, nullable)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS leetcode_id INT;

-- Add UNIQUE constraint only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.questions'::regclass
      AND conname = 'questions_leetcode_id_key'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_leetcode_id_key UNIQUE (leetcode_id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 2. questions: add concept_tags (text array)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS concept_tags TEXT[] DEFAULT '{}';


-- ────────────────────────────────────────────────────────────
-- 3. questions: add sync_updated_at (timestamp)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS sync_updated_at TIMESTAMPTZ;


-- ────────────────────────────────────────────────────────────
-- 4. user_topic_mastery: add rating (Elo-style 0–2000)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.user_topic_mastery
  ADD COLUMN IF NOT EXISTS rating NUMERIC(6,2) DEFAULT 1000.0;

-- Add CHECK constraint only if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_topic_mastery'::regclass
      AND conname = 'user_topic_mastery_rating_check'
  ) THEN
    ALTER TABLE public.user_topic_mastery
      ADD CONSTRAINT user_topic_mastery_rating_check
      CHECK (rating >= 0 AND rating <= 2000);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 5. unresolved_gaps table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.unresolved_gaps (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id            TEXT        NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  concept_tags        TEXT[]      DEFAULT '{}',
  origin_question_id  TEXT        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  origin_difficulty   TEXT        NOT NULL CHECK (origin_difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  failure_reason      TEXT,
  used_help           BOOLEAN     DEFAULT FALSE,
  status              TEXT        DEFAULT 'OPEN'
                                  CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  severity            INT         DEFAULT 1,
  reinforcement_attempts INT      DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  last_touched_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

-- Index for fast per-user gap lookups filtered by status
CREATE INDEX IF NOT EXISTS idx_gaps_user_status
  ON public.unresolved_gaps (user_id, status);

-- RLS
ALTER TABLE public.unresolved_gaps ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'unresolved_gaps'
      AND policyname = 'Users can manage their own gaps'
  ) THEN
    CREATE POLICY "Users can manage their own gaps"
      ON public.unresolved_gaps
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 6. sync_log table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sync_log (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type         TEXT        NOT NULL,
  status            TEXT        NOT NULL,
  questions_synced  INT         DEFAULT 0,
  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- sync_log is internal / service-only; no user-level RLS needed.
-- Service role key (used by the sync endpoint) bypasses RLS automatically.


-- ────────────────────────────────────────────────────────────
-- 7. Performance indexes for Recommendation Engine & Filtering
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_primary_topic
  ON public.questions (primary_topic_id);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty
  ON public.questions (difficulty);

CREATE INDEX IF NOT EXISTS idx_attempts_user_created
  ON public.attempts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attempts_user_question
  ON public.attempts (user_id, question_id);

