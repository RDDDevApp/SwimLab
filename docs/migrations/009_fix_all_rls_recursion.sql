-- ============================================================
-- Migration 009: Fix ALL cross-table RLS recursion
--
-- Problem: group_coaches_select references group_members,
-- and group_members_select references group_coaches -> infinite loop.
-- Also, 14+ policies on other tables (groups, training_slots,
-- workout_assignments, workout_sessions) do SELECT/JOIN from
-- group_coaches, which triggers the same recursive chain.
--
-- Fix: Use SECURITY DEFINER functions everywhere to bypass RLS
-- when querying group_coaches or group_members from within policies.
-- ============================================================

-- ============================================================
-- 1. Create/replace SECURITY DEFINER helper functions
-- ============================================================

-- Returns group IDs where the user is a coach (bypasses RLS on group_coaches)
CREATE OR REPLACE FUNCTION get_coach_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM group_coaches WHERE coach_id = p_user_id;
$$;

-- Returns group IDs where the user is a member/swimmer (bypasses RLS on group_members)
CREATE OR REPLACE FUNCTION get_member_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM group_members WHERE user_id = p_user_id;
$$;

-- Returns coach count for a group (bypasses RLS on group_coaches)
CREATE OR REPLACE FUNCTION count_coaches_in_group(p_group_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM group_coaches WHERE group_id = p_group_id;
$$;

-- Returns training_slot IDs for groups where user is a coach
CREATE OR REPLACE FUNCTION get_coach_training_slot_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT ts.id FROM training_slots ts
  WHERE ts.group_id IN (SELECT group_id FROM group_coaches WHERE coach_id = p_user_id);
$$;

-- Returns training_slot IDs for groups where user is a swimmer
CREATE OR REPLACE FUNCTION get_member_training_slot_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT ts.id FROM training_slots ts
  WHERE ts.group_id IN (SELECT group_id FROM group_members WHERE user_id = p_user_id);
$$;

-- Returns workout_assignment IDs for groups where user is a coach
CREATE OR REPLACE FUNCTION get_coach_assignment_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT wa.id FROM workout_assignments wa
  JOIN training_slots ts ON wa.training_slot_id = ts.id
  WHERE ts.group_id IN (SELECT group_id FROM group_coaches WHERE coach_id = p_user_id);
$$;

-- Checks if a user is a coach member of the club that owns a given group
-- (bypasses RLS on groups and club_members)
CREATE OR REPLACE FUNCTION is_coach_in_group_club(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM groups g
    JOIN club_members cm ON cm.club_id = g.club_id
    WHERE g.id = p_group_id
    AND cm.user_id = p_user_id
    AND cm.role = 'coach'
  );
$$;

-- ============================================================
-- 2. Drop ALL policies that reference group_coaches or group_members
-- ============================================================

-- group_coaches policies
DROP POLICY IF EXISTS "group_coaches_select" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_insert" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_delete" ON group_coaches;

-- group_members policies
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- groups policies (coach manage/delete reference group_coaches)
DROP POLICY IF EXISTS "groups_coach_manage" ON groups;
DROP POLICY IF EXISTS "groups_coach_delete" ON groups;

-- training_slots policies
DROP POLICY IF EXISTS "training_slots_select" ON training_slots;
DROP POLICY IF EXISTS "training_slots_coach_manage" ON training_slots;

-- workout_assignments policies
DROP POLICY IF EXISTS "workout_assignments_select" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_insert" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_update" ON workout_assignments;
DROP POLICY IF EXISTS "workout_assignments_delete" ON workout_assignments;

-- workout_sessions policies
DROP POLICY IF EXISTS "workout_sessions_coach_select" ON workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_coach_insert" ON workout_sessions;

-- ============================================================
-- 3. Recreate group_coaches policies (NO raw subqueries)
-- ============================================================

CREATE POLICY "group_coaches_select"
  ON group_coaches FOR SELECT
  TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    OR group_id IN (SELECT get_member_group_ids(auth.uid()))
  );

CREATE POLICY "group_coaches_insert"
  ON group_coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      coach_id = auth.uid()
      OR group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
    )
    AND is_coach_in_group_club(group_coaches.group_id, COALESCE(group_coaches.coach_id, auth.uid()))
  );

CREATE POLICY "group_coaches_delete"
  ON group_coaches FOR DELETE
  TO authenticated
  USING (
    group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
    AND count_coaches_in_group(group_coaches.group_id) > 1
  );

-- ============================================================
-- 4. Recreate group_members policies (use get_coach_group_ids)
-- ============================================================

CREATE POLICY "group_members_select"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "group_members_insert"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "group_members_delete"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- 5. Recreate groups policies (coach manage/delete)
-- ============================================================

CREATE POLICY "groups_coach_manage"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  )
  WITH CHECK (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  );

CREATE POLICY "groups_coach_delete"
  ON groups FOR DELETE
  TO authenticated
  USING (
    id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- 6. Recreate training_slots policies
-- ============================================================

CREATE POLICY "training_slots_select"
  ON training_slots FOR SELECT
  TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    OR group_id IN (SELECT get_member_group_ids(auth.uid()))
  );

CREATE POLICY "training_slots_coach_manage"
  ON training_slots FOR ALL
  TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  )
  WITH CHECK (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );

-- ============================================================
-- 7. Recreate workout_assignments policies
-- ============================================================

CREATE POLICY "workout_assignments_select"
  ON workout_assignments FOR SELECT
  TO authenticated
  USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
    OR training_slot_id IN (SELECT get_member_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_insert"
  ON workout_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_update"
  ON workout_assignments FOR UPDATE
  TO authenticated
  USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

CREATE POLICY "workout_assignments_delete"
  ON workout_assignments FOR DELETE
  TO authenticated
  USING (
    training_slot_id IN (SELECT get_coach_training_slot_ids(auth.uid()))
  );

-- ============================================================
-- 8. Recreate workout_sessions policies (coach only)
-- ============================================================

CREATE POLICY "workout_sessions_coach_select"
  ON workout_sessions FOR SELECT
  TO authenticated
  USING (
    workout_assignment_id IN (SELECT get_coach_assignment_ids(auth.uid()))
  );

CREATE POLICY "workout_sessions_coach_insert"
  ON workout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    workout_assignment_id IN (SELECT get_coach_assignment_ids(auth.uid()))
  );
