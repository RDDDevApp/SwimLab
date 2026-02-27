# 🔄 Workflows Club - SwimLab V0.5

## 📋 Table des Matières

1. [Workflows Création](#workflows-création)
2. [Workflows Gestion](#workflows-gestion)
3. [Workflows Suppression](#workflows-suppression)
4. [Règles Métier](#règles-métier)

---

# Workflows Création

## 1. 🏊 Création Compte & Premier Club

### Scénario A : Nouvel Utilisateur → Coach → Crée Club

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Inscription                          │
└─────────────────────────────────────────────────┘
User ouvre app
  ↓
Écran "Bienvenue"
  → Bouton "Créer un compte"
  ↓
Formulaire inscription :
  - Email
  - Mot de passe
  - Prénom
  - Nom
  - Rôle : [Coach] ← Sélectionné
  ↓
Validation
  ↓
Compte créé (auth.users + profiles)

┌─────────────────────────────────────────────────┐
│  ÉTAPE 2 : Création Club                        │
└─────────────────────────────────────────────────┘
Redirect automatique → "Créer votre club"
  ↓
Formulaire :
  - Nom du club (requis)
  - Description (optionnel)
  - Logo (optionnel, V0.5+)
  ↓
Validation
  ↓
Club créé avec :
  - owner_id = coach.id
  - invitation_code_club = ABC123XY (auto-généré)
  - invitation_code_coach = COACH456 (auto-généré)
  ↓
Coach ajouté à club_members (role='coach')
  ↓
Écran "Votre club est prêt !"
  ↓
Affichage 2 codes :
  ┌──────────────────────────────────────┐
  │  Code Club (nageurs) : ABC123XY      │
  │  Code Coach (coaches) : COACH456     │
  │  [Copier] [Partager]                 │
  └──────────────────────────────────────┘
  ↓
Redirect → Dashboard Coach
```

**Résultat** :
```
Tables impactées :
- auth.users : Nouveau user
- profiles : role='coach'
- clubs : Nouveau club
- club_members : Coach dans club
```

---

### Scénario B : Nouvel Utilisateur → Nageur → Rejoint Club

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Inscription                          │
└─────────────────────────────────────────────────┘
User ouvre app
  ↓
Formulaire inscription :
  - Email, Mot de passe, Prénom, Nom
  - Rôle : [Nageur] ← Sélectionné
  - Code club : [________] ← Requis
  ↓
User entre : ABC123XY
  ↓
Validation code
  ↓
Si code valide :
  - Compte créé
  - Nageur ajouté au club (club_members)
  ↓
Redirect → Dashboard Nageur (vide tant que pas dans un groupe)

┌─────────────────────────────────────────────────┐
│  MESSAGE                                        │
└─────────────────────────────────────────────────┘
"Bienvenue au club Paris Natation !
Un coach va t'ajouter à un groupe d'entraînement."
```

**Résultat** :
```
Tables impactées :
- auth.users : Nouveau user
- profiles : role='swimmer'
- club_members : Nageur dans club
```

---

## 2. 👥 Ajout Coach au Club

### Scénario : Coach Existant Rejoint Club

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Coach reçoit code coach              │
└─────────────────────────────────────────────────┘
Coach Thomas (owner) partage :
  "Code coach : COACH456"
  ↓
Coach Marie ouvre app
  ↓
Si déjà inscrite :
  → Écran "Rejoindre un club"
  → Entre code : COACH456
  ↓
Si pas encore inscrite :
  → Formulaire inscription
  → Rôle : Coach
  → Entre code : COACH456
  ↓
Validation code
  ↓
Vérification :
  ✅ Code existe ?
  ✅ Marie n'est pas déjà coach ailleurs ?
  ↓
Si OK :
  - Marie ajoutée à club_members (role='coach')
  - Notification à Thomas : "Marie a rejoint votre club"
  ↓
Redirect → Dashboard Coach Marie
```

**Règles Métier** :
- ❌ Un coach ne peut être que dans **1 seul club**
- ✅ Si coach tente de rejoindre 2ème club → **Erreur**
  ```
  "Vous êtes déjà coach au club Paris Natation.
   Un coach ne peut gérer qu'un seul club."
  ```

---

## 3. 📦 Création Groupe

### Workflow Coach Crée Groupe

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Coach crée groupe                    │
└─────────────────────────────────────────────────┘
Coach → Dashboard → Onglet "Groupes"
  ↓
Bouton "+ Créer un groupe"
  ↓
Formulaire :
  - Nom groupe (requis) : "Compétition"
  - Description (optionnel) : "Nageurs compétiteurs"
  - Niveau (optionnel) : [Competition]
  ↓
Validation
  ↓
Groupe créé (table groups)
  ↓
Coach automatiquement ajouté (table group_coaches)
  - is_creator = true
  ↓
Redirect → Page Groupe "Compétition"
  ↓
┌──────────────────────────────────────┐
│  Groupe Compétition                  │
│  ─────────────────────                │
│  Coaches : Thomas ⭐ (créateur)      │
│  Nageurs : (vide)                    │
│                                      │
│  [+ Ajouter coach]                   │
│  [+ Ajouter nageurs]                 │
└──────────────────────────────────────┘
```

**Résultat** :
```
Tables impactées :
- groups : Nouveau groupe
- group_coaches : Coach créateur ajouté
```

---

## 4. 👥 Ajout Coach au Groupe

### Workflow Coach Ajoute un Autre Coach

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Ajouter coach au groupe              │
└─────────────────────────────────────────────────┘
Coach Thomas → Page Groupe "Compétition"
  ↓
Bouton "+ Ajouter coach"
  ↓
Modal avec liste coaches du club :
  ☐ Marie (coach)
  ☐ Pierre (coach)
  ↓
Thomas coche Marie
  ↓
Validation
  ↓
Marie ajoutée à group_coaches
  - is_creator = false
  ↓
Marie reçoit notification :
  "Thomas t'a ajouté au groupe Compétition"
  ↓
Page Groupe mise à jour :
┌──────────────────────────────────────┐
│  Groupe Compétition                  │
│  ─────────────────────                │
│  Coaches :                           │
│    - Thomas ⭐ (créateur)            │
│    - Marie                           │
│                                      │
│  [+ Ajouter coach]                   │
└──────────────────────────────────────┘
```

**Règles Métier** :
- ✅ Tous les coaches du groupe ont les **mêmes droits** (V0.5)
- ✅ Pas de différence créateur/non-créateur (juste info)

---

## 5. 🏊 Ajout Nageurs au Groupe

### Workflow Coach Ajoute Nageurs

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Ajouter nageurs                      │
└─────────────────────────────────────────────────┘
Coach → Page Groupe "Compétition"
  ↓
Bouton "+ Ajouter nageurs"
  ↓
Modal avec liste nageurs du club :
  ☐ Sophie (pas encore dans un groupe)
  ☐ Bob (déjà dans Groupe Loisir) ← OK multi-groupes
  ☐ Alice (déjà dans ce groupe) ← Grisé, déjà dedans
  ↓
Coach coche Sophie et Bob
  ↓
Validation
  ↓
Sophie et Bob ajoutés à group_members
  ↓
Notifications :
  "Thomas t'a ajouté au groupe Compétition"
  ↓
Page Groupe mise à jour :
┌──────────────────────────────────────┐
│  Groupe Compétition                  │
│  ─────────────────────                │
│  Coaches : Thomas, Marie             │
│  Nageurs : Sophie, Bob (15 total)    │
└──────────────────────────────────────┘
```

**Cas Multi-Groupes** :
```
Bob rejoint Groupe Compétition
  ↓
Bob est maintenant dans :
  - Groupe Loisir (depuis 2 mois)
  - Groupe Compétition (nouveau)
  ↓
Calendrier Bob affiche :
  - Entraînements Loisir
  - Entraînements Compétition
```

---

## 6. 🗓️ Création Slot

### Workflow Coach Crée Créneau Récurrent

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Créer slot                           │
└─────────────────────────────────────────────────┘
Coach → Calendrier → Bouton "+ Créer créneau"
  ↓
Formulaire :
  - Groupe : [Compétition] ← Dropdown
  - Nom : "Entraînement Compétition"
  - Jour : [Lundi] ← Dropdown
  - Heure : [18:00] ← Time picker
  - Durée : [90] minutes
  - Lieu : "Piscine Municipale"
  ↓
Validation
  ↓
Slot créé (training_slots)
  ↓
Apparaît dans calendrier coach :
  - Tous les lundis 18h
  - Badge "Slot vide" (pas d'entraînement assigné)
  ↓
Nageurs du groupe le voient aussi :
  - Calendrier nageur : "Lundi 18h (détails après)"
```

---

## 7. 📝 Assignation Entraînement

### Workflow Coach Assigne Entraînement au Slot

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Créer entraînement                   │
└─────────────────────────────────────────────────┘
Coach → "Créer entraînement"
  ↓
Formulaire (structure hiérarchique)
  ↓
Publier entraînement
  ↓
Entraînement sauvegardé (workouts)

┌─────────────────────────────────────────────────┐
│  ÉTAPE 2 : Assigner au slot                     │
└─────────────────────────────────────────────────┘
Coach → Calendrier → Clic sur slot vide (Lundi 18h)
  ↓
Modal "Assigner un entraînement"
  ↓
Liste entraînements publiés :
  ○ Endurance 3000m
  ○ Sprint 2500m
  ● Technique 2000m ← Sélectionné
  ↓
Sélection semaine :
  [Semaine du 27 Jan - 2 Fév] ← Par défaut semaine courante
  ↓
Validation
  ↓
workout_assignment créé :
  - workout_id = technique-2000m
  - training_slot_id = lundi-18h-comp
  - scheduled_date = 2026-01-27
  - coach_id = NULL (pas encore donné)
  ↓
Calendrier mis à jour :
  - Slot "rempli"
  - Badge type "Technique"
  - Distance "2000m"
  ↓
Nageurs voient dans calendrier :
  "Lundi 27 Jan - 18h
   Entraînement Technique 🔒
   Détails disponibles après"
```

---

# Workflows Gestion

## 8. ✅ Émargement Entraînement

### Workflow Coach Émarque (Multi-Coaches)

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Lancer émargement                    │
└─────────────────────────────────────────────────┘
Lundi 19h30 (après entraînement 18h-19h30)
  ↓
Coach ouvre app
  ↓
Notification : "Émarger l'entraînement de 18h"
  ↓
Coach clique → Page Émargement

┌─────────────────────────────────────────────────┐
│  ÉTAPE 2 : Sélection coach qui a donné          │
└─────────────────────────────────────────────────┘
SI plusieurs coaches dans le groupe :
  ┌──────────────────────────────────────┐
  │  Qui a donné cet entraînement ?      │
  │  ○ Thomas                            │
  │  ● Marie    ← Sélectionné            │
  │                                      │
  │  [Continuer]                         │
  └──────────────────────────────────────┘
  ↓
Marie sélectionnée → workout_assignments.coach_id = marie-id

┌─────────────────────────────────────────────────┐
│  ÉTAPE 3 : Émargement nageurs                   │
└─────────────────────────────────────────────────┘
Liste nageurs du groupe :
  ☑ Sophie (présente) ← Cochée par défaut
  ☑ Bob (présent)
  ☐ Alice (absente) ← Décochée par coach
  ─────────────────────────────
  [+ Ajouter un nageur] ← NOUVEAU
  ↓
Coach clique "+ Ajouter un nageur"
  ↓
Modal : Liste nageurs du club (hors groupe)
  ☐ Marc (Groupe Loisir)
  ☐ Julie (Groupe Technique)
  ↓
Coach coche Marc (invité ponctuel)
  ↓
Liste émargement mise à jour :
  ☑ Sophie (présente)
  ☑ Bob (présent)
  ☐ Alice (absente)
  ☑ Marc (présent) 🎫 Guest
  ↓
Validation "Émarger"
  ↓
workout_sessions créées :
  - Sophie : attended=true, is_guest=false
  - Bob : attended=true, is_guest=false
  - Alice : attended=false, is_guest=false
  - Marc : attended=true, is_guest=true ← Invité
  ↓
workout_assignments mis à jour :
  - attendance_marked = true
  - coach_id = marie-id
  ↓
Notifications envoyées aux présents :
  "Donne ton feedback sur l'entraînement de 18h"
```

---

## 9. 💬 Feedback Nageur

### Workflow Nageur Donne Feedback

```
Nageur (Sophie) reçoit notification
  ↓
Ouvre app → Calendrier
  ↓
Badge "Donner feedback" sur entraînement
  ↓
Clic → Formulaire feedback
  ↓
RPE : [14/20] ← Slider
Commentaire : "Dur sur les 200m mais j'ai tenu"
  ↓
Validation "Envoyer"
  ↓
workout_sessions mis à jour :
  - rpe_score = 14
  - feedback_text = "Dur..."
  - completed_at = NOW()
  ↓
Badge passe à "Feedback donné ✅"
  ↓
Détails entraînement déverrouillés :
  Sophie peut voir la structure complète
```

---

# Workflows Suppression

## 10. 🗑️ Suppression Club

### Workflow Owner Supprime Club

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Demande suppression                  │
└─────────────────────────────────────────────────┘
Owner (Thomas) → Paramètres Club
  ↓
Bouton "Supprimer le club"
  ↓
Modal confirmation :
┌──────────────────────────────────────┐
│  ⚠️ ATTENTION                        │
│                                      │
│  Supprimer le club supprimera :      │
│  - Tous les groupes                  │
│  - Tous les entraînements            │
│  - Tous les slots                    │
│  - Toutes les données                │
│                                      │
│  Les coaches et nageurs resteront    │
│  dans l'app mais sans club.          │
│                                      │
│  Taper "SUPPRIMER" pour confirmer    │
│  [____________]                      │
│                                      │
│  [Annuler] [Confirmer]               │
└──────────────────────────────────────┘
  ↓
Thomas tape "SUPPRIMER"
  ↓
Validation
  ↓
Suppression CASCADE :

1. groups → ON DELETE CASCADE
   - Tous les groupes du club supprimés
   
2. training_slots → ON DELETE CASCADE (via groups)
   - Tous les slots supprimés
   
3. workout_assignments → ON DELETE CASCADE (via slots)
   - Toutes les assignations supprimées
   
4. workout_sessions → ON DELETE CASCADE (via assignments)
   - Tous les feedbacks supprimés
   
5. workouts → ON DELETE CASCADE (via club_id)
   - Tous les entraînements supprimés
   
6. group_members → ON DELETE CASCADE (via groups)
   - Toutes les appartenances groupes supprimées
   
7. group_coaches → ON DELETE CASCADE (via groups)
   - Tous les liens coach-groupe supprimés
   
8. club_members → ON DELETE CASCADE (via club_id)
   - Tous les membres retirés du club
   
9. clubs → Supprimé
  ↓
Résultat :
  - Coaches : profiles intacts, mais sans club
  - Nageurs : profiles intacts, mais sans club
  - Tous peuvent rejoindre un autre club
  ↓
Redirect Thomas → "Créer un nouveau club"
```

**Impact** :
```
AVANT suppression :
- Club Paris Natation
  - 3 coaches (Thomas, Marie, Pierre)
  - 5 groupes
  - 25 nageurs
  - 150 entraînements

APRÈS suppression :
- Coaches restent dans l'app (peuvent rejoindre autre club)
- Nageurs restent dans l'app (peuvent rejoindre autre club)
- Toutes les données du club : SUPPRIMÉES
```

---

## 11. 📦 Suppression Groupe

### Workflow Coach Supprime Groupe

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Demande suppression                  │
└─────────────────────────────────────────────────┘
Coach → Page Groupe "Compétition"
  ↓
Menu → "Supprimer le groupe"
  ↓
Modal confirmation :
┌──────────────────────────────────────┐
│  ⚠️ Supprimer le groupe Compétition ?│
│                                      │
│  Cela supprimera :                   │
│  - Tous les slots (créneaux)         │
│  - Les entraînements assignés        │
│                                      │
│  Les nageurs et coaches resteront    │
│  dans le club.                       │
│                                      │
│  [Annuler] [Supprimer]               │
└──────────────────────────────────────┘
  ↓
Validation
  ↓
Suppression CASCADE :

1. training_slots → ON DELETE CASCADE (via group_id)
   - Tous les slots du groupe supprimés
   
2. workout_assignments → ON DELETE CASCADE (via training_slots)
   - Toutes les assignations supprimées
   
3. workout_sessions → ON DELETE CASCADE (via assignments)
   - Tous les feedbacks supprimés
   
4. group_members → ON DELETE CASCADE (via group_id)
   - Nageurs retirés du groupe (mais restent dans club)
   
5. group_coaches → ON DELETE CASCADE (via group_id)
   - Coaches retirés du groupe (mais restent dans club)
   
6. groups → Supprimé
  ↓
Résultat :
  - Nageurs : restent dans le club (peuvent être ajoutés à autre groupe)
  - Coaches : restent dans le club (peuvent créer autre groupe)
  - Entraînements (workouts) : NON supprimés (réutilisables)
```

---

## 12. 👤 Retrait Coach d'un Groupe

### Workflow Retirer Coach

```
┌─────────────────────────────────────────────────┐
│  ÉTAPE 1 : Retirer coach                        │
└─────────────────────────────────────────────────┘
Coach Thomas → Page Groupe "Compétition"
  ↓
Liste coaches :
  - Thomas ⭐ [Retirer]
  - Marie [Retirer]
  ↓
Thomas clique "Retirer" sur Marie
  ↓
Vérification :
  ✅ Combien de coaches dans le groupe ?
  ↓
SI > 1 coach :
  ✅ OK, supprimer Marie
  ↓
  Modal confirmation :
  "Retirer Marie du groupe Compétition ?"
  [Annuler] [Retirer]
  ↓
  Marie retirée de group_coaches
  ↓
  Notification à Marie :
  "Thomas t'a retiré du groupe Compétition"
  
SI = 1 coach (dernier) :
  ❌ BLOCAGE
  ↓
  Modal erreur :
  ┌──────────────────────────────────────┐
  │  ⚠️ Impossible de retirer            │
  │                                      │
  │  Thomas est le dernier coach de ce   │
  │  groupe. Un groupe doit avoir au     │
  │  moins un coach.                     │
  │                                      │
  │  Ajoutez un autre coach ou           │
  │  supprimez le groupe.                │
  │                                      │
  │  [OK]                                │
  └──────────────────────────────────────┘
```

**Règle Métier** :
- ❌ **Impossible de supprimer le dernier coach d'un groupe**
- ✅ Groupe doit toujours avoir au moins 1 coach

---

## 13. 🏊 Retrait Nageur d'un Groupe

### Workflow Retirer Nageur

```
Coach → Page Groupe "Compétition"
  ↓
Liste nageurs :
  - Sophie [Retirer]
  - Bob [Retirer]
  ↓
Coach clique "Retirer" sur Sophie
  ↓
Modal confirmation :
  "Retirer Sophie du groupe Compétition ?"
  [Annuler] [Retirer]
  ↓
Sophie retirée de group_members
  ↓
Sophie reste dans le club
  ↓
Calendrier Sophie :
  - N'affiche plus les entraînements Compétition
  - Affiche toujours ses autres groupes (si multi-groupes)
```

**Cas Multi-Groupes** :
```
Sophie était dans :
  - Groupe Compétition
  - Groupe Technique
  ↓
Retrait du Groupe Compétition
  ↓
Sophie reste dans :
  - Groupe Technique ✅
  ↓
Calendrier Sophie :
  - Entraînements Technique (toujours visibles)
  - Entraînements Compétition (disparus)
```

---

# Règles Métier

## ✅ Ce Qui Est Possible

### Création
- ✅ Coach peut créer un club
- ✅ Coach peut rejoindre un club (avec code coach)
- ✅ Nageur peut rejoindre un club (avec code club)
- ✅ Coach peut créer plusieurs groupes dans son club
- ✅ Coach peut ajouter d'autres coaches à ses groupes
- ✅ Coach peut ajouter nageurs à ses groupes
- ✅ Nageur peut être dans **plusieurs groupes** (même club)
- ✅ Coach peut créer slots pour ses groupes
- ✅ Coach peut assigner entraînements aux slots

### Gestion
- ✅ Tous les coaches d'un groupe ont les mêmes droits
- ✅ N'importe quel coach du groupe peut émarger
- ✅ Coach sélectionne qui a donné la séance (si plusieurs)
- ✅ Coach peut ajouter nageurs hors groupe (invités)
- ✅ Nageur peut donner feedback après émargement

### Suppression
- ✅ Owner peut supprimer le club
- ✅ Coach peut supprimer un groupe
- ✅ Coach peut retirer un nageur d'un groupe
- ✅ Coach peut retirer un autre coach (si pas le dernier)

---

## ❌ Ce Qui Est Interdit

### Création
- ❌ Coach ne peut pas être dans **plusieurs clubs**
- ❌ Nageur ne peut pas rejoindre avec code coach (et vice versa)
- ❌ Groupe ne peut pas exister sans club
- ❌ Slot ne peut pas exister sans groupe

### Gestion
- ❌ Nageur ne peut pas voir entraînement avant émargement (🔒)
- ❌ Nageur ne peut pas modifier émargement
- ❌ Coach ne peut pas modifier feedbacks nageurs

### Suppression
- ❌ Coach ne peut pas supprimer le club (sauf s'il est owner)
- ❌ Coach ne peut pas retirer le dernier coach d'un groupe
- ❌ Coach ne peut pas supprimer un groupe dont il n'est pas membre
- ❌ Groupe vide de coaches = impossible

---

## 🔄 Cascades de Suppression

### Suppression Club

```
DELETE clubs WHERE id = 'club-123'
  ↓ CASCADE
groups (tous supprimés)
  ↓ CASCADE
training_slots (tous supprimés)
  ↓ CASCADE
workout_assignments (tous supprimés)
  ↓ CASCADE
workout_sessions (tous supprimés)
  ↓ PARALLÈLE
group_members (tous supprimés)
group_coaches (tous supprimés)
club_members (tous supprimés)
workouts (tous supprimés)

RÉSULTAT :
- Coaches/Nageurs : profiles intacts
- Toutes données club : SUPPRIMÉES
```

---

### Suppression Groupe

```
DELETE groups WHERE id = 'group-123'
  ↓ CASCADE
training_slots (du groupe)
  ↓ CASCADE
workout_assignments (des slots du groupe)
  ↓ CASCADE
workout_sessions (des assignments)
  ↓ PARALLÈLE
group_members (du groupe)
group_coaches (du groupe)

RÉSULTAT :
- Nageurs/Coaches : restent dans club
- Entraînements (workouts) : NON supprimés
```

---

### Suppression Nageur du Groupe

```
DELETE group_members WHERE group_id='X' AND user_id='Y'

RÉSULTAT :
- Nageur reste dans le club
- Peut être ajouté à autre groupe
- Si multi-groupes : reste dans ses autres groupes
```

---

### Retrait Coach du Groupe

```
DELETE group_coaches WHERE group_id='X' AND coach_id='Y'

VÉRIFICATION AVANT :
IF (SELECT COUNT(*) FROM group_coaches WHERE group_id='X') = 1 THEN
  ❌ ERREUR "Impossible de retirer le dernier coach"
ELSE
  ✅ OK, supprimer
END IF

RÉSULTAT :
- Coach reste dans le club
- Peut créer/rejoindre autre groupe
```

---

## 🎯 États Possibles

### Club
```
États :
- Actif (normal)
- Supprimé (soft delete possible en V1+)

Transitions :
Création → Actif → Suppression
```

---

### Groupe
```
États :
- Vide (0 nageurs, ≥1 coach)
- Actif (≥1 nageur, ≥1 coach)
- Supprimé

Transitions :
Création → Vide → Actif → Suppression

IMPOSSIBLE :
- Groupe sans coach (bloqué)
```

---

### Nageur
```
États par rapport au club :
- Sans club
- Dans club, sans groupe
- Dans club, dans 1+ groupes

États par rapport au groupe :
- Pas dans le groupe
- Dans le groupe

Transitions :
Inscription → Sans club
Code club → Dans club, sans groupe
Ajout groupe → Dans groupe
Retrait groupe → Sans groupe (mais toujours dans club)
```

---

### Coach
```
États :
- Sans club
- Dans 1 club, sans groupe
- Dans 1 club, dans 1+ groupes

Contraintes :
- MAX 1 club
- MIN 1 coach par groupe

Transitions :
Inscription → Sans club
Code coach → Dans club
Crée/Rejoint groupe → Dans groupe
Retrait groupe → Sans groupe (mais toujours dans club)
```

---

## 📊 Matrices de Vérification

### Avant Suppression Groupe

```
Vérifier :
- Nombre coaches : ≥ 1 (pas de contrainte)
- Nombre nageurs : ≥ 0 (pas de contrainte)
- Entraînements futurs : WARNING (alerte coach)

Action :
✅ Toujours autoriser suppression groupe
⚠️ Avertir si entraînements futurs planifiés
```

---

### Avant Retrait Coach du Groupe

```
Vérifier :
- Nombre coaches actuels : X
  
IF X = 1 THEN
  ❌ BLOQUER "Dernier coach, impossible"
ELSE
  ✅ AUTORISER retrait
END IF
```

---

### Avant Retrait Nageur du Groupe

```
Vérifier :
- Nageur a feedbacks en attente ? WARNING

Action :
✅ Toujours autoriser
⚠️ Avertir si feedbacks en attente
```

---

**Version** : 1.0 (V0.5)  
**Date** : 29 Janvier 2026  
**Statut** : Spécification complète
