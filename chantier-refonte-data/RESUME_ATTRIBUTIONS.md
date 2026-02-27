# 📋 Résumé - Refonte Attributions SwimLab V0.5

## 🎯 Changements Majeurs V0 → V0.5

### 1. Nageur Multi-Groupes ⭐⭐⭐⭐⭐

**AVANT (V0)** :
```
Sophie → 1 seul groupe maximum
❌ Impossible d'être dans Compétition + Technique
```

**APRÈS (V0.5)** :
```
Sophie → Plusieurs groupes possibles
✅ Peut être dans Compétition + Technique + Water-Polo
```

**Impact BDD** : Enlever contrainte UNIQUE sur `group_members`

---

### 2. Coach = 1 Seul Club ⭐⭐⭐⭐

**AVANT (V0)** :
```
Coach Thomas → Pas de restriction
Pourrait théoriquement être dans plusieurs clubs
```

**APRÈS (V0.5)** :
```
Coach Thomas → 1 club maximum
❌ Si déjà coach à Paris, ne peut pas rejoindre Versailles
```

**Impact BDD** : Contrainte EXCLUDE sur `club_members`

---

### 3. Multi-Coaches par Groupe ⭐⭐⭐⭐

**AVANT (V0)** :
```
groups.coach_id → 1 seul coach par groupe
```

**APRÈS (V0.5)** :
```
Nouvelle table group_coaches
✅ Plusieurs coaches par groupe
✅ Tous ont les mêmes droits
```

**Impact BDD** : 
- Supprimer `groups.coach_id`
- Créer table `group_coaches`
- Minimum 1 coach par groupe (contrainte applicative)

---

### 4. Sélection Coach qui a Donné la Séance ⭐⭐⭐

**AVANT (V0)** :
```
Émargement → Pas d'info sur qui a donné
```

**APRÈS (V0.5)** :
```
Émargement → Si plusieurs coaches, sélectionner qui a donné
workout_assignments.coach_id renseigné
```

**Impact BDD** : Ajouter `workout_assignments.coach_id`

---

### 5. Nageurs Invités (Guests) ⭐⭐⭐

**AVANT (V0)** :
```
Émargement → Seulement nageurs du groupe
```

**APRÈS (V0.5)** :
```
Émargement → Bouton "+ Ajouter nageur"
✅ Coach peut ajouter nageur du club hors groupe
✅ Nageur invité peut donner feedback
```

**Impact BDD** : Ajouter `workout_sessions.is_guest`

---

### 6. Deux Codes Invitation ⭐⭐⭐

**AVANT (V0)** :
```
clubs.invitation_code → 1 seul code
```

**APRÈS (V0.5)** :
```
clubs.invitation_code_club → Pour nageurs
clubs.invitation_code_coach → Pour coaches
✅ Sécurité : Coach ne peut pas utiliser code nageur
```

**Impact BDD** : Ajouter `clubs.invitation_code_coach`

---

## 📊 Architecture BDD V0.5

```
┌─────────────┐
│   CLUBS     │ (2 codes invitation)
└──────┬──────┘
       │
       ├─────────────────────────┐
       │                         │
┌──────▼──────┐          ┌───────▼────────┐
│club_members │          │    groups      │
│(coach=1club)│          │  (multi-coach) │
└─────────────┘          └───────┬────────┘
                                 │
                 ┌───────────────┼────────────────┐
                 │               │                │
         ┌───────▼─────┐  ┌─────▼──────┐  ┌─────▼─────────┐
         │group_coaches│  │group_members│  │training_slots │
         │  (N:N)      │  │(multi-group)│  │(no coach_id)  │
         └─────────────┘  └─────────────┘  └───────┬───────┘
                                                    │
                                            ┌───────▼─────────────┐
                                            │workout_assignments  │
                                            │  (+ coach_id)       │
                                            └───────┬─────────────┘
                                                    │
                                            ┌───────▼─────────────┐
                                            │ workout_sessions    │
                                            │  (+ is_guest)       │
                                            └─────────────────────┘
```

---

## 🔄 Workflows Clés

### Workflow 1 : Création Club → Groupe

```
1. Coach Thomas crée compte
   ↓
2. Crée club "Paris Natation"
   - Code club : ABC123 (nageurs)
   - Code coach : COACH456 (coaches)
   ↓
3. Crée groupe "Compétition"
   - Thomas auto-ajouté comme coach
   ↓
4. Ajoute Coach Marie au groupe
   - Marie reçoit notification
   ↓
5. Ajoute nageurs Sophie, Bob
   - Notifications envoyées
```

---

### Workflow 2 : Nageur Multi-Groupes

```
1. Sophie rejoint club avec code ABC123
   ↓
2. Thomas ajoute Sophie → Groupe Compétition
   ↓
3. Marie ajoute Sophie → Groupe Technique
   ↓
Sophie voit dans son calendrier :
  - Entraînements Compétition (Lun/Mer/Ven)
  - Entraînements Technique (Mar)
```

---

### Workflow 3 : Émargement Multi-Coaches

```
Lundi 18h - Entraînement Compétition
Coaches du groupe : Thomas, Marie
  ↓
Marie ouvre émargement :
  ↓
1. "Qui a donné la séance ?"
   ○ Thomas
   ● Marie  ← Sélectionné
  ↓
2. Liste nageurs :
   ☑ Sophie
   ☑ Bob
   ☐ Alice (absente)
   ─────────────────
   [+ Ajouter nageur] ← NOUVEAU
  ↓
3. Marie ajoute Marc (Groupe Loisir) comme invité
   ☑ Marc 🎫 Guest
  ↓
4. Validation
   ↓
Résultat :
  - workout_assignments.coach_id = marie-id
  - workout_sessions créées (Sophie, Bob, Marc)
  - Marc.is_guest = true
```

---

### Workflow 4 : Suppression Club (CASCADE)

```
Owner supprime club
  ↓
CASCADE :
  1. groups supprimés
  2. training_slots supprimés
  3. workout_assignments supprimés
  4. workout_sessions supprimés
  5. workouts supprimés
  6. group_members supprimés
  7. group_coaches supprimés
  8. club_members supprimés
  9. clubs supprimé
  ↓
Coaches & Nageurs :
  - Profiles intacts
  - Sans club
  - Peuvent rejoindre autre club
```

---

## 🔐 Permissions Résumé

### Coach du Groupe

**Peut** :
- ✅ Créer/modifier/supprimer groupe
- ✅ Ajouter/retirer coaches (si pas dernier)
- ✅ Ajouter/retirer nageurs
- ✅ Créer slots
- ✅ Assigner entraînements
- ✅ Émarger (tous coaches du groupe)
- ✅ Ajouter nageurs invités
- ✅ Voir tous feedbacks

**Ne peut pas** :
- ❌ Retirer dernier coach du groupe
- ❌ Modifier feedbacks nageurs
- ❌ Supprimer le club (sauf owner)

---

### Nageur

**Peut** :
- ✅ Voir entraînements de ses groupes
- ✅ Donner feedbacks (si présent)
- ✅ Voir son propre feedback
- ✅ Modifier feedback < 24h (V0.5+)

**Ne peut pas** :
- ❌ Voir détails entraînement avant émargement 🔒
- ❌ Modifier émargement
- ❌ Créer/modifier groupes

---

### Owner

**Peut** :
- ✅ Tout ce que Coach peut faire
- ✅ Supprimer le club
- ✅ Régénérer codes (V1)
- ✅ Stats globales club (V1)

---

## ⚠️ Contraintes Métier

### Obligatoires (Bloquantes)

1. **Coach = 1 seul club**
   ```
   SI coach déjà dans club A
   ALORS ne peut pas rejoindre club B
   ```

2. **Groupe ≥ 1 coach**
   ```
   SI tentative retrait dernier coach
   ALORS bloquer avec message erreur
   ```

3. **Code invitation valide**
   ```
   SI code invalide
   ALORS erreur "Code incorrect"
   ```

4. **Nageur présent pour feedback**
   ```
   SI attended = false
   ALORS pas de formulaire feedback
   ```

---

### Recommandées (UX)

1. **Confirmation suppression**
   ```
   Supprimer club/groupe
   → Modal confirmation avec conséquences
   ```

2. **Notifications**
   ```
   Ajout coach/nageur → Notification
   Retrait → Notification
   Émargement → Notification présents
   ```

3. **Badges UI**
   ```
   Coach créateur : ⭐
   Nageur invité : 🎫
   Entraînement futur : 🔒
   ```

---

## 📋 Migrations SQL V0 → V0.5

### Ordre d'Exécution

```sql
-- 1. Ajouter code coach
ALTER TABLE clubs ADD COLUMN invitation_code_coach TEXT;

-- 2. Créer table group_coaches
CREATE TABLE group_coaches (...);

-- 3. Migrer données groups.coach_id → group_coaches
INSERT INTO group_coaches (group_id, coach_id, is_creator)
SELECT id, coach_id, true FROM groups;

-- 4. Supprimer groups.coach_id
ALTER TABLE groups DROP COLUMN coach_id;

-- 5. Supprimer training_slots.coach_id
ALTER TABLE training_slots DROP COLUMN coach_id;

-- 6. Ajouter workout_assignments.coach_id
ALTER TABLE workout_assignments ADD COLUMN coach_id UUID;

-- 7. Ajouter workout_sessions.is_guest
ALTER TABLE workout_sessions ADD COLUMN is_guest BOOLEAN DEFAULT false;

-- 8. Ajouter contrainte coach 1 club
ALTER TABLE club_members 
ADD CONSTRAINT unique_coach_per_user 
  EXCLUDE USING gist (user_id WITH =) 
  WHERE (role = 'coach');
```

---

## ✅ Checklist Validation

### BDD
- [ ] Codes invitation (club + coach) créés
- [ ] Table `group_coaches` créée
- [ ] Contrainte coach 1 club ajoutée
- [ ] `workout_assignments.coach_id` ajouté
- [ ] `workout_sessions.is_guest` ajouté
- [ ] Migrations testées

### UI
- [ ] Formulaire inscription (2 codes)
- [ ] Page groupe (liste coaches + nageurs)
- [ ] Émargement (sélection coach + invités)
- [ ] Calendrier nageur (multi-groupes)
- [ ] Modal confirmations (suppressions)

### Backend
- [ ] RLS policies mises à jour
- [ ] Services (coaches, groupes, émargement)
- [ ] Validation contraintes métier
- [ ] Tests E2E workflows

---

## 🎯 Impact Estimation

### Complexité Technique

| Feature | Complexité | Temps Estimé |
|---------|-----------|-------------|
| Nageur multi-groupes | Faible | 2h |
| Coach 1 club | Faible | 1h |
| Multi-coaches groupe | Moyenne | 4h |
| Sélection coach séance | Faible | 2h |
| Nageurs invités | Moyenne | 3h |
| 2 codes invitation | Faible | 1h |
| **TOTAL** | **Moyenne** | **13h** |

---

### Impact Utilisateur

| Feature | Impact Business | Adoption |
|---------|----------------|----------|
| Nageur multi-groupes | ⭐⭐⭐⭐⭐ | Critique |
| Multi-coaches groupe | ⭐⭐⭐⭐ | Haute |
| Nageurs invités | ⭐⭐⭐ | Moyenne |
| Sélection coach | ⭐⭐ | QoL |
| 2 codes | ⭐⭐ | Sécurité |

---

## 🚀 Roadmap

### V0 (Actuel)
- ❌ Nageur = 1 groupe
- ❌ Coach = plusieurs clubs possibles
- ❌ 1 coach par groupe

### V0.5 (Cible)
- ✅ Nageur = plusieurs groupes
- ✅ Coach = 1 club max
- ✅ Plusieurs coaches par groupe
- ✅ Sélection coach séance
- ✅ Nageurs invités
- ✅ 2 codes invitation

### V1 (Future)
- ⚠️ Rôles coaches (Head vs Assistant)
- ⚠️ Rôles admin club (Owner vs Admin)
- ⚠️ Permissions granulaires

---

**Prêt à implémenter ? 🎯**

**Documents complets disponibles ci-dessus** :
1. **DATABASE_SCHEMA_V0.5.md** - Schéma BDD complet
2. **WORKFLOWS_CLUB.md** - Tous les workflows
3. **PERMISSIONS_MATRIX.md** - Matrice permissions

**Des questions sur l'implémentation ?** 🤔
