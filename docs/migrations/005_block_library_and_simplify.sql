-- Migration 005: Block Library & Simplified Workout Structure
-- Replaces exercise_library and workout_templates with block_library
-- Simplifies workout content: Block > SubBlock (2 levels instead of 3)

-- 1. Create block_library table
CREATE TABLE IF NOT EXISTS block_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warmup', 'main', 'cooldown', 'other')),
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_distance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_block_library_club_id ON block_library(club_id);
CREATE INDEX IF NOT EXISTS idx_block_library_coach_id ON block_library(coach_id);

-- RLS
ALTER TABLE block_library ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own blocks
CREATE POLICY block_library_coach_all ON block_library
  FOR ALL
  TO authenticated
  USING (
    coach_id = auth.uid()
    OR club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (coach_id = auth.uid());

-- 2. Make workouts.type nullable (no longer required)
ALTER TABLE workouts ALTER COLUMN type DROP NOT NULL;
ALTER TABLE workouts ALTER COLUMN type SET DEFAULT NULL;

-- 3. Drop obsolete tables (exercise_library and workout_templates)
DROP TABLE IF EXISTS workout_templates;
DROP TABLE IF EXISTS exercise_library;
