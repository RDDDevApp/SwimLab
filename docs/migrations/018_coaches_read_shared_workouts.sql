-- Migration 018 : les coachs voient les séances partagées
--
-- La règle "workouts_select" (011) limitait la lecture à coach_id = auth.uid().
-- Un coach adjoint ne voyait donc pas les séances qu'un autre coach avait
-- programmées dans leur groupe commun : titres remplacés par « Séance »,
-- erreurs 406, détail de séance vide.
--
-- Désormais un coach peut LIRE :
--   - les séances programmées dans un groupe qu'il coache (même brouillon) ;
--   - les séances publiées de son club.
-- Modifier et supprimer restent réservés à l'auteur. Rejouable.

CREATE OR REPLACE FUNCTION get_coach_visible_workout_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.id
  FROM workouts w
  WHERE w.is_published
    AND w.club_id IN (SELECT club_id FROM club_members WHERE user_id = p_user_id AND role = 'coach')
  UNION
  SELECT wa.workout_id
  FROM workout_assignments wa
  JOIN training_slots ts ON ts.id = wa.training_slot_id
  WHERE ts.group_id IN (SELECT group_id FROM group_coaches WHERE coach_id = p_user_id);
$$;

DROP POLICY IF EXISTS "workouts_select_shared_with_coaches" ON workouts;
CREATE POLICY "workouts_select_shared_with_coaches" ON workouts
  FOR SELECT TO authenticated
  USING (id IN (SELECT get_coach_visible_workout_ids(auth.uid())));
