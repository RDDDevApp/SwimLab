# Plan de Refonte - Editeur de Seances

## Resume des changements

### Ce qu'on SUPPRIME
- Templates (ecran, service, table, bouton "Sauvegarder comme template")
- Types d'entrainement (endurance, sprint, technique, recovery, other)
- Niveau "Exercise" dans la hierarchie (plus de ExerciseEditor)
- Bibliotheque d'exercices (remplacee par bibliotheque de blocs)
- Navigation vers CreateWorkout au clic sur un entrainement (remplace par accordeon)

### Ce qu'on MODIFIE
- Structure : Block > Sub-block (2 niveaux au lieu de 3)
- Sub-block : distance, repetitions, description optionnelle, depart optionnel
- CreateWorkoutScreen : 3 blocs par defaut + structure simplifiee
- WorkoutsScreen : accordeon inline au clic + bouton "Modifier" au lieu de "Template"
- BlockEditor : ajouter/remplacer depuis bibliotheque de blocs
- WorkoutContentView : adapter a la nouvelle structure (lecture seule nageur)

### Ce qu'on AJOUTE
- Bibliotheque de blocs (ecran, service, table)
- BlockPickerModal (choisir un bloc depuis la bibliotheque)
- Accordeon dans WorkoutsScreen (vue deroulante des blocs)

---

## Nouvelle structure de donnees

```typescript
// AVANT (3 niveaux)
Block > SubBlock > Exercise[]

// APRES (2 niveaux)
Block > SubBlock[]
```

### SubBlock (nouveau format)
```typescript
interface SubBlock {
  id: string;
  distance: number;        // Distance par repetition (ex: 50m)
  repetitions: number;     // Nombre de repetitions (ex: 4)
  description?: string;    // Optionnel (ex: "4 nages", "1 crawl 1 spe")
  departure?: string;      // Intervalle optionnel (ex: "1'15")
}
// total_distance = distance * repetitions (calcule a la volee)
```

### WorkoutBlock (simplifie)
```typescript
interface WorkoutBlock {
  id: string;
  type: 'warmup' | 'main' | 'cooldown' | 'other';
  name: string;
  sub_blocks: SubBlock[];
  // total_distance = somme des (sub_block.distance * sub_block.repetitions)
}
```

### BlockLibraryRow (nouveau - remplace exercise_library)
```typescript
interface BlockLibraryRow {
  id: string;
  club_id: string;
  coach_id: string;
  name: string;                // ex: "Echauffement standard"
  type: 'warmup' | 'main' | 'cooldown' | 'other';
  content: SubBlock[];         // Les sous-blocs du bloc
  total_distance: number;
  created_at: string;
}
```

### Exemple concret
```
---Echauffement---1000m---
  |--Sous bloc 1---200m
  |  50m x 4 rep --- "4 nages" --- Depart: 1'15
  |--Sous bloc 2---800m
  |  400m x 2 rep --- "1 crawl 1 spe" --- Depart:
  |
  | [+ Sous-bloc] [Sauvegarder dans biblio] [Remplacer depuis biblio]
```

---

## Micro-taches (ordre d'execution)

### PHASE 1 : Types & Services (fondation)
**Objectif** : Poser les nouvelles structures de donnees

#### 1.1 Modifier les types TypeScript
- Fichier : `src/types/database.types.ts`
- [ ] Simplifier SubBlock : retirer `exercises[]`, `title`, `series` → mettre `distance`, `repetitions`, `description?`, `departure?`
- [ ] Simplifier WorkoutBlock : garder `type` avec seulement 4 valeurs (warmup/main/cooldown/other), garder `name`, `sub_blocks`
- [ ] Retirer le type WorkoutType (endurance/sprint/technique/recovery/other)
- [ ] Ajouter type BlockLibraryRow (id, club_id, coach_id, name, type, content: SubBlock[], total_distance)
- [ ] Retirer le type Exercise et ExerciseLibraryRow
- [ ] Retirer le type WorkoutTemplateRow
- [ ] Mettre a jour WorkoutInsert/WorkoutUpdate (retirer `type`)
- **Test** : `npx tsc --noEmit` doit compiler (va echouer → on fixe dans les etapes suivantes)

#### 1.2 Creer blockLibraryService
- Fichier : `src/services/blockLibraryService.ts` (nouveau)
- [ ] getByClub(clubId) : SELECT * FROM block_library WHERE club_id ORDER BY name
- [ ] create(data) : INSERT INTO block_library
- [ ] update(id, data) : UPDATE block_library SET ... WHERE id
- [ ] delete(id) : DELETE FROM block_library WHERE id
- **Test** : Ecrire `src/__tests__/services/blockLibraryService.test.ts`
  - [ ] Test getByClub retourne les blocs du club
  - [ ] Test create insere un nouveau bloc
  - [ ] Test delete supprime un bloc

#### 1.3 Modifier workoutService
- Fichier : `src/services/workoutService.ts`
- [ ] Mettre a jour calculateTotalDistance pour la nouvelle structure (distance * repetitions au lieu de exercises)
- [ ] Retirer le champ `type` des appels create/update
- **Test** : Mettre a jour `src/__tests__/services/workoutService.test.ts`
  - [ ] Test calculateTotalDistance avec nouvelle structure SubBlock

#### 1.4 Supprimer les services obsoletes
- [ ] Supprimer `src/services/workoutTemplateService.ts`
- [ ] Supprimer `src/services/exerciseLibraryService.ts`
- **Test** : Supprimer `src/__tests__/services/workoutTemplateService.test.ts`
- **Test** : Supprimer `src/__tests__/services/exerciseLibraryService.test.ts`

#### 1.5 Migration SQL
- Fichier : `docs/migrations/004_block_library_and_simplify.sql`
- [ ] CREATE TABLE block_library (id uuid, club_id, coach_id, name text, type text, content jsonb, total_distance int, created_at)
- [ ] RLS policies pour block_library (coach peut CRUD ses blocs, nageurs lecture)
- [ ] ALTER TABLE workouts DROP COLUMN type (ou le rendre nullable/ignorer)
- [ ] DROP TABLE workout_templates (plus besoin)
- [ ] DROP TABLE exercise_library (remplacee par block_library)
- **Test** : Verifier la migration manuellement dans Supabase

---

### PHASE 2 : Composants editeur (UI)
**Objectif** : Refaire les composants d'edition de blocs et sous-blocs

#### 2.1 Refaire SubBlockEditor
- Fichier : `src/components/workout/SubBlockEditor.tsx` (reecriture)
- [ ] Props : subBlock, onChange, onRemove
- [ ] Champ distance (TextInput numerique, ex: 50)
- [ ] Champ repetitions (TextInput numerique, ex: 4)
- [ ] Afficher distance totale calculee (distance * repetitions) en gras
- [ ] Champ description optionnel (TextInput, ex: "4 nages")
- [ ] Champ depart optionnel (TextInput, ex: "1'15")
- [ ] Bouton supprimer sous-bloc
- [ ] Layout compact : une ligne par sous-bloc si possible
- **Test** : Test rendu avec valeurs, test onChange quand on modifie distance/repetitions

#### 2.2 Refaire BlockEditor
- Fichier : `src/components/workout/BlockEditor.tsx` (reecriture)
- [ ] Props : block, onChange, onRemove, onMoveUp?, onMoveDown?, onSaveToLibrary, onReplaceFromLibrary
- [ ] Afficher nom du bloc (editable) + type (warmup/main/cooldown/other)
- [ ] Afficher distance totale du bloc (somme des sous-blocs)
- [ ] Liste des SubBlockEditor
- [ ] Bouton "+ Sous-bloc"
- [ ] Bouton "Sauvegarder dans bibliotheque" en bas du bloc
- [ ] Bouton "Remplacer depuis bibliotheque" en bas du bloc
- [ ] Couleurs par type (warmup=vert, main=cyan, cooldown=violet, other=gris)
- [ ] Boutons monter/descendre/supprimer dans le header
- **Test** : Test rendu avec bloc et sous-blocs, test ajout sous-bloc

#### 2.3 Supprimer composants obsoletes
- [ ] Supprimer `src/components/workout/ExerciseEditor.tsx`
- [ ] Supprimer `src/components/workout/ExercisePickerModal.tsx`

#### 2.4 Creer BlockPickerModal
- Fichier : `src/components/workout/BlockPickerModal.tsx` (nouveau)
- [ ] Props : visible, onDismiss, onSelect(block: BlockLibraryRow)
- [ ] Charger blocs depuis blockLibraryService.getByClub()
- [ ] Liste avec recherche (filtre par nom)
- [ ] Afficher : nom, type, distance totale, nombre de sous-blocs
- [ ] Au clic : appeler onSelect et fermer
- **Test** : Test rendu modal, test selection d'un bloc

---

### PHASE 3 : Ecrans coach (integration)
**Objectif** : Integrer les nouveaux composants dans les ecrans

#### 3.1 Refaire CreateWorkoutScreen
- Fichier : `src/screens/coach/CreateWorkoutScreen.tsx` (reecriture majeure)
- [ ] Retirer le selecteur de type (plus de type)
- [ ] Garder titre + description optionnelle
- [ ] A la creation : generer 3 blocs par defaut :
  - Echauffement (type: warmup)
  - Corps de seance (type: main)
  - Recuperation (type: cooldown)
- [ ] Permettre d'ajouter des blocs supplementaires (type: other)
- [ ] Permettre de supprimer n'importe quel bloc
- [ ] Integrer le nouveau BlockEditor
- [ ] Brancher "Sauvegarder dans biblio" → blockLibraryService.create()
- [ ] Brancher "Remplacer depuis biblio" → ouvrir BlockPickerModal → remplacer le bloc
- [ ] Calcul distance totale : sum(sub_block.distance * sub_block.repetitions) pour tous les blocs
- [ ] Sauvegarder : workoutService.create() avec la nouvelle structure content
- **Test** : Test creation avec 3 blocs par defaut, test ajout/suppression bloc

#### 3.2 Modifier EditWorkoutScreen (si separe)
- Fichier : `src/screens/coach/EditWorkoutScreen.tsx`
- [ ] Meme logique que CreateWorkoutScreen mais en mode edition
- [ ] Charger le workout existant, peupler les blocs
- [ ] Gerer la retro-compatibilite : si ancien format (avec exercises[]), migrer a la volee
- **Test** : Test chargement workout existant, test sauvegarde modifications

#### 3.3 Refaire WorkoutsScreen (accordeon + actions)
- Fichier : `src/screens/coach/WorkoutsScreen.tsx` (modification majeure)
- [ ] Retirer bouton "Templates" du header
- [ ] Retirer bouton "Bibliotheque" du header → le remplacer par "Biblio Blocs"
- [ ] Garder bouton "Historique"
- [ ] Retirer le badge type sur les cards
- [ ] Au clic sur un entrainement : toggle accordeon inline (pas navigation)
  - Afficher les blocs avec leurs sous-blocs (style compact, lecture seule)
  - Utiliser WorkoutContentView adapte
- [ ] Remplacer bouton "Sauvegarder comme template" par bouton "Modifier" → navigation vers EditWorkout/CreateWorkout
- [ ] Garder : Dupliquer, Publier/Depublier, Supprimer
- [ ] Retirer le FAB si on garde le bouton "+" dans le header (ou garder le FAB)
- **Test** : Test accordeon s'ouvre/ferme, test bouton Modifier navigue correctement

#### 3.4 Creer BlockLibraryScreen (remplace ExerciseLibraryScreen)
- Fichier : `src/screens/coach/BlockLibraryScreen.tsx` (nouveau, inspire de ExerciseLibraryScreen)
- [ ] Lister tous les blocs de la bibliotheque du club
- [ ] Afficher : nom, type (badge couleur), distance totale, nb sous-blocs
- [ ] Recherche par nom
- [ ] Supprimer un bloc (avec confirmation)
- [ ] Au clic : ouvrir un accordeon montrant les sous-blocs du bloc
- [ ] FAB pour creer un nouveau bloc manuellement (optionnel - la plupart seront crees depuis l'editeur)
- **Test** : Test liste blocs, test suppression, test recherche

#### 3.5 Supprimer ecrans obsoletes
- [ ] Supprimer `src/screens/coach/WorkoutTemplatesScreen.tsx`
- [ ] Supprimer `src/screens/coach/ExerciseLibraryScreen.tsx`
- [ ] Supprimer `src/screens/coach/CreateExerciseScreen.tsx`

---

### PHASE 4 : Navigation & nettoyage
**Objectif** : Mettre a jour la navigation et nettoyer

#### 4.1 Mettre a jour CoachNavigator
- Fichier : `src/navigation/CoachNavigator.tsx`
- [ ] Retirer route WorkoutTemplates
- [ ] Retirer route ExerciseLibrary
- [ ] Retirer route CreateExercise
- [ ] Ajouter route BlockLibrary
- [ ] Verifier que CreateWorkout et EditWorkout pointent vers les bons ecrans

#### 4.2 Mettre a jour les types de navigation
- Fichier : `src/types/database.types.ts` ou navigation types
- [ ] Retirer WorkoutTemplates, ExerciseLibrary, CreateExercise de CoachStackParamList
- [ ] Ajouter BlockLibrary a CoachStackParamList

#### 4.3 Adapter WorkoutContentView (lecture seule)
- Fichier : `src/components/workout/WorkoutContentView.tsx`
- [ ] Adapter a la nouvelle structure SubBlock (distance * repetitions, description, depart)
- [ ] Retirer l'affichage des exercises individuels
- [ ] Utilise par : nageur WorkoutDetailScreen, SessionDetail modal, accordeon WorkoutsScreen
- **Test** : Test rendu avec nouveau format SubBlock

#### 4.4 Adapter les ecrans nageur
- [ ] `src/screens/swimmer/WorkoutDetailScreen.tsx` : verifier que WorkoutContentView fonctionne
- [ ] Ecrans de session detail : verifier affichage correct
- **Test** : Test rendu workout detail avec nouveau format

#### 4.5 Retro-compatibilite des donnees existantes
- [ ] Dans workoutService ou un utilitaire : fonction `migrateWorkoutContent(content)` qui convertit l'ancien format (avec exercises[]) vers le nouveau (SubBlock simplifie)
- [ ] Appeler cette fonction partout ou on charge un workout
- **Test** : Test migration ancien format → nouveau format

---

### PHASE 5 : Tests finaux & QA
**Objectif** : Tout doit marcher

#### 5.1 Mettre a jour tous les tests existants
- [ ] Supprimer tests workoutTemplateService
- [ ] Supprimer tests exerciseLibraryService
- [ ] Mettre a jour tests workoutService (nouvelle structure)
- [ ] Mettre a jour tests workoutAssignmentService si impacte
- [ ] Verifier `npx jest` : tous les tests passent

#### 5.2 TypeScript compile
- [ ] `npx tsc --noEmit` : 0 erreurs

#### 5.3 QA manuelle
- [ ] Flow complet : Creer entrainement → 3 blocs par defaut → ajouter sous-blocs → sauvegarder
- [ ] Flow : Ouvrir entrainement en accordeon dans la liste → verifier affichage
- [ ] Flow : Modifier entrainement → verifier edition
- [ ] Flow : Sauvegarder bloc dans bibliotheque → verifier dans biblio
- [ ] Flow : Remplacer bloc depuis bibliotheque → verifier remplacement
- [ ] Flow nageur : Voir entrainement assigne → verifier affichage correct
- [ ] Flow : Dupliquer entrainement → verifier copie
- [ ] Retro-compat : Anciens entrainements (format exercises[]) s'affichent correctement

---

## Estimation
- Phase 1 (Types & Services) : ~30 micro-taches
- Phase 2 (Composants) : ~25 micro-taches
- Phase 3 (Ecrans) : ~30 micro-taches
- Phase 4 (Navigation & nettoyage) : ~15 micro-taches
- Phase 5 (Tests & QA) : ~10 micro-taches

**Total : ~110 micro-taches**
