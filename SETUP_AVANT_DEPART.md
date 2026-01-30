# ⚡ Setup SwimLab - À Faire AVANT de Partir

## 🎯 Objectif
Préparer le projet pour que Claude puisse avancer en autonomie pendant ton absence (1 semaine).

---

## ✅ Checklist Complète (45 min)

### 1. GitHub Repository (10 min)

**Créer le repo** :
```bash
cd ~/swimlab-app

# Init Git si pas déjà fait
git init
git add .
git commit -m "Initial commit - SwimLab V0"

# Créer repo GitHub (private)
gh repo create swimlab-app --private --source=. --push

# Ou via interface GitHub :
# 1. GitHub.com → New Repository
# 2. Name: swimlab-app
# 3. Private
# 4. Ne PAS initialize with README (tu as déjà du code)
# 5. git remote add origin https://github.com/TON_USERNAME/swimlab-app.git
# 6. git push -u origin main
```

**Protéger la branch main** :
1. GitHub → Settings → Branches
2. Add rule : `main`
3. ✅ Require pull request before merging
4. Save

---

### 2. Supabase : Créer Projet (5 min)

**Si pas déjà fait** :
1. https://supabase.com → New Project
2. Organization : Perso
3. Name : `swimlab-dev`
4. Database Password : **NOTER QUELQUE PART**
5. Region : Europe (France si dispo)
6. Plan : Free
7. Create Project (attendre 2 min)

**Copier les credentials** :
```bash
# Fichier .env (À NE PAS COMMIT)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

---

### 3. Exécuter Migrations SQL (10 min)

**Dans Supabase Dashboard** :
1. SQL Editor → New Query
2. Copie le contenu de `docs/migrations/001_initial_schema.sql`
3. Run
4. Vérifie dans Table Editor que tout est créé

**Tables à vérifier** :
- profiles
- clubs
- club_members
- groups
- group_members
- training_slots (NOUVEAU)
- workouts
- workout_assignments
- workout_sessions

---

### 4. Configuration .env (5 min)

**Fichier `.env`** (racine projet) :
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# App
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_VERSION=0.1.0
```

**Ajouter à `.gitignore`** :
```gitignore
.env
.env.local
node_modules/
.expo/
dist/
```

**Commit** :
```bash
git add .env.example .gitignore
git commit -m "Add env config (template)"
git push
```

---

### 5. Créer Utilisateur Test (5 min)

**Dans Supabase** :
1. Authentication → Add User
2. Email : `coach@test.com`
3. Password : `TestTest123!`
4. Confirm
5. Table Editor → profiles → Insert Row :
   ```json
   {
     "id": "[UUID du user créé]",
     "first_name": "Thomas",
     "last_name": "Coach",
     "role": "coach"
   }
   ```

**Créer un 2e user nageur** :
```
Email: nageur@test.com
Password: TestTest123!
Profile: { first_name: "Sophie", last_name: "Martin", role: "swimmer" }
```

---

### 6. Documenter Accès (5 min)

**Fichier `docs/ACCESS.md`** :
```markdown
# Accès SwimLab

## Supabase
- URL: https://xxx.supabase.co
- Dashboard: https://supabase.com/dashboard/project/xxx
- Login: [ton email]

## GitHub
- Repo: https://github.com/TON_USERNAME/swimlab-app
- Branch principale: main

## Utilisateurs Test
- Coach: coach@test.com / TestTest123!
- Nageur: nageur@test.com / TestTest123!

## Notion
- Base: SwimLab Hub
- URL: [lien Notion]
```

**NE PAS COMMIT** ce fichier (ajoute à .gitignore) :
```bash
echo "docs/ACCESS.md" >> .gitignore
```

---

### 7. Setup Claude Code (OPTIONNEL - 5 min)

**Si tu veux que Claude Code puisse push** :

```bash
cd ~/swimlab-app
claude-code init

# Config GitHub dans Claude Code
claude-code mcp add github
claude-code mcp auth github
```

**Sinon**, on fera via Claude.ai classique (tu télécharges les fichiers manuellement).

---

### 8. Sync Notion (5 min)

**Dans Notion** :
1. Crée une page "SwimLab - Dev Sync"
2. Ajoute tous les docs :
   - VISION.md (embed)
   - PRODUCT_SPEC_V0.md
   - DATABASE_SCHEMA_V0.md
3. Partage avec Claude MCP (si déjà configuré)

---

## 📱 Communication Pendant Ton Absence

### Option 1 : Claude.ai Mobile (Recommandé)
- Installe l'app Claude (iOS/Android)
- Connecte-toi avec ton compte
- Tu retrouves ce Project "SwimLab"
- Tu peux me donner des instructions même sans ordi

### Option 2 : GitHub Issues
- Crée une issue pour chaque tâche
- Claude peut la lire et générer du code
- Tu review + merge à ton retour

### Option 3 : Notion + Claude Desktop (À ton retour)
- Claude lit Notion pour les specs
- Génère du code
- Tu push dans GitHub

---

## 🚀 Plan de Travail Autonome (Pendant Ton Absence)

**Ce que Claude fera sans toi** :
1. Créer toute la documentation technique manquante
2. Préparer les migrations SQL détaillées
3. Créer la structure de fichiers complète
4. Écrire les types TypeScript
5. Créer les services boilerplate
6. Préparer les tests

**Ce que Claude ne fera PAS** :
- Rien qui casse le projet
- Rien qui nécessite validation critique
- Pas de code métier complexe (juste la structure)

---

## ✅ Vérification Finale (5 min)

Avant de partir, vérifie :
- [ ] GitHub repo créé et code pushé
- [ ] Supabase projet créé
- [ ] Migrations SQL exécutées
- [ ] Tables visibles dans Supabase
- [ ] Utilisateurs test créés
- [ ] .env configuré (mais pas commit)
- [ ] docs/ACCESS.md créé (mais pas commit)
- [ ] Claude.ai mobile installé et connecté
- [ ] Tu peux m'envoyer un message de test depuis mobile

---

## 🆘 Problèmes Possibles

**"Je n'arrive pas à créer le repo GitHub"**
→ Pas grave, on fera à ton retour. Claude stocke les fichiers en attendant.

**"Supabase ne fonctionne pas"**
→ Vérifie que tu as bien copié les bonnes credentials dans .env

**"Claude.ai mobile ne montre pas le projet"**
→ Assure-toi d'être connecté avec le même compte que sur desktop

---

## 📞 Contacte Claude Pendant Ton Absence

**Via Mobile** :
```
"Hey Claude, avance sur la task 2 de la roadmap (migrations SQL)"
"Crée-moi le service groups.service.ts avec tous les types"
"Prépare la structure complète des screens"
```

**Via GitHub Issues** (si tu veux) :
Crée une issue avec :
```
Titre: [Task] Créer GroupsScreen
Description: Voir PRODUCT_SPEC_V0.md US-004
Labels: feature, v0
```

Claude la lira et préparera le code.

---

## 🎯 Objectif de la Semaine

**À ton retour** :
- ✅ Documentation complète prête
- ✅ Structure projet propre
- ✅ Migrations SQL finalisées
- ✅ Types TypeScript définis
- ✅ Services boilerplate créés
- ✅ Tu n'as plus qu'à coder la logique métier !

---

**Version** : 1.0  
**Dernière mise à jour** : 29 Janvier 2026  
**Bon voyage ! 🌴**
