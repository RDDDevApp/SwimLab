/**
 * Source unique des cles de cache TanStack Query.
 * Convention : [domaine, portee, ...params]. Toute invalidation passe par ici.
 */
export const queryKeys = {
  // Nageur
  swimmerWeek: (swimmerId: string, weekStart: string) =>
    ['swimmer', 'week', swimmerId, weekStart] as const,
  swimmerHistory: (swimmerId: string) => ['swimmer', 'history', swimmerId] as const,

  // Sessions / assignments
  assignmentSessions: (assignmentId: string) => ['sessions', 'byAssignment', assignmentId] as const,

  // Coach
  coachGroups: (coachId: string) => ['coach', 'groups', coachId] as const,
  trainingSlots: (coachId: string, groupId?: string) =>
    ['coach', 'slots', coachId, groupId ?? 'all'] as const,
  coachHistory: (coachId: string) => ['coach', 'history', coachId] as const,
  groupDetail: (groupId: string) => ['group', 'detail', groupId] as const,
  coachStats: (coachId: string) => ['coach', 'stats', coachId] as const,
  coachWorkouts: (coachId: string) => ['coach', 'workouts', coachId] as const,
  blockLibrary: (clubId: string) => ['club', 'blockLibrary', clubId] as const,

  coachCalendar: (coachId: string, startDate: string, endDate: string) =>
    ['coach', 'calendar', coachId, startDate, endDate] as const,

  attendance: (assignmentId: string) => ['attendance', assignmentId] as const,

  group: (groupId: string) => ['group', groupId] as const,
  sessionDetail: (assignmentId: string) => ['sessions', 'detail', assignmentId] as const,

  // Séances
  workout: (workoutId: string) => ['workout', workoutId] as const,
} as const;
