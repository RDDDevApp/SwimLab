-- ============================================================
-- Migration 011: NUCLEAR RESET - Drop ALL policies, recreate from scratch
--
-- Run this SINGLE file in Supabase SQL Editor.
-- It replaces ALL previous RLS policies regardless of current state.
-- Tables and data are NOT touched - only policies and functions.
-- ============================================================

-- ============================================================
-- STEP 1: DROP EVERY SINGLE POLICY ON EVERY TABLE
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- clubs
DROP POLICY IF EXISTS "Club members can view their club" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can view clubs" ON clubs;
DROP POLICY IF EXISTS "Coaches can create clubs" ON clubs;
DROP POLICY IF EXISTS "Club owner can update club" ON clubs;

-- club_members
DROP POLICY IF EXISTS "Club members can view other members" ON club_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON club_members;
DROP POLICY IF EXISTS "Club owners can view all members" ON club_members;
DROP POLICY IF EXISTS "Users can join clubs" ON club_members;

-- groups
DROP POLICY IF EXISTS "Club members can view groups" ON groups;
DROP POLICY IF EXISTS "Coaches can create groups" ON groups;
DROP POLICY IF EXISTS "Coach can update own groups" ON groups;
DROP POLICY IF EXISTS "Coach can delete own groups" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_coach_manage" ON groups;
DROP POLICY IF EXISTS "groups_coach_delete" ON groups;
DROP POLICY IF EXISTS "groups_coach_all" ON groups;
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;

-- group_coaches
DROP POLICY IF EXISTS "group_coaches_select" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_insert" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_delete" ON group_coaches;

-- group_members
DROP POLICY IF EXISTS "Group members and coach can view" ON group_members;
DROP POLICY IF EXISTS "Coach can manage group members" ON group_members;
DROP POLICY IF EXISTS "Coach can remove group members" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- training_slots
DROP POLICY IF EXISTS "Group members can view slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can create slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can update own slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can delete own slots" ON training_slots;
DROP POLICY IF EXISTS "training_slots_select" ON training_slots;
DROP POLICY IF EXISTS "training_slots_coach_manage" ON training_slots;
DROP POLICY IF EXISTS "training_slots_coach_all" ON training_slots;
DROP POLICY IF EXISTS "Coaches can manage their training slots" ON training_slots;

-- workouts
DROP POLICY IF EXISTS "Coach can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Swimmers can view assigned published workouts" ON workouts;
DROP POLICY IF EXISTS "Coach can create workouts" ON workouts;
DROP POLICY IF EXISTS "Coach can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Coach can delete own workouts" ON workouts;

-- workout_assignments
DROP POLICY IF EXISTS "Coach and swimmers can view assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Coach can view own slot assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Swimmers can view group assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Coach can create assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Coach can update assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Coach can delete assignments" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_select" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_insert" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_update" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_delete" ON workout_assignments;

-- workout_sessions
DROP POLICY IF EXISTS "Swimmer can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Coach can view group sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Coach can create sessions (attendance)" ON workout_sessions;
DROP POLICY IF EXISTS "Swimmer can update own session (feedback)" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_swimmer_select" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_coach_select" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_coach_insert" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_swimmer_update" ON workout_sessions;

-- ============================================================
-- STEP 2: ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: CREATE ALL HELPER FUNCTIONS (SECURITY DEFINER)
-- These bypass RLS to prevent cross-table recursion.
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_club_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT club_id FROM club_members WHERE user_id = p_user_id; $$;

CREATE OR REPLACE FUNCTION get_coach_club_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT club_id FROM club_members WHERE user_id = p_user_id AND role = 'coach'; $$;

CREATE OR REPLACE FUNCTION get_coach_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT group_id FROM group_coaches WHERE coach_id = p_user_id; $$;

CREATE OR REPLACE FUNCTION get_member_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT group_id FROM group_members WHERE user_id = p_user_id; $$;

CREATE OR REPLACE FUNCTION count_coaches_in_group(p_group_id UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT COUNT(*)::INTEGER FROM group_coaches WHERE group_id = p_group_id; $$;

CREATE OR REPLACE FUNCTION get_coach_training_slot_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT ts.id FROM training_slots ts
  WHERE ts.group_id IN (SELECT group_id FROM group_coaches WHERE coach_id = p_user_id);
$$;

CREATE OR REPLACE FUNCTION get_member_training_slot_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT ts.id FROM training_slots ts
  WHERE ts.group_id IN (SELECT group_id FROM group_members WHERE user_id = p_user_id);
$$;

CREATE OR REPLACE FUNCTION get_coach_assignment_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT wa.id FROM workout_assignments wa
  JOIN training_slots ts ON wa.training_slot_id = ts.id
  WHERE ts.group_id IN (SELECT group_id FROM group_coaches WHERE coach_id = p_user_id);
$$;

-- ============================================================
-- STEP 4: PROFILES POLICIES (simple, no cross-table refs)
-- ============================================================

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- ============================================================
-- STEP 5: CLUBS POLICIES
-- ============================================================

CREATE POLICY "clubs_select" ON clubs
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "clubs_insert" ON clubs
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "clubs_update" ON clubs
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- STEP 6: CLUB_MEMBERS POLICIES
-- ============================================================

CREATE POLICY "club_members_select_own" ON club_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "club_members_select_as_owner" ON club_members
  FOR SELECT TO authenticated USING (
    club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())
  );

CREATE POLICY "club_members_insert" ON club_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================
-- STEP 7: GROUPS POLICIES
-- Uses get_user_club_ids / get_coach_club_ids (SECURITY DEFINER)
-- ============================================================

CREATE POLICY "groups_select" ON groups
  FOR SELECT TO authenticated USING (
    club_id IN (SELECT get_user_club_ids(auth.uid()))
  );

CREATE POLICY "groups_insert" ON groups
  FOR INSERT TO authenticated WITH CHECK (
    club_id IN (SELECT get_coach_club_ids(auth.uid()))
  );

CREATE POLICY "groups_update" ON groups
  FOR UPDATE TO authenticated USING (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  ) WITH CHECK (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "groups_delete" ON groups
  FOR DELETE TO authenticated USING (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- STEP 8: GROUP_COACHES POLICIES
-- The critical table! All refs via SECURITY DEFINER.
-- ============================================================

CREATE POLICY "group_coaches_select" ON group_coaches
  FOR SELECT TO authenticated USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    OR group_id IN (SELECT get_member_group_ids(auth.uid()))
  );

CREATE POLICY "group_coaches_insert" ON group_coaches
  FOR INSERT TO authenticated WITH CHECK (
    coach_id = auth.uid()
    OR group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "group_coaches_delete" ON group_coaches
  FOR DELETE TO authenticated USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    AND count_coaches_in_group(group_id) > 1
  );

-- ============================================================
-- STEP 9: GROUP_MEMBERS POLICIES
-- ============================================================

CREATE POLICY "group_members_select" ON group_members
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "group_members_insert" ON group_members
  FOR INSERT TO authenticated WITH CHECK (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "group_members_delete" ON group_members
  FOR DELETE TO authenticated USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- STEP 10: TRAINING_SLOTS POLICIES
-- ============================================================

CREATE POLICY "training_slots_select" ON training_slots
  FOR SELECT TO authenticated USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    OR group_id IN (SELECT get_member_group_ids(auth.uid()))
  );

CREATE POLICY "training_slots_manage" ON training_slots
  FOR ALL TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  )
  WITH CHECK (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- STEP 11: WORKOUTS POLICIES (simple, coach_id direct)
-- ============================================================

CREATE POLICY "workouts_select" ON workouts
  FOR SELECT TO authenticated USING (coach_id = auth.uid());

CREATE POLICY "workouts_insert" ON workouts
  FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());

CREATE POLICY "workouts_update" ON workouts
  FOR UPDATE TO authenticated USING (coach_id = auth.uid());

CREATE POLICY "workouts_delete" ON workouts
  FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ============================================================
-- STEP 12: WORKOUT_ASSIGNMENTS POLICIES
-- ============================================================

CREATE POLICY "workout_assignments_select" ON workout_assignments
  FOR SELECT TO authenticated USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
    OR training_slot_id IN (SELECT get_member_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_insert" ON workout_assignments
  FOR INSERT TO authenticated WITH CHECK (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_update" ON workout_assignments
  FOR UPDATE TO authenticated USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_delete" ON workout_assignments
  FOR DELETE TO authenticated USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

-- ============================================================
-- STEP 13: WORKOUT_SESSIONS POLICIES
-- ============================================================

CREATE POLICY "workout_sessions_select_swimmer" ON workout_sessions
  FOR SELECT TO authenticated USING (swimmer_id = auth.uid());

CREATE POLICY "workout_sessions_select_coach" ON workout_sessions
  FOR SELECT TO authenticated USING (
    workout_assignment_id IN (SELECT get_coach_assignment_ids(auth.uid()))
  );

CREATE POLICY "workout_sessions_insert" ON workout_sessions
  FOR INSERT TO authenticated WITH CHECK (
    workout_assignment_id IN (SELECT get_coach_assignment_ids(auth.uid()))
  );

CREATE POLICY "workout_sessions_update" ON workout_sessions
  FOR UPDATE TO authenticated USING (swimmer_id = auth.uid());

-- ============================================================
-- STEP 14: VERIFICATION - Run this to confirm everything is clean
-- ============================================================

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
