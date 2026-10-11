import { useQuery } from '@tanstack/react-query';
import { workoutSessionService } from '../services';
import { queryKeys } from './queryKeys';

/** Historique complet du nageur (1 requete, embeds assignments+workouts). */
export function useSwimmerHistory(swimmerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.swimmerHistory(swimmerId ?? ''),
    queryFn: () => workoutSessionService.getSwimmerHistory(swimmerId!),
    enabled: !!swimmerId,
  });
}

/** Sessions d'un assignment avec noms des nageurs (vue coach). */
export function useAssignmentSessions(assignmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignmentSessions(assignmentId ?? ''),
    queryFn: () => workoutSessionService.getByAssignmentWithNames(assignmentId!),
    enabled: !!assignmentId,
  });
}
