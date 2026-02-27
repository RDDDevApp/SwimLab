-- ============================================================
-- Migration 008: Fix infinite recursion in group_coaches RLS policies
-- The group_coaches policies self-reference the table, causing
-- "infinite recursion detected in policy for relation group_coaches".
-- Fix: SECURITY DEFINER functions bypass RLS on self-referencing checks.
-- ============================================================

-- ============================================================
-- 1. Create helper functions (SECURITY DEFINER = bypasses RLS)
-- ============================================================

-- Returns group IDs where the user is a coach
CREATE OR REPLACE FUNCTION get_coach_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM group_coaches WHERE coach_id = p_user_id;
$$;

-- Returns coach count for a group
CREATE OR REPLACE FUNCTION count_coaches_in_group(p_group_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM group_coaches WHERE group_id = p_group_id;
$$;

-- ============================================================
-- 2. Drop the recursive group_coaches policies
-- ============================================================
DROP POLICY IF EXISTS "group_coaches_select" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_insert" ON group_coaches;
DROP POLICY IF EXISTS "group_coaches_delete" ON group_coaches;

-- ============================================================
-- 3. Recreate group_coaches policies using helper functions
-- ============================================================

-- SELECT: coach sees their own groups' coaches, swimmers see their group's coaches
CREATE POLICY "group_coaches_select"
  ON group_coaches FOR SELECT
  TO authenticated
  USING (
    group_id IN (SELECT get_coach_group_ids(auth.uid()))
    OR group_id IN (
      SELECT gm.group_id FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- INSERT: coach can add themselves or another coach if already coach of the group
-- AND the target user must be a coach member of the club
CREATE POLICY "group_coaches_insert"
  ON group_coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      coach_id = auth.uid()
      OR group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
    )
    AND EXISTS (
      SELECT 1 FROM groups g
      JOIN club_members cm ON cm.club_id = g.club_id
      WHERE g.id = group_coaches.group_id
      AND cm.user_id = COALESCE(group_coaches.coach_id, auth.uid())
      AND cm.role = 'coach'
    )
  );

-- DELETE: coach of the group can remove someone, but not the last coach
CREATE POLICY "group_coaches_delete"
  ON group_coaches FOR DELETE
  TO authenticated
  USING (
    group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
    AND count_coaches_in_group(group_coaches.group_id) > 1
  );
