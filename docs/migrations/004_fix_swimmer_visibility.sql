-- ============================================
-- Migration 004: Fix Swimmer Visibility
-- Run this in Supabase SQL Editor
-- ============================================
-- Problem: RLS policy chain on workout_assignments references training_slots
-- which has its own RLS, causing empty results for swimmers.
-- Solution: Add a SECURITY DEFINER function to bypass the RLS chain,
-- and fix the RLS policies to be more direct.

-- ============================================
-- 1. RPC function for swimmer assignment queries
-- ============================================
-- This function bypasses the RLS chain issue by running as DEFINER
CREATE OR REPLACE FUNCTION get_assignments_for_slots(
  p_slot_ids UUID[],
  p_start_date DATE,
  p_end_date DATE
)
RETURNS SETOF workout_assignments
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM workout_assignments
  WHERE training_slot_id = ANY(p_slot_ids)
    AND scheduled_date >= p_start_date
    AND scheduled_date <= p_end_date
  ORDER BY scheduled_date;
$$;

-- ============================================
-- 2. Fix workout_assignments RLS policy
-- ============================================
-- Drop old policies (idempotent)
DROP POLICY IF EXISTS "Coach and swimmers can view assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Coach can view own slot assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Swimmers can view group assignments" ON workout_assignments;

-- Separate policy for coaches (direct, no chain)
CREATE POLICY "Coach can view own slot assignments" ON workout_assignments
  FOR SELECT USING (
    training_slot_id IN (
      SELECT id FROM training_slots WHERE coach_id = auth.uid()
    )
  );

-- Separate policy for swimmers using a SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION get_swimmer_slot_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ts.id
  FROM training_slots ts
  INNER JOIN group_members gm ON ts.group_id = gm.group_id
  WHERE gm.user_id = p_user_id
    AND ts.is_active = true;
$$;

CREATE POLICY "Swimmers can view group assignments" ON workout_assignments
  FOR SELECT USING (
    training_slot_id IN (
      SELECT * FROM get_swimmer_slot_ids(auth.uid())
    )
  );

-- ============================================
-- 3. Fix workouts visibility for swimmers
-- ============================================
-- Drop old policies (idempotent)
DROP POLICY IF EXISTS "Swimmers can view assigned published workouts" ON workouts;
DROP POLICY IF EXISTS "Swimmers can view assigned workouts" ON workouts;

-- New policy: swimmers can view workouts assigned to their group's slots
-- Uses SECURITY DEFINER helper to avoid RLS chain
CREATE OR REPLACE FUNCTION get_swimmer_workout_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT wa.workout_id
  FROM workout_assignments wa
  INNER JOIN training_slots ts ON wa.training_slot_id = ts.id
  INNER JOIN group_members gm ON ts.group_id = gm.group_id
  WHERE gm.user_id = p_user_id;
$$;

CREATE POLICY "Swimmers can view assigned workouts" ON workouts
  FOR SELECT USING (
    id IN (SELECT * FROM get_swimmer_workout_ids(auth.uid()))
  );

-- ============================================
-- DONE! Swimmer calendar should now show sessions.
-- ============================================
