-- Migration 022 : rappels push planifiés (pg_cron + pg_net)
-- Problème : l'Edge Function send-push existait mais rien ne la déclenchait.
-- Solution : deux tâches planifiées qui appellent send-push avec l'en-tête
-- x-cron-secret :
--   - training-reminder : tous les jours à 17 h UTC (18 h à Paris en hiver, 19 h en été),
--     rappel des séances du lendemain ;
--   - feedback-reminder : tous les jours à 19 h UTC (20 h / 21 h à Paris),
--     rappel des feedbacks en attente (3 derniers jours).
--
-- Prérequis (une fois, hors migration, car ce sont des secrets) : deux secrets Vault
--   select vault.create_secret('https://<projet>.supabase.co', 'project_url');
--   select vault.create_secret('<valeur de CRON_SECRET>', 'cron_secret');
-- La même valeur doit être définie comme secret CRON_SECRET des Edge Functions.
-- Les tâches lisent ces secrets à chaque exécution : pas de secret dans ce fichier.
--
-- Sans pg_cron (réplique locale PGlite), la migration ne fait rien.
-- Rejouable : cron.schedule remplace une tâche existante du même nom.

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron')
     OR NOT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_net') THEN
    RAISE NOTICE 'pg_cron ou pg_net indisponible : tâches planifiées non créées';
    RETURN;
  END IF;

  CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

  PERFORM cron.schedule(
    'training-reminder',
    '0 17 * * *',
    $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
               || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
        ),
        body := '{"type": "training_reminder"}'::jsonb
      );
    $job$
  );

  PERFORM cron.schedule(
    'feedback-reminder',
    '0 19 * * *',
    $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
               || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
        ),
        body := '{"type": "feedback_reminder"}'::jsonb
      );
    $job$
  );
END
$migration$;
