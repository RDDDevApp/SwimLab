-- Migration 021 : journal des générations de séances par IA
-- Problème : l'Edge Function generate-workout n'avait aucune limite, n'importe quel
-- compte pouvait consommer des crédits API sans fin.
-- Solution : chaque génération réussie est notée ici ; la fonction refuse au-delà de
-- 10 générations par utilisateur sur 24 h. Seule la fonction (rôle service) écrit
-- dans la table ; chacun peut relire ses propres lignes.
-- Rejouable.

CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_created
  ON ai_generations (user_id, created_at DESC);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Lecture de ses propres générations ; aucune politique d'écriture :
-- seul le rôle service (Edge Function) insère.
DROP POLICY IF EXISTS "ai_generations_select_own" ON ai_generations;
CREATE POLICY "ai_generations_select_own" ON ai_generations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
