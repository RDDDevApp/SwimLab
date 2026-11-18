-- Migration 023 : consentements et nageurs mineurs (lot 3 du pilote)
-- Problème : en France, avant 15 ans, il faut l'accord d'un parent pour créer un
-- compte en ligne. SwimLab ne connaissait ni l'âge des nageurs ni leur accord aux
-- conditions d'utilisation.
-- Solution (décision de Raudi, octobre 2026) : date de naissance à l'inscription ;
-- sous 15 ans, email d'un parent et case « un parent est d'accord » ; pour tous,
-- acceptation de la page « Conditions et données personnelles ». Le parent reçoit
-- un email d'information (Edge Function notify-parent, quand le service d'email est
-- branché).
--
-- Ces données ne vont PAS dans `profiles` : tout compte connecté peut lire tous les
-- profils (politique profiles_select de la 011). Table à part, lisible et modifiable
-- seulement par son titulaire (et par le rôle service des Edge Functions).
-- Rejouable.

CREATE TABLE IF NOT EXISTS member_consents (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date date,
  parent_email text,
  parental_consent_at timestamptz,
  terms_accepted_at timestamptz,
  parent_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_consents_birth_date_plausible
    CHECK (birth_date IS NULL OR (birth_date > '1900-01-01' AND birth_date <= current_date))
);

ALTER TABLE member_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_consents_select_own" ON member_consents;
CREATE POLICY "member_consents_select_own" ON member_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "member_consents_insert_own" ON member_consents;
CREATE POLICY "member_consents_insert_own" ON member_consents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "member_consents_update_own" ON member_consents;
CREATE POLICY "member_consents_update_own" ON member_consents
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- À l'inscription, les choix faits dans le formulaire arrivent dans les métadonnées
-- du compte (supabase.auth.signUp, options.data) : on les range ici. Déclencheur à
-- part pour ne pas toucher à handle_new_user (création du profil).
CREATE OR REPLACE FUNCTION public.handle_new_user_consents()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  birth date;
BEGIN
  BEGIN
    birth := NULLIF(meta->>'birth_date', '')::date;
  EXCEPTION WHEN others THEN
    birth := NULL; -- date illisible : on ne bloque jamais une inscription pour ça
  END;
  IF birth IS NOT NULL AND (birth <= '1900-01-01' OR birth > current_date) THEN
    birth := NULL;
  END IF;

  INSERT INTO public.member_consents (user_id, birth_date, parent_email, parental_consent_at, terms_accepted_at)
  VALUES (
    NEW.id,
    birth,
    NULLIF(lower(trim(meta->>'parent_email')), ''),
    CASE WHEN (meta->>'parental_consent')::boolean IS TRUE THEN now() END,
    CASE WHEN (meta->>'terms_accepted')::boolean IS TRUE THEN now() END
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW; -- jamais d'inscription refusée à cause des consentements
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_consents ON auth.users;
CREATE TRIGGER on_auth_user_created_consents
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_consents();

-- Email d'information au parent : toutes les heures, l'Edge Function notify-parent
-- traite les comptes dont le parent n'a pas encore été prévenu (même secret que la 022).
DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     OR NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_cron ou pg_net absent : tâche notify-parent non créée';
    RETURN;
  END IF;

  PERFORM cron.schedule(
    'notify-parent',
    '5 * * * *',
    $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
               || '/functions/v1/notify-parent',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
        ),
        body := '{}'::jsonb
      );
    $job$
  );
END
$migration$;
