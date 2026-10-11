-- ============================================================
-- Données de démo SwimLab : suppression complète
--
-- Supprime les comptes démo et tout ce qui en dépend (club démo,
-- groupes, créneaux, séances, émargements, feedbacks, données solo).
-- Les vrais utilisateurs ne sont pas touchés : seuls les comptes de
-- la liste ci-dessous sont supprimés.
-- ============================================================

DELETE FROM auth.users
WHERE email IN (
  'demo.coach@example.com',
  'demo.coach2@example.com',
  'demo.nageuse@example.com',
  'demo.nageur@example.com',
  'demo.junior@example.com',
  'demo.solo@example.com',
  'demo.nouveau@example.com',
  'demo.nouveaucoach@example.com',
  'demo.hugo@example.com',
  'demo.lea@example.com',
  'demo.nathan@example.com',
  'demo.ines@example.com',
  'demo.maxime@example.com',
  'demo.camille@example.com',
  'demo.jade@example.com',
  'demo.tom@example.com'
);
