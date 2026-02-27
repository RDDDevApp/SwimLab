# 🔐 Matrice de Permissions - SwimLab V0.5

## 📋 Table des Matières

1. [Rôles Système](#rôles-système)
2. [Permissions par Entité](#permissions-par-entité)
3. [Permissions par Action](#permissions-par-action)
4. [Cas Particuliers](#cas-particuliers)

---

# Rôles Système

## 1. Owner (Propriétaire Club)

**Définition** : Coach qui a créé le club

**Identifiant** : `clubs.owner_id = user.id`

**Permissions spéciales** :
- ✅ Supprimer le club
- ✅ Régénérer codes invitation (V1)
- ✅ Voir statistiques globales club (V1)

**Hérite de** : Toutes permissions Coach

---

## 2. Coach

**Définition** : Membre du club avec rôle 'coach'

**Identifiant** : `club_members.role = 'coach'`

**Permissions** :
- ✅ Créer groupes
- ✅ Gérer ses groupes
- ✅ Créer entraînements
- ✅ Assigner entraînements
- ✅ Émarger
- ✅ Voir feedbacks

**Contraintes** :
- ❌ 1 seul club max
- ✅ Plusieurs groupes possibles

---

## 3. Nageur (Swimmer)

**Définition** : Membre du club avec rôle 'swimmer'

**Identifiant** : `club_members.role = 'swimmer'`

**Permissions** :
- ✅ Voir son calendrier
- ✅ Donner feedbacks
- ✅ Voir ses stats (V0.5+)

**Contraintes** :
- ✅ Plusieurs groupes possibles
- ✅ Plusieurs clubs possibles (V2)

---

## 4. Invité (Guest)

**Définition** : Nageur du club ajouté ponctuellement à un entraînement hors de son groupe

**Identifiant** : `workout_sessions.is_guest = true`

**Permissions** :
- ✅ Donner feedback pour cet entraînement
- ✅ Voir détails après émargement
- ❌ Pas ajouté au groupe de façon permanente

---

# Permissions par Entité

## 📋 Club

### Créer Club

| Rôle | Peut créer ? | Conditions |
|------|-------------|------------|
| **Coach (nouveau)** | ✅ Oui | Lors de l'inscription ou après |
| **Coach (existant)** | ❌ Non | Déjà dans un club |
| **Nageur** | ❌ Non | Rôle nageur ne peut pas créer club |
| **Anonyme** | ❌ Non | Doit être connecté |

**Query** :
```sql
-- Vérifier si coach peut créer club
SELECT COUNT(*) 
FROM club_members 
WHERE user_id = 'coach-id' AND role = 'coach';

-- Si COUNT = 0 → OK créer
-- Si COUNT = 1 → ❌ ERREUR "Déjà dans un club"
```

---

### Rejoindre Club

| Rôle | Peut rejoindre ? | Code requis | Conditions |
|------|-----------------|-------------|------------|
| **Coach** | ✅ Oui | Code coach | Pas déjà coach ailleurs |
| **Nageur** | ✅ Oui | Code club | Aucune |
| **Anonyme** | ✅ Oui | Code (inscription) | Créer compte d'abord |

**Validation Codes** :
```sql
-- Code coach
SELECT * FROM clubs WHERE invitation_code_coach = 'COACH456';

-- Code club (nageur)
SELECT * FROM clubs WHERE invitation_code_club = 'ABC123XY';
```

---

### Voir Club

| Rôle | Peut voir ? | Données visibles |
|------|------------|------------------|
| **Owner** | ✅ Oui | Tout |
| **Coach du club** | ✅ Oui | Tout sauf codes |
| **Nageur du club** | ✅ Oui | Info basiques (nom, logo) |
| **Coach autre club** | ❌ Non | RLS bloque |
| **Nageur autre club** | ❌ Non | RLS bloque |

**RLS Policy** :
```sql
CREATE POLICY "Members can view their club"
  ON clubs FOR SELECT
  USING (
    id IN (
      SELECT club_id 
      FROM club_members 
      WHERE user_id = auth.uid()
    )
  );
```

---

### Modifier Club

| Rôle | Peut modifier ? | Champs modifiables |
|------|----------------|-------------------|
| **Owner** | ✅ Oui | Nom, description, logo |
| **Coach du club** | ⚠️ Limité (V2) | Proposer modifications |
| **Nageur** | ❌ Non | - |

---

### Supprimer Club

| Rôle | Peut supprimer ? | Conséquences |
|------|-----------------|-------------|
| **Owner** | ✅ Oui | Supprime tout (CASCADE) |
| **Coach** | ❌ Non | - |
| **Nageur** | ❌ Non | - |

---

## 📦 Groupe

### Créer Groupe

| Rôle | Peut créer ? | Conditions |
|------|-------------|------------|
| **Coach du club** | ✅ Oui | Devient coach du groupe |
| **Nageur du club** | ❌ Non | - |
| **Coach autre club** | ❌ Non | Doit être coach du club |

**Auto-ajout** :
```sql
-- Transaction
BEGIN;

-- 1. Créer groupe
INSERT INTO groups (club_id, name) VALUES ('club-id', 'Compétition');

-- 2. Ajouter coach créateur
INSERT INTO group_coaches (group_id, coach_id, is_creator)
VALUES ('group-id', 'coach-id', true);

COMMIT;
```

---

### Voir Groupe

| Rôle | Peut voir ? | Données visibles |
|------|------------|------------------|
| **Coach du groupe** | ✅ Oui | Tout (nageurs, coaches, entraînements) |
| **Nageur du groupe** | ✅ Oui | Info groupe, entraînements |
| **Coach du club (pas du groupe)** | ✅ Oui | Info basiques |
| **Nageur du club (pas du groupe)** | ⚠️ Limité | Nom, niveau (pour savoir où il va) |
| **Coach autre club** | ❌ Non | RLS bloque |

**RLS Policy** :
```sql
CREATE POLICY "Club members can view groups"
  ON groups FOR SELECT
  USING (
    club_id IN (
      SELECT club_id 
      FROM club_members 
      WHERE user_id = auth.uid()
    )
  );
```

---

### Modifier Groupe

| Rôle | Peut modifier ? | Champs modifiables |
|------|----------------|-------------------|
| **Coach du groupe** | ✅ Oui | Nom, description, niveau |
| **Coach du club (pas du groupe)** | ❌ Non | Doit rejoindre le groupe |
| **Nageur** | ❌ Non | - |

---

### Supprimer Groupe

| Rôle | Peut supprimer ? | Conditions |
|------|-----------------|------------|
| **Coach du groupe** | ✅ Oui | Aucune |
| **Owner** | ✅ Oui (V2) | Tous les groupes |
| **Coach du club (pas du groupe)** | ❌ Non | - |

---

### Ajouter Coach au Groupe

| Rôle | Peut ajouter ? | Qui peut être ajouté ? |
|------|---------------|----------------------|
| **Coach du groupe** | ✅ Oui | Coaches du club |
| **Coach du club (pas du groupe)** | ❌ Non | - |
| **Owner** | ✅ Oui (V2) | Coaches du club |

---

### Retirer Coach du Groupe

| Rôle | Peut retirer ? | Conditions |
|------|---------------|------------|
| **Coach du groupe** | ✅ Oui | Si pas le dernier coach |
| **Coach lui-même** | ✅ Oui | Peut se retirer (si pas dernier) |

**Contrainte** :
```sql
-- Vérifier avant retrait
SELECT COUNT(*) 
FROM group_coaches 
WHERE group_id = 'group-id';

-- Si COUNT = 1 → ❌ BLOQUER "Dernier coach"
-- Si COUNT > 1 → ✅ OK retirer
```

---

### Ajouter Nageur au Groupe

| Rôle | Peut ajouter ? | Qui peut être ajouté ? |
|------|---------------|----------------------|
| **Coach du groupe** | ✅ Oui | Nageurs du club |
| **Coach du club (pas du groupe)** | ❌ Non | - |

**Multi-groupes** :
```sql
-- Un nageur peut être ajouté même s'il est déjà dans un autre groupe
INSERT INTO group_members (group_id, user_id)
VALUES ('group-comp', 'sophie-id');  -- ✅ OK même si Sophie est dans Groupe Loisir
```

---

### Retirer Nageur du Groupe

| Rôle | Peut retirer ? | Conditions |
|------|---------------|------------|
| **Coach du groupe** | ✅ Oui | Aucune |
| **Nageur lui-même** | ⚠️ Demander (V2) | Via support/coach |

---

## 🗓️ Slot (Créneau)

### Créer Slot

| Rôle | Peut créer ? | Pour quel groupe ? |
|------|-------------|-------------------|
| **Coach du groupe** | ✅ Oui | Ses groupes |
| **Nageur** | ❌ Non | - |

---

### Voir Slot

| Rôle | Peut voir ? | Détails visibles |
|------|------------|------------------|
| **Coach du groupe** | ✅ Oui | Tout |
| **Nageur du groupe** | ✅ Oui | Heure, lieu, type (détails après émargement) |
| **Coach autre groupe** | ❌ Non | RLS bloque |

**RLS Policy** :
```sql
CREATE POLICY "Group members can view slots"
  ON training_slots FOR SELECT
  USING (
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
    OR group_id IN (
      SELECT group_id 
      FROM group_coaches 
      WHERE coach_id = auth.uid()
    )
  );
```

---

### Modifier/Supprimer Slot

| Rôle | Peut modifier ? | Peut supprimer ? |
|------|----------------|-----------------|
| **Coach du groupe** | ✅ Oui | ✅ Oui |
| **Nageur** | ❌ Non | ❌ Non |

---

## 📝 Entraînement (Workout)

### Créer Entraînement

| Rôle | Peut créer ? | Visibilité |
|------|-------------|-----------|
| **Coach du club** | ✅ Oui | Tous coaches du club si publié |
| **Nageur** | ❌ Non | - |

**Brouillon vs Publié** :
```sql
-- Brouillon (is_published = false)
-- Visible seulement par le créateur

-- Publié (is_published = true)
-- Visible par tous coaches du club
```

---

### Voir Entraînement

| Rôle | Peut voir ? | Quand ? |
|------|------------|---------|
| **Coach créateur** | ✅ Oui | Toujours |
| **Coach du club** | ✅ Oui | Si publié |
| **Nageur du groupe** | 🔒 Conditionnel | Seulement après émargement |

**Règle Nageur** :
```
SI entraînement.scheduled_date > TODAY :
  → 🔒 Masqué ("Disponible après")
  
SI entraînement.attendance_marked = true :
  → ✅ Détails visibles
```

---

### Modifier Entraînement

| Rôle | Peut modifier ? | Conditions |
|------|----------------|------------|
| **Coach créateur** | ✅ Oui | Toujours |
| **Coach du club** | ❌ Non | Doit dupliquer |

---

### Dupliquer Entraînement

| Rôle | Peut dupliquer ? | Résultat |
|------|-----------------|----------|
| **Coach du club** | ✅ Oui | Copie en brouillon (coach devient créateur) |

---

### Supprimer Entraînement

| Rôle | Peut supprimer ? | Conditions |
|------|-----------------|------------|
| **Coach créateur** | ✅ Oui | Si pas assigné (V0.5+) |
| **Owner** | ✅ Oui (V2) | Tous entraînements |

---

## 📅 Assignment (Entraînement Assigné)

### Assigner Entraînement

| Rôle | Peut assigner ? | À quel slot ? |
|------|----------------|--------------|
| **Coach du groupe** | ✅ Oui | Slots de ses groupes |
| **Nageur** | ❌ Non | - |

---

### Désassigner Entraînement

| Rôle | Peut désassigner ? | Conditions |
|------|-------------------|------------|
| **Coach du groupe** | ✅ Oui | Si pas encore émargé |
| **Coach du groupe** | ⚠️ Confirmation | Si déjà émargé (perd feedbacks) |

---

## ✅ Émargement

### Émarger Entraînement

| Rôle | Peut émarger ? | Qui peut émarger ? |
|------|---------------|-------------------|
| **Coach du groupe** | ✅ Oui | N'importe quel coach du groupe |
| **Coach créateur entraînement** | ⚠️ Seulement si dans le groupe | Doit être coach du groupe |
| **Nageur** | ❌ Non | - |

**Flow** :
```
1. N'importe quel coach du groupe ouvre émargement
2. Si plusieurs coaches → sélectionne qui a donné la séance
3. Coche nageurs présents
4. Peut ajouter nageurs hors groupe (invités)
5. Valide → workout_assignments.coach_id renseigné
```

---

### Modifier Émargement

| Rôle | Peut modifier ? | Délai |
|------|----------------|-------|
| **Coach du groupe** | ✅ Oui | < 24h après émargement |
| **Coach qui a émargé** | ✅ Oui | < 24h |
| **Nageur** | ❌ Non | - |

---

### Ajouter Nageur Invité (Guest)

| Rôle | Peut ajouter ? | Qui peut être ajouté ? |
|------|---------------|----------------------|
| **Coach du groupe** | ✅ Oui | Nageurs du club (hors groupe) |

**Flow** :
```
Émargement → Bouton "+ Ajouter nageur"
  ↓
Modal liste nageurs du club :
  - Filtré : seulement nageurs PAS dans ce groupe
  - Coach coche nageur(s)
  ↓
Validation
  ↓
workout_session créée avec is_guest=true
```

---

## 💬 Feedback

### Donner Feedback

| Rôle | Peut donner ? | Conditions |
|------|--------------|------------|
| **Nageur présent** | ✅ Oui | Après émargement (attended=true) |
| **Nageur absent** | ❌ Non | attended=false |
| **Nageur invité** | ✅ Oui | is_guest=true, attended=true |
| **Coach** | ❌ Non | Les coaches ne donnent pas de feedback |

---

### Voir Feedback

| Rôle | Peut voir ? | Quels feedbacks ? |
|------|------------|------------------|
| **Coach du groupe** | ✅ Oui | Tous feedbacks du groupe |
| **Nageur** | ✅ Oui | Seulement son propre feedback |
| **Coach autre groupe** | ❌ Non | RLS bloque |

**RLS Policy** :
```sql
CREATE POLICY "View own feedback"
  ON workout_sessions FOR SELECT
  USING (
    swimmer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workout_assignments wa
      JOIN training_slots ts ON ts.id = wa.training_slot_id
      JOIN group_coaches gc ON gc.group_id = ts.group_id
      WHERE wa.id = workout_sessions.workout_assignment_id
      AND gc.coach_id = auth.uid()
    )
  );
```

---

### Modifier Feedback

| Rôle | Peut modifier ? | Délai |
|------|----------------|-------|
| **Nageur (son feedback)** | ✅ Oui | < 24h après envoi (V0.5+) |
| **Coach** | ❌ Non | Ne peut pas modifier feedback nageur |

---

# Permissions par Action

## 📊 Matrice Globale

| Action | Owner | Coach Groupe | Coach Club | Nageur Groupe | Nageur Club |
|--------|-------|-------------|-----------|--------------|------------|
| **Club** |
| Créer club | ✅ (si sans club) | ✅ (si sans club) | ❌ | ❌ | ❌ |
| Voir club | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modifier club | ✅ | ⚠️ (V2) | ⚠️ (V2) | ❌ | ❌ |
| Supprimer club | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Groupe** |
| Créer groupe | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir groupe | ✅ | ✅ | ✅ (limité) | ✅ | ⚠️ (info) |
| Modifier groupe | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer groupe | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ajouter coach | ✅ | ✅ | ❌ | ❌ | ❌ |
| Retirer coach | ✅ | ✅ (si pas dernier) | ❌ | ❌ | ❌ |
| Ajouter nageur | ✅ | ✅ | ❌ | ❌ | ❌ |
| Retirer nageur | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Slot** |
| Créer slot | ✅ | ✅ | ❌ | ❌ | ❌ |
| Voir slot | ✅ | ✅ | ❌ | ✅ | ❌ |
| Modifier slot | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer slot | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Entraînement** |
| Créer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir (brouillon) | ✅ (si créateur) | ✅ (si créateur) | ✅ (si créateur) | ❌ | ❌ |
| Voir (publié) | ✅ | ✅ | ✅ | 🔒 (après émargement) | ❌ |
| Modifier | ✅ (si créateur) | ✅ (si créateur) | ✅ (si créateur) | ❌ | ❌ |
| Dupliquer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer | ✅ (si créateur) | ✅ (si créateur) | ❌ | ❌ | ❌ |
| Assigner | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Émargement** |
| Émarger | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sélectionner coach | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ajouter invité | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier (< 24h) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Feedback** |
| Donner | ❌ | ❌ | ❌ | ✅ (si présent) | ❌ |
| Voir tous | ✅ | ✅ | ❌ | ❌ | ❌ |
| Voir sien | ❌ | ❌ | ❌ | ✅ | ❌ |
| Modifier (< 24h) | ❌ | ❌ | ❌ | ✅ (V0.5+) | ❌ |

**Légende** :
- ✅ : Autorisé
- ❌ : Interdit
- 🔒 : Conditionnel (règle spéciale)
- ⚠️ : Limité / Future version

---

# Cas Particuliers

## 1. Nageur Multi-Groupes

**Situation** :
```
Sophie est dans :
- Groupe Compétition
- Groupe Technique
```

**Permissions** :
- ✅ Voit entraînements des 2 groupes dans son calendrier
- ✅ Peut donner feedback pour chaque entraînement
- ✅ Stats agrégées sur tous ses groupes (V0.5+)

**Calendrier** :
```
LUNDI 18h : Entraînement Compétition
MARDI 19h : Entraînement Technique
MERCREDI 18h : Entraînement Compétition
```

---

## 2. Nageur Invité (Guest)

**Situation** :
```
Marc (Groupe Loisir) ajouté ponctuellement à entraînement Compétition
```

**Permissions** :
- ✅ Peut donner feedback pour cet entraînement
- ✅ Voit détails après émargement
- ✅ Apparaît dans stats coach avec badge "Invité"
- ❌ N'est PAS ajouté au groupe de façon permanente
- ❌ Ne voit pas les autres entraînements du groupe

**Badge UI** :
```
Liste émargement :
  ☑ Sophie (présente)
  ☑ Bob (présent)
  ☑ Marc (présent) 🎫 Invité
```

---

## 3. Coach Multi-Groupes (Même Club)

**Situation** :
```
Thomas est coach de :
- Groupe Compétition
- Groupe Loisir
```

**Permissions** :
- ✅ Crée slots pour les 2 groupes
- ✅ Voit entraînements des 2 groupes
- ✅ Peut émarger les 2 groupes
- ✅ Dashboard agrégé sur tous ses groupes

---

## 4. Plusieurs Coaches par Groupe

**Situation** :
```
Groupe Compétition :
- Coach Thomas
- Coach Marie
```

**Permissions** :
- ✅ Thomas et Marie ont **exactement les mêmes droits**
- ✅ Les deux peuvent émarger
- ✅ Les deux voient tous les feedbacks
- ✅ Lors de l'émargement, sélectionner qui a donné la séance

**Émargement** :
```
Lundi 18h - Marie émarque :
  ↓
1. "Qui a donné la séance ?"
   ○ Thomas
   ● Marie  ← Sélectionné
  ↓
2. Émargement nageurs
  ↓
3. workout_assignments.coach_id = marie-id
```

---

## 5. Entraînement Créé par Coach A, Assigné par Coach B

**Situation** :
```
Groupe Compétition (Thomas + Marie) :
- Thomas crée entraînement "Endurance 3000m"
- Marie l'assigne au slot Lundi 18h
```

**Permissions** :
- ✅ Thomas : peut modifier son entraînement
- ✅ Marie : peut assigner, émarger
- ✅ Marie : NE peut PAS modifier l'entraînement de Thomas
- ✅ Marie : peut DUPLIQUER et modifier la copie

---

## 6. Dernier Coach d'un Groupe

**Situation** :
```
Groupe Loisir :
- Coach Thomas (seul)
```

**Tentative Retrait** :
```
Thomas → "Se retirer du groupe Loisir"
  ↓
Vérification : COUNT(group_coaches) = 1
  ↓
❌ ERREUR :
┌──────────────────────────────────────┐
│  ⚠️ Impossible de se retirer         │
│                                      │
│  Vous êtes le dernier coach de ce    │
│  groupe. Un groupe doit avoir au     │
│  moins un coach.                     │
│                                      │
│  Options :                           │
│  - Ajouter un autre coach            │
│  - Supprimer le groupe               │
│                                      │
│  [OK]                                │
└──────────────────────────────────────┘
```

---

## 7. Suppression Club (Owner Absent)

**Situation** :
```
Owner Thomas supprime le club
  ↓
Que se passe-t-il pour :
  - Coach Marie ?
  - Nageurs ?
```

**Résultat** :
```
Coach Marie :
  - Profile intact
  - Retiré de club_members
  - Peut rejoindre un autre club avec code coach
  - Ou créer son propre club

Nageurs (Sophie, Bob, etc.) :
  - Profiles intacts
  - Retirés de club_members
  - Peuvent rejoindre un autre club avec code club
  - Dashboard vide : "Rejoindre un club"
```

---

## 8. Modification Feedback (V0.5+)

**Situation** :
```
Sophie donne feedback Lundi 20h :
  - RPE : 14/20
  - Commentaire : "Dur mais bien"
  
Mardi 10h (< 24h) :
  - Sophie veut modifier : RPE 15/20
```

**Permissions** :
- ✅ Sophie peut modifier son feedback < 24h
- ❌ Sophie NE peut PAS modifier > 24h
- ❌ Coach NE peut JAMAIS modifier feedback nageur

---

## 9. Coach Créateur vs Coach Membre

**Situation** :
```
Groupe Compétition :
- Thomas (créateur, is_creator=true)
- Marie (membre, is_creator=false)
```

**Permissions** :
- ✅ Exactement les mêmes droits (V0.5)
- ⚠️ En V2 : rôles "Head Coach" vs "Assistant" possible

**UI** :
```
Liste coaches :
  - Thomas ⭐ (créateur)
  - Marie

Le ⭐ est informatif uniquement, pas de différence de permissions
```

---

## 10. Nageur Absent vs Présent

**Situation** :
```
Émargement Lundi 18h :
  ☑ Sophie (présente)
  ☐ Bob (absent)
```

**Permissions Feedback** :

| Nageur | attended | Peut donner feedback ? | Voit détails ? |
|--------|----------|----------------------|---------------|
| Sophie | true | ✅ Oui | ✅ Oui (après émargement) |
| Bob | false | ❌ Non | ✅ Oui (mais pas de feedback) |

**UI Bob** :
```
Calendrier Bob :
  Lundi 18h
  Badge : "Absent"
  [Voir détail] → Structure entraînement visible
  Feedback : Non applicable (absent)
```

---

**Version** : 1.0 (V0.5)  
**Date** : 29 Janvier 2026  
**Statut** : Spécification complète
