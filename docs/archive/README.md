# Archives

Documents d'étapes terminées, conservés pour l'historique. Ils ne décrivent plus
l'état actuel de l'application.

| Document | Pourquoi archivé |
|---|---|
| `PRODUCT_SPEC_V0.md` | Spécification du MVP V0, entièrement livrée |
| `TECHNICAL_ROADMAP_V0.md` | Roadmap par sprints jusqu'à V1 ; les sprints 7 à 12 sont livrés |
| `DATABASE_SCHEMA_V0.md` | Décrit des tables supprimées depuis (`exercise_library`, `workout_templates`) et ignore `group_coaches`, `block_library` ; la référence est désormais `docs/migrations/` |
| `PLAN_REFONTE_SEANCES.md` | Plan de refonte de l'éditeur de séances, exécuté |

Le prototype Figma V1 (projet Vite) et les wireframes V0 ont été retirés du dépôt.
Ils restent dans l'historique de `main` (commit `7bf270e`). Pour les récupérer :

```bash
git checkout 7bf270e -- "SwimLab Figma V1" wireframes_v0.html
```
