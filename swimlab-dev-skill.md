---
name: swimlab-dev
description: SwimLab swimming club management app development skill. Use when working on SwimLab codebase. Provides conventions, architecture patterns, and best practices for React Native + Supabase development.
---

# SwimLab Development Skill

## Project Context

**SwimLab** : Swimming club management app (React Native + Supabase)

**Mission** : Digitaliser l'entraînement en natation pour créer un lien fort coach-nageur

**Current Phase** : V0 MVP (club pilote validation)

**Timeline** : 10-12 semaines @ 10h/semaine

## Stack Technique

- **Frontend** : React Native + Expo SDK 54, TypeScript
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **UI** : React Native Paper
- **Navigation** : React Navigation 6
- **State** : Zustand
- **Animations** : Moti (V0.5)

## Architecture Hiérarchique

```
Club
 └─ Coach(s)
     └─ Groupe(s)
         └─ Nageur(s)
         
Nageur Solo (V1)
 └─ IA Coach Virtuel
```

## Database Schema (V0)

**Tables** :
- profiles (users extension)
- clubs (code invitation)
- club_members (user ↔ club)
- groups (groupes d'entraînement)
- group_members (user ↔ group)
- **training_slots** (créneaux récurrents)
- workouts (entraînements typés)
- workout_assignments (entraînement ↔ slot ↔ date)
- workout_sessions (feedback nageur avec RPE)

**Workout Structure (JSONB)** :
```json
{
  "type": "endurance|sprint|technique|recovery|other",
  "blocks": [
    {
      "id": "block_1",
      "type": "warmup|main|cooldown",
      "name": "Échauffement",
      "total_distance": 600,
      "sub_blocks": [
        {
          "id": "sub_1_1",
          "title": "4x150m",
          "series": 4,
          "distance": 150,
          "departure": "@ 3'30",
          "exercises": [
            {
              "id": "ex_1_1_1",
              "distance": 100,
              "stroke": "freestyle|backstroke|breaststroke|butterfly|...",
              "intensity": "recovery|easy|moderate|threshold|hard|sprint",
              "target_time": "1'30",
              "notes": ""
            }
          ]
        }
      ]
    }
  ]
}
```

## Conventions de Code

### Nomenclature Fichiers
```
src/
├─ screens/
│   ├─ coach/GroupsScreen.tsx (PascalCase)
│   └─ swimmer/CalendarScreen.tsx
├─ components/
│   ├─ GroupCard.tsx (composants réutilisables)
│   └─ workout/BlockEditor.tsx (sous-dossiers si complexe)
├─ services/
│   └─ groups.service.ts (camelCase + .service)
├─ hooks/
│   └─ useAuth.ts (camelCase + "use" prefix)
├─ types/
│   └─ workout.types.ts (camelCase + .types)
└─ utils/
    └─ dateHelpers.ts
```

### TypeScript
- **Interfaces** pour props : `interface GroupCardProps {}`
- **Types** pour données : `type WorkoutType = 'endurance' | 'sprint'`
- **Pas de `any`** sauf cas vraiment exceptionnels
- **Strict mode** activé

### React Native Patterns
```typescript
// ✅ BON : Functional Component + TypeScript
interface Props {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  const [count, setCount] = useState(0);
  
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

// ✅ BON : Hooks custom
export function useWorkouts(clubId: string) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWorkouts();
  }, [clubId]);
  
  return { workouts, loading };
}
```

### Supabase Queries
```typescript
// ✅ BON : Service layer avec error handling
export const groupsService = {
  async getMyGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('*, club:clubs(name)')
      .eq('coach_id', userId);
    
    if (error) throw error;
    return data;
  }
};

// ✅ BON : RLS policies (sécurité)
// Un coach ne voit que ses groupes
// Un nageur ne voit que les groupes où il est membre
```

### Error Handling
```typescript
// ✅ BON : Try-catch + user feedback
try {
  await groupsService.createGroup(data);
  showToast('Groupe créé !', 'success');
  navigation.goBack();
} catch (error) {
  console.error('Erreur création groupe:', error);
  showToast('Impossible de créer le groupe', 'error');
}
```

## Principes de Développement

### 1. Pédagogique d'abord
- Code commenté (explications pour junior dev)
- Étape par étape, validation avant de continuer
- Pas de "magic" incompréhensible

### 2. Fonctionnel avant Design
- V0 : UI simple mais propre
- V0.5 : Polish design + animations
- Pas de perfectionnisme prématuré

### 3. Mobile-First
- Tester sur mobile (pas juste desktop)
- Tactile-friendly (boutons >= 44x44)
- Performance (pas de lags)

### 4. Security First
- RLS sur toutes les tables
- Jamais de données sensibles en clair
- Validation côté serveur (pas que client)

## Workflow de Dev

### Avant de Coder
1. Lire spec dans Notion/PRODUCT_SPEC_V0.md
2. Vérifier DATABASE_SCHEMA_V0.md
3. Identifier tâches techniques

### Pendant le Dev
1. Créer branch feature
2. Coder feature
3. Tester manuellement
4. Commit + push

### Après le Dev
1. Tester sur mobile physique
2. Vérifier RLS (sécurité)
3. Update PROGRESS.md

## Features V0 (Checklist)

### ✅ Fait
- Auth & Profils
- Clubs + Invitation
- Groupes + Membres
- Database Schema

### 🚧 En Cours
- Créneaux récurrents (slots)
- Création entraînement structuré

### ⏳ À Faire
- Assignation slot ↔ entraînement
- Calendrier Coach
- Calendrier Nageur
- Émargement
- Feedback RPE
- Stats coach

## Resources

- **Docs Notion** : Base SwimLab (specs, idées, notes)
- **Figma** : Designs UI/UX
- **Supabase Docs** : https://supabase.com/docs
- **React Native Paper** : https://callstack.github.io/react-native-paper/

## Anti-Patterns à Éviter

- ❌ Copier-coller code sans comprendre
- ❌ Ignorer les erreurs TypeScript
- ❌ Oublier RLS policies (faille sécurité !)
- ❌ Créer des composants de 500 lignes
- ❌ Hardcoder des valeurs (use constants)

## Questions Fréquentes

**Q: Comment tester si RLS fonctionne ?**
R: Créer 2 utilisateurs différents, vérifier qu'ils ne voient pas les données de l'autre

**Q: Où mettre la logique métier ?**
R: Dans les services (`src/services/`), pas dans les composants

**Q: Comment gérer les dates/timezone ?**
R: Toujours stocker en UTC dans Supabase, convertir en local pour affichage

---

**Version** : 1.0
**Dernière mise à jour** : 29 Janvier 2026
**Maintenu par** : Raudi (DI)
