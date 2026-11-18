# Jour J : retirer la démo avant le pilote

À faire le jour où les vrais clubs commencent à utiliser SwimLab, dans cet ordre.
Compter 15 minutes.

## 1. Retirer le panneau « connexion en un clic » du site

1. Ouvrir la pull request « Jour J : retrait de la démo » dans GitHub.
2. Cliquer sur **Ready for review** (elle est en brouillon pour éviter une fusion par erreur).
3. Cliquer sur **Merge pull request** puis **Confirm merge**.
4. Mettre en ligne : ouvrir https://github.com/RDDDevApp/SwimLab/compare/main...develop,
   cliquer sur **Create pull request** deux fois, puis la fusionner.
5. Dix minutes plus tard, sur https://rdddevapp.github.io/SwimLab/ : l'écran de connexion
   ne propose plus les comptes démo.

Pour l'application Android de test : dans `.github/workflows/build-android.yml`, la ligne
`EXPO_PUBLIC_DEMO_MODE` doit aussi passer à `'false'` avant de construire l'APK du pilote
(Claude s'en charge si on le lui demande).

## 2. Supprimer les comptes démo de la base

Ce qui est supprimé : les 16 comptes `demo.…@example.com`, le club « CN Les Dauphins
(Démo) » et tout ce qui en dépend (groupes, créneaux, séances, appels, ressentis,
records, séances solo). C'est **définitif**.

Ce qui n'est pas touché : les vrais comptes et leurs clubs. Vérifié le 18 novembre 2026 :
aucun vrai compte n'est membre du club démo, et toutes les données démo sont reliées
aux comptes démo, donc rien ne reste derrière.

1. Ouvrir Supabase : https://supabase.com/dashboard/project/kwzghvmwsrodpomtmfjt/sql/new
2. Copier tout le contenu du fichier `supabase/seed/demo_reset.sql` (dans GitHub : ouvrir
   le fichier, bouton **Copy raw file** en haut à droite).
3. Le coller dans l'éditeur, ne rien sélectionner, cliquer sur **Run**.
4. Supabase demande une confirmation (suppression) : confirmer.
5. Vérifier : lancer cette requête, elle doit répondre `0`.

   ```sql
   select count(*) from auth.users where email like 'demo.%@example.com';
   ```

## 3. Après

- Demander à Claude de mettre à jour CLAUDE.md (section « Comptes démo » et lot 5).
- Pour refaire une démo plus tard (salon, présentation) : `supabase/seed/demo_seed.sql`
  la recrée à l'identique, sur un projet Supabase de test de préférence.
