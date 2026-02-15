-- ============================================
-- SWIMLAB - Fix RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================
-- Problem: club_members SELECT policy references itself (infinite recursion → 500)
-- Problem: clubs SELECT policy blocks non-members from querying by invitation_code

-- 1. Fix club_members SELECT policy (remove self-reference)
DROP POLICY IF EXISTS "Club members can view other members" ON club_members;

-- Allow users to see their own memberships
CREATE POLICY "Users can view own memberships" ON club_members
  FOR SELECT USING (user_id = auth.uid());

-- Allow coaches to see all members in clubs they own
CREATE POLICY "Club owners can view all members" ON club_members
  FOR SELECT USING (
    club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())
  );

-- 2. Fix clubs SELECT policy (allow querying by invitation_code for joining)
DROP POLICY IF EXISTS "Club members can view their club" ON clubs;

-- Allow all authenticated users to view clubs (needed for join by code)
CREATE POLICY "Authenticated users can view clubs" ON clubs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- DONE! The 500 errors should be fixed.
-- ============================================
