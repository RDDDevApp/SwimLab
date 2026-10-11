# Migrations SQL

Les fichiers sont à appliquer dans l'ordre, dans le SQL Editor de Supabase.

## État de la base de production (vérifié le 11 octobre 2026)

| Migrations | État | Contenu |
|---|---|---|
| 001 à 011 | Appliquées | Schéma de base, bibliothèque de blocs, multi-coachs (`group_coaches`), invités, notifications, règles de sécurité (RLS) réécrites par la 011 |
| 012 | **Absente du dépôt** | La numérotation saute de 011 à 013. Rien ne manque côté base : le schéma réel correspond à la 011 |
| 013 à 016 | **Non appliquées** | Feedback v2, absences déclarées, gamification, mode solo. L'app fonctionne sans, mais ces fonctions ne sauvegardent rien |

Tables présentes : `profiles`, `clubs`, `club_members`, `groups`, `group_coaches`,
`group_members`, `training_slots`, `workouts`, `workout_assignments`,
`workout_sessions`, `block_library`, `push_tokens`.

## Attention

- **Ne pas rejouer 001 à 011 sur la base de production** : elles ne sont pas
  idempotentes (la 001 échoue, `groups.coach_id` a été remplacé par `group_coaches`).
- Les migrations 002 à 011 sont un historique de correctifs RLS. Pour une base neuve,
  il faudra les remplacer par une seule migration de référence extraite de la
  production (`supabase db dump`), voir les recommandations de l'audit.
- 013 à 016 sont additives (nouvelles colonnes et tables), ne modifient pas les
  données existantes et peuvent être rejouées sans erreur.
