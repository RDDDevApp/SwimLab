-- Migration 013 : Feedback v2
-- Ajoute deux auto-evaluations optionnelles au feedback post-seance :
-- fatigue musculaire et sensation technique (echelle 1-5).
-- Colonnes nullable => zero breakage pour les clients existants.

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS fatigue_score smallint
    CHECK (fatigue_score IS NULL OR (fatigue_score >= 1 AND fatigue_score <= 5)),
  ADD COLUMN IF NOT EXISTS technique_score smallint
    CHECK (technique_score IS NULL OR (technique_score >= 1 AND technique_score <= 5));

COMMENT ON COLUMN workout_sessions.fatigue_score IS 'Auto-evaluation fatigue musculaire 1-5 (optionnel)';
COMMENT ON COLUMN workout_sessions.technique_score IS 'Auto-evaluation sensation technique 1-5 (optionnel)';
