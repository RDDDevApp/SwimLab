# 🗄️ Database Schema - V0

## 📊 Vue d'Ensemble

**8 tables principales + 1 nouvelle table (training_slots)**

```
┌─────────────┐
│   profiles  │
└──────┬──────┘
       │
       ├─────────────────────────┐
       │                         │
┌──────▼──────┐          ┌───────▼────────┐
│    clubs    │          │  club_members  │
└──────┬──────┘          └───────┬────────┘
       │                         │
       │                 ┌───────▼────────┐
       │                 │     groups     │
       │                 └───────┬────────┘
       │                         │
       │         ┌───────────────┼────────────────┐
       │         │               │                │
┌──────▼─────────▼──┐   ┌───────▼──────┐  ┌─────▼─────────┐
│ training_slots    │   │ group_members │  │   workouts    │
└──────┬────────────┘   └──────────────┘  └─────┬─────────┘
       │                                         │
       │                 ┌───────────────────────┤
       │                 │                       │
┌──────▼─────────────────▼──┐         ┌─────────▼──────────┐
│  workout_assignments      │         │ workout_sessions   │
└───────────────────────────┘         └────────────────────┘
```

---

## 📋 Tables Détaillées

### 1. profiles

**Description** : Profils utilisateurs (étend auth.users de Supabase)

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

**Champs** :
- `id` : UUID (même que auth.users)
- `first_name` : Prénom
- `last_name` : Nom
- `avatar_url` : URL photo de profil (optionnel)
- `role` : 'coach' ou 'swimmer'
- `created_at` : Date création
- `updated_at` : Date modification

**RLS Policies** :
- `SELECT` : Tous peuvent voir tous les profils
- `UPDATE` : Utilisateur peut modifier son propre profil uniquement

---

### 2. clubs

**Description** : Clubs de natation

```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  invitation_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_invitation_code ON clubs(invitation_code);
CREATE INDEX idx_clubs_owner_id ON clubs(owner_id);
```

**Champs** :
- `id` : UUID
- `name` : Nom du club
- `description` : Description (optionnel)
- `logo_url` : URL logo (optionnel)
- `invitation_code` : Code unique 8 caractères (auto-généré)
- `owner_id` : Coach créateur du club
- `created_at` : Date création
- `updated_at` : Date modification

**RLS Policies** (corrigées migration 002) :
- `SELECT` : Tous les utilisateurs authentifiés peuvent voir les clubs (nécessaire pour rejoindre par code invitation)
- `INSERT` : Coachs peuvent créer des clubs
- `UPDATE` : Owner peut modifier son club

---

### 3. club_members

**Description** : Association utilisateurs ↔ clubs

```sql
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'swimmer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_members_role ON club_members(role);
```

**Champs** :
- `id` : UUID
- `club_id` : Référence au club
- `user_id` : Référence à l'utilisateur
- `role` : 'coach' ou 'swimmer'
- `joined_at` : Date d'adhésion

**Contraintes** :
- Un utilisateur ne peut être qu'une seule fois dans un club

**RLS Policies** (corrigées migration 002 — évite les sous-requêtes auto-référencées) :
- `SELECT` : Utilisateurs voient leurs propres adhésions (`user_id = auth.uid()`) + Propriétaires du club voient tous les membres (`club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())`)
- `INSERT` : Coachs peuvent ajouter des nageurs + Nageurs peuvent s'auto-ajouter via code invitation

---

### 4. groups

**Description** : Groupes d'entraînement au sein d'un club

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'competition')),
  schedule_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_club_id ON groups(club_id);
CREATE INDEX idx_groups_coach_id ON groups(coach_id);
```

**Champs** :
- `id` : UUID
- `club_id` : Club parent
- `coach_id` : Coach responsable
- `name` : Nom du groupe
- `description` : Description (optionnel)
- `level` : Niveau (beginner, intermediate, advanced, competition)
- `schedule_info` : Infos horaires texte libre (optionnel, V0.5+)
- `created_at` : Date création
- `updated_at` : Date modification

**RLS Policies** :
- `SELECT` : Membres du club peuvent voir les groupes
- `INSERT` : Coachs du club peuvent créer des groupes
- `UPDATE/DELETE` : Coach propriétaire uniquement

---

### 5. group_members

**Description** : Association nageurs ↔ groupes

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

**Champs** :
- `id` : UUID
- `group_id` : Groupe
- `user_id` : Nageur
- `joined_at` : Date d'ajout

**Contraintes** :
- Un nageur ne peut être qu'une seule fois dans un groupe (V0)
- V0.5 : On enlèvera cette contrainte pour permettre multi-groupes

**RLS Policies** :
- `SELECT` : Membres du groupe et coach peuvent voir
- `INSERT/DELETE` : Coach du groupe uniquement

---

### 6. training_slots (NOUVEAU !)

**Description** : Créneaux récurrents d'entraînement

```sql
CREATE TABLE training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_training_slots_coach_id ON training_slots(coach_id);
CREATE INDEX idx_training_slots_day_of_week ON training_slots(day_of_week);
```

**Champs** :
- `id` : UUID
- `group_id` : Groupe concerné
- `coach_id` : Coach propriétaire
- `name` : Nom du créneau (ex: "Entraînement Compétition")
- `day_of_week` : Jour de la semaine (0=Dimanche, 1=Lundi, ..., 6=Samedi)
- `start_time` : Heure de début (ex: 18:00:00)
- `duration_minutes` : Durée en minutes (ex: 90)
- `location` : Lieu (ex: "Piscine Municipale")
- `is_active` : Actif ou archivé
- `created_at` : Date création
- `updated_at` : Date modification

**Exemples** :
```sql
-- Lundi 18h-19h30 pour groupe Compétition
INSERT INTO training_slots (group_id, coach_id, name, day_of_week, start_time, duration_minutes, location)
VALUES ('<group_uuid>', '<coach_uuid>', 'Entraînement Compétition', 1, '18:00:00', 90, 'Piscine Municipale');

-- Mercredi 19h-20h pour groupe Loisir
INSERT INTO training_slots (group_id, coach_id, name, day_of_week, start_time, duration_minutes, location)
VALUES ('<group_uuid>', '<coach_uuid>', 'Entraînement Loisir', 3, '19:00:00', 60, 'Piscine Jean Bouin');
```

**RLS Policies** :
- `SELECT` : Membres du groupe peuvent voir les slots
- `INSERT/UPDATE/DELETE` : Coach propriétaire uniquement

---

### 7. workouts

**Description** : Entraînements créés par les coachs

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

**Champs** :
- `id` : UUID
- `club_id` : Club
- `coach_id` : Coach créateur
- `title` : Titre de l'entraînement
- `type` : Type (endurance, sprint, technique, recovery, other)
- `description` : Description (optionnel)
- `content` : Structure JSON de l'entraînement
- `total_distance` : Distance totale en mètres (calculée)
- `estimated_duration` : Durée estimée en minutes (optionnel)
- `is_published` : Publié (visible) ou brouillon
- `created_at` : Date création
- `updated_at` : Date modification

**Structure JSON content** :
```json
{
  "blocks": [
    {
      "id": "block_1",
      "type": "warmup",
      "name": "Échauffement",
      "total_distance": 600,
      "sub_blocks": [
        {
          "id": "sub_block_1_1",
          "title": "4x150m",
          "series": 4,
          "distance": 150,
          "departure": "",
          "notes": "",
          "exercises": [
            {
              "id": "exercise_1_1_1",
              "distance": 100,
              "stroke": "freestyle",
              "intensity": "easy",
              "target_time": "",
              "notes": ""
            },
            {
              "id": "exercise_1_1_2",
              "distance": 50,
              "stroke": "backstroke",
              "intensity": "easy",
              "target_time": "",
              "notes": ""
            }
          ]
        }
      ]
    },
    {
      "id": "block_2",
      "type": "main",
      "name": "Série Principale",
      "total_distance": 2000,
      "sub_blocks": [
        {
          "id": "sub_block_2_1",
          "title": "10x200m",
          "series": 10,
          "distance": 200,
          "departure": "@ 3'30",
          "notes": "",
          "exercises": [
            {
              "id": "exercise_2_1_1",
              "distance": 200,
              "stroke": "freestyle",
              "intensity": "moderate",
              "target_time": "",
              "notes": ""
            }
          ]
        }
      ]
    }
  ]
}
```

**Types de nage (stroke)** :
- freestyle, backstroke, breaststroke, butterfly
- individual_medley (4 nages)
- choice (au choix du nageur)
- kick (jambes seules)
- pull (bras seuls)
- drill (éducatifs)
- fins (palmes)
- pull_buoy
- paddles (plaquettes)

**Intensités (intensity)** :
- recovery (récupération)
- easy (facile)
- moderate (modéré)
- threshold (soutenu)
- hard (intense)
- sprint (maximal)

**RLS Policies** :
- `SELECT` : Coach créateur + Nageurs des groupes assignés
- `INSERT` : Coachs du club
- `UPDATE/DELETE` : Coach créateur uniquement

---

### 8. workout_assignments

**Description** : Association entraînements ↔ slots (planification)

```sql
CREATE TABLE workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  training_slot_id UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  attendance_marked BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(training_slot_id, scheduled_date)
);

CREATE INDEX idx_workout_assignments_workout_id ON workout_assignments(workout_id);
CREATE INDEX idx_workout_assignments_training_slot_id ON workout_assignments(training_slot_id);
CREATE INDEX idx_workout_assignments_scheduled_date ON workout_assignments(scheduled_date);
```

**Champs** :
- `id` : UUID
- `workout_id` : Entraînement assigné
- `training_slot_id` : Slot concerné
- `scheduled_date` : Date spécifique (ex: 2026-01-29)
- `is_completed` : Entraînement terminé (après émargement)
- `attendance_marked` : Émargement fait
- `assigned_at` : Date d'assignation

**Contraintes** :
- Un slot ne peut avoir qu'un seul entraînement assigné par date

**Exemples** :
```sql
-- Assigner entraînement au slot "Lundi 18h" du 27 janvier 2026
INSERT INTO workout_assignments (workout_id, training_slot_id, scheduled_date)
VALUES ('<workout_uuid>', '<slot_uuid>', '2026-01-27');
```

**RLS Policies** :
- `SELECT` : Coach + Nageurs du groupe
- `INSERT/DELETE` : Coach du slot uniquement

---

### 9. workout_sessions

**Description** : Feedbacks des nageurs sur les entraînements

```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_assignment_id UUID NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
  swimmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
```

**Champs** :
- `id` : UUID
- `workout_assignment_id` : Entraînement planifié concerné
- `swimmer_id` : Nageur
- `attended` : Présent (true) ou absent (false)
- `rpe_score` : RPE (Rating of Perceived Exertion) 6-20, NULL si pas donné
- `feedback_text` : Commentaire (optionnel)
- `performances` : JSON pour times/performances (V0.5+)
- `completed_at` : Date de feedback (NULL si pas encore donné)
- `created_at` : Date création (émargement)
- `updated_at` : Date modification

**Contraintes** :
- Un nageur ne peut avoir qu'une session par entraînement

**RLS Policies** :
- `SELECT` : Nageur lui-même + Coach du groupe
- `INSERT` : Nageur (après émargement)
- `UPDATE` : Nageur peut modifier son propre feedback

---

## 🔐 Row Level Security (RLS)

Toutes les tables ont RLS activé (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY`).

### Principes de Sécurité
1. **Isolation par club** : Un coach/nageur ne voit que les données de son/ses clubs
2. **Propriété** : Seul le créateur peut modifier/supprimer (sauf règles spécifiques)
3. **Rôles** : Coachs ont plus de droits que nageurs
4. **Lecture publique limitée** : Profils visibles par tous (pour mentions, recherche)

---

## 🔄 Triggers & Functions

### 1. Trigger auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Appliqué à toutes les tables avec updated_at
CREATE TRIGGER update_<table>_updated_at
  BEFORE UPDATE ON <table>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Trigger auto-création profil (V0.5)

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'swimmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 📦 Tables V0.5 (Sprint 7)

### 10. exercise_library

**Description** : Bibliothèque d'exercices réutilisables par club

```sql
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance INTEGER NOT NULL DEFAULT 100,
  stroke TEXT NOT NULL DEFAULT 'freestyle',
  intensity TEXT NOT NULL DEFAULT 'moderate',
  notes TEXT,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11. workout_templates

**Description** : Templates de séances réutilisables

```sql
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('endurance', 'sprint', 'technique', 'recovery', 'other')),
  description TEXT,
  content JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
  total_distance INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Migration : `docs/migrations/003_exercise_library_and_templates.sql`

---

## 📈 Évolutions Futures

### V0.5 (restant)
- Ajouter champ `times` dans `workout_sessions.performances` (times réalisés)
- Enlever contrainte UNIQUE sur group_members (multi-groupes)

### V1
- Ajouter table `solo_swimmers` (nageurs indépendants)
- Ajouter table `ai_training_plans` (plans IA)
- Ajouter table `swimmer_goals` (objectifs nageurs)
- Ajouter intégration API FFN (table `competition_results`)

---

**Version** : 1.2
**Date** : 15 Février 2026
**Statut** : V0 + Sprint 7 (exercise_library, workout_templates)
