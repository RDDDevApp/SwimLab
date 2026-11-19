-- ============================================================
-- Migration 024 : sécurité de la table group_coaches
--
-- Constat (conseiller sécurité Supabase, 19 novembre 2026) : les règles de
-- group_coaches existaient (migrations 007 à 011) mais RLS était désactivé sur
-- la table, sans doute à la main pendant un dépannage. Tout compte, et même un
-- visiteur sans compte avec la clé publique du site, pouvait donc lire, ajouter
-- ou retirer des coachs dans n'importe quel groupe.
--
-- 1. Réactive RLS (les règles existantes s'appliquent à nouveau).
-- 2. Resserre la règle d'ajout : avant, « coach_id = auth.uid() » laissait
--    n'importe quel compte, nageur compris, se déclarer coach de n'importe quel
--    groupe. Désormais, le coach ajouté doit être coach du club du groupe, et :
--      - soit c'est soi-même, sur un groupe qui n'a encore aucun coach
--        (création du groupe par groupService.create) ;
--      - soit on est déjà coach du groupe (ajout d'un collègue).
-- 3. Fixe le search_path de handle_new_user (avertissement du conseiller).
--
-- Les fonctions SECURITY DEFINER (get_coach_group_ids, count_coaches_in_group,
-- is_coach_in_group_club) lisent group_coaches sans passer par RLS : pas de
-- récursion (voir migrations 008 à 011).
--
-- Rejouable : ENABLE et ALTER sont sans effet s'ils sont déjà appliqués.
-- Aucune instruction de suppression.
-- ============================================================

ALTER TABLE public.group_coaches ENABLE ROW LEVEL SECURITY;

ALTER POLICY "group_coaches_insert" ON public.group_coaches
  WITH CHECK (
    public.is_coach_in_group_club(group_id, coach_id)
    AND (
      group_id IN (SELECT public.get_coach_group_ids((SELECT auth.uid())))
      OR (
        coach_id = (SELECT auth.uid())
        AND public.count_coaches_in_group(group_id) = 0
      )
    )
  );

ALTER FUNCTION public.handle_new_user() SET search_path = public;
