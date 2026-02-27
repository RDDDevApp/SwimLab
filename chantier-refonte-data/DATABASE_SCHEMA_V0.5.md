# 🗄️ Database Schema - V0.5 (Refonte Attributions)

## 📊 Vue d'Ensemble

**Changements majeurs V0 → V0.5** :
- ✅ Nageur peut être dans **plusieurs groupes**
- ✅ Coach limité à **un seul club**
- ✅ **2 codes d'invitation** (club + coach)
- ✅ Plusieurs coaches par groupe (droits égaux)
- ✅ Sélection coach qui a donné la séance (émargement)
- ✅ Ajout nageurs hors groupe dans émargement

---

## 🏗️ Architecture Hiérarchique

```
CLUB (unique)
 ├─ COACH(s) (1 club par coach)
 │   └─ GROUPE(s) (plusieurs coaches possibles)
 │       └─ NAGEUR(s) (peut être dans plusieurs groupes)
 └─ ENTRAÎNEMENTS
     └─ ASSIGNMENTS (slots + date)
         └─ SESSIONS (feedbacks nageurs)
```

**Règles V0.5** :
- ✅ Un club peut avoir plusieurs coaches
- ✅ Un coach ne peut être que dans UN SEUL club
- ✅ Un coach peut gérer plusieurs groupes
- ✅ Un groupe peut avoir plusieurs coaches (droits égaux)
- ✅ Un nageur peut être dans plusieurs groupes
- ✅ Un groupe doit avoir AU MOINS 1 coach (impossible de supprimer dernier coach)

---

## 📋 Tables Détaillées

### 1. profiles (Inchangé)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('coach', 'swimmer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
```

**Notes** :
- Un user a UN rôle principal (coach ou swimmer)
- Un user peut être dans plusieurs contextes (plusieurs groupes si swimmer)

---

### 2. clubs (Modifié - 2 codes d'invitation)

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- 2 codes d'invitation
  invitation_code_club TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  invitation_code_coach TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_invitation_code_club ON clubs(invitation_code_club);
CREATE INDEX idx_clubs_invitation_code_coach ON clubs(invitation_code_coach);
CREATE INDEX idx_clubs_owner_id ON clubs(owner_id);
```

**Changements** :
- ✅ **2 codes** au lieu d'1 :
  - `invitation_code_club` : Pour nageurs (rejoindre comme swimmer)
  - `invitation_code_coach` : Pour coaches (rejoindre comme coach)

**Exemple** :
```sql
-- Club Paris Natation
{
  id: 'club-uuid-123',
  name: 'Paris Natation',
  invitation_code_club: 'ABC123XY',  -- Pour nageurs
  invitation_code_coach: 'COACH456',  -- Pour coaches
  owner_id: 'thomas-uuid',
}
```

---

### 3. club_members (Modifié - coach limité à 1 club)

```sql
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'swimmer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- CONTRAINTE : Un user ne peut être qu'une seule fois dans un club
  UNIQUE(club_id, user_id),
  
  -- NOUVELLE CONTRAINTE : Un coach ne peut être que dans UN SEUL club
  CONSTRAINT unique_coach_per_user 
    EXCLUDE USING gist (user_id WITH =) 
    WHERE (role = 'coach')
);

CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_members_role ON club_members(role);
```

**Changements** :
- ✅ **Nouvelle contrainte** : Un coach ne peut être que dans 1 club
- ✅ Un nageur peut être dans plusieurs clubs (si besoin V2)

**Explication contrainte** :
```sql
-- Coach Thomas
INSERT INTO club_members (club_id, user_id, role)
VALUES ('paris-club', 'thomas-id', 'coach');  -- ✅ OK

INSERT INTO club_members (club_id, user_id, role)
VALUES ('versailles-club', 'thomas-id', 'coach');  -- ❌ ERREUR (déjà coach ailleurs)

-- Nageur Sophie
INSERT INTO club_members (club_id, user_id, role)
VALUES ('paris-club', 'sophie-id', 'swimmer');  -- ✅ OK

INSERT INTO club_members (club_id, user_id, role)
VALUES ('versailles-club', 'sophie-id', 'swimmer');  -- ✅ OK (nageur peut être dans plusieurs clubs)
```

---

### 4. groups (Inchangé)

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'competition')),
  schedule_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_club_id ON groups(club_id);
```

**Notes** :
- Pas de `coach_id` unique (plusieurs coaches possibles)
- Créateur du groupe stocké dans `group_coaches` avec metadata

---

### 5. group_coaches (NOUVELLE TABLE)

```sql
CREATE TABLE group_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Un coach ne peut être qu'une fois dans un groupe
  UNIQUE(group_id, coach_id)
);

CREATE INDEX idx_group_coaches_group_id ON group_coaches(group_id);
CREATE INDEX idx_group_coaches_coach_id ON group_coaches(coach_id);
```

**Usage** :
```sql
-- Groupe Compétition
-- Coach Thomas (créateur)
INSERT INTO group_coaches (group_id, coach_id, is_creator)
VALUES ('group-comp', 'thomas-id', true);

-- Coach Marie (ajoutée ensuite)
INSERT INTO group_coaches (group_id, coach_id, is_creator)
VALUES ('group-comp', 'marie-id', false);
```

**Contraintes Métier** :
- ✅ Tous les coaches ont les mêmes droits (V0.5)
- ✅ `is_creator` = informatif uniquement (pas de différence de permissions)
- ✅ Impossible de supprimer dernier coach d'un groupe (contrainte applicative)

---

### 6. group_members (Modifié - Nageur multi-groupes)

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- MODIFICATION : Enlever contrainte UNIQUE(group_id, user_id)
  -- Un nageur peut être dans plusieurs groupes
  UNIQUE(group_id, user_id)  -- Juste pour éviter doublons dans MÊME groupe
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

**Changements** :
- ✅ Nageur peut être dans plusieurs groupes
- ✅ Contrainte UNIQUE gardée pour éviter doublon dans MÊME groupe

**Exemple** :
```sql
-- Sophie dans 3 groupes
INSERT INTO group_members (group_id, user_id)
VALUES 
  ('group-competition', 'sophie-id'),  -- ✅ OK
  ('group-technique', 'sophie-id'),     -- ✅ OK
  ('group-waterpolo', 'sophie-id');     -- ✅ OK

-- Doublon dans même groupe
INSERT INTO group_members (group_id, user_id)
VALUES ('group-competition', 'sophie-id');  -- ❌ ERREUR (déjà dans ce groupe)
```

---

### 7. training_slots (Modifié - Plusieurs coaches)

```sql
CREATE TABLE training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  
  -- SUPPRESSION : coach_id (car plusieurs coaches par groupe)
  
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_slots_group_id ON training_slots(group_id);
CREATE INDEX idx_training_slots_day_of_week ON training_slots(day_of_week);
```

**Changements** :
- ❌ **Suppression `coach_id`** (plusieurs coaches possibles)
- ✅ Tous les coaches du groupe peuvent gérer les slots

---

### 8. workouts (Inchangé)

```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('endurance', 'sprint', 'technique', 'recovery', 'other')),
  description TEXT,
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  total_distance INTEGER,
  estimated_duration INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_club_id ON workouts(club_id);
CREATE INDEX idx_workouts_coach_id ON workouts(coach_id);
CREATE INDEX idx_workouts_type ON workouts(type);
CREATE INDEX idx_workouts_is_published ON workouts(is_published);
CREATE INDEX idx_workouts_content ON workouts USING GIN (content);
```

**Notes** :
- `coach_id` = créateur de l'entraînement (garde la traçabilité)
- Tous les coaches du club peuvent voir les entraînements publiés

---

### 9. workout_assignments (Modifié - Coach qui a donné la séance)

```sql
CREATE TABLE workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  training_slot_id UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  
  -- NOUVEAU : Coach qui a donné la séance (rempli lors de l'émargement)
  coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  is_completed BOOLEAN NOT NULL DEFAULT false,
  attendance_marked BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(training_slot_id, scheduled_date)
);

CREATE INDEX idx_workout_assignments_workout_id ON workout_assignments(workout_id);
CREATE INDEX idx_workout_assignments_training_slot_id ON workout_assignments(training_slot_id);
CREATE INDEX idx_workout_assignments_scheduled_date ON workout_assignments(scheduled_date);
CREATE INDEX idx_workout_assignments_coach_id ON workout_assignments(coach_id);
```

**Changements** :
- ✅ **Nouveau champ `coach_id`** = coach qui a donné la séance
- ✅ Rempli au moment de l'émargement (NULL avant)

**Flow** :
```sql
-- 1. Assignment créé (coach_id = NULL)
INSERT INTO workout_assignments (workout_id, training_slot_id, scheduled_date)
VALUES ('workout-123', 'slot-456', '2026-01-30');

-- 2. Émargement (coach sélectionne qui a donné la séance)
UPDATE workout_assignments 
SET coach_id = 'thomas-id', attendance_marked = true
WHERE id = 'assignment-789';
```

---

### 10. workout_sessions (Modifié - Nageurs hors groupe)

```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_assignment_id UUID NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
  swimmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- NOUVEAU : Indique si le nageur faisait partie du groupe ou ajouté ponctuellement
  is_guest BOOLEAN NOT NULL DEFAULT false,
  
  attended BOOLEAN NOT NULL DEFAULT false,
  rpe_score INTEGER CHECK (rpe_score >= 6 AND rpe_score <= 20),
  feedback_text TEXT,
  performances JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workout_assignment_id, swimmer_id)
);

CREATE INDEX idx_workout_sessions_workout_assignment_id ON workout_sessions(workout_assignment_id);
CREATE INDEX idx_workout_sessions_swimmer_id ON workout_sessions(swimmer_id);
CREATE INDEX idx_workout_sessions_attended ON workout_sessions(attended);
CREATE INDEX idx_workout_sessions_rpe_score ON workout_sessions(rpe_score);
CREATE INDEX idx_workout_sessions_is_guest ON workout_sessions(is_guest);
```

**Changements** :
- ✅ **Nouveau champ `is_guest`** = nageur hors groupe ajouté ponctuellement
- ✅ `is_guest = false` : nageur du groupe
- ✅ `is_guest = true` : nageur du club mais pas du groupe

**Flow Émargement** :
```sql
-- Nageurs du groupe (normal)
INSERT INTO workout_sessions (workout_assignment_id, swimmer_id, attended, is_guest)
VALUES 
  ('assignment-123', 'sophie-id', true, false),  -- Sophie (du groupe)
  ('assignment-123', 'bob-id', true, false);     -- Bob (du groupe)

-- Nageur hors groupe ajouté (guest)
INSERT INTO workout_sessions (workout_assignment_id, swimmer_id, attended, is_guest)
VALUES ('assignment-123', 'alice-id', true, true);  -- Alice (groupe Loisir, invitée ponctuellement)
```

---

## 🔄 Migrations SQL (V0 → V0.5)

### Migration 1 : Ajouter 2ème code invitation club

```sql
-- Ajouter code invitation coach
ALTER TABLE clubs ADD COLUMN invitation_code_coach TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8);

-- Générer codes pour clubs existants
UPDATE clubs SET invitation_code_coach = substring(md5(random()::text || id::text) from 1 for 8);

-- Rendre non-null
ALTER TABLE clubs ALTER COLUMN invitation_code_coach SET NOT NULL;

CREATE INDEX idx_clubs_invitation_code_coach ON clubs(invitation_code_coach);
```

---

### Migration 2 : Contrainte coach 1 seul club

```sql
-- Vérifier qu'aucun coach n'est dans plusieurs clubs avant d'ajouter contrainte
SELECT user_id, COUNT(*) 
FROM club_members 
WHERE role = 'coach' 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Si résultat vide, ajouter contrainte
ALTER TABLE club_members 
ADD CONSTRAINT unique_coach_per_user 
  EXCLUDE USING gist (user_id WITH =) 
  WHERE (role = 'coach');
```

---

### Migration 3 : Créer table group_coaches

```sql
-- Créer table
CREATE TABLE group_coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, coach_id)
);

CREATE INDEX idx_group_coaches_group_id ON group_coaches(group_id);
CREATE INDEX idx_group_coaches_coach_id ON group_coaches(coach_id);

-- Migrer données existantes (V0 : groups.coach_id)
INSERT INTO group_coaches (group_id, coach_id, is_creator, joined_at)
SELECT id, coach_id, true, created_at
FROM groups
WHERE coach_id IS NOT NULL;

-- Supprimer colonne coach_id de groups
ALTER TABLE groups DROP COLUMN coach_id;
```

---

### Migration 4 : Enlever contrainte unique group_members

```sql
-- Pas besoin de migration, contrainte UNIQUE(group_id, user_id) déjà correcte
-- Elle évite doublons dans MÊME groupe, mais permet plusieurs groupes
```

---

### Migration 5 : Supprimer coach_id de training_slots

```sql
-- Vérifier que training_slots existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'training_slots' AND column_name = 'coach_id';

-- Si existe, supprimer
ALTER TABLE training_slots DROP COLUMN IF EXISTS coach_id;
```

---

### Migration 6 : Ajouter coach_id dans workout_assignments

```sql
ALTER TABLE workout_assignments 
ADD COLUMN coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_workout_assignments_coach_id ON workout_assignments(coach_id);
```

---

### Migration 7 : Ajouter is_guest dans workout_sessions

```sql
ALTER TABLE workout_sessions 
ADD COLUMN is_guest BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_workout_sessions_is_guest ON workout_sessions(is_guest);
```

---

## 🔐 Row Level Security (RLS)

### Nouvelles Policies

#### group_coaches

```sql
-- Voir coaches d'un groupe
CREATE POLICY "Group members can view group coaches"
  ON group_coaches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_coaches.group_id
      AND group_members.user_id = auth.uid()
    )
    OR coach_id = auth.uid()
  );

-- Coach peut s'ajouter à un groupe (si déjà coach du club)
CREATE POLICY "Coaches can add themselves to groups"
  ON group_coaches FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM groups g
      JOIN club_members cm ON cm.club_id = g.club_id
      WHERE g.id = group_coaches.group_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'coach'
    )
  );

-- Coach peut se retirer d'un groupe (sauf si dernier)
CREATE POLICY "Coaches can remove themselves from groups"
  ON group_coaches FOR DELETE
  USING (
    coach_id = auth.uid()
    AND (
      SELECT COUNT(*) 
      FROM group_coaches gc2 
      WHERE gc2.group_id = group_coaches.group_id
    ) > 1  -- Au moins 2 coaches (pas le dernier)
  );
```

---

## 📊 Exemples de Queries

### Récupérer tous les groupes d'un nageur

```sql
SELECT g.*, gm.joined_at
FROM groups g
JOIN group_members gm ON gm.group_id = g.id
WHERE gm.user_id = 'sophie-id';
```

### Récupérer tous les coaches d'un groupe

```sql
SELECT p.*, gc.is_creator, gc.joined_at
FROM profiles p
JOIN group_coaches gc ON gc.coach_id = p.id
WHERE gc.group_id = 'group-comp';
```

### Récupérer tous les entraînements d'un nageur (multi-groupes)

```sql
SELECT wa.*, w.*, ts.*
FROM workout_assignments wa
JOIN workouts w ON w.id = wa.workout_id
JOIN training_slots ts ON ts.id = wa.training_slot_id
WHERE ts.group_id IN (
  SELECT group_id 
  FROM group_members 
  WHERE user_id = 'sophie-id'
)
AND wa.scheduled_date >= CURRENT_DATE
ORDER BY wa.scheduled_date, ts.start_time;
```

### Vérifier si coach est dernier du groupe

```sql
SELECT COUNT(*) 
FROM group_coaches 
WHERE group_id = 'group-comp';

-- Si COUNT = 1 → impossible de retirer ce coach
```

---

## ✅ Checklist Migration V0 → V0.5

- [ ] Ajouter `invitation_code_coach` dans `clubs`
- [ ] Créer table `group_coaches`
- [ ] Migrer données `groups.coach_id` → `group_coaches`
- [ ] Supprimer `groups.coach_id`
- [ ] Supprimer `training_slots.coach_id`
- [ ] Ajouter `workout_assignments.coach_id`
- [ ] Ajouter `workout_sessions.is_guest`
- [ ] Ajouter contrainte `unique_coach_per_user` dans `club_members`
- [ ] Mettre à jour RLS policies
- [ ] Tester queries avec nageur multi-groupes
- [ ] Tester suppression dernier coach (doit bloquer)

---

**Version** : 1.0 (V0.5)  
**Date** : 29 Janvier 2026  
**Statut** : Spécification complète
