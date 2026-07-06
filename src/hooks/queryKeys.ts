/**
 * Source unique des cles de cache TanStack Query.
 * Convention : [domaine, portee, ...params]. Toute invalidation passe par ici.
 */
export const queryKeys = {
  // Nageur
  swimmerHistory: (swimmerId: string) => ['swimmer', 'history', swimmerId] as const,
  swimmerStats: (swimmerId: string) => ['swimmer', 'stats', swimmerId] as const,
  pendingFeedback: (swimmerId: string) => ['swimmer', 'pendingFeedback', swimmerId] as const,

  // Sessions / assignments
  assignmentSessions: (assignmentId: string) => ['sessions', 'byAssignment', assignmentId] as const,

  // Coach / club
  club: (clubId: string) => ['club', clubId] as const,
  groups: (coachId: string) => ['groups', 'byCoach', coachId] as const,
  workouts: (coachId: string) => ['workouts', 'byCoach', coachId] as const,

  // Prefixes d'invalidation
  allSwimmer: (swimmerId: string) => ['swimmer'] as const,
} as const;
