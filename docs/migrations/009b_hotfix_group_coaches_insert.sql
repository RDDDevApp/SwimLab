-- ============================================================
-- Hotfix 009b: Fix group_coaches INSERT policy (403 Forbidden)
--
-- Problem: The EXISTS clause in group_coaches_insert accesses
-- `groups` and `club_members` tables, which have their own RLS
-- policies. When Postgres evaluates the EXISTS, RLS on those
-- tables can block access, causing a false 403.
--
-- Fix: Use a SECURITY DEFINER function to bypass RLS when
-- checking club membership.
--
-- Run this AFTER migration 009 (or standalone if 009 was already applied).
-- ============================================================

-- Create helper function (bypasses RLS on groups + club_members)
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

-- Drop and recreate the INSERT policy
DROP POLICY IF EXISTS "group_coaches_insert" ON group_coaches;

CREATE POLICY "group_coaches_insert"
  ON group_coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Coach adding themselves OR existing coach of the group
    (
      coach_id = auth.uid()
      OR group_coaches.group_id IN (SELECT get_coach_group_ids(auth.uid()))
    )
    -- AND the target user is a coach member of the club (bypasses RLS)
    AND is_coach_in_group_club(group_coaches.group_id, COALESCE(group_coaches.coach_id, auth.uid()))
  );
