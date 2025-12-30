-- MathMon Quest - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================
-- PROFILES TABLE
-- Stores trainer information and stats
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_name TEXT NOT NULL DEFAULT '',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  highest_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_problems_attempted INTEGER NOT NULL DEFAULT 0,
  daily_login_streak INTEGER NOT NULL DEFAULT 0,
  last_reward_claimed_date DATE,
  total_days_played INTEGER NOT NULL DEFAULT 0,
  last_played_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- CAUGHT_POKEMON TABLE
-- Stores Pokemon collection for each user
-- ============================================
CREATE TABLE caught_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name TEXT NOT NULL,
  pokemon_sprite TEXT NOT NULL,
  pokemon_artwork TEXT NOT NULL,
  pokemon_types TEXT[] NOT NULL,
  caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  caught_with_problem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_caught_pokemon_user_id ON caught_pokemon(user_id);
CREATE INDEX idx_caught_pokemon_pokemon_id ON caught_pokemon(user_id, pokemon_id);

-- Enable RLS
ALTER TABLE caught_pokemon ENABLE ROW LEVEL SECURITY;

-- RLS Policies for caught_pokemon
CREATE POLICY "Users can view own caught pokemon" ON caught_pokemon
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caught pokemon" ON caught_pokemon
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own caught pokemon" ON caught_pokemon
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER_ACHIEVEMENTS TABLE
-- Stores achievement progress for each user
-- ============================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create index
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- WORKSHEET_RESULTS TABLE
-- Stores completed worksheet results
-- ============================================
CREATE TABLE worksheet_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worksheet_id TEXT NOT NULL,
  worksheet_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  operation TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 3),
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_worksheet_results_user_id ON worksheet_results(user_id);
CREATE INDEX idx_worksheet_results_worksheet_id ON worksheet_results(user_id, worksheet_id);

-- Enable RLS
ALTER TABLE worksheet_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worksheet_results
CREATE POLICY "Users can view own worksheet results" ON worksheet_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own worksheet results" ON worksheet_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, trainer_name)
  VALUES (NEW.id, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply updated_at trigger to user_achievements
CREATE TRIGGER user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- OPTIONAL: Sample data for testing
-- ============================================
-- Uncomment these to add test data

-- INSERT INTO auth.users (id, email) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'test@example.com');

-- INSERT INTO profiles (id, trainer_name, xp, level) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Ash', 500, 2);
