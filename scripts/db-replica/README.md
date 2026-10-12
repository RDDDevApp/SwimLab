# Réplique locale de la base

Postgres en mémoire (PGlite) qui rejoue le schéma de SwimLab : une imitation
minimale de Supabase (`supabase_stub.sql`), toutes les migrations de
`docs/migrations/`, les droits par défaut (`grants.sql`) puis les données démo.
Rien n'est envoyé à Supabase.

À utiliser **avant** d'appliquer une migration ou une règle de sécurité en
production : si le script passe ici, deux fois de suite, et que chaque compte voit
ce qu'il doit voir, on peut l'appliquer.

```bash
npm run db:replica                                  # tout rejouer, vérifier que ça passe
npm run db:replica -- docs/migrations/021_x.sql     # + un fichier (le rejouer 2 fois = test d'idempotence)
npm run db:replica -- --no-seed                     # sans les données démo
npm run db:replica -- --as demo.nageuse@example.com --query "select count(*) from workouts"
```

`--as` exécute la requête comme ce compte (rôle `authenticated`, `auth.uid()`
renseigné), donc à travers les règles de sécurité, comme le ferait l'app.

Limites : pas de GoTrue (connexion réelle), pas de PostgREST (jointures embarquées
`table!colonne`), pas d'Edge Functions. Une jointure PostgREST se vérifie contre la
vraie API avec un compte démo.
