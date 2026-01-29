# 🛠️ Technical Roadmap - V0

## 📊 Vue d'Ensemble

**Durée estimée** : 10-12 semaines (100-120h @ 10h/semaine)

**Sprints** :
1. Foundation (2 semaines)
2. Slots & Entraînements (2 semaines)
3. Calendriers (2 semaines)
4. Feedback (2 semaines)
5. Stats & Polish (2 semaines)
6. Test Pilote (2 semaines)

---

## 🎯 Sprint 1 : Foundation (Semaines 1-2)

### Objectif
Mettre en place l'authentification, les profils, les clubs et les groupes.

---

### Tâche 1 : Setup Projet & Base de Données

**Étapes** :
- [x] Projet Expo créé
- [x] Dépendances installées (Supabase, Navigation, Paper)
- [x] Configuration Supabase
- [x] Tables BDD créées (profiles, clubs, club_members, groups, group_members)
- [ ] **NOUVELLE TABLE** : `training_slots` à créer
- [ ] **MODIFICATION** : Ajouter champs `type` et `is_published` dans `workouts`

**SQL à exécuter** :
```sql
-- 1. Créer training_slots
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

ALTER TABLE training_slots ENABLE ROW LEVEL SECURITY;

-- Policies training_slots
CREATE POLICY "Group members can view slots"
  ON training_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = training_slots.group_id
      AND group_members.user_id = auth.uid()
    )
    OR coach_id = auth.uid()
  );

CREATE POLICY "Coaches can create slots"
  ON training_slots FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their slots"
  ON training_slots FOR UPDATE
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their slots"
  ON training_slots FOR DELETE
  USING (coach_id = auth.uid());

CREATE TRIGGER update_training_slots_updated_at
  BEFORE UPDATE ON training_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Modifier workouts
ALTER TABLE workouts ADD COLUMN type TEXT NOT NULL DEFAULT 'other' 
  CHECK (type IN ('endurance', 'sprint', 'technique', 'recovery', 'other'));
ALTER TABLE workouts ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_workouts_type ON workouts(type);
CREATE INDEX idx_workouts_is_published ON workouts(is_published);

-- 3. Modifier workout_assignments
ALTER TABLE workout_assignments ADD COLUMN training_slot_id UUID REFERENCES training_slots(id) ON DELETE CASCADE;
ALTER TABLE workout_assignments ADD COLUMN scheduled_date DATE NOT NULL;
ALTER TABLE workout_assignments ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE workout_assignments ADD COLUMN attendance_marked BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_workout_assignments_training_slot_id ON workout_assignments(training_slot_id);
CREATE INDEX idx_workout_assignments_scheduled_date ON workout_assignments(scheduled_date);

-- Contrainte unique : un slot = un entraînement par date
ALTER TABLE workout_assignments ADD CONSTRAINT unique_slot_date UNIQUE(training_slot_id, scheduled_date);

-- 4. Modifier workout_sessions
ALTER TABLE workout_sessions RENAME COLUMN workout_id TO workout_assignment_id;
ALTER TABLE workout_sessions ALTER COLUMN workout_assignment_id TYPE UUID;
ALTER TABLE workout_sessions ADD CONSTRAINT fk_workout_assignment 
  FOREIGN KEY (workout_assignment_id) REFERENCES workout_assignments(id) ON DELETE CASCADE;
```

**Critères de validation** :
- [ ] Toutes les tables créées et visible dans Supabase Table Editor
- [ ] Policies testées (un coach ne voit pas les données d'un autre club)

**Temps estimé** : 2h

---

### Tâche 2 : Navigation & Structure App

**Fichiers à créer** :
```
src/
├── navigation/
│   ├── AuthNavigator.tsx       # Stack Login/Register
│   ├── CoachNavigator.tsx      # Tab bar coach
│   ├── SwimmerNavigator.tsx    # Tab bar nageur
│   └── AppNavigator.tsx        # Root navigator (détecte auth)
├── store/
│   └── useAuthStore.ts         # Zustand store pour auth
├── hooks/
│   └── useAuth.ts              # Hook pour auth state
└── types/
    └── navigation.ts           # Types pour navigation
```

**Installation dépendances** :
```bash
npm install zustand @react-navigation/bottom-tabs
```

**Code AuthNavigator.tsx** :
```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
```

**Code useAuthStore.ts** :
```typescript
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, profile: null }),
}));
```

**Critères de validation** :
- [ ] Navigation fonctionne (Login ↔ Register)
- [ ] Auth store détecte utilisateur connecté
- [ ] Redirection automatique selon rôle (coach → CoachNavigator, nageur → SwimmerNavigator)

**Temps estimé** : 3h

---

### Tâche 3 : Écran Register & Onboarding

**Fichiers à créer** :
```
src/screens/auth/RegisterScreen.tsx
src/screens/onboarding/ClubSetupScreen.tsx (coach)
src/screens/onboarding/JoinClubScreen.tsx (nageur)
```

**Fonctionnalités** :
- Formulaire register avec sélection rôle
- Si coach → redirect ClubSetupScreen
- Si nageur → redirect JoinClubScreen (code invitation)

**Critères de validation** :
- [ ] Coach peut créer compte + club
- [ ] Nageur peut créer compte + rejoindre club avec code
- [ ] Erreurs gérées (code invalide, email déjà pris, etc.)

**Temps estimé** : 4h

---

### Tâche 4 : Dashboard Coach - Groupes

**Fichiers à créer** :
```
src/screens/coach/GroupsScreen.tsx
src/screens/coach/CreateGroupScreen.tsx
src/screens/coach/GroupDetailScreen.tsx
src/components/GroupCard.tsx
```

**Fonctionnalités** :
- Liste groupes du coach
- Créer un groupe
- Voir détail groupe (liste nageurs)
- Ajouter nageurs au groupe

**Services** :
```typescript
// src/services/groups.service.ts
export const groupsService = {
  getMyGroups: async () => { /* ... */ },
  createGroup: async (data) => { /* ... */ },
  addSwimmersToGroup: async (groupId, swimmerIds) => { /* ... */ },
};
```

**Critères de validation** :
- [ ] Coach voit ses groupes
- [ ] Coach peut créer un groupe
- [ ] Coach peut ajouter nageurs

**Temps estimé** : 5h

---

## 🎯 Sprint 2 : Slots & Entraînements (Semaines 3-4)

### Tâche 5 : Gestion Créneaux (Slots)

**Fichiers à créer** :
```
src/screens/coach/SlotsScreen.tsx
src/screens/coach/CreateSlotScreen.tsx
src/components/SlotCard.tsx
src/services/slots.service.ts
```

**Fonctionnalités** :
- Liste créneaux par groupe
- Créer un créneau récurrent
- Modifier/Supprimer créneau

**Service slots.service.ts** :
```typescript
export const slotsService = {
  getSlotsByGroup: async (groupId: string) => {
    const { data } = await supabase
      .from('training_slots')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });
    return data;
  },
  
  createSlot: async (slotData) => {
    const { data, error } = await supabase
      .from('training_slots')
      .insert(slotData)
      .select()
      .single();
    return { data, error };
  },
  
  updateSlot: async (slotId: string, updates) => { /* ... */ },
  deleteSlot: async (slotId: string) => { /* ... */ },
};
```

**Critères de validation** :
- [ ] Coach peut créer slots (jour, heure, durée, lieu)
- [ ] Liste slots par groupe visible
- [ ] Modification/suppression fonctionne

**Temps estimé** : 4h

---

### Tâche 6 : Création Entraînement - Formulaire

**Fichiers à créer** :
```
src/screens/coach/CreateWorkoutScreen.tsx
src/components/workout/WorkoutForm.tsx
src/components/workout/BlockEditor.tsx
src/services/workouts.service.ts
src/types/workout.types.ts
```

**Types workout.types.ts** :
```typescript
export type WorkoutType = 'endurance' | 'sprint' | 'technique' | 'recovery' | 'other';
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'individual_medley' | 'choice' | 'kick' | 'pull' | 'drill' | 'fins' | 'pull_buoy' | 'paddles';
export type Intensity = 'recovery' | 'easy' | 'moderate' | 'threshold' | 'hard' | 'sprint';

export interface Exercise {
  id: string;
  distance: number;
  stroke: Stroke;
  intensity: Intensity;
  target_time?: string;
  notes?: string;
}

export interface SubBlock {
  id: string;
  title: string;
  series: number;
  distance: number;
  departure?: string;
  notes?: string;
  exercises: Exercise[];
}

export interface Block {
  id: string;
  type: string;
  name: string;
  total_distance: number;
  sub_blocks: SubBlock[];
}

export interface WorkoutContent {
  blocks: Block[];
}

export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  description?: string;
  content: WorkoutContent;
  total_distance: number;
  is_published: boolean;
}
```

**Fonctionnalités** :
- Formulaire titre + type + description
- Éditeur hiérarchique :
  - Ajouter block
  - Ajouter sub-block dans block
  - Ajouter exercice dans sub-block
- Calcul auto distance totale
- Sauvegarder brouillon / Publier

**Critères de validation** :
- [ ] Coach peut créer structure 3 niveaux
- [ ] Distance totale calculée correctement
- [ ] Brouillon sauvegardé (is_published=false)
- [ ] Publication fonctionne (is_published=true)

**Temps estimé** : 8h

---

### Tâche 7 : Assignation Entraînement à Slot

**Fichiers à créer** :
```
src/screens/coach/AssignWorkoutScreen.tsx
src/services/workoutAssignments.service.ts
```

**Fonctionnalités** :
- Sélectionner un slot
- Sélectionner une date (semaine courante ou futures)
- Choisir un entraînement publié
- Assigner → Crée workout_assignment

**Service workoutAssignments.service.ts** :
```typescript
export const workoutAssignmentsService = {
  assignWorkout: async (workoutId: string, slotId: string, date: string) => {
    const { data, error } = await supabase
      .from('workout_assignments')
      .insert({
        workout_id: workoutId,
        training_slot_id: slotId,
        scheduled_date: date,
      })
      .select()
      .single();
    return { data, error };
  },
  
  getAssignmentsBySlot: async (slotId: string, startDate: string, endDate: string) => {
    const { data } = await supabase
      .from('workout_assignments')
      .select('*, workouts(*)')
      .eq('training_slot_id', slotId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate);
    return data;
  },
};
```

**Critères de validation** :
- [ ] Coach peut assigner entraînement à slot spécifique
- [ ] Erreur si slot déjà rempli pour cette date
- [ ] Assignment visible dans calendrier

**Temps estimé** : 3h

---

## 🎯 Sprint 3 : Calendriers (Semaines 5-6)

### Tâche 8 : Calendrier Coach - Vue Semaine

**Fichiers à créer** :
```
src/screens/coach/CalendarScreen.tsx
src/components/calendar/WeekView.tsx
src/components/calendar/DayColumn.tsx
src/components/calendar/SlotItem.tsx
src/utils/dateHelpers.ts
```

**Fonctionnalités** :
- Navigation semaine (précédent/suivant/aujourd'hui)
- Affichage slots par jour
- Si slot vide : badge + bouton "Créer entraînement"
- Si slot rempli : badge type + titre + distance + stats feedback

**Utils dateHelpers.ts** :
```typescript
export const dateHelpers = {
  getWeekDates: (date: Date) => {
    // Retourne array de 7 dates (Lun-Dim)
  },
  
  formatDate: (date: Date, format: string) => {
    // Format date selon pattern
  },
  
  getDayOfWeek: (date: Date) => {
    // Retourne 0-6 (Dim-Sam)
  },
};
```

**Critères de validation** :
- [ ] Vue semaine affiche tous les slots
- [ ] Navigation fonctionne
- [ ] Distinction visuelle slot vide/rempli
- [ ] Clic sur slot → Action appropriée

**Temps estimé** : 6h

---

### Tâche 9 : Calendrier Nageur - Vue Liste

**Fichiers à créer** :
```
src/screens/swimmer/CalendarScreen.tsx
src/components/calendar/WorkoutListItem.tsx
```

**Fonctionnalités** :
- Liste entraînements des 7-14 prochains jours
- Badge statut : "À venir" / "Donner feedback" / "Feedback donné" / "Absent"
- Détails masqués si entraînement futur (icône 🔒)
- Détails visibles si entraînement passé avec émargement

**Query** :
```typescript
// Récupérer entraînements du nageur
const { data } = await supabase
  .from('workout_assignments')
  .select(`
    *,
    workouts(*),
    training_slots!inner(group_id),
    workout_sessions(attended, rpe_score, completed_at)
  `)
  .in('training_slots.group_id', userGroupIds)
  .gte('scheduled_date', today)
  .lte('scheduled_date', in14Days)
  .order('scheduled_date', { ascending: true });
```

**Critères de validation** :
- [ ] Nageur voit uniquement ses entraînements (groupes où il est)
- [ ] Détails masqués avant émargement
- [ ] Badges statut corrects

**Temps estimé** : 5h

---

## 🎯 Sprint 4 : Feedback (Semaines 7-8)

### Tâche 10 : Émargement Coach

**Fichiers à créer** :
```
src/screens/coach/AttendanceScreen.tsx
src/components/attendance/SwimmerCheckbox.tsx
src/services/workoutSessions.service.ts
```

**Fonctionnalités** :
- Liste nageurs du groupe avec checkboxes
- Tous cochés par défaut
- Compteur présents/total
- Validation → Crée workout_sessions pour chaque nageur
- Marque attendance_marked=true dans workout_assignment

**Service workoutSessions.service.ts** :
```typescript
export const workoutSessionsService = {
  markAttendance: async (assignmentId: string, attendanceData: Array<{swimmerId: string, attended: boolean}>) => {
    // 1. Créer workout_sessions pour chaque nageur
    const sessions = attendanceData.map(item => ({
      workout_assignment_id: assignmentId,
      swimmer_id: item.swimmerId,
      attended: item.attended,
    }));
    
    const { error: sessionsError } = await supabase
      .from('workout_sessions')
      .insert(sessions);
    
    // 2. Marquer assignment comme émargé
    const { error: assignmentError } = await supabase
      .from('workout_assignments')
      .update({ attendance_marked: true })
      .eq('id', assignmentId);
    
    return { error: sessionsError || assignmentError };
  },
  
  getFeedbacksByAssignment: async (assignmentId: string) => {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*, profiles(first_name, last_name)')
      .eq('workout_assignment_id', assignmentId);
    return data;
  },
};
```

**Critères de validation** :
- [ ] Coach peut émarger après entraînement
- [ ] Workout_sessions créés pour tous les nageurs
- [ ] Seuls présents reçoivent notification (V0.5)

**Temps estimé** : 4h

---

### Tâche 11 : Formulaire Feedback Nageur

**Fichiers à créer** :
```
src/screens/swimmer/FeedbackScreen.tsx
src/components/feedback/RPESlider.tsx
```

**Fonctionnalités** :
- Slider RPE 6-20 avec labels
- Couleur change selon intensité (vert → orange → rouge)
- Textarea commentaire (optionnel)
- Validation → Update workout_session avec rpe_score + feedback_text + completed_at

**Component RPESlider.tsx** :
```typescript
export function RPESlider({ value, onChange }) {
  const getColor = (rpe: number) => {
    if (rpe <= 10) return '#22c55e'; // green
    if (rpe <= 14) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };
  
  const getLabel = (rpe: number) => {
    if (rpe <= 8) return 'Très Très Facile';
    if (rpe <= 10) return 'Très Facile';
    if (rpe <= 12) return 'Facile';
    if (rpe <= 14) return 'Un Peu Dur';
    if (rpe <= 16) return 'Dur';
    if (rpe <= 18) return 'Très Dur';
    return 'Très Très Dur';
  };
  
  return (
    <View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={6}
        maximumValue={20}
        step={1}
        minimumTrackTintColor={getColor(value)}
      />
      <Text style={{ color: getColor(value) }}>
        {value}/20 - {getLabel(value)}
      </Text>
    </View>
  );
}
```

**Critères de validation** :
- [ ] Nageur peut donner RPE + commentaire
- [ ] Feedback sauvegardé dans BDD
- [ ] Badge passe à "Feedback donné ✅"
- [ ] Détails entraînement déverrouillés

**Temps estimé** : 4h

---

## 🎯 Sprint 5 : Stats & Polish (Semaines 9-10)

### Tâche 12 : Stats Coach par Entraînement

**Fichiers à créer** :
```
src/screens/coach/WorkoutStatsScreen.tsx
src/components/stats/GlobalStats.tsx
src/components/stats/FeedbackList.tsx
```

**Fonctionnalités** :
- Section stats globales :
  - Taux présence
  - RPE moyen (avec jauge)
  - RPE min/max
  - Nombre commentaires
- Section feedbacks individuels :
  - Liste nageurs avec statut
  - Tri par RPE décroissant
  - Badge alerte si RPE > 17

**Calculs** :
```typescript
export function calculateStats(sessions: WorkoutSession[]) {
  const present = sessions.filter(s => s.attended);
  const withFeedback = present.filter(s => s.rpe_score !== null);
  
  return {
    attendanceRate: (present.length / sessions.length) * 100,
    avgRPE: withFeedback.reduce((sum, s) => sum + s.rpe_score!, 0) / withFeedback.length,
    minRPE: Math.min(...withFeedback.map(s => s.rpe_score!)),
    maxRPE: Math.max(...withFeedback.map(s => s.rpe_score!)),
    commentsCount: withFeedback.filter(s => s.feedback_text).length,
  };
}
```

**Critères de validation** :
- [ ] Coach voit stats globales correctement calculées
- [ ] Liste feedbacks triée par RPE
- [ ] Alerte visible pour RPE élevés

**Temps estimé** : 4h

---

### Tâche 13 : Polish UX & Animations

**Améliorations** :
- Loading states (skeletons)
- Animations transitions (Moti)
- Error handling (toasts)
- Pull-to-refresh
- Confirmation dialogs (suppression, etc.)
- Empty states (pas de groupes, pas d'entraînements, etc.)

**Installation** :
```bash
npm install moti react-native-toast-message
```

**Critères de validation** :
- [ ] Loading visible sur toutes les actions async
- [ ] Toasts pour succès/erreurs
- [ ] Confirmations avant suppressions
- [ ] Empty states clairs

**Temps estimé** : 5h

---

### Tâche 14 : Tests & Bugs

**Actions** :
- Tester chaque flow end-to-end
- Corriger bugs identifiés
- Optimiser performances (queries, rendering)
- Tester sur mobile physique

**Critères de validation** :
- [ ] Aucun bug bloquant
- [ ] Flows principaux fonctionnent
- [ ] App fluide sur mobile

**Temps estimé** : 6h

---

## 🎯 Sprint 6 : Test Pilote (Semaines 11-12)

### Tâche 15 : Préparation Pilote

**Actions** :
- Créer compte coach pilote
- Créer club + groupes
- Créer quelques entraînements
- Inviter 5-10 nageurs
- Brief utilisateurs

**Critères de validation** :
- [ ] Club pilote configuré
- [ ] Nageurs invités et onboardés
- [ ] 2-3 entraînements planifiés pour semaine 1

**Temps estimé** : 3h

---

### Tâche 16 : Suivi & Ajustements

**Actions** :
- Monitorer utilisation
- Collecter feedbacks
- Corriger bugs remontés
- Ajuster UX si nécessaire

**Critères de validation** :
- [ ] 4 semaines de test complétées
- [ ] 10+ entraînements créés
- [ ] 50+ feedbacks collectés
- [ ] Taux feedback > 60%
- [ ] Feedbacks utilisateurs globalement positifs

**Temps estimé** : 10h

---

## 📊 Récapitulatif Temps

| Sprint | Tâches | Temps Estimé |
|--------|--------|--------------|
| Sprint 1 | 1-4 | 14h |
| Sprint 2 | 5-7 | 15h |
| Sprint 3 | 8-9 | 11h |
| Sprint 4 | 10-11 | 8h |
| Sprint 5 | 12-14 | 15h |
| Sprint 6 | 15-16 | 13h |
| **TOTAL** | **16 tâches** | **76h** |

**Marge de sécurité** : +30% = **~100h**

**À 10h/semaine** : **10 semaines** (2,5 mois)

---

## ✅ Checklist de Démarrage

Avant de coder :
- [ ] Lire tous les docs (VISION, PRODUCT_SPEC, DATABASE_SCHEMA, ARCHITECTURE)
- [ ] Exécuter SQL de mise à jour BDD (training_slots, champs type/is_published)
- [ ] Installer dépendances manquantes (zustand, moti, toast-message)
- [ ] Configurer Claude Code avec skills et agents (voir doc séparée)
- [ ] Créer branch `feature/sprint-1` dans Git

---

**Version** : 1.0  
**Date** : 29 Janvier 2026  
**Statut** : Prêt pour développement
