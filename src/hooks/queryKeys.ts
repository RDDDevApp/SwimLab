/**
 * Source unique des cles de cache TanStack Query.
 * Convention : [domaine, portee, ...params]. Toute invalidation passe par ici.
 */
export const queryKeys = {
  // Nageur
  swimmerHistory: (swimmerId: string) => ['swimmer', 'history', swimmerId] as const,

  // Sessions / assignments
  assignmentSessions: (assignmentId: string) => ['sessions', 'byAssignment', assignmentId] as const,
} as const;
