# SwimLab

Application de suivi d'entraînement de natation qui relie coachs et nageurs :
le coach planifie ses séances et fait l'émargement, le nageur voit son programme,
donne son ressenti (RPE) et suit sa progression.

**Version web en ligne : https://rdddevapp.github.io/SwimLab/** (déployée depuis `main`)

## Fonctionnalités

| Coach | Nageur |
|---|---|
| Club, groupes, multi-coachs, codes d'invitation | Rejoindre un club par code, ou nager en solo |
| Créneaux récurrents et calendrier semaine / mois | Calendrier avec statut de chaque séance |
| Éditeur de séances par blocs, bibliothèque de blocs, export PDF | Détail de la séance, compte à rebours |
| Émargement, nageurs invités, absences déclarées | Feedback RPE, fatigue, technique (modifiable 24 h) |
| Statistiques, alertes de surcharge RPE | Statistiques, historique, XP, streaks, badges |
| Génération de séances par IA | Mode solo : séances perso, planification, auto-émargement |

Certaines fonctions demandent des migrations ou des services pas encore déployés :
voir [l'état des migrations](./docs/migrations/README.md).

## Stack

- **App** : Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 (iOS, Android, web)
- **UI** : React Native Paper, design system maison (`src/config/tokens.ts`, `src/components/`)
- **Données** : TanStack Query (cache serveur), Zustand (session, snackbar)
- **Navigation** : React Navigation 7
- **Backend** : Supabase (Postgres + RLS, Auth, Edge Functions)
- **IA** : API Claude via l'Edge Function `generate-workout` (clé côté serveur uniquement)

## Structure

```
src/
├── components/   # Design system et composants partagés (workout/, calendar/)
├── config/       # Supabase, thème, tokens, gamification, badges, feature flags
├── hooks/        # Hooks TanStack Query (dashboards, historique, solo, gamification)
├── navigation/   # Navigateurs Auth / Coach / Swimmer
├── screens/      # Écrans par rôle : auth, coach, swimmer, onboarding, shared, dev
├── services/     # Accès Supabase, un service par domaine
├── stores/       # Zustand
├── types/        # Types de la base et de la navigation
└── utils/        # Dates, export PDF, migration du format de séance
supabase/functions/  # Edge Functions (Deno) : generate-workout, send-push
docs/                # Vision produit, guides, migrations SQL, archives
```

## Développement local

Prérequis : Node.js 22 et npm.

```bash
npm install
cp .env.example .env   # puis renseigner l'URL et la clé anon du projet Supabase
npm run web            # http://localhost:8081
```

| Commande | Rôle |
|---|---|
| `npm run web` | Lancer la version web en local |
| `npm start` | Lancer Expo (QR code pour Expo Go) |
| `npm run typecheck` | Vérifier les types |
| `npm run lint` | Lancer ESLint |
| `npm test` | Lancer les tests |
| `npm run check` | Les trois à la suite, à lancer avant chaque pull request |

Les valeurs du `.env` se trouvent dans Supabase : *Project Settings > API*. Seule la
clé publique `anon` va dans l'app ; aucune autre clé ne doit être commitée.

## Branches et workflow

| Branche | Rôle | Règle |
|---|---|---|
| `main` | Production : ce qui est en ligne | Ne reçoit que des pull requests depuis `develop` (ou `hotfix/*`). Chaque merge redéploie le site |
| `develop` | Intégration : la prochaine version | Reçoit les pull requests des branches de travail. La CI (types, lint, tests) doit passer |
| `feature/<sujet>` | Nouvelle fonctionnalité | Part de `develop`, revient dans `develop` |
| `fix/<sujet>` | Correction non urgente | Part de `develop`, revient dans `develop` |
| `chore/<sujet>` | Outillage, dépendances, docs | Part de `develop`, revient dans `develop` |
| `hotfix/<sujet>` | Correction urgente en production | Part de `main`, revient dans `main` **et** `develop` |
| `claude/*` | Branches créées par les sessions Claude Code | Traitées comme des `feature/*` : pull request vers `develop` |

Cycle normal :

```bash
git checkout develop && git pull
git checkout -b feature/feedback-parents
# ... commits ...
npm run check
git push -u origin feature/feedback-parents
# ouvrir une pull request vers develop ; supprimer la branche une fois fusionnée
```

## Déploiement

- **Web** : `.github/workflows/deploy-web.yml` construit et publie sur GitHub Pages à
  chaque push sur `main` (relance manuelle possible depuis l'onglet Actions).
- **CI** : `.github/workflows/ci.yml` vérifie types, lint et tests sur chaque pull
  request vers `main` ou `develop`.
- **Base de données** : migrations SQL dans [`docs/migrations/`](./docs/migrations/README.md),
  appliquées à la main dans Supabase.
- **Edge Functions** : `supabase functions deploy generate-workout` et `send-push`
  (secret `ANTHROPIC_API_KEY` à définir dans Supabase pour l'IA).

## Documentation

- [Vision produit](./docs/product/VISION.md)
- [État des migrations SQL](./docs/migrations/README.md)
- [Restaurer le backend Supabase](./docs/guides/RESTORE_BACKEND.md)
- [Archives (spécification V0, roadmap, ancien schéma)](./docs/archive/README.md)

## Licence

Voir [LICENSE](./LICENSE).
