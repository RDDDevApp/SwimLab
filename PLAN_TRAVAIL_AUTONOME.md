# 🤖 Plan de Travail Autonome Claude - Semaine d'Absence

**Période** : 30 Janvier - 6 Février 2026  
**Objectif** : Préparer tout le terrain technique pour accélérer le dev V0 au retour

---

## 🎯 Principes de Travail en Autonomie

### ✅ Ce que Claude PEUT faire seul
- Créer documentation technique
- Préparer migrations SQL
- Créer structure de fichiers
- Écrire types TypeScript
- Créer services boilerplate (interfaces)
- Préparer tests skeleton

### ❌ Ce que Claude NE fait PAS seul
- Coder la logique métier complexe
- Modifier la BDD de prod
- Prendre des décisions d'architecture majeures
- Supprimer du code existant

### 📣 Communication
- Chaque jour : résumé dans DAILY_LOG.md
- Si question importante : attendre validation

---

## 📅 Planning Jour par Jour

### **Jour 1 (Jeu 30 Jan) : Documentation Technique Complète**

#### Morning
- [ ] Créer `TECHNICAL_ROADMAP_V0.md` détaillé
  - Chaque tâche numérotée (T001, T002, etc.)
  - Critères d'acceptance
  - Temps estimé
  - Dépendances

- [ ] Créer `ARCHITECTURE.md`
  - Patterns React Native (hooks, context, services)
  - Structure folders détaillée
  - Flow de données
  - Security patterns (RLS)

#### Afternoon
- [ ] Créer `DEVELOPMENT_GUIDE.md`
  - Setup local step-by-step
  - Commandes utiles
  - Troubleshooting commun
  - Best practices

- [ ] Créer `API_REFERENCE.md`
  - Tous les services avec signatures
  - Exemples d'usage
  - Error handling patterns

**Deliverables** :
```
docs/
├─ TECHNICAL_ROADMAP_V0.md (détaillé)
├─ ARCHITECTURE.md
├─ DEVELOPMENT_GUIDE.md
└─ API_REFERENCE.md
```

---

### **Jour 2 (Ven 31 Jan) : Database & Migrations**

#### Morning
- [ ] Créer migrations SQL numérotées
  ```
  docs/migrations/
  ├─ 001_initial_schema.sql
  ├─ 002_add_training_slots.sql
  ├─ 003_add_workout_types.sql
  ├─ 004_indexes_optimization.sql
  └─ README.md
  ```

- [ ] Documenter chaque migration
  - Pourquoi cette migration
  - Tables affectées
  - Rollback SQL

#### Afternoon
- [ ] Créer `seed_dev_data.sql`
  - 1 club "Test Swimming Club"
  - 1 coach "Thomas Coach"
  - 2 groupes (Compétition, Loisir)
  - 5 nageurs répartis
  - 3 slots récurrents
  - 2 entraînements types

- [ ] Créer `docs/RLS_POLICIES.md`
  - Documenter toutes les policies
  - Cas d'usage
  - Tests de sécurité

**Deliverables** :
```
docs/
├─ migrations/
│   ├─ 001_initial_schema.sql
│   ├─ 002_add_training_slots.sql
│   └─ README.md
├─ seed_dev_data.sql
└─ RLS_POLICIES.md
```

---

### **Jour 3 (Sam 1 Fév) : Services Layer - Interfaces & Types**

#### Morning
- [ ] Créer tous les fichiers types
  ```
  src/types/
  ├─ auth.types.ts
  ├─ profile.types.ts
  ├─ club.types.ts
  ├─ group.types.ts
  ├─ slot.types.ts
  ├─ workout.types.ts
  ├─ assignment.types.ts
  └─ session.types.ts
  ```

- [ ] Chaque type avec :
  - Interface complète
  - Types helpers (CreateDTO, UpdateDTO)
  - Enums si nécessaire
  - JSDoc comments

#### Afternoon
- [ ] Créer services boilerplate (interfaces seulement)
  ```
  src/services/
  ├─ auth.service.ts
  ├─ profiles.service.ts
  ├─ clubs.service.ts
  ├─ groups.service.ts
  ├─ slots.service.ts
  ├─ workouts.service.ts
  ├─ assignments.service.ts
  └─ sessions.service.ts
  ```

- [ ] Chaque service avec :
  - Interface des méthodes
  - Types input/output
  - JSDoc pour chaque méthode
  - TODO pour implémentation

**Deliverables** :
```
src/
├─ types/ (8 fichiers)
└─ services/ (8 fichiers boilerplate)
```

---

### **Jour 4 (Dim 2 Fév) : Components Structure & Navigation**

#### Morning
- [ ] Créer structure navigation
  ```
  src/navigation/
  ├─ types.ts
  ├─ AuthNavigator.tsx (skeleton)
  ├─ CoachNavigator.tsx (skeleton)
  ├─ SwimmerNavigator.tsx (skeleton)
  └─ AppNavigator.tsx (skeleton)
  ```

- [ ] Créer tous les screens (vides mais routés)
  ```
  src/screens/
  ├─ auth/
  │   ├─ LoginScreen.tsx
  │   └─ RegisterScreen.tsx
  ├─ coach/
  │   ├─ DashboardScreen.tsx
  │   ├─ GroupsScreen.tsx
  │   ├─ SlotsScreen.tsx
  │   ├─ WorkoutsScreen.tsx
  │   └─ CalendarScreen.tsx
  └─ swimmer/
      ├─ DashboardScreen.tsx
      ├─ CalendarScreen.tsx
      └─ FeedbackScreen.tsx
  ```

#### Afternoon
- [ ] Créer components boilerplate
  ```
  src/components/
  ├─ common/
  │   ├─ Button.tsx
  │   ├─ Card.tsx
  │   ├─ Input.tsx
  │   └─ Loading.tsx
  ├─ groups/
  │   └─ GroupCard.tsx
  ├─ slots/
  │   └─ SlotCard.tsx
  └─ workouts/
      └─ WorkoutCard.tsx
  ```

**Deliverables** :
```
src/
├─ navigation/ (5 fichiers)
├─ screens/ (10+ fichiers skeleton)
└─ components/ (8+ fichiers skeleton)
```

---

### **Jour 5 (Lun 3 Fév) : Testing Setup & Utils**

#### Morning
- [ ] Setup Jest configuration
  ```
  jest.config.js
  .babelrc (pour tests)
  ```

- [ ] Créer tests boilerplate
  ```
  src/__tests__/
  ├─ services/
  │   ├─ auth.service.test.ts
  │   └─ groups.service.test.ts
  └─ utils/
      └─ dateHelpers.test.ts
  ```

#### Afternoon
- [ ] Créer utils helpers
  ```
  src/utils/
  ├─ dateHelpers.ts
  ├─ validators.ts
  ├─ formatters.ts
  └─ constants.ts
  ```

- [ ] Créer hooks custom
  ```
  src/hooks/
  ├─ useAuth.ts
  ├─ useGroups.ts
  ├─ useWorkouts.ts
  └─ useDebounce.ts
  ```

**Deliverables** :
```
src/
├─ __tests__/ (tests boilerplate)
├─ utils/ (4 fichiers)
└─ hooks/ (4 fichiers)
```

---

### **Jour 6 (Mar 4 Fév) : CI/CD & Scripts**

#### Morning
- [ ] GitHub Actions workflow
  ```
  .github/workflows/
  ├─ ci.yml (test + lint)
  └─ deploy-preview.yml (Expo preview)
  ```

- [ ] Setup ESLint + Prettier
  ```
  .eslintrc.js
  .prettierrc
  ```

#### Afternoon
- [ ] Scripts utiles
  ```
  scripts/
  ├─ setup-dev.sh
  ├─ reset-db.sh
  ├─ generate-types.sh
  └─ check-health.sh
  ```

- [ ] Créer `CONTRIBUTING.md`
  - Code style
  - Commit conventions
  - PR process

**Deliverables** :
```
.github/workflows/ (2 fichiers)
scripts/ (4 fichiers)
CONTRIBUTING.md
```

---

### **Jour 7 (Mer 5 Fév) : Documentation Finale & Review**

#### Morning
- [ ] Créer `MVP_CHECKLIST.md`
  - Toutes les features V0
  - Critères d'acceptance
  - Status (TODO/DOING/DONE)

- [ ] Créer `FAQ.md`
  - Questions fréquentes
  - Troubleshooting
  - Liens utiles

#### Afternoon
- [ ] Mettre à jour `README.md`
  - Badges (build, coverage)
  - Quick start amélioré
  - Contribution guide

- [ ] Créer `CHANGELOG.md`
  - Template pour futures versions
  - V0 planning

- [ ] Résumé de la semaine dans `WEEKLY_SUMMARY.md`
  - Ce qui a été fait
  - Ce qui reste à faire
  - Recommandations pour la suite

**Deliverables** :
```
docs/
├─ MVP_CHECKLIST.md
├─ FAQ.md
└─ WEEKLY_SUMMARY.md
README.md (updated)
CHANGELOG.md
```

---

## 📊 Métriques de Succès

À la fin de la semaine, le projet doit avoir :
- [ ] 15+ fichiers de documentation
- [ ] 30+ fichiers de code (structure)
- [ ] 100% des types définis
- [ ] 100% des services avec interfaces
- [ ] 100% des screens créés (skeleton)
- [ ] Tests boilerplate prêts
- [ ] CI/CD configuré

---

## 📝 Daily Log Template

**Chaque jour, Claude crée** : `docs/daily/2026-01-30.md`

```markdown
# Daily Log - 30 Janvier 2026

## ✅ Completed
- [x] TECHNICAL_ROADMAP_V0.md créé (120 lignes)
- [x] ARCHITECTURE.md créé (95 lignes)

## 🚧 In Progress
- [ ] DEVELOPMENT_GUIDE.md (50% done)

## ❓ Questions
- Faut-il inclure les animations dès V0 ou V0.5 ?

## 📌 Next
- Finir DEVELOPMENT_GUIDE.md
- Commencer API_REFERENCE.md

## 📈 Stats
- Files created: 2
- Lines written: 215
- Estimated time saved: 4h
```

---

## 🚨 Règles d'Or

1. **Pas de modification du code existant fonctionnel**
2. **Tous les nouveaux fichiers sont commentés**
3. **Demander validation si doute sur architecture**
4. **Daily log TOUJOURS créé**
5. **Ne pas bloquer : si bloqué sur quelque chose, passer à la suite**

---

## 📞 Comment DI Me Contacte

**Via Claude.ai Mobile** :
```
"Hey Claude, où en es-tu ?"
"Passe à la task suivante"
"Change de priorité : fais d'abord les migrations SQL"
```

**Via GitHub** (si configuré) :
- Issues : pour demandes spécifiques
- PRs : Claude peut créer des branches

---

## 🎯 Objectif Final

**Au retour de DI** :
- ✅ Projet 100% documenté
- ✅ Structure complète prête
- ✅ Plus qu'à coder la logique métier
- ✅ Gain de temps : ~15-20h de prep

**DI peut démarrer direct sur** :
- Sprint 1, Task 6 : Créer le formulaire entraînement
- Sprint 2, Task 8 : Logique émargement
- Etc.

---

**Let's Go! 🚀**
