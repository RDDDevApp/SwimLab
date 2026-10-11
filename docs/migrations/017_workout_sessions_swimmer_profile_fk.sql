-- Migration 017 : lien workout_sessions.swimmer_id -> profiles
--
-- swimmer_id ne pointait que vers auth.users. Les requêtes de l'app qui
-- joignent un émargement au profil du nageur (profiles!swimmer_id :
-- activité récente et alertes RPE du tableau de bord coach, noms dans le
-- détail d'une séance) échouaient avec PGRST200, ce qui vidait le tableau
-- de bord coach. profiles.id étant égal à auth.users.id, la contrainte est
-- toujours vraie. Rejouable.

ALTER TABLE workout_sessions
  DROP CONSTRAINT IF EXISTS workout_sessions_swimmer_id_profiles_fkey;

ALTER TABLE workout_sessions
  ADD CONSTRAINT workout_sessions_swimmer_id_profiles_fkey
  FOREIGN KEY (swimmer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Recharge le cache de schéma de PostgREST pour que la jointure soit visible tout de suite
NOTIFY pgrst, 'reload schema';
