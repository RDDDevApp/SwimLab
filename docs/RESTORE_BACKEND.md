# Restaurer / recréer le backend Supabase

Symptôme : `ERR_NAME_NOT_RESOLVED` sur `<ref>.supabase.co` dans la console,
bannière rouge "Serveur injoignable" dans l'app. Le projet Supabase n'existe
plus à cette URL (supprimé, ou pause prolongée du tier gratuit).

## Option A — Le projet est en pause

1. https://supabase.com/dashboard → ouvrir le projet
2. Cliquer **Restore project** et attendre la fin
3. Rien d'autre à faire : l'URL et les clés ne changent pas

## Option B — Le projet n'existe plus (recréation)

1. **Créer un nouveau projet** sur https://supabase.com/dashboard
2. **Appliquer les migrations dans l'ordre** (SQL Editor) :
   `docs/migrations/001_*.sql` → `016_solo_mode.sql`, une par une
3. **Mettre à jour `.env`** (et `.env.example`) :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<nouveau-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<nouvelle cle anon>
   ```
4. **Redéployer les Edge Functions** :
   ```bash
   supabase link --project-ref <nouveau-ref>
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   supabase functions deploy generate-workout
   supabase functions deploy send-push
   ```
5. Relancer l'app (`npx expo start --web -c` pour vider le cache) et
   recréer un compte coach + club de test

## Vérifier que le backend répond

```bash
curl https://<ref>.supabase.co/auth/v1/health
# → {"version":"...","name":"GoTrue",...}
```

L'app fait ce même health check au démarrage : la bannière rouge disparaît
d'elle-même dès que le projet répond (re-test toutes les 30 s, ou tap sur
la bannière).
