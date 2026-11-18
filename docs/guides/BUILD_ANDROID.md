# Application Android de test (lot 4)

GitHub construit l'application Android (fichier APK) à partir du code, sans rien
installer sur ton PC et sans compte à créer. Tu l'installes ensuite sur un téléphone
Android pour tester l'app « en vrai » : icône sur l'écran d'accueil, plein écran,
notifications.

## Construire l'APK

1. Ouvrir https://github.com/RDDDevApp/SwimLab/actions/workflows/build-android.yml
2. Cliquer sur **Run workflow** (à droite), laisser la branche `main`, puis le bouton
   vert **Run workflow**.
3. Attendre que la ligne qui apparaît passe au vert (environ 20 à 30 minutes). On peut
   fermer la page en attendant.
4. Cliquer sur cette ligne. En bas de la page, rubrique **Artifacts**, cliquer sur
   **SwimLab-APK** : un fichier `.zip` se télécharge. Il contient `app-release.apk`.

Le bouton **Run workflow** n'apparaît qu'une fois ce changement mis en ligne
(`develop` fusionné dans `main`).

## Installer l'APK sur un téléphone Android

1. Envoyer le fichier `app-release.apk` sur le téléphone (par email à toi-même, Google
   Drive, ou câble USB), après l'avoir sorti du `.zip`.
2. Sur le téléphone, ouvrir le fichier. Android demande d'autoriser l'installation
   d'applications depuis cette source (Gmail, Drive ou Fichiers) : **Paramètres** →
   activer **Autoriser depuis cette source**, puis revenir et **Installer**.
3. Google Play Protect peut avertir « application inconnue » : c'est normal pour une app
   de test qui ne vient pas du Play Store. Choisir **Installer quand même**.
4. Pour une nouvelle version : construire un nouvel APK et l'installer par-dessus,
   les données restent.

L'APK fonctionne avec la vraie base (mêmes comptes que le site, démo comprise tant que
la démo n'est pas retirée). Il vise les téléphones récents (processeur 64 bits, soit la
quasi-totalité des téléphones vendus depuis 2017).

## Les notifications

L'app sait déjà demander l'autorisation et enregistrer le téléphone. Pour que les
notifications arrivent vraiment sur Android, il manque deux comptes gratuits, à faire
quand tu voudras tester les notifications :

1. **Expo** (le service qui relaie les notifications) : créer un compte sur
   https://expo.dev/signup, puis un projet nommé `swimlab` (**Create a project**).
   Donner à Claude l'**ID** du projet (affiché sur la page du projet, de la forme
   `1a2b3c4d-…`) : il n'est pas secret.
2. **Firebase** (le service de Google qui livre les notifications Android) : Claude
   te guidera le moment venu pour créer le projet, récupérer le fichier
   `google-services.json` et déposer la clé de service dans Expo.

## Plus tard : le Play Store

Cet APK est signé avec une clé de test : parfait pour essayer, mais le Play Store
demandera une version signée avec une clé définitive (via EAS, le service de
construction d'Expo) et un compte développeur Google (25 $, une fois). À voir après le
pilote.
