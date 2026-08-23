-- Adaptive DSA Practice Platform Database Schema
-- Supabase PostgreSQL Migration

-- 1. PROFILES
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

-- 2. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TOPIC PREREQUISITES
CREATE TABLE IF NOT EXISTS public.topic_prerequisites (
  topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
  prerequisite_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, prerequisite_id)
);

-- 4. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  leetcode_id INT UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  leetcode_url TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,
  estimated_time INT DEFAULT 20,
  primary_topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  secondary_topics TEXT[] DEFAULT '{}',
  concept_tags TEXT[] DEFAULT '{}',
  pattern TEXT,
  sync_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER TOPIC MASTERY
CREATE TABLE IF NOT EXISTS public.user_topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(5,2) DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  rating NUMERIC(6,2) DEFAULT 1000.0 CHECK (rating >= 0 AND rating <= 2000),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

-- 6. UNRESOLVED GAPS
CREATE TABLE IF NOT EXISTS public.unresolved_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  concept_tags TEXT[] DEFAULT '{}',
  origin_question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  origin_difficulty TEXT CHECK (origin_difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,
  failure_reason TEXT,
  used_help BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'OPEN',
  severity INT DEFAULT 1,
  reinforcement_attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_touched_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 7. GOALS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_target INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_target INT NOT NULL,
  total_completed INT DEFAULT 0,
  status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTEMPTS
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  result TEXT CHECK (result IN ('SOLVED_INDEPENDENTLY', 'SOLVED_WITH_HELP', 'DID_NOT_SOLVE')) NOT NULL,
  failure_reason TEXT CHECK (failure_reason IN ('TOO_DIFFICULT', 'DID_NOT_UNDERSTAND', 'DID_NOT_KNOW_CONCEPT', 'DID_NOT_KNOW_APPROACH', 'RAN_OUT_OF_TIME', 'OTHER')),
  used_help BOOLEAN DEFAULT FALSE,
  time_spent INT DEFAULT 0,
  notes TEXT,
  mastery_change NUMERIC(5,2) DEFAULT 0,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DAILY ACTIVITY
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  target INT NOT NULL,
  questions_attempted INT DEFAULT 0,
  questions_completed INT DEFAULT 0,
  target_completed BOOLEAN DEFAULT FALSE,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- 10. STREAKS
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_practice_date DATE,
  available_freezes INT DEFAULT 2,
  last_freezer_milestone INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. XP TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  source TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SYNC LOG
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  questions_synced INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question_id ON public.attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON public.attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_mastery_user_id ON public.user_topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_gaps_user_status ON public.unresolved_gaps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unresolved_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR USER-SPECIFIC TABLES
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own mastery" ON public.user_topic_mastery FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own gaps" ON public.unresolved_gaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own attempts" ON public.attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own activity" ON public.daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own xp" ON public.xp_transactions FOR ALL USING (auth.uid() = user_id);

-- PUBLIC READ-ONLY POLICIES FOR CATALOG TABLES
CREATE POLICY "Anyone can read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Anyone can read prerequisites" ON public.topic_prerequisites FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);

