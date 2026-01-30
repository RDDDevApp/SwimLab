# 🚀 Guide Installation Claude Code pour SwimLab

## 📋 Checklist Complète

### Étape 1 : Installer Claude Code
```bash
# Via npm (recommandé)
npm install -g @anthropic-ai/claude-code

# Ou via Homebrew (macOS)
brew install claude-code
```

### Étape 2 : Initialiser dans le Projet SwimLab
```bash
cd ~/path/to/swimlab-app
claude-code init
```

Cela crée un dossier `.claude/` avec la config.

---

## 🛠️ Configuration Optimale

### 1. Activer les Skills

**Fichier** : `.claude/config.json`

```json
{
  "skills": {
    "enabled": [
      "frontend-design",
      "skill-creator"
    ],
    "custom": [
      {
        "name": "swimlab-dev",
        "path": "./docs/swimlab-dev-skill.md"
      }
    ]
  }
}
```

**Actions** :
1. Copie `swimlab-dev-skill.md` dans `docs/` de ton projet
2. Ajoute la référence dans `.claude/config.json`

---

### 2. Configurer les MCP (Connecteurs)

**Fichier** : `.claude/mcp.json`

```json
{
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

**Actions** :
1. Connecte ton compte Notion (OAuth)
2. Connecte ton compte Figma (OAuth)
3. Donne accès à la base "SwimLab" dans Notion

---

### 3. Créer l'Agent Principal

**Fichier** : `.claude/agents/swimlab-dev.md`

```markdown
# SwimLab Dev Agent

## Rôle
Développeur full-stack React Native + Supabase pour SwimLab

## Contexte Projet
- App de gestion de clubs de natation
- Stack : React Native, Expo, TypeScript, Supabase
- Phase : V0 MVP (validation club pilote)
- Timeline : 10-12 semaines

## Skills Actifs
- swimlab-dev (conventions projet)
- frontend-design (UI moderne)

## MCP Actifs
- Notion : Lire/écrire dans base SwimLab
- Figma : Consulter designs UI/UX

## Principes de Travail
1. Toujours consulter Notion avant de coder
2. Code pédagogique (commentaires pour junior dev)
3. Étape par étape, validation avant de continuer
4. Tests après chaque feature
5. Fonctionnel avant design

## Accès Fichiers
- VISION.md : Vision produit complète
- PRODUCT_SPEC_V0.md : Specs détaillées V0
- DATABASE_SCHEMA_V0.md : Schema BDD
- TECHNICAL_ROADMAP_V0.md : Roadmap technique

## Commands Rapides
- `npm start` : Lancer Expo
- `npm run test` : Tests
- `npx supabase start` : Supabase local
```

---

### 4. Structure Projet Recommandée

```
swimlab-app/
├─ .claude/
│   ├─ config.json          # Config globale
│   ├─ mcp.json             # Connecteurs MCP
│   └─ agents/
│       └─ swimlab-dev.md   # Agent principal
├─ docs/
│   ├─ VISION.md
│   ├─ PRODUCT_SPEC_V0.md
│   ├─ DATABASE_SCHEMA_V0.md
│   ├─ TECHNICAL_ROADMAP_V0.md
│   └─ swimlab-dev-skill.md  # Skill custom
├─ src/
│   ├─ screens/
│   ├─ components/
│   ├─ services/
│   ├─ hooks/
│   ├─ types/
│   └─ utils/
├─ .gitignore
├─ package.json
└─ README.md
```

---

## 🎯 Commandes Claude Code

### Démarrer une Session
```bash
# Mode interactif
claude-code

# Avec agent spécifique
claude-code --agent swimlab-dev

# Avec contexte fichier
claude-code --context docs/PRODUCT_SPEC_V0.md
```

### Commandes Utiles
```bash
# Lister agents disponibles
claude-code agents list

# Activer/désactiver un skill
claude-code skills enable frontend-design
claude-code skills disable canva

# Vérifier config MCP
claude-code mcp status

# Sync avec Notion
claude-code sync notion
```

---

## 📝 Workflows Recommandés

### Workflow 1 : Nouvelle Feature
```
1. Ouvre Claude Code : `claude-code --agent swimlab-dev`
2. Demande : "Consulte Notion et lis la US-006 (Création Slots)"
3. Claude lit la spec dans Notion
4. Demande : "Crée les fichiers nécessaires pour cette feature"
5. Claude génère code + tests
6. Vérifie, teste, ajuste
7. Commit
```

### Workflow 2 : Debug
```
1. `claude-code --agent swimlab-dev`
2. Partage l'erreur
3. Claude analyse le code
4. Propose fix
5. Test
```

### Workflow 3 : Design Component
```
1. `claude-code --agent swimlab-dev`
2. "Consulte Figma pour le composant GroupCard"
3. Claude voit le design dans Figma
4. "Crée le composant React Native en suivant ce design"
5. Claude génère avec skill frontend-design
```

---

## ⚙️ Configuration Avancée (Optionnel)

### Custom Prompts
**Fichier** : `.claude/prompts/create-screen.md`

```markdown
Crée un écran React Native avec :
- TypeScript strict
- Props typées
- Hooks useState/useEffect si nécessaire
- Service layer pour data
- Error handling
- Loading state
- React Native Paper components
```

Usage : `claude-code --prompt create-screen`

---

### Sub-Agents (V0.5+)

Quand ton projet grossit, tu peux créer des sub-agents spécialisés :

**`.claude/agents/backend-expert.md`**
```markdown
# Backend Expert

Spécialisé dans :
- Supabase queries
- RLS policies
- Database migrations
- API optimization
```

**`.claude/agents/ui-designer.md`**
```markdown
# UI Designer

Spécialisé dans :
- Composants React Native Paper
- Animations Moti
- Responsive design
- Accessibility
```

**Usage** :
```bash
claude-code --agent backend-expert
# Ou déléguer depuis agent principal :
"@backend-expert crée la migration pour training_slots"
```

---

## 🔒 Sécurité & Best Practices

### Fichiers à Ignorer (.gitignore)
```
.claude/secrets/
.claude/cache/
.env
```

### Variables d'Environnement
**Fichier** : `.claude/env.json`
```json
{
  "SUPABASE_URL": "https://xxx.supabase.co",
  "SUPABASE_ANON_KEY": "eyJxxx..."
}
```

**NE PAS commit** ce fichier (add to .gitignore)

---

## 🐛 Troubleshooting

### Problème : "Skill not found"
**Solution** : Vérifie le path dans `config.json` et que le fichier existe

### Problème : "MCP connection failed"
**Solution** : Re-auth avec `claude-code mcp auth notion`

### Problème : "Agent doesn't have context"
**Solution** : Spécifie les fichiers : `--context docs/VISION.md`

---

## 📚 Ressources

- **Claude Code Docs** : https://docs.claude.ai/code
- **MCP Protocol** : https://modelcontextprotocol.io
- **Notion API** : https://developers.notion.com
- **Figma API** : https://www.figma.com/developers/api

---

## ✅ Checklist Post-Installation

- [ ] Claude Code installé
- [ ] Projet initialisé (`.claude/` créé)
- [ ] Skills activés (frontend-design, swimlab-dev)
- [ ] MCP Notion connecté
- [ ] MCP Figma connecté
- [ ] Agent swimlab-dev créé
- [ ] Docs projet dans `docs/`
- [ ] Test : `claude-code --agent swimlab-dev` fonctionne

---

**Version** : 1.0  
**Dernière mise à jour** : 29 Janvier 2026  
**Auteur** : Claude (pour Raudi/DI)
