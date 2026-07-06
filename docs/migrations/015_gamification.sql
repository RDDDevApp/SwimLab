-- Migration 015 : Gamification minimale viable
-- Philosophie "calculer, pas tracker" : l'XP et les streaks sont derives
-- des workout_sessions cote client. Seuls les AWARDS de badges et les
-- records personnels sont stockes.

-- Badges attribues (le catalogue vit dans le code : src/config/badges.ts)
CREATE TABLE IF NOT EXISTS swimmer_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swimmer_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_swimmer_badges_swimmer ON swimmer_badges (swimmer_id);

ALTER TABLE swimmer_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swimmer_manages_own_badges" ON swimmer_badges
  FOR ALL
  USING (swimmer_id = auth.uid())
  WITH CHECK (swimmer_id = auth.uid());

CREATE POLICY "group_coaches_read_badges" ON swimmer_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM group_members gm
      JOIN group_coaches gc ON gc.group_id = gm.group_id
      WHERE gm.user_id = swimmer_badges.swimmer_id
        AND gc.coach_id = auth.uid()
    )
  );

-- Records personnels (saisie manuelle nageur/coach)
CREATE TABLE IF NOT EXISTS personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stroke text NOT NULL CHECK (stroke IN ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley')),
  distance_m integer NOT NULL CHECK (distance_m > 0),
  time_ms integer NOT NULL CHECK (time_ms > 0),
  pool_length smallint NOT NULL DEFAULT 25 CHECK (pool_length IN (25, 50)),
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_records_swimmer
  ON personal_records (swimmer_id, stroke, distance_m, recorded_at);

ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swimmer_manages_own_records" ON personal_records
  FOR ALL
  USING (swimmer_id = auth.uid())
  WITH CHECK (swimmer_id = auth.uid());

CREATE POLICY "group_coaches_read_records" ON personal_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM group_members gm
      JOIN group_coaches gc ON gc.group_id = gm.group_id
      WHERE gm.user_id = personal_records.swimmer_id
        AND gc.coach_id = auth.uid()
    )
  );

-- Objectif distance mensuel du club (cible des Defis du Mois cote coach)
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS monthly_distance_goal integer
    CHECK (monthly_distance_goal IS NULL OR monthly_distance_goal > 0);

COMMENT ON COLUMN clubs.monthly_distance_goal IS 'Objectif de distance mensuel du club en metres (Defis du Mois)';
