# SwimLab - Lancer l'application en mode Web

## Prerequis

- **Node.js** >= 18 installe (`node -v` pour verifier)
- **npm** >= 9 (`npm -v`)
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)

## 1. Installation des dependances

Depuis la racine du projet :

```bash
npm install
```

Cela installe toutes les dependances, y compris les packages web necessaires
(`react-dom`, `react-native-web`, `@expo/metro-runtime`).

## 2. Configuration de l'environnement

Cree un fichier `.env` a la racine du projet a partir du modele :

```bash
cp .env.example .env
```

Remplis les valeurs avec tes identifiants Supabase :

```
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon-ici
```

> Tu trouves ces valeurs dans **Supabase Dashboard > Settings > API**.

## 3. Lancer le serveur de developpement

```bash
npm run web
```

Cela execute `expo start --web` en arriere-plan. Le serveur demarre et :
- Ouvre automatiquement ton navigateur sur `http://localhost:8081`
- Affiche les logs dans le terminal
- Recharge automatiquement a chaque modification de code (Hot Reload)

### Commande alternative (mode interactif)

```bash
npx expo start
```

Puis appuie sur **`w`** dans le terminal pour ouvrir la version web.

## 4. Naviguer dans l'app

Au lancement, tu arrives sur l'ecran de **connexion** :

1. **Creer un compte** : clique sur "Creer un compte", choisis ton role (Coach ou Nageur), remplis les champs
2. **Se connecter** : entre email + mot de passe
3. Apres connexion, tu es redirige vers le **Dashboard** correspondant a ton role

### Ecrans disponibles (Coach)

| Onglet | Description |
|--------|-------------|
| Dashboard | Accueil avec stats et raccourcis |
| Calendrier | Vue calendrier (a venir) |
| Entrainements | Liste des seances |
| Groupes | Gestion des groupes |
| Profil | Informations personnelles |

### Ecrans disponibles (Nageur)

| Onglet | Description |
|--------|-------------|
| Dashboard | Accueil avec prochains entrainements |
| Entrainements | Vue calendrier des seances |
| Profil | Informations personnelles |

## 5. Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run web` | Lancer en mode web |
| `npm start` | Lancer Expo (tous les modes) |
| `npm test` | Lancer les tests unitaires |
| `npm run test:watch` | Tests en mode watch |

## 6. Depannage

### Le navigateur ne s'ouvre pas automatiquement

Ouvre manuellement `http://localhost:8081` dans ton navigateur.

### Erreur "EXPO_PUBLIC_SUPABASE_URL is not defined"

Verifie que le fichier `.env` existe a la racine et contient les bonnes valeurs.
Relance le serveur apres avoir modifie `.env`.

### Erreur de port (8081 deja utilise)

```bash
npx expo start --web --port 3000
```

### L'ecran reste blanc / erreur JS dans la console

1. Ouvre les DevTools du navigateur (F12)
2. Regarde l'onglet Console pour les erreurs
3. Essaie un hard refresh : `Ctrl+Shift+R` (ou `Cmd+Shift+R` sur Mac)

### Probleme avec expo-secure-store sur le web

`expo-secure-store` utilise `localStorage` en fallback sur le web. Si tu as des
problemes d'authentification, verifie que les cookies/localStorage ne sont pas
bloques par ton navigateur.

## 7. Differences Web vs Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| Stockage tokens | localStorage | SecureStore (chiffre) |
| Navigation | URL-based | Stack natif |
| Rendu | DOM (react-native-web) | Composants natifs |
| Performance | Bonne | Optimale |

> **Note** : L'app est d'abord concue pour mobile. Le mode web est pratique
> pour le developpement et les demos, mais l'experience finale cible iOS/Android.
