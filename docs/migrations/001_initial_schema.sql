-- ============================================
-- SWIMLAB V0 - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('coach', 'swimmer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. CLUBS TABLE
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  invitation_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_invitation_code ON clubs(invitation_code);
CREATE INDEX IF NOT EXISTS idx_clubs_owner_id ON clubs(owner_id);

-- 3. CLUB_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'swimmer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_role ON club_members(role);

-- 4. GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'competition')),
  schedule_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_club_id ON groups(club_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);

-- 5. GROUP_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- 6. TRAINING_SLOTS TABLE
CREATE TABLE IF NOT EXISTS training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_slots_group_id ON training_slots(group_id);
CREATE INDEX IF NOT EXISTS idx_training_slots_coach_id ON training_slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_slots_day_of_week ON training_slots(day_of_week);

-- 7. WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('endurance', 'sprint', 'technique', 'recovery', 'other')),
  description TEXT,
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  total_distance INTEGER,
  estimated_duration INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_club_id ON workouts(club_id);
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON workouts(coach_id);
CREATE INDEX IF NOT EXISTS idx_workouts_type ON workouts(type);
CREATE INDEX IF NOT EXISTS idx_workouts_is_published ON workouts(is_published);
CREATE INDEX IF NOT EXISTS idx_workouts_content ON workouts USING GIN (content);

-- 8. WORKOUT_ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  training_slot_id UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  attendance_marked BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(training_slot_id, scheduled_date)
);

CREATE INDEX IF NOT EXISTS idx_workout_assignments_workout_id ON workout_assignments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_training_slot_id ON workout_assignments(training_slot_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_scheduled_date ON workout_assignments(scheduled_date);

-- 9. WORKOUT_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_assignment_id UUID NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
  swimmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attended BOOLEAN NOT NULL DEFAULT false,
  rpe_score INTEGER CHECK (rpe_score >= 6 AND rpe_score <= 20),
  feedback_text TEXT,
  performances JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workout_assignment_id, swimmer_id)
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_assignment_id ON workout_sessions(workout_assignment_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_swimmer_id ON workout_sessions(swimmer_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_attended ON workout_sessions(attended);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_rpe_score ON workout_sessions(rpe_score);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_slots_updated_at
  BEFORE UPDATE ON training_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- CLUBS POLICIES
CREATE POLICY "Club members can view their club" ON clubs
  FOR SELECT USING (
    id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
    OR owner_id = auth.uid()
  );

CREATE POLICY "Coaches can create clubs" ON clubs
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Club owner can update club" ON clubs
  FOR UPDATE USING (auth.uid() = owner_id);

-- CLUB_MEMBERS POLICIES
CREATE POLICY "Club members can view other members" ON club_members
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join clubs" ON club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GROUPS POLICIES
CREATE POLICY "Club members can view groups" ON groups
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can create groups" ON groups
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Coach can update own groups" ON groups
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coach can delete own groups" ON groups
  FOR DELETE USING (auth.uid() = coach_id);

-- GROUP_MEMBERS POLICIES
CREATE POLICY "Group members and coach can view" ON group_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE coach_id = auth.uid())
  );

CREATE POLICY "Coach can manage group members" ON group_members
  FOR INSERT WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE coach_id = auth.uid())
  );

CREATE POLICY "Coach can remove group members" ON group_members
  FOR DELETE USING (
    group_id IN (SELECT id FROM groups WHERE coach_id = auth.uid())
  );

-- TRAINING_SLOTS POLICIES
CREATE POLICY "Group members can view slots" ON training_slots
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coach can create slots" ON training_slots
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach can update own slots" ON training_slots
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coach can delete own slots" ON training_slots
  FOR DELETE USING (auth.uid() = coach_id);

-- WORKOUTS POLICIES
CREATE POLICY "Coach can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Swimmers can view assigned published workouts" ON workouts
  FOR SELECT USING (
    is_published = true
    AND id IN (
      SELECT wa.workout_id FROM workout_assignments wa
      JOIN training_slots ts ON wa.training_slot_id = ts.id
      JOIN group_members gm ON ts.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coach can create workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Coach can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = coach_id);

-- WORKOUT_ASSIGNMENTS POLICIES
CREATE POLICY "Coach and swimmers can view assignments" ON workout_assignments
  FOR SELECT USING (
    training_slot_id IN (
      SELECT ts.id FROM training_slots ts
      JOIN groups g ON ts.group_id = g.id
      WHERE g.coach_id = auth.uid()
    )
    OR training_slot_id IN (
      SELECT ts.id FROM training_slots ts
      JOIN group_members gm ON ts.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coach can create assignments" ON workout_assignments
  FOR INSERT WITH CHECK (
    training_slot_id IN (
      SELECT id FROM training_slots WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coach can update assignments" ON workout_assignments
  FOR UPDATE USING (
    training_slot_id IN (
      SELECT id FROM training_slots WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coach can delete assignments" ON workout_assignments
  FOR DELETE USING (
    training_slot_id IN (
      SELECT id FROM training_slots WHERE coach_id = auth.uid()
    )
  );

-- WORKOUT_SESSIONS POLICIES
CREATE POLICY "Swimmer can view own sessions" ON workout_sessions
  FOR SELECT USING (swimmer_id = auth.uid());

CREATE POLICY "Coach can view group sessions" ON workout_sessions
  FOR SELECT USING (
    workout_assignment_id IN (
      SELECT wa.id FROM workout_assignments wa
      JOIN training_slots ts ON wa.training_slot_id = ts.id
      WHERE ts.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coach can create sessions (attendance)" ON workout_sessions
  FOR INSERT WITH CHECK (
    workout_assignment_id IN (
      SELECT wa.id FROM workout_assignments wa
      JOIN training_slots ts ON wa.training_slot_id = ts.id
      WHERE ts.coach_id = auth.uid()
    )
  );

CREATE POLICY "Swimmer can update own session (feedback)" ON workout_sessions
  FOR UPDATE USING (swimmer_id = auth.uid());

-- ============================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'swimmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DONE!
-- ============================================
-- Your SwimLab database is now ready.
-- 9 tables created with RLS policies.
