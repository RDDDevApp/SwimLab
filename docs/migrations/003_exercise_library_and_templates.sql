-- Migration 003: Exercise Library & Workout Templates (Sprint 7 - V0.5)

-- Exercise Library: reusable exercises per club
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance INTEGER NOT NULL DEFAULT 100,
  stroke TEXT NOT NULL DEFAULT 'freestyle',
  intensity TEXT NOT NULL DEFAULT 'moderate',
  notes TEXT,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout Templates: save a workout structure as reusable template
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('endurance', 'sprint', 'technique', 'recovery', 'other')),
  description TEXT,
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  total_distance INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercise_library_club ON exercise_library(club_id);
CREATE INDEX idx_exercise_library_coach ON exercise_library(coach_id);
CREATE INDEX idx_workout_templates_club ON workout_templates(club_id);
CREATE INDEX idx_workout_templates_coach ON workout_templates(coach_id);

-- RLS Policies: exercise_library
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their club exercises"
  ON exercise_library FOR SELECT
  USING (
    club_id IN (
      SELECT cm.club_id FROM club_members cm WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create exercises for their club"
  ON exercise_library FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = auth.uid() AND cm.role = 'coach'
    )
  );

CREATE POLICY "Coaches can update their own exercises"
  ON exercise_library FOR UPDATE
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their own exercises"
  ON exercise_library FOR DELETE
  USING (coach_id = auth.uid());

-- RLS Policies: workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their club templates"
  ON workout_templates FOR SELECT
  USING (
    club_id IN (
      SELECT cm.club_id FROM club_members cm WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create templates for their club"
  ON workout_templates FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = auth.uid() AND cm.role = 'coach'
    )
  );

CREATE POLICY "Coaches can update their own templates"
  ON workout_templates FOR UPDATE
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their own templates"
  ON workout_templates FOR DELETE
  USING (coach_id = auth.uid());
