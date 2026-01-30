# 🌍 Guide Travail à Distance - SwimLab

## 🎯 Objectif

Te permettre de travailler sur SwimLab pendant 1 semaine sans ton ordi principal, via téléphone/tablette/autre appareil.

---

## 📱 Comment Me Donner des Instructions à Distance

### **Option 1 : Claude.ai Web/Mobile** (RECOMMANDÉ ⭐)

**Pourquoi c'est le meilleur** :
- ✅ Accessible depuis n'importe quel appareil (téléphone, tablette, ordi public)
- ✅ Notre conversation continue (historique gardé, contexte projet intact)
- ✅ Je peux créer des fichiers que tu télécharges
- ✅ Projet "SwimLab" reste actif avec tous les docs

**Comment faire** :
1. Va sur https://claude.ai (ou app mobile Claude)
2. Connecte-toi avec ton compte
3. Ouvre le projet "SwimLab" (où on travaille actuellement)
4. Continue la conversation normalement

**Exemples d'instructions** :
```
Toi : "Claude, crée la migration SQL pour la table training_slots"
Moi : [Je génère le fichier SQL avec le code complet]
Toi : [Tu télécharges le fichier depuis Claude.ai]
Toi : [Plus tard, depuis ton ordi, tu push sur GitHub]

Toi : "Lis le PRODUCT_SPEC_V0.md et commence à coder la feature US-006 (Slots)"
Moi : [Je lis le doc, je crée les fichiers nécessaires]
Toi : [Tu télécharges, tu testes, tu push]

Toi : "Regarde dans Notion la page 'Idées Features' et dis-moi ce qu'on peut ajouter en V0.5"
Moi : [Je lis Notion via MCP, je te fais un résumé]
```

**Avantages** :
- Pas besoin de copier-coller le code ailleurs
- Je garde tout le contexte du projet
- Tu peux me demander de l'aide, debug, etc.

---

### **Option 2 : GitHub Issues + Claude** (ORGANISATION)

**Pourquoi c'est utile** :
- ✅ Organisation claire (1 issue = 1 tâche)
- ✅ Traçabilité de ce qui est fait/à faire
- ✅ Tu peux y accéder depuis GitHub mobile app
- ✅ Tu peux me copier-coller les issues dans Claude

**Setup** :
1. Va sur ton repo GitHub
2. Créer des issues pour chaque tâche

**Workflow** :
```
1. Tu crées issue GitHub : "Feature: Créer table training_slots"
2. Dans Claude : "Voici l'issue #1, implémente-la"
3. Je génère le code/migration
4. Tu télécharges et commit
5. Tu fermes l'issue sur GitHub
```

**Template d'Issue** :
```markdown
## Feature: [Nom]

**Description** :
Créer la table training_slots pour les créneaux récurrents

**Acceptance Criteria** :
- [ ] Table créée avec tous les champs
- [ ] RLS policies configurées
- [ ] Indexes créés
- [ ] Migration SQL testée

**Référence** :
Voir DATABASE_SCHEMA_V0.md ligne 234-280
```

---

### **Option 3 : Notion + Claude** (HYBRIDE ⚡)

**Pourquoi c'est puissant** :
- ✅ Tu notes tes idées dans Notion (mobile-friendly)
- ✅ Je peux lire directement dans Notion (MCP connecté)
- ✅ Documentation automatique

**Workflow** :
```
1. Tu ouvres Notion sur ton téléphone
2. Tu vas dans ta base "SwimLab"
3. Tu ajoutes une note : "Feature: Implémenter les slots récurrents"
4. Tu viens sur Claude : "Lis la page Notion 'Feature Slots' et code-la"
5. Je lis Notion, je comprends, je code
6. Je te donne les fichiers
```

**Conseils** :
- Crée une page "ToDo Dev" dans Notion
- Liste les features à implémenter
- Je peux les lire et les traiter une par une

---

## 🔧 Configuration AVANT de Partir (30-45 min)

### 1️⃣ **Créer le Repo GitHub**

**Actions** :
```bash
cd ~/swimlab-app

# Initialiser Git
git init

# Créer .gitignore (déjà fait si tu as utilisé github-setup.sh)

# Premier commit
git add .
git commit -m "🎉 Initial commit - SwimLab V0"

# Créer repo sur GitHub
# Va sur https://github.com/new
# Nom : swimlab-app
# Privé : ✅ Oui
# Créer

# Lier et push
git remote add origin https://github.com/TON_USERNAME/swimlab-app.git
git branch -M main
git push -u origin main
```

### 2️⃣ **Copier Toute la Documentation**

**Actions** :
```bash
# Créer dossier docs
mkdir -p docs

# Copier tous les docs
cp VISION.md docs/
cp PRODUCT_SPEC_V0.md docs/
cp DATABASE_SCHEMA_V0.md docs/
cp TECHNICAL_ROADMAP_V0.md docs/
cp CLAUDE_CODE_SETUP.md docs/
cp swimlab-dev-skill.md docs/

# Copier le README
cp README.md ./

# Commit
git add .
git commit -m "📚 Add complete documentation"
git push
```

### 3️⃣ **Configurer Supabase (Si Pas Déjà Fait)**

**Actions sur Supabase Dashboard** :
```
1. Va sur https://supabase.com
2. Crée un projet "swimlab-app"
3. Note :
   - Project URL : https://xxx.supabase.co
   - anon/public key : eyJxxx...
   - service_role key : eyJxxx... (GARDER SECRET)

4. SQL Editor :
   - Copie le contenu de DATABASE_SCHEMA_V0.md
   - Exécute toutes les migrations SQL
   - Vérifie que les 8 tables + RLS sont créées

5. Test :
   - Crée un utilisateur test "coach@test.com"
   - Vérifie qu'il peut se connecter
```

**Créer .env** :
```bash
# Dans swimlab-app/
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EOF

# ⚠️ NE PAS COMMIT .env (déjà dans .gitignore)
```

### 4️⃣ **Créer .env.example** (Pour Référence)

```bash
cat > .env.example << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Instructions:
# 1. Copie ce fichier en .env
# 2. Remplace les valeurs par tes credentials Supabase
# 3. Ne commit JAMAIS le fichier .env
EOF

git add .env.example
git commit -m "🔐 Add .env.example"
git push
```

---

## 🤖 Configuration Agents (Pour Claude Code)

**Note** : Tu n'as PAS besoin de configurer ça maintenant si tu utilises Claude.ai web/mobile. Les agents sont surtout pour Claude Code sur ton ordi.

Mais voici la config si tu veux la préparer :

### **Fichier** : `.claude/config.json`
```json
{
  "project": "swimlab-app",
  "skills": {
    "enabled": ["frontend-design"],
    "custom": [
      {
        "name": "swimlab-dev",
        "path": "./docs/swimlab-dev-skill.md"
      }
    ]
  },
  "mcpServers": [
    {
      "name": "notion",
      "url": "https://mcp.notion.com/mcp",
      "enabled": true
    },
    {
      "name": "figma",
      "url": "https://mcp.figma.com/mcp",
      "enabled": true
    }
  ]
}
```

### **Fichier** : `.claude/agents/swimlab-dev.md`
```markdown
# SwimLab Dev Agent

## Rôle
Développeur full-stack React Native + Supabase pour SwimLab

## Contexte
- App de gestion de clubs de natation
- Stack : React Native, Expo, TypeScript, Supabase
- Phase : V0 MVP (validation club pilote)

## Skills
- swimlab-dev (conventions projet)
- frontend-design (UI moderne)

## Principes
1. Consulter docs avant de coder
2. Code pédagogique (commentaires)
3. Étape par étape
4. Tests après chaque feature
```

---

## 📝 Workflows à Distance Recommandés

### **Workflow 1 : Développement Feature**

```
1. [TOI] Sur Claude.ai : "Crée la feature US-006 (Créneaux récurrents)"

2. [MOI] Je lis PRODUCT_SPEC_V0.md et DATABASE_SCHEMA_V0.md

3. [MOI] Je crée :
   - Migration SQL : `20260129_create_training_slots.sql`
   - Service : `src/services/slots.service.ts`
   - Types : `src/types/slot.types.ts`
   - Écran : `src/screens/coach/SlotsScreen.tsx`

4. [TOI] Tu télécharges les 4 fichiers

5. [TOI] Plus tard, depuis un ordi, tu :
   - Copies les fichiers dans le projet
   - Testes
   - Commit + push sur GitHub
```

### **Workflow 2 : Feedback sur Code Existant**

```
1. [TOI] Tu me montres un bout de code (screenshot ou copier-coller)

2. [MOI] J'analyse et te donne feedback

3. [MOI] Je propose améliorations si nécessaire

4. [TOI] Tu appliques les changements
```

### **Workflow 3 : Planification / Brainstorm**

```
1. [TOI] "J'ai une idée : ajouter un système de badges pour les nageurs"

2. [MOI] J'analyse par rapport à la roadmap

3. [MOI] Je te dis si c'est V0, V0.5 ou V1+

4. [TOI] Tu notes dans Notion si validé

5. [MOI] J'ajoute à la roadmap si besoin
```

---

## 🚨 Important : Ce Que Je PEUX Faire à Distance

### ✅ Je Peux :
- Créer des fichiers de code (migrations, services, composants, etc.)
- Lire/écrire dans Notion (via MCP)
- Analyser ton code et proposer améliorations
- Créer de la documentation
- Planifier les prochaines features
- Débugger des erreurs (si tu me montres les logs)

### ❌ Je Ne Peux PAS :
- Pousser directement sur ton GitHub (tu dois le faire)
- Tester l'app (tu dois le faire sur ton appareil)
- Exécuter du code directement
- Accéder à ton Supabase dashboard (mais je peux t'aider à le configurer)

---

## 📞 Communication Pendant la Semaine

### **Via Claude.ai** :
- Tu peux m'écrire à tout moment
- Je réponds dès que tu envoies un message
- Historique gardé (tu peux relire nos échanges)

### **Rythme Recommandé** :
```
Jour 1 : Setup GitHub + Supabase (si pas fait avant)
Jour 2-3 : Feature Slots (création table + UI basique)
Jour 4-5 : Feature Création Entraînement (structure JSONB)
Jour 6 : Tests + corrections
Jour 7 : Repos / Planification semaine suivante
```

### **Check-ins** :
- Matin : "Bonjour Claude, c'est quoi la priorité du jour ?"
- Soir : "Voici ce que j'ai fait aujourd'hui [résumé]. C'est OK ?"

---

## ✅ Checklist Avant de Partir

**Fais ça AUJOURD'HUI** :

- [ ] Créer repo GitHub `swimlab-app`
- [ ] Push tout le code actuel
- [ ] Copier tous les docs dans `docs/`
- [ ] Créer README.md
- [ ] Configurer Supabase (projet + migrations SQL)
- [ ] Créer .env (et le garder local, pas sur GitHub)
- [ ] Créer .env.example sur GitHub
- [ ] Tester que tu peux accéder au repo depuis GitHub mobile app
- [ ] Tester que tu peux ouvrir Claude.ai sur ton téléphone
- [ ] Sauvegarder les credentials Supabase (dans ton gestionnaire de mots de passe)

**Optionnel** :
- [ ] Créer 2-3 issues GitHub pour les premières features
- [ ] Noter dans Notion les idées/features à creuser

---

## 🎯 Plan pour la Semaine d'Absence

**Si tu veux avancer le projet même en étant absent** :

### Jour 1-2 : Foundation Database
- Créer migration training_slots
- Ajouter champ `type` dans workouts
- Tester migrations
- **Résultat** : BDD prête pour V0

### Jour 3-4 : Services Layer
- Service slots.service.ts
- Service workouts.service.ts
- Service workoutAssignments.service.ts
- **Résultat** : Logique métier isolée

### Jour 5-6 : Écrans Basiques
- SlotsScreen (liste + création slot)
- CreateWorkoutScreen (formulaire simple)
- **Résultat** : UI minimale fonctionnelle

### Jour 7 : Documentation
- Mettre à jour PROGRESS.md
- Créer CHANGELOG.md
- Préparer sprint suivant
- **Résultat** : Tout documenté pour continuer sereinement

---

**Des questions avant de partir ?** 🚀

**Une fois configuré, tu peux me ping depuis n'importe où !** 📱
