-- ==============================================================================
-- AIspire Supabase PostgreSQL Schema with Row Level Security (RLS)
-- Run this in your Supabase SQL Editor to provision the database tables and policies.
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  education_level TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  target_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSESSMENTS TABLE (Supports Resuming Unfinished Tests)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  current_question INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ASSESSMENT SCORES TABLE (7-Dimensional Deterministic Aptitude Profile)
CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  analytical NUMERIC NOT NULL DEFAULT 0,
  creative NUMERIC NOT NULL DEFAULT 0,
  technical NUMERIC NOT NULL DEFAULT 0,
  social_healthcare NUMERIC NOT NULL DEFAULT 0,
  management NUMERIC NOT NULL DEFAULT 0,
  research NUMERIC NOT NULL DEFAULT 0,
  communication NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, assessment_id)
);

-- 4. CAREER RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.career_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id TEXT NOT NULL,
  match_score INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROADMAP PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id TEXT NOT NULL,
  step_id INT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, career_id, step_id)
);

-- 6. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 7. AI CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce auth.uid() = user_id on every single user-owned table.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can select their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Assessments Policies
CREATE POLICY "Users can select their own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON public.assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Assessment Scores Policies
CREATE POLICY "Users can select their own assessment scores"
  ON public.assessment_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment scores"
  ON public.assessment_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment scores"
  ON public.assessment_scores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessment scores"
  ON public.assessment_scores FOR DELETE
  USING (auth.uid() = user_id);

-- Career Results Policies
CREATE POLICY "Users can select their own career results"
  ON public.career_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career results"
  ON public.career_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career results"
  ON public.career_results FOR DELETE
  USING (auth.uid() = user_id);

-- Roadmap Progress Policies
CREATE POLICY "Users can select their own roadmap progress"
  ON public.roadmap_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap progress"
  ON public.roadmap_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmap progress"
  ON public.roadmap_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmap progress"
  ON public.roadmap_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks Policies
CREATE POLICY "Users can select their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- AI Chat History Policies
CREATE POLICY "Users can select their own chat history"
  ON public.ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON public.ai_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history"
  ON public.ai_chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- 8. AI REQUEST LOG TABLE (Database-Backed Rate Limiting & Cooldown Protection)
CREATE TABLE IF NOT EXISTS public.ai_request_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_request_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own AI request log"
  ON public.ai_request_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own AI request log"
  ON public.ai_request_log FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- PERFORMANCE & RATE LIMITING INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_request_log_user_created ON public.ai_request_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_created ON public.ai_chat_history(user_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_assessments_user_created ON public.assessments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_user_created ON public.assessment_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_career ON public.roadmap_progress(user_id, career_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_assessments_updated_at ON public.assessments;
CREATE TRIGGER set_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

