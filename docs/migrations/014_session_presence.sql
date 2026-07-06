-- Migration 014 : Presence declaree (workflow d'absence)
-- Le nageur declare a l'avance sa presence ou son absence (avec raison)
-- pour une seance assignee. Le coach voit les declarations et l'emargement
-- se pre-remplit.

CREATE TABLE IF NOT EXISTS session_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_assignment_id uuid NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
  swimmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('present', 'absent')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workout_assignment_id, swimmer_id)
);

CREATE INDEX IF NOT EXISTS idx_session_presence_assignment
  ON session_presence (workout_assignment_id);
CREATE INDEX IF NOT EXISTS idx_session_presence_swimmer
  ON session_presence (swimmer_id);

ALTER TABLE session_presence ENABLE ROW LEVEL SECURITY;

-- Le nageur gere ses propres declarations
CREATE POLICY "swimmer_manages_own_presence" ON session_presence
  FOR ALL
  USING (swimmer_id = auth.uid())
  WITH CHECK (swimmer_id = auth.uid());

-- Les coachs des groupes concernes lisent les declarations
-- (via assignment -> training_slot -> group -> group_coaches)
CREATE POLICY "group_coaches_read_presence" ON session_presence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM workout_assignments wa
      JOIN training_slots ts ON ts.id = wa.training_slot_id
      JOIN group_coaches gc ON gc.group_id = ts.group_id
      WHERE wa.id = session_presence.workout_assignment_id
        AND gc.coach_id = auth.uid()
    )
  );

-- Trigger updated_at (reutilise la fonction existante si presente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    CREATE TRIGGER session_presence_updated_at
      BEFORE UPDATE ON session_presence
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
