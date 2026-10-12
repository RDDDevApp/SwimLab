# SwimLab

Application de suivi d'entraînement de natation qui relie coachs et nageurs :
le coach planifie ses séances et fait l'émargement, le nageur voit son programme,
donne son ressenti (RPE) et suit sa progression.

**Version web en ligne : https://rdddevapp.github.io/SwimLab/** (déployée depuis `main`)

## Fonctionnalités

| Coach | Nageur |
|---|---|
| Club, groupes, multi-coachs, liens d'invitation nageur et coach | Inscription avec code club (ou lien), ou nager en solo |
| Créneaux récurrents et calendrier semaine / mois | Calendrier avec statut de chaque séance |
| Éditeur de séances par blocs, bibliothèque de blocs, export PDF | Programme secret jusqu'à la fin de la séance (sauf choix du coach) |
| Émargement, nageurs invités, absences déclarées | Feedback RPE, fatigue, technique (modifiable 24 h), absence déclarée |
| Statistiques, alertes de surcharge RPE, séances partagées entre coachs | Statistiques, historique, XP, streaks, badges |
| Génération de séances par IA | Mode solo : séances perso, planification, auto-émargement |

Pour tous : mot de passe oublié, suppression de compte, connexion rapide aux comptes
démo (`EXPO_PUBLIC_DEMO_MODE`).

Pas encore en service : la génération par IA et les notifications push (Edge
Functions à déployer, voir « Déploiement »).

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
supabase/seed/       # Données démo (demo_seed.sql) et suppression (demo_reset.sql)
scripts/db-replica/  # Réplique locale de la base pour tester migrations et RLS
docs/                # Vision produit, guides, migrations SQL, archives
.claude/skills/      # Skills Claude Code chargées par les sessions sur ce dépôt
```

## Développement local

Prérequis : Node.js 22 et npm.

```bash
npm install
cp .env.example .env   # déjà rempli avec l'URL et la clé publique du projet
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
| `npm run db:replica` | Rejouer la base en local pour tester une migration (voir [`scripts/db-replica`](./scripts/db-replica/README.md)) |

Les valeurs du `.env` se trouvent dans Supabase : *Project Settings > API*. Seule la
clé publique `anon` va dans l'app ; aucune autre clé ne doit être commitée.

## Données de démo

Un club fictif complet (« CN Les Dauphins », 2 coachs, 3 groupes, 15 nageurs,
6 semaines d'historique, un nageur solo) pour tester l'app sous tous les profils.

1. La démo est déjà en place en production. Pour la remettre à zéro et recaler ses
   dates sur aujourd'hui, exécuter [`supabase/seed/demo_seed.sql`](./supabase/seed/demo_seed.sql)
   dans le SQL Editor de Supabase. Le script est rejouable.
2. Avec `EXPO_PUBLIC_DEMO_MODE=true`, l'écran de connexion et les écrans Profil
   affichent un panneau « Comptes démo » : un clic pour se connecter sous n'importe
   quel profil. Mot de passe commun : `SwimLabDemo2026`.
3. Pour tout supprimer : [`supabase/seed/demo_reset.sql`](./supabase/seed/demo_reset.sql).
   Les vrais comptes ne sont pas touchés.

Avant d'ouvrir l'app à un vrai club : supprimer la démo et passer
`EXPO_PUBLIC_DEMO_MODE` à `false` dans `.github/workflows/deploy-web.yml`.

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
  testées sur la réplique locale puis appliquées à la main dans Supabase. Toutes sont
  appliquées à ce jour (jusqu'à la 020).
- **Auth Supabase** : *Authentication → URL Configuration*, Site URL et Redirect URL
  `https://rdddevapp.github.io/SwimLab/` (liens de confirmation et de mot de passe oublié).
  Les emails passent par le service gratuit de Supabase (quelques envois par heure) :
  prévoir un vrai service d'envoi (SMTP) avant le pilote.
- **Edge Functions** : `supabase functions deploy generate-workout` et `send-push`
  (secret `ANTHROPIC_API_KEY` à définir dans Supabase pour l'IA).

## Skills Claude Code

`.claude/skills/` contient des skills de design front-end (emilkowalski/skills et
leonxlnx/taste-skill, MIT). Elles sont chargées par toute nouvelle session Claude
Code ouverte sur ce dépôt. Sources, versions et licences :
[`.claude/skills/THIRD_PARTY_SKILLS.md`](./.claude/skills/THIRD_PARTY_SKILLS.md).

## Documentation

- [Consignes pour Claude Code](./CLAUDE.md)

- [Vision produit](./docs/product/VISION.md)
- [État des migrations SQL](./docs/migrations/README.md)
- [Restaurer le backend Supabase](./docs/guides/RESTORE_BACKEND.md)
- [Archives (spécification V0, roadmap, ancien schéma)](./docs/archive/README.md)

## Licence

Voir [LICENSE](./LICENSE).
