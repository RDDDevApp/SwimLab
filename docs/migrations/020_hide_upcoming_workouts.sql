-- Migration 020 : le programme d'une séance reste secret pour les nageurs
--
-- Avant : un nageur pouvait lire le contenu de toutes les séances programmées
-- dans son groupe, y compris celles à venir.
-- Après : un nageur ne peut lire une séance de club que si
--   - la séance est terminée (fin du créneau, heure de Paris), ou
--   - le coach a fait l'émargement, ou
--   - le coach a choisi de la montrer avant (workouts.show_before_session).
-- Le nageur continue de voir le créneau (date, heure, lieu) via
-- workout_assignments et training_slots. Le contrôle est fait en base, pas
-- seulement à l'affichage. Rejouable.

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS show_before_session boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN workouts.show_before_session IS
  'Le coach rend le programme visible aux nageurs avant la fin de la séance';

-- Utilisée par la règle "Swimmers can view assigned workouts" (migration 004)
CREATE OR REPLACE FUNCTION get_swimmer_workout_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT wa.workout_id
  FROM workout_assignments wa
  JOIN training_slots ts ON ts.id = wa.training_slot_id
  JOIN group_members gm ON gm.group_id = ts.group_id
  JOIN workouts w ON w.id = wa.workout_id
  WHERE gm.user_id = p_user_id
    AND (
      w.show_before_session
      OR wa.attendance_marked
      OR ((wa.scheduled_date + ts.start_time + make_interval(mins => ts.duration_minutes))
            AT TIME ZONE 'Europe/Paris') <= now()
    );
$$;
