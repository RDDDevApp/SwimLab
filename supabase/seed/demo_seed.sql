-- ============================================================
-- Données de démo SwimLab
--
-- Crée un club fictif complet pour tester l'app sous tous les profils.
-- Prérequis : migrations 001 à 016 appliquées.
-- Rejouable : le script commence par supprimer les données démo
-- existantes. Les dates sont calculées à partir d'aujourd'hui, donc la
-- démo reste à jour à chaque exécution.
--
-- Tous les comptes démo ont le mot de passe : SwimLabDemo2026
-- ============================================================

BEGIN;

-- 0. Repartir de zéro (mêmes adresses que demo_reset.sql)
DELETE FROM auth.users
WHERE email IN (
  'demo.coach@example.com', 'demo.coach2@example.com', 'demo.nageuse@example.com',
  'demo.nageur@example.com', 'demo.junior@example.com', 'demo.solo@example.com',
  'demo.nouveau@example.com', 'demo.nouveaucoach@example.com', 'demo.hugo@example.com',
  'demo.lea@example.com', 'demo.nathan@example.com', 'demo.ines@example.com',
  'demo.maxime@example.com', 'demo.camille@example.com', 'demo.jade@example.com',
  'demo.tom@example.com'
);

-- 1. Comptes ---------------------------------------------------
CREATE TEMP TABLE demo_people (id uuid, email text, first_name text, last_name text, role text) ON COMMIT DROP;
INSERT INTO demo_people VALUES
  ('de000000-0000-4000-a000-000000000001', 'demo.coach@example.com',        'Thomas',  'Martin',   'coach'),
  ('de000000-0000-4000-a000-000000000002', 'demo.coach2@example.com',       'Julie',   'Bernard',  'coach'),
  ('de000000-0000-4000-a000-000000000003', 'demo.nageuse@example.com',      'Sophie',  'Laurent',  'swimmer'),
  ('de000000-0000-4000-a000-000000000004', 'demo.nageur@example.com',       'Lucas',   'Petit',    'swimmer'),
  ('de000000-0000-4000-a000-000000000005', 'demo.junior@example.com',       'Emma',    'Durand',   'swimmer'),
  ('de000000-0000-4000-a000-000000000006', 'demo.solo@example.com',         'Marc',    'Dubois',   'swimmer'),
  ('de000000-0000-4000-a000-000000000007', 'demo.nouveau@example.com',      'Chloé',   'Garcia',   'swimmer'),
  ('de000000-0000-4000-a000-000000000008', 'demo.nouveaucoach@example.com', 'Antoine', 'Lambert',  'coach'),
  ('de000000-0000-4000-a000-000000000011', 'demo.hugo@example.com',         'Hugo',    'Moreau',   'swimmer'),
  ('de000000-0000-4000-a000-000000000012', 'demo.lea@example.com',          'Léa',     'Roux',     'swimmer'),
  ('de000000-0000-4000-a000-000000000013', 'demo.nathan@example.com',       'Nathan',  'Girard',   'swimmer'),
  ('de000000-0000-4000-a000-000000000014', 'demo.ines@example.com',         'Inès',    'Fontaine', 'swimmer'),
  ('de000000-0000-4000-a000-000000000015', 'demo.maxime@example.com',       'Maxime',  'Lefebvre', 'swimmer'),
  ('de000000-0000-4000-a000-000000000016', 'demo.camille@example.com',      'Camille', 'Bonnet',   'swimmer'),
  ('de000000-0000-4000-a000-000000000017', 'demo.jade@example.com',         'Jade',    'Mercier',  'swimmer'),
  ('de000000-0000-4000-a000-000000000018', 'demo.tom@example.com',          'Tom',     'Garnier',  'swimmer');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000', p.id, 'authenticated', 'authenticated', p.email,
  extensions.crypt('SwimLabDemo2026', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('first_name', p.first_name, 'last_name', p.last_name, 'role', p.role),
  now() - interval '60 days', now(),
  '', '', '', ''
FROM demo_people p;

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id::text, p.id,
  jsonb_build_object('sub', p.id::text, 'email', p.email, 'email_verified', true),
  'email', now(), now() - interval '60 days', now()
FROM demo_people p;

-- Le trigger on_auth_user_created crée déjà les profils ; on garantit les valeurs.
INSERT INTO profiles (id, first_name, last_name, role)
SELECT id, first_name, last_name, role FROM demo_people
ON CONFLICT (id) DO UPDATE
  SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

-- 2. Club, membres, groupes, coachs ------------------------------
INSERT INTO clubs (id, name, description, invitation_code, invitation_code_coach, owner_id, monthly_distance_goal)
VALUES (
  'de0c0000-0000-4000-a000-000000000001',
  'CN Les Dauphins (Démo)',
  'Club fictif pour tester SwimLab. Bassin de 25 m, trois groupes, deux coachs.',
  'dauphins', 'coachdem',
  'de000000-0000-4000-a000-000000000001',
  150000
);

INSERT INTO club_members (club_id, user_id, role)
SELECT 'de0c0000-0000-4000-a000-000000000001', id, role
FROM demo_people
WHERE id NOT IN (
  'de000000-0000-4000-a000-000000000006',  -- Marc : nageur solo
  'de000000-0000-4000-a000-000000000007',  -- Chloé : nouvelle, sans club
  'de000000-0000-4000-a000-000000000008'   -- Antoine : nouveau coach, sans club
);

INSERT INTO groups (id, club_id, name, description, level, schedule_info) VALUES
  ('de060000-0000-4000-a000-000000000001', 'de0c0000-0000-4000-a000-000000000001', 'Compétition',
   'Préparation aux interclubs et aux championnats régionaux.', 'competition', 'Lun, mer 19h · sam 9h'),
  ('de060000-0000-4000-a000-000000000002', 'de0c0000-0000-4000-a000-000000000001', 'Loisir adultes',
   'Garder la forme et progresser en technique, sans pression.', 'intermediate', 'Mar, jeu 20h'),
  ('de060000-0000-4000-a000-000000000003', 'de0c0000-0000-4000-a000-000000000001', 'Juniors',
   'Groupe des 11-14 ans : apprentissage des 4 nages et des départs.', 'beginner', 'Mer 14h · sam 11h');

INSERT INTO group_coaches (group_id, coach_id, is_creator) VALUES
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001', true),
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000002', false),
  ('de060000-0000-4000-a000-000000000002', 'de000000-0000-4000-a000-000000000001', true),
  ('de060000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000002', true);

INSERT INTO group_members (group_id, user_id) VALUES
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000003'),
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000011'),
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000012'),
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000013'),
  ('de060000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000014'),
  ('de060000-0000-4000-a000-000000000002', 'de000000-0000-4000-a000-000000000004'),
  ('de060000-0000-4000-a000-000000000002', 'de000000-0000-4000-a000-000000000015'),
  ('de060000-0000-4000-a000-000000000002', 'de000000-0000-4000-a000-000000000016'),
  ('de060000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000005'),
  ('de060000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000017'),
  ('de060000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000018');

-- 3. Créneaux (day_of_week : 0 = dimanche, comme dans l'app) ------
INSERT INTO training_slots (id, group_id, name, day_of_week, start_time, duration_minutes, location) VALUES
  ('de050000-0000-4000-a000-000000000001', 'de060000-0000-4000-a000-000000000001', 'Compétition lundi',   1, '19:00', 90,  'Piscine Georges-Vallerey'),
  ('de050000-0000-4000-a000-000000000002', 'de060000-0000-4000-a000-000000000001', 'Compétition mercredi', 3, '19:00', 90,  'Piscine Georges-Vallerey'),
  ('de050000-0000-4000-a000-000000000003', 'de060000-0000-4000-a000-000000000001', 'Compétition samedi',  6, '09:00', 120, 'Piscine Georges-Vallerey'),
  ('de050000-0000-4000-a000-000000000004', 'de060000-0000-4000-a000-000000000002', 'Loisir mardi',        2, '20:00', 60,  'Piscine Pailleron'),
  ('de050000-0000-4000-a000-000000000005', 'de060000-0000-4000-a000-000000000002', 'Loisir jeudi',        4, '20:00', 60,  'Piscine Pailleron'),
  ('de050000-0000-4000-a000-000000000006', 'de060000-0000-4000-a000-000000000003', 'Juniors mercredi',    3, '14:00', 60,  'Piscine Pailleron'),
  ('de050000-0000-4000-a000-000000000007', 'de060000-0000-4000-a000-000000000003', 'Juniors samedi',      6, '11:00', 60,  'Piscine Pailleron');

-- 4. Séances (structure Bloc > Série) -----------------------------
INSERT INTO workouts (id, club_id, coach_id, title, type, description, estimated_duration, is_published, content) VALUES
('de0a0000-0000-4000-a000-000000000001', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Endurance aérobie 3400', 'endurance', 'Volume régulier en aisance respiratoire.', 90, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":400,"repetitions":1,"description":"Crawl souple"},{"id":"s2","distance":100,"repetitions":4,"description":"4 nages","departure":"1''50"}]},
   {"id":"b2","type":"main","name":"Corps de séance","sub_blocks":[{"id":"s3","distance":600,"repetitions":3,"description":"Allure régulière, respiration 3 temps","departure":"9''30"},{"id":"s4","distance":100,"repetitions":6,"description":"Pull-buoy","departure":"1''40"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s5","distance":200,"repetitions":1,"description":"Dos souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000002', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Seuil 10 × 200', 'endurance', 'Travail au seuil, temps de passage constants.', 90, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":600,"repetitions":1,"description":"Progressif"},{"id":"s2","distance":50,"repetitions":6,"description":"Éducatifs crawl","departure":"1''00"}]},
   {"id":"b2","type":"main","name":"Série principale","sub_blocks":[{"id":"s3","distance":200,"repetitions":10,"description":"Allure seuil","departure":"3''00"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s4","distance":300,"repetitions":1,"description":"Souple au choix"}]}]}'),
('de0a0000-0000-4000-a000-000000000003', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Vitesse 25 / 50', 'sprint', 'Départs plongés et vitesse maximale, récupération complète.', 90, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":800,"repetitions":1,"description":"Crawl et dos alternés"}]},
   {"id":"b2","type":"main","name":"Vitesse","sub_blocks":[{"id":"s2","distance":25,"repetitions":12,"description":"Sprint départ plongé","departure":"1''00"},{"id":"s3","distance":50,"repetitions":6,"description":"Vitesse max sur la spécialité","departure":"2''00"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s4","distance":400,"repetitions":1,"description":"Très souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000004', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Technique crawl : rattrapé et respiration', 'technique', 'Qualité de prise d''appui avant la vitesse.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":300,"repetitions":1,"description":"Crawl souple"}]},
   {"id":"b2","type":"main","name":"Éducatifs","sub_blocks":[{"id":"s2","distance":50,"repetitions":8,"description":"Rattrapé","departure":"1''10"},{"id":"s3","distance":50,"repetitions":8,"description":"Respiration 5 temps","departure":"1''10"},{"id":"s4","distance":100,"repetitions":4,"description":"Nage complète, amplitude","departure":"2''00"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s5","distance":200,"repetitions":1,"description":"Souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000005', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Récupération active', 'recovery', 'Lendemain de compétition : nager souple, sans chrono.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"main","name":"Nage continue","sub_blocks":[{"id":"s1","distance":400,"repetitions":1,"description":"Crawl très souple"},{"id":"s2","distance":100,"repetitions":6,"description":"Dos et brasse alternés","departure":"2''00"}]},
   {"id":"b2","type":"cooldown","name":"Retour au calme","sub_blocks":[{"id":"s3","distance":200,"repetitions":1,"description":"Au choix"}]}]}'),
('de0a0000-0000-4000-a000-000000000006', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Loisir : endurance douce 2000', 'endurance', 'Nager longtemps sans s''arrêter.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":200,"repetitions":1,"description":"Brasse et crawl"}]},
   {"id":"b2","type":"main","name":"Endurance","sub_blocks":[{"id":"s2","distance":400,"repetitions":3,"description":"Crawl régulier","departure":"8''00"},{"id":"s3","distance":100,"repetitions":4,"description":"Pull-buoy","departure":"2''15"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s4","distance":200,"repetitions":1,"description":"Dos souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000007', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Loisir : découverte 4 nages', 'technique', 'Papillon, dos, brasse, crawl : une nage à la fois.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":300,"repetitions":1,"description":"Au choix"}]},
   {"id":"b2","type":"main","name":"4 nages","sub_blocks":[{"id":"s2","distance":50,"repetitions":4,"description":"Ondulations papillon avec palmes","departure":"1''30"},{"id":"s3","distance":50,"repetitions":4,"description":"Dos, rotation des épaules","departure":"1''20"},{"id":"s4","distance":50,"repetitions":4,"description":"Brasse, coulée longue","departure":"1''30"},{"id":"s5","distance":100,"repetitions":2,"description":"4 nages","departure":"2''45"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s6","distance":200,"repetitions":1,"description":"Souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000008', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000002',
 'Juniors : départs et coulées', 'sprint', 'Départs plongés, coulées et jeux de relais.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":200,"repetitions":1,"description":"Crawl et dos"}]},
   {"id":"b2","type":"main","name":"Départs","sub_blocks":[{"id":"s2","distance":25,"repetitions":8,"description":"Départ plongé + coulée 10 m","departure":"1''00"},{"id":"s3","distance":25,"repetitions":8,"description":"Relais par équipes"}]},
   {"id":"b3","type":"cooldown","name":"Retour au calme","sub_blocks":[{"id":"s4","distance":100,"repetitions":1,"description":"Souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000009', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000002',
 'Juniors : apprentissage du dos', 'technique', 'Position du corps et battements en dos.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":200,"repetitions":1,"description":"Au choix"}]},
   {"id":"b2","type":"main","name":"Dos","sub_blocks":[{"id":"s2","distance":25,"repetitions":8,"description":"Battements dos, planche sur le ventre","departure":"0''50"},{"id":"s3","distance":50,"repetitions":6,"description":"Dos complet, regard au plafond","departure":"1''30"}]},
   {"id":"b3","type":"cooldown","name":"Retour au calme","sub_blocks":[{"id":"s4","distance":100,"repetitions":1,"description":"Jeu libre"}]}]}'),
('de0a0000-0000-4000-a000-000000000010', 'de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001',
 'Brouillon : préparation interclubs', 'sprint', 'Séance en cours de préparation, non publiée.', 120, false,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":800,"repetitions":1,"description":"Progressif"}]},
   {"id":"b2","type":"main","name":"Allure course","sub_blocks":[{"id":"s2","distance":100,"repetitions":8,"description":"Allure 200 m course","departure":"2''00"}]}]}'),
-- Séances perso du nageur solo (pas de club)
('de0a0000-0000-4000-a000-000000000051', NULL, 'de000000-0000-4000-a000-000000000006',
 'Ma séance du mardi', 'endurance', 'Avant le travail, 45 minutes.', 45, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":200,"repetitions":1,"description":"Brasse"}]},
   {"id":"b2","type":"main","name":"Corps de séance","sub_blocks":[{"id":"s2","distance":100,"repetitions":10,"description":"Crawl régulier","departure":"2''10"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s3","distance":200,"repetitions":1,"description":"Dos"}]}]}'),
('de0a0000-0000-4000-a000-000000000052', NULL, 'de000000-0000-4000-a000-000000000006',
 'Pyramide du week-end', 'endurance', 'Monter puis redescendre.', 60, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":300,"repetitions":1,"description":"Au choix"}]},
   {"id":"b2","type":"main","name":"Pyramide","sub_blocks":[{"id":"s2","distance":100,"repetitions":1},{"id":"s3","distance":200,"repetitions":1},{"id":"s4","distance":300,"repetitions":1},{"id":"s5","distance":200,"repetitions":1},{"id":"s6","distance":100,"repetitions":1}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s7","distance":200,"repetitions":1,"description":"Souple"}]}]}'),
('de0a0000-0000-4000-a000-000000000053', NULL, 'de000000-0000-4000-a000-000000000006',
 'Technique crawl perso', 'technique', 'Générée avec le coach IA puis ajustée.', 45, true,
 '{"blocks":[
   {"id":"b1","type":"warmup","name":"Échauffement","sub_blocks":[{"id":"s1","distance":200,"repetitions":1,"description":"Crawl souple"}]},
   {"id":"b2","type":"main","name":"Éducatifs","sub_blocks":[{"id":"s2","distance":50,"repetitions":6,"description":"Rattrapé","departure":"1''20"},{"id":"s3","distance":50,"repetitions":6,"description":"Poings fermés","departure":"1''20"}]},
   {"id":"b3","type":"cooldown","name":"Récupération","sub_blocks":[{"id":"s4","distance":200,"repetitions":1,"description":"Souple"}]}]}');

-- Distance totale calculée depuis le contenu (distance × répétitions)
UPDATE workouts w
SET total_distance = (
  SELECT COALESCE(SUM((sb->>'distance')::int * (sb->>'repetitions')::int), 0)
  FROM jsonb_array_elements(w.content->'blocks') b,
       jsonb_array_elements(b->'sub_blocks') sb
)
WHERE w.id::text LIKE 'de0a0000-%';

-- 5. Bibliothèque de blocs du club --------------------------------
INSERT INTO block_library (club_id, coach_id, name, type, content, total_distance) VALUES
  ('de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001', 'Échauffement standard 800', 'warmup',
   '[{"id":"l1","distance":400,"repetitions":1,"description":"Crawl souple"},{"id":"l2","distance":100,"repetitions":4,"description":"4 nages","departure":"1''50"}]', 800),
  ('de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001', 'Éducatifs crawl', 'main',
   '[{"id":"l3","distance":50,"repetitions":4,"description":"Rattrapé","departure":"1''10"},{"id":"l4","distance":50,"repetitions":4,"description":"Poings fermés","departure":"1''10"}]', 400),
  ('de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001', 'Série sprint 12 × 25', 'main',
   '[{"id":"l5","distance":25,"repetitions":12,"description":"Sprint départ plongé","departure":"1''00"}]', 300),
  ('de0c0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001', 'Retour au calme 200', 'cooldown',
   '[{"id":"l6","distance":200,"repetitions":1,"description":"Dos souple"}]', 200);

-- 6. Planning : 6 semaines passées + 7 jours à venir ----------------
-- Chaque créneau reçoit une séance de son groupe, en rotation.
-- Les 7 jours suivants restent vides, pour tester l'assignation.
CREATE TEMP TABLE demo_rotation (group_id uuid, pos int, workout_id uuid, coach_id uuid) ON COMMIT DROP;
INSERT INTO demo_rotation VALUES
  ('de060000-0000-4000-a000-000000000001', 0, 'de0a0000-0000-4000-a000-000000000001', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000001', 1, 'de0a0000-0000-4000-a000-000000000002', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000001', 2, 'de0a0000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000001', 3, 'de0a0000-0000-4000-a000-000000000004', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000001', 4, 'de0a0000-0000-4000-a000-000000000005', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000002', 0, 'de0a0000-0000-4000-a000-000000000006', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000002', 1, 'de0a0000-0000-4000-a000-000000000007', 'de000000-0000-4000-a000-000000000001'),
  ('de060000-0000-4000-a000-000000000003', 0, 'de0a0000-0000-4000-a000-000000000008', 'de000000-0000-4000-a000-000000000002'),
  ('de060000-0000-4000-a000-000000000003', 1, 'de0a0000-0000-4000-a000-000000000009', 'de000000-0000-4000-a000-000000000002');

INSERT INTO workout_assignments (workout_id, training_slot_id, scheduled_date, is_completed, attendance_marked, coach_id)
SELECT r.workout_id, ts.id, d::date, d::date < CURRENT_DATE, d::date < CURRENT_DATE, r.coach_id
FROM training_slots ts
CROSS JOIN generate_series(CURRENT_DATE - 42, CURRENT_DATE + 7, interval '1 day') d
JOIN demo_rotation r
  ON r.group_id = ts.group_id
 AND r.pos = ((d::date - DATE '2026-01-05') / 7 + ts.day_of_week)
             % (SELECT count(*) FROM demo_rotation r2 WHERE r2.group_id = ts.group_id)
WHERE ts.id::text LIKE 'de050000-%'
  AND extract(dow FROM d) = ts.day_of_week;

-- 7. Émargements et feedbacks des séances passées -------------------
-- Valeurs pseudo-aléatoires mais stables (hashtext), pour une démo identique à chaque exécution.
CREATE TEMP TABLE demo_comments (n int, txt text) ON COMMIT DROP;
INSERT INTO demo_comments VALUES
  (0, 'Bonne séance, les séries passaient bien.'),
  (1, 'Bras lourds sur la fin, j''ai dû ralentir.'),
  (2, 'Super ambiance, j''ai tenu les départs.'),
  (3, 'Un peu fatigué(e) après la semaine de travail.'),
  (4, 'Les éducatifs m''ont bien aidé(e) sur la respiration.'),
  (5, 'Difficile, mais content(e) d''avoir fini.'),
  (6, 'Douleur légère à l''épaule droite en fin de séance.'),
  (7, 'Je sens que ça progresse sur les virages.');

INSERT INTO workout_sessions (
  workout_assignment_id, swimmer_id, attended, rpe_score, feedback_text,
  completed_at, fatigue_score, technique_score, is_guest
)
SELECT
  x.assignment_id, x.swimmer_id, x.attended,
  CASE WHEN x.attended AND x.gives_feedback THEN x.rpe END,
  CASE WHEN x.attended AND x.gives_feedback AND x.h % 100 < 45 THEN (SELECT txt FROM demo_comments WHERE n = x.h % 8) END,
  CASE WHEN x.attended AND x.gives_feedback THEN x.done_at END,
  CASE WHEN x.attended AND x.gives_feedback AND x.h % 100 < 65 THEN 1 + (x.h / 7) % 5 END,
  CASE WHEN x.attended AND x.gives_feedback AND x.h % 100 < 65 THEN 1 + (x.h / 11) % 5 END,
  false
FROM (
  SELECT
    wa.id AS assignment_id,
    gm.user_id AS swimmer_id,
    h.h,
    -- Présence : Sophie et Emma très assidues, les autres autour de 80 %
    (h.h % 100) < CASE WHEN gm.user_id IN ('de000000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000005') THEN 95 ELSE 80 END AS attended,
    -- Feedback donné : comptes démo toujours (sauf exceptions plus bas), les autres 3 fois sur 4
    (h.h % 100) < CASE WHEN gm.user_id IN ('de000000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000004', 'de000000-0000-4000-a000-000000000005') THEN 95 ELSE 80 END
      AND ((h.h / 3) % 100 < CASE WHEN gm.user_id IN ('de000000-0000-4000-a000-000000000003', 'de000000-0000-4000-a000-000000000004', 'de000000-0000-4000-a000-000000000005') THEN 100 ELSE 75 END) AS gives_feedback,
    -- RPE (échelle de Borg 6-20) selon le type de séance, avec une variation par nageur.
    -- Sophie est en surcharge sur les 7 derniers jours, pour déclencher l'alerte coach.
    LEAST(20, GREATEST(6,
      CASE w.type WHEN 'sprint' THEN 15 WHEN 'endurance' THEN 13 WHEN 'technique' THEN 11 WHEN 'recovery' THEN 9 ELSE 12 END
      + ((h.h / 13) % 5) - 2
      + CASE WHEN gm.user_id = 'de000000-0000-4000-a000-000000000003' AND wa.scheduled_date >= CURRENT_DATE - 6 THEN 5 ELSE 0 END
    )) AS rpe,
    (wa.scheduled_date + ts.start_time + make_interval(mins => ts.duration_minutes + 90))::timestamptz AS done_at
  FROM workout_assignments wa
  JOIN training_slots ts ON ts.id = wa.training_slot_id
  JOIN workouts w ON w.id = wa.workout_id
  JOIN group_members gm ON gm.group_id = ts.group_id
  CROSS JOIN LATERAL (SELECT abs(hashtext(wa.scheduled_date::text || gm.user_id::text || ts.id::text)) AS h) h
  WHERE ts.id::text LIKE 'de050000-%'
    AND wa.scheduled_date < CURRENT_DATE
) x;

-- Lucas : sa dernière séance attend son feedback (bannière et rappel automatique)
UPDATE workout_sessions ws
SET attended = true, rpe_score = NULL, feedback_text = NULL, completed_at = NULL,
    fatigue_score = NULL, technique_score = NULL
WHERE ws.id = (
  SELECT ws2.id FROM workout_sessions ws2
  JOIN workout_assignments wa ON wa.id = ws2.workout_assignment_id
  WHERE ws2.swimmer_id = 'de000000-0000-4000-a000-000000000004'
  ORDER BY wa.scheduled_date DESC LIMIT 1
);

-- Sophie : sa dernière séance est notée récemment, pour tester la modification sous 24 h
UPDATE workout_sessions ws
SET attended = true, rpe_score = COALESCE(rpe_score, 18), completed_at = now() - interval '3 hours',
    feedback_text = 'Très dur aujourd''hui, je sens la fatigue s''accumuler.'
WHERE ws.id = (
  SELECT ws2.id FROM workout_sessions ws2
  JOIN workout_assignments wa ON wa.id = ws2.workout_assignment_id
  WHERE ws2.swimmer_id = 'de000000-0000-4000-a000-000000000003'
  ORDER BY wa.scheduled_date DESC LIMIT 1
);

-- 8. Présences déclarées pour les prochaines séances ---------------
INSERT INTO session_presence (workout_assignment_id, swimmer_id, status, reason)
SELECT next_a.id, p.swimmer_id, p.status, p.reason
FROM (VALUES
  ('de000000-0000-4000-a000-000000000003'::uuid, 'de060000-0000-4000-a000-000000000001'::uuid, 'present', NULL),
  ('de000000-0000-4000-a000-000000000011'::uuid, 'de060000-0000-4000-a000-000000000001'::uuid, 'absent', 'Douleur à l''épaule, je préfère me reposer'),
  ('de000000-0000-4000-a000-000000000004'::uuid, 'de060000-0000-4000-a000-000000000002'::uuid, 'absent', 'Déplacement professionnel')
) AS p(swimmer_id, group_id, status, reason)
CROSS JOIN LATERAL (
  SELECT wa.id FROM workout_assignments wa
  JOIN training_slots ts ON ts.id = wa.training_slot_id
  WHERE ts.group_id = p.group_id AND wa.scheduled_date >= CURRENT_DATE
  ORDER BY wa.scheduled_date LIMIT 1
) next_a;

-- 9. Records personnels de Sophie (bassin de 25 m) ----------------
INSERT INTO personal_records (swimmer_id, stroke, distance_m, time_ms, pool_length, recorded_at, note) VALUES
  ('de000000-0000-4000-a000-000000000003', 'freestyle', 50,  28940,  25, CURRENT_DATE - 30, 'Interclubs'),
  ('de000000-0000-4000-a000-000000000003', 'freestyle', 100, 63410,  25, CURRENT_DATE - 30, 'Interclubs'),
  ('de000000-0000-4000-a000-000000000003', 'butterfly', 50,  31870,  25, CURRENT_DATE - 75, NULL),
  ('de000000-0000-4000-a000-000000000003', 'medley',    200, 156200, 25, CURRENT_DATE - 75, 'Championnats régionaux');

-- 10. Nageur solo : 4 semaines d'historique et 2 séances à venir ----
INSERT INTO solo_sessions (swimmer_id, workout_id, scheduled_date, completed_at, rpe_score, feedback_text, fatigue_score, technique_score)
SELECT
  'de000000-0000-4000-a000-000000000006',
  CASE WHEN extract(dow FROM d) = 2 THEN 'de0a0000-0000-4000-a000-000000000051'::uuid ELSE 'de0a0000-0000-4000-a000-000000000052'::uuid END,
  d::date,
  d::date + time '19:30',
  12 + (abs(hashtext(d::text)) % 4),
  CASE WHEN abs(hashtext(d::text)) % 3 = 0 THEN 'Bonne séance, régulier sur les 100.' END,
  1 + abs(hashtext(d::text || 'f')) % 4,
  2 + abs(hashtext(d::text || 't')) % 3
FROM generate_series(CURRENT_DATE - 28, CURRENT_DATE - 1, interval '1 day') d
WHERE extract(dow FROM d) IN (2, 6);

INSERT INTO solo_sessions (swimmer_id, workout_id, scheduled_date) VALUES
  ('de000000-0000-4000-a000-000000000006', 'de0a0000-0000-4000-a000-000000000053', CURRENT_DATE + 1),
  ('de000000-0000-4000-a000-000000000006', 'de0a0000-0000-4000-a000-000000000052', CURRENT_DATE + 4);

COMMIT;

-- 11. Récapitulatif -------------------------------------------------
SELECT 'comptes démo' AS element, count(*) AS nombre FROM auth.users WHERE email LIKE 'demo.%@example.com'
UNION ALL SELECT 'groupes', count(*) FROM groups WHERE club_id = 'de0c0000-0000-4000-a000-000000000001'
UNION ALL SELECT 'séances (club + solo)', count(*) FROM workouts WHERE id::text LIKE 'de0a0000-%'
UNION ALL SELECT 'séances planifiées', count(*) FROM workout_assignments wa JOIN training_slots ts ON ts.id = wa.training_slot_id WHERE ts.id::text LIKE 'de050000-%'
UNION ALL SELECT 'émargements', count(*) FROM workout_sessions ws JOIN workout_assignments wa ON wa.id = ws.workout_assignment_id JOIN training_slots ts ON ts.id = wa.training_slot_id WHERE ts.id::text LIKE 'de050000-%'
UNION ALL SELECT 'feedbacks', count(*) FROM workout_sessions ws JOIN workout_assignments wa ON wa.id = ws.workout_assignment_id JOIN training_slots ts ON ts.id = wa.training_slot_id WHERE ts.id::text LIKE 'de050000-%' AND ws.completed_at IS NOT NULL
UNION ALL SELECT 'séances solo', count(*) FROM solo_sessions WHERE swimmer_id = 'de000000-0000-4000-a000-000000000006';
