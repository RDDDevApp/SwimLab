# SwimLab : consignes pour Claude Code

App de suivi d'entraînement de natation (coach / nageur), Expo + React Native +
Supabase. Vue d'ensemble, stack et commandes : [README.md](./README.md).

## Avec qui on travaille

- Raudi, créateur du projet, ancien nageur et coach, développeur débutant.
- Échanges **en français**, explications simples, phrases complètes, pas de jargon
  non expliqué.
- Il n'a **ni Git ni Node** sur son PC : il teste sur le site en ligne
  (https://rdddevapp.github.io/SwimLab/) et fusionne les pull requests dans GitHub.
  Lui donner des étapes cliquables (liens exacts, nom des boutons).
- Il pilote le produit : demander avant un choix produit ou une action irréversible,
  ne pas demander pour le reste.

## Workflow Git (obligatoire)

- Partir de `develop`, **une branche par sujet** : `feature/…`, `fix/…`, `chore/…`, `docs/…`.
- `npm run check` (types, lint, tests) avant chaque push.
- Ne jamais pousser sur `main` ni `develop` (protégées) : ouvrir une pull request
  vers `develop`. Raudi fusionne, puis `develop` → `main` pour mettre en ligne
  (chaque fusion dans `main` redéploie le site).
- Créer la pull request soi-même via l'API GitHub si `gh` n'est pas authentifié :
  `curl -X POST -H "Content-Type: application/json" https://api.github.com/repos/RDDDevApp/SwimLab/pulls -d '{"title":…,"head":…,"base":"develop","body":…}'`
  (le proxy de session fournit l'authentification).
- Plusieurs branches qui touchent les mêmes fichiers : simuler leur fusion dans
  l'ordre sur une branche locale jetable et résoudre les conflits avant de les livrer.
- Les vérifications « cancelled » sur `develop` ne sont pas des échecs : la CI annule
  le run précédent quand un nouveau commit arrive.

## Base de données (Supabase, projet `kwzghvmwsrodpomtmfjt`, région eu-central-1)

- Données réelles en production : **aucune écriture sans accord**, sauf migration
  demandée et testée.
- Toute migration : fichier `docs/migrations/0NN_sujet.sql`, rejouable, testée deux
  fois de suite sur la réplique (`npm run db:replica -- docs/migrations/0NN_….sql`),
  visibilité vérifiée par compte (`--as <email> --query …`), puis appliquée.
- Appliquer : avec le connecteur Supabase s'il répond (il se déconnecte souvent),
  sinon envoyer le fichier SQL à Raudi pour le SQL Editor (bouton « Run » **sans
  sélection** : « Run selected » n'exécute que le texte sélectionné).
- Le connecteur attend une confirmation humaine pour les instructions destructrices
  (`DELETE`, `DROP`, y compris `DROP POLICY IF EXISTS`) et finit en délai dépassé
  sans rien appliquer. Passer ces fichiers par le SQL Editor de Raudi, ou exécuter
  les autres instructions une par une et vérifier ensuite l'état réel.
- Redéployer une Edge Function existante par le connecteur a échoué (« internal
  error ») le 12 octobre 2026 ; solution de repli : éditeur de code du tableau de
  bord Supabase (Edge Functions → la fonction → Code → Deploy).
- Après application, vérifier contre la vraie API REST avec un compte démo
  (`/auth/v1/token?grant_type=password` puis `/rest/v1/...`).
- Mettre à jour `docs/migrations/README.md` (tableau d'état) à chaque migration.

## Textes de l'interface

- **Tutoiement partout**, coach comme nageur, y compris avant la connexion
  (décision de Raudi, octobre 2026). Jamais de « vous », « votre », « Veuillez ».
- **Accents obligatoires**, majuscules accentuées comprises (« Échauffement », « À venir »).
- Majuscule au premier mot seulement dans les titres (« Mes groupes », « RPE moyen »).
- Messages d'erreur : une phrase simple qui dit quoi faire (« Réessaie dans quelques minutes. »).

## Pièges déjà rencontrés

- **Les tests Jest simulent Supabase** : ils ne voient ni les règles de sécurité (RLS)
  ni les jointures PostgREST. Une requête nouvelle se vérifie contre la vraie API.
- **Jointures `table!colonne`** : il faut une clé étrangère vers cette table.
  `profiles!swimmer_id` a cassé le tableau de bord coach jusqu'à la migration 017.
- **RLS** : passer par des fonctions `SECURITY DEFINER` (voir 011, 018, 020) ; les
  politiques qui se lisent entre elles ont causé des récursions (migrations 008 à 011).
- **Programme secret** : la règle existe en double, en base
  (`get_swimmer_workout_ids`, migration 020) et dans l'app
  (`src/utils/workoutVisibility.ts`, par créneau). Les garder alignées.
- **Liens d'auth** : `detectSessionInUrl` est désactivé ; les liens email sont lus
  par `src/utils/authLink.ts`. Les invitations passent par `?club=<code>`
  (`src/utils/invite.ts`, `src/utils/pendingInvite.ts`).
- Un code d'invitation doit correspondre au rôle du compte (`clubService.joinByCode`).
- Les tests qui importent `react-native` doivent simuler `Platform`
  (`jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }))`).
- **Edge Functions** : répondre à `OPTIONS` avec les en-têtes CORS (sinon le site web
  est bloqué) et vérifier l'appelant dans le code. Les notifications vers d'autres
  utilisateurs passent par `send-push` : l'app ne peut pas lire leurs jetons (RLS).
- ESLint : `react/no-unescaped-entities` est désactivé (règle HTML, sans objet en RN).

## Comptes démo (club « CN Les Dauphins (Démo) »)

Mot de passe commun `SwimLabDemo2026`, connexion en un clic depuis l'app.
`demo.coach@` (Thomas, coach principal), `demo.coach2@` (Julie, coach adjointe),
`demo.nageuse@` (Sophie, compétition, en surcharge RPE), `demo.nageur@` (Lucas,
feedback en attente), `demo.junior@` (Emma), `demo.solo@` (Marc, sans club),
`demo.nouveau@` (Chloé, nouvelle sans club), `demo.nouveaucoach@` (Antoine,
nouveau coach) : tous en `@example.com`. Remise à zéro : `supabase/seed/demo_seed.sql`.

## Tester l'app dans le conteneur

- `npx expo start --web --port 8085` (en arrière-plan), puis Playwright :
  `playwright-core@1.56.1` avec `executablePath: '/opt/pw-browsers/chromium'`.
- Les champs React Native Paper ne sont pas liés à leur label : cibler
  `input:visible`. Des écrans restent montés derrière l'écran courant.
- Lire les captures pour vérifier le rendu, pas seulement la présence d'un texte.

## Chantiers ouverts (par priorité)

1. Avant le pilote, en lots (une pull request par lot) :
   1. Notifications et IA sécurisées : **en service** (fonctions déployées, migrations
      021-022 appliquées, essais réels OK). Reste : secret `CRON_SECRET` + secret
      Vault `cron_secret` (même valeur) ; redéployer `generate-workout` (intervalles
      en secondes, sinon séance coupée) par l'éditeur du tableau de bord ; supprimer
      la fonction de diagnostic `generate-workout-test`.
   2. Emails via **Brevo** (SMTP dans Supabase, modèles d'emails en français).
   3. Nageurs mineurs : date de naissance à l'inscription ; sous 15 ans, case
      « un parent est d'accord » + email du parent informé ; page « Conditions et
      données personnelles ».
   4. Build natif de test (EAS, APK Android) pour les notifications.
   5. Jour J : `EXPO_PUBLIC_DEMO_MODE` à `false` et suppression de la démo
      (gardée d'ici là pour tester).
2. Migrer les 14 écrans encore en chargement manuel vers TanStack Query ; générer
   les types depuis la base (`supabase gen types`) pour supprimer les `any`.
3. Tests des services récents (absences, solo, IA, notifications, bibliothèque) et
   des parcours émargement / feedback.
4. Décision en attente : dépôt public sous licence MIT (code réutilisable par tous).

Audit complet du 11 octobre 2026 : https://claude.ai/artifact/6QEgXoxWRsq4TCYEqm4C2p
