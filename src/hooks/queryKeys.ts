/**
 * Source unique des cles de cache TanStack Query.
 * Convention : [domaine, portee, ...params]. Toute invalidation passe par ici.
 */
export const queryKeys = {
  // Nageur
  swimmerHistory: (swimmerId: string) => ['swimmer', 'history', swimmerId] as const,

  // Sessions / assignments
  assignmentSessions: (assignmentId: string) => ['sessions', 'byAssignment', assignmentId] as const,

  // Coach
  coachGroups: (coachId: string) => ['coach', 'groups', coachId] as const,
  trainingSlots: (coachId: string, groupId?: string) =>
    ['coach', 'slots', coachId, groupId ?? 'all'] as const,
  coachWorkouts: (coachId: string) => ['coach', 'workouts', coachId] as const,
  blockLibrary: (clubId: string) => ['club', 'blockLibrary', clubId] as const,

  // Séances
  workout: (workoutId: string) => ['workout', workoutId] as const,
} as const;
