-- Migration 016 : Mode nageur solo (Sprint 11)
-- Un nageur sans club peut creer ses propres seances (workouts avec
-- club_id NULL, coach_id = lui-meme) et les planifier/emarger via la
-- table solo_sessions (pas de creneau ni d'assignment : modele allege).

-- 1) Les workouts personnels n'ont pas de club
ALTER TABLE workouts ALTER COLUMN club_id DROP NOT NULL;

-- RLS : un nageur gere ses propres seances solo
CREATE POLICY "solo_swimmer_manages_own_workouts" ON workouts
  FOR ALL
  USING (club_id IS NULL AND coach_id = auth.uid())
  WITH CHECK (club_id IS NULL AND coach_id = auth.uid());

-- 2) Sessions solo : planification + auto-emargement + feedback
CREATE TABLE IF NOT EXISTS solo_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  completed_at timestamptz,
  rpe_score smallint CHECK (rpe_score IS NULL OR (rpe_score >= 6 AND rpe_score <= 20)),
  feedback_text text,
  fatigue_score smallint CHECK (fatigue_score IS NULL OR (fatigue_score >= 1 AND fatigue_score <= 5)),
  technique_score smallint CHECK (technique_score IS NULL OR (technique_score >= 1 AND technique_score <= 5)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solo_sessions_swimmer
  ON solo_sessions (swimmer_id, scheduled_date);

ALTER TABLE solo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swimmer_manages_own_solo_sessions" ON solo_sessions
  FOR ALL
  USING (swimmer_id = auth.uid())
  WITH CHECK (swimmer_id = auth.uid());
