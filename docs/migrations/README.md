# Migrations SQL

Les fichiers sont appliqués dans l'ordre, à la main, dans le SQL Editor de Supabase
(bouton « Run », sans sélection). Avant toute application, les tester sur la
réplique locale : `npm run db:replica -- docs/migrations/<fichier>.sql` (voir
[`scripts/db-replica`](../../scripts/db-replica/README.md)).

## État de la base de production (vérifié le 12 octobre 2026)

Toutes les migrations du dépôt sont appliquées, jusqu'à la 022.

| Migrations | Contenu |
|---|---|
| 001 à 011 | Schéma de base, bibliothèque de blocs, multi-coachs (`group_coaches`), invités, notifications, règles de sécurité (RLS) réécrites par la 011 |
| 012 | **N'existe pas** : la numérotation saute de 011 à 013. Rien ne manque côté base |
| 013 | Feedback v2 : fatigue et technique (1 à 5) |
| 014 | Absences déclarées (`session_presence`) |
| 015 | Gamification : badges (`swimmer_badges`), records (`personal_records`), objectif mensuel du club |
| 016 | Mode solo : séances sans club, `solo_sessions` |
| 017 | Lien `workout_sessions.swimmer_id` → `profiles` (requis par les jointures `profiles!swimmer_id`) |
| 018 | Un coach lit les séances programmées dans ses groupes et les séances publiées de son club |
| 019 | `delete_my_account()` : suppression de compte par l'utilisateur, en protégeant les clubs |
| 020 | Programme secret : un nageur ne lit une séance qu'après la fin, l'émargement ou si le coach l'a montrée (`workouts.show_before_session`) |
| 021 | Journal des générations IA (`ai_generations`) : plafond de 10 séances générées par jour et par compte |
| 022 | Rappels push planifiés (`pg_cron` + `pg_net`) qui appellent `send-push` (17 h et 19 h UTC). Secrets Vault : `project_url` (créé), `cron_secret` (à créer, même valeur que le secret `CRON_SECRET` des Edge Functions). Sans effet sur la réplique locale |

Données démo : [`supabase/seed/demo_seed.sql`](../../supabase/seed/demo_seed.sql), appliquées et rejouables.

## Règles

- **Ne jamais rejouer 001 à 011 sur la production** : elles ne sont pas idempotentes
  (la 001 échoue, `groups.coach_id` a été remplacé par `group_coaches`).
- **À partir de la 013, chaque migration est rejouable** : `IF NOT EXISTS`,
  `CREATE OR REPLACE`, `DROP POLICY IF EXISTS` avant `CREATE POLICY`. Garder cette règle.
- Nouvelle migration : `0NN_sujet.sql`, un en-tête qui explique le problème et la
  solution, testée deux fois de suite sur la réplique, puis appliquée en production.
- Les migrations 002 à 011 sont un historique de correctifs RLS. Pour monter une base
  neuve proprement, il faudra une migration de référence extraite de la production
  (`supabase db dump`).
