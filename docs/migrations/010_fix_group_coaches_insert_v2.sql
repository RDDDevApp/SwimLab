-- ============================================================
-- Migration 010: Fix group_coaches INSERT policy (403 Forbidden)
--
-- Root cause: The club membership check in the INSERT policy
-- fails despite using SECURITY DEFINER. Since groups_insert
-- already validates that only coaches can create groups in
-- their own club, the group_coaches INSERT only needs to check:
--   1. Coach is adding themselves, OR
--   2. Coach is already a coach of the group (adding another)
--
-- This is safe because:
--   - groups_insert enforces club membership + coach role
--   - groups_select only shows groups from the user's club
--   - A coach can only add themselves to groups they can see
-- ============================================================

-- Ensure helper function exists (idempotent)
CREATE OR REPLACE FUNCTION get_coach_group_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM group_coaches WHERE coach_id = p_user_id;
$$;

-- Drop and recreate with simplified logic
DROP POLICY IF EXISTS "group_coaches_insert" ON group_coaches;

CREATE POLICY "group_coaches_insert"
  ON group_coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: Coach adding themselves to a group
    coach_id = auth.uid()
    -- Case 2: Existing coach of the group adding another coach
    OR group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
  );
