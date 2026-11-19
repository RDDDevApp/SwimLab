-- Tests de la migration 024, compte par compte (rôle authenticated, à travers RLS).
-- npm run db:replica -- scripts/db-replica/tests/024_group_coaches.sql : « OK » si les 10 cas sont conformes,
-- « ECHEC … TEST RATÉ » sinon. Tout est annulé à la fin (ROLLBACK).
CREATE OR REPLACE FUNCTION pg_temp.try_as(p_email text, p_sql text, p_label text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE uid uuid; n int; ok boolean; detail text;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = p_email;
  PERFORM set_config('request.jwt.claim.sub', uid::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    EXECUTE p_sql;
    GET DIAGNOSTICS n = ROW_COUNT;
    ok := n > 0; detail := n || ' ligne(s)';
  EXCEPTION WHEN OTHERS THEN
    ok := false; detail := SQLERRM;
  END;
  RESET ROLE;
  -- Le libellé dit « attendu : accepté » ou « attendu : refusé / 0 ligne »
  IF (p_label LIKE '%attendu : accepté%') <> ok THEN
    RAISE EXCEPTION 'TEST RATÉ % -> %', p_label, detail;
  END IF;
  INSERT INTO pg_temp.results VALUES (p_label, detail);
END $$;
CREATE TEMP TABLE results (label text, detail text);

BEGIN;
-- Groupes du club démo « CN Les Dauphins (Démo) »
SELECT pg_temp.try_as('demo.nageuse@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id, is_creator) SELECT id, auth.uid(), true FROM groups WHERE name = 'Compétition' AND club_id = 'de0c0000-0000-4000-a000-000000000001'$q$,
  '1 nageuse se déclare coach (attendu : refusé)');
SELECT pg_temp.try_as('demo.nouveaucoach@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id) SELECT id, auth.uid() FROM groups WHERE name = 'Compétition' AND club_id = 'de0c0000-0000-4000-a000-000000000001'$q$,
  '2 coach d''un autre club s''ajoute (attendu : refusé)');
SELECT pg_temp.try_as('demo.coach2@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id) SELECT g.id, auth.uid() FROM groups g WHERE g.club_id = 'de0c0000-0000-4000-a000-000000000001' AND g.id NOT IN (SELECT group_id FROM group_coaches WHERE coach_id = auth.uid()) LIMIT 1$q$,
  '3 coach du club s''ajoute seule à un groupe déjà encadré (attendu : refusé)');
SELECT pg_temp.try_as('demo.coach@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id) SELECT gc.group_id, 'de000000-0000-4000-a000-000000000002'::uuid FROM group_coaches gc WHERE gc.coach_id = auth.uid() AND gc.group_id NOT IN (SELECT group_id FROM group_coaches x WHERE x.coach_id = 'de000000-0000-4000-a000-000000000002'::uuid) LIMIT 1$q$,
  '4 coach du groupe ajoute une collègue du club (attendu : accepté)');
SELECT pg_temp.try_as('demo.coach@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id) SELECT gc.group_id, 'de000000-0000-4000-a000-000000000003'::uuid FROM group_coaches gc WHERE gc.coach_id = auth.uid() LIMIT 1$q$,
  '5 coach ajoute une nageuse comme coach (attendu : refusé)');
-- Création d'un groupe puis ajout de soi-même comme créateur (parcours groupService.create)
SELECT pg_temp.try_as('demo.coach2@example.com',
  $q$INSERT INTO groups (id, club_id, name) VALUES ('00000000-0000-4000-a000-0000000000aa', 'de0c0000-0000-4000-a000-000000000001', 'Test 024')$q$,
  '6a coach crée un groupe (attendu : accepté)');
SELECT pg_temp.try_as('demo.coach2@example.com',
  $q$INSERT INTO group_coaches (group_id, coach_id, is_creator) VALUES ('00000000-0000-4000-a000-0000000000aa', auth.uid(), true)$q$,
  '6b puis s''en déclare créatrice (attendu : accepté)');
SELECT pg_temp.try_as('demo.nageuse@example.com',
  $q$SELECT 1 FROM group_coaches$q$,
  '7 nageuse lit les coachs de ses groupes (attendu : accepté, quelques lignes)');
SELECT pg_temp.try_as('demo.solo@example.com',
  $q$SELECT 1 FROM group_coaches$q$,
  '8 nageur sans club lit group_coaches (attendu : 0 ligne)');
SELECT pg_temp.try_as('demo.nageuse@example.com',
  $q$DELETE FROM group_coaches$q$,
  '9 nageuse tente de tout supprimer (attendu : 0 ligne)');
DO $$ BEGIN IF (SELECT count(*) FROM pg_temp.results) <> 10 THEN RAISE EXCEPTION 'tests incomplets'; END IF; END $$;
ROLLBACK;
