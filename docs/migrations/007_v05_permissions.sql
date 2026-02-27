-- ============================================================
-- Migration 007: V0.5 Permissions Refonte
-- Multi-coaches par groupe, 2 codes invitation, nageurs invites
-- ============================================================

-- ============================================================
-- 1. Ajouter code invitation coach dans clubs
-- ============================================================
ALTER TABLE clubs
ADD COLUMN invitation_code_coach TEXT UNIQUE
  DEFAULT substring(md5(random()::text) from 1 for 8);

-- Generer codes pour clubs existants
UPDATE clubs
SET invitation_code_coach = substring(md5(random()::text || id::text) from 1 for 8)
WHERE invitation_code_coach IS NULL;

-- Rendre non-null
ALTER TABLE clubs
ALTER COLUMN invitation_code_coach SET NOT NULL;

CREATE INDEX idx_clubs_invitation_code_coach ON clubs(invitation_code_coach);

-- ============================================================
-- 2. Creer table group_coaches (multi-coaches par groupe)
-- ============================================================
CREATE TABLE group_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, coach_id)
);

CREATE INDEX idx_group_coaches_group_id ON group_coaches(group_id);
CREATE INDEX idx_group_coaches_coach_id ON group_coaches(coach_id);

-- ============================================================
-- 3. Migrer groups.coach_id vers group_coaches
-- ============================================================
INSERT INTO group_coaches (group_id, coach_id, is_creator, joined_at)
SELECT id, coach_id, true, created_at
FROM groups
WHERE coach_id IS NOT NULL;

-- ============================================================
-- 4. Supprimer TOUTES les anciennes RLS policies qui referencent
--    groups.coach_id ou training_slots.coach_id AVANT de dropper les colonnes
-- ============================================================

-- Policies sur groups
DROP POLICY IF EXISTS "Coaches can create groups" ON groups;
DROP POLICY IF EXISTS "Coach can update own groups" ON groups;
DROP POLICY IF EXISTS "Coach can delete own groups" ON groups;
DROP POLICY IF EXISTS "groups_coach_all" ON groups;
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;

-- Policies sur group_members (referencent groups.coach_id via subquery)
DROP POLICY IF EXISTS "Group members and coach can view" ON group_members;
DROP POLICY IF EXISTS "Coach can manage group members" ON group_members;
DROP POLICY IF EXISTS "Coach can remove group members" ON group_members;

-- Policies sur training_slots (referencent groups.coach_id ou training_slots.coach_id)
DROP POLICY IF EXISTS "Group members can view slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can create slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can update own slots" ON training_slots;
DROP POLICY IF EXISTS "Coach can delete own slots" ON training_slots;
DROP POLICY IF EXISTS "training_slots_coach_all" ON training_slots;
DROP POLICY IF EXISTS "Coaches can manage their training slots" ON training_slots;

-- ============================================================
-- 5. Supprimer coach_id de groups
-- ============================================================
ALTER TABLE groups DROP COLUMN coach_id;

-- ============================================================
-- 6. Supprimer coach_id de training_slots
-- ============================================================
ALTER TABLE training_slots DROP COLUMN IF EXISTS coach_id;

-- ============================================================
-- 7. Ajouter coach_id dans workout_assignments
--    (coach qui a donne la seance, rempli lors de l'emargement)
-- ============================================================
ALTER TABLE workout_assignments
ADD COLUMN coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_workout_assignments_coach_id ON workout_assignments(coach_id);

-- ============================================================
-- 8. Ajouter is_guest dans workout_sessions
--    (nageur hors groupe ajoute ponctuellement a l'emargement)
-- ============================================================
ALTER TABLE workout_sessions
ADD COLUMN is_guest BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_workout_sessions_is_guest ON workout_sessions(is_guest);

-- ============================================================
-- 9. RLS Policies pour group_coaches
-- ============================================================
ALTER TABLE group_coaches ENABLE ROW LEVEL SECURITY;

-- Coaches peuvent voir les coaches de leurs groupes
CREATE POLICY "group_coaches_select"
  ON group_coaches FOR SELECT
  TO authenticated
  USING (
    -- Coach du meme groupe
    group_id IN (
      SELECT gc2.group_id FROM group_coaches gc2
      WHERE gc2.coach_id = auth.uid()
    )
    -- OU nageur du groupe
    OR group_id IN (
      SELECT gm.group_id FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- Coach du club peut s'ajouter a un groupe
CREATE POLICY "group_coaches_insert"
  ON group_coaches FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Le coach s'ajoute lui-meme ou est coach du groupe
    (
      coach_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM group_coaches gc
        WHERE gc.group_id = group_coaches.group_id
        AND gc.coach_id = auth.uid()
      )
    )
    -- ET est coach du club qui possede le groupe
    AND EXISTS (
      SELECT 1 FROM groups g
      JOIN club_members cm ON cm.club_id = g.club_id
      WHERE g.id = group_coaches.group_id
      AND cm.user_id = COALESCE(group_coaches.coach_id, auth.uid())
      AND cm.role = 'coach'
    )
  );

-- Coach peut se retirer (ou retirer un autre) si pas le dernier
CREATE POLICY "group_coaches_delete"
  ON group_coaches FOR DELETE
  TO authenticated
  USING (
    -- Est coach du groupe (peut retirer n'importe qui)
    EXISTS (
      SELECT 1 FROM group_coaches gc
      WHERE gc.group_id = group_coaches.group_id
      AND gc.coach_id = auth.uid()
    )
    -- ET pas le dernier coach
    AND (
      SELECT COUNT(*)
      FROM group_coaches gc2
      WHERE gc2.group_id = group_coaches.group_id
    ) > 1
  );

-- ============================================================
-- 10. Nouvelles RLS policies pour training_slots
--     (coach_id supprime, verifier via group_coaches)
-- ============================================================

-- Nouvelle policy SELECT : coaches du groupe + nageurs du groupe
CREATE POLICY "training_slots_select"
  ON training_slots FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
    OR group_id IN (
      SELECT gm.group_id FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- Nouvelle policy INSERT/UPDATE/DELETE : coaches du groupe
CREATE POLICY "training_slots_coach_manage"
  ON training_slots FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );

-- ============================================================
-- 11. Nouvelles RLS policies pour groups
--     (coach_id supprime, verifier via group_coaches)
-- ============================================================

-- SELECT : membres du club peuvent voir les groupes
CREATE POLICY "groups_select"
  ON groups FOR SELECT
  TO authenticated
  USING (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- INSERT : coaches du club peuvent creer des groupes
CREATE POLICY "groups_insert"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (
    club_id IN (
      SELECT cm.club_id FROM club_members cm
      WHERE cm.user_id = auth.uid()
      AND cm.role = 'coach'
    )
  );

-- UPDATE/DELETE : coaches du groupe peuvent modifier/supprimer
CREATE POLICY "groups_coach_manage"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );

CREATE POLICY "groups_coach_delete"
  ON groups FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );

-- ============================================================
-- 12. Nouvelles RLS policies pour group_members
--     (coach_id supprime, verifier via group_coaches)
-- ============================================================

-- SELECT : nageur peut voir ses propres groupes, coaches du groupe aussi
CREATE POLICY "group_members_select"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );

-- INSERT : coaches du groupe peuvent ajouter des membres
CREATE POLICY "group_members_insert"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );

-- DELETE : coaches du groupe peuvent retirer des membres
CREATE POLICY "group_members_delete"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT gc.group_id FROM group_coaches gc
      WHERE gc.coach_id = auth.uid()
    )
  );
