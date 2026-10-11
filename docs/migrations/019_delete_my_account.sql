-- Migration 019 : suppression de compte par l'utilisateur
--
-- Exigée par l'App Store, le Play Store et le RGPD. L'app ne peut pas
-- supprimer un compte (auth.users) elle-même : cette fonction le fait pour
-- l'utilisateur connecté uniquement, en protégeant les données du club.
--
--   - Responsable d'un club qui a encore d'autres membres : refusé, sinon tout
--     le club (groupes, séances, historique des nageurs) serait supprimé.
--   - Coach non responsable : ses séances et blocs du club sont transférés au
--     responsable du club, pour garder l'historique des nageurs.
--   - Le reste (profil, adhésions, feedbacks, séances solo, badges…) est
--     supprimé en cascade.
-- Rejouable.

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  blocking_club text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Tu dois être connecté pour supprimer ton compte.';
  END IF;

  SELECT c.name INTO blocking_club
  FROM clubs c
  WHERE c.owner_id = uid
    AND EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = c.id AND cm.user_id <> uid)
  LIMIT 1;

  IF blocking_club IS NOT NULL THEN
    RAISE EXCEPTION 'Tu es responsable du club « % », qui a encore des membres. Retire-les du club ou contacte l''équipe SwimLab pour transférer le club, puis réessaie.', blocking_club;
  END IF;

  UPDATE workouts w SET coach_id = c.owner_id
  FROM clubs c
  WHERE w.club_id = c.id AND w.coach_id = uid AND c.owner_id <> uid;

  UPDATE block_library b SET coach_id = c.owner_id
  FROM clubs c
  WHERE b.club_id = c.id AND b.coach_id = uid AND c.owner_id <> uid;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
