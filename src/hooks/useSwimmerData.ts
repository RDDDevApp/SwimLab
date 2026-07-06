import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

/** Stats globales du nageur (total, presence, RPE moyen). */
export function useSwimmerStats(swimmerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.swimmerStats(swimmerId ?? ''),
    queryFn: () => workoutSessionService.getSwimmerStats(swimmerId!),
    enabled: !!swimmerId,
  });
}

/** Feedbacks en attente du nageur. */
export function usePendingFeedback(swimmerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pendingFeedback(swimmerId ?? ''),
    queryFn: () => workoutSessionService.getPendingFeedback(swimmerId!),
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

/** Envoi/edition de feedback avec invalidation du cache nageur. */
export function useSubmitFeedback(swimmerId: string | undefined) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      rpe,
      comment,
      isEdit,
    }: {
      sessionId: string;
      rpe: number;
      comment?: string;
      isEdit?: boolean;
    }) =>
      isEdit
        ? workoutSessionService.updateFeedback(sessionId, {
            rpe_score: rpe,
            feedback_text: comment,
          })
        : workoutSessionService.submitFeedback(sessionId, {
            rpe_score: rpe,
            feedback_text: comment,
          }),
    onSuccess: () => {
      // Toutes les vues nageur dependent des sessions : historique, stats, pending
      if (swimmerId) {
        client.invalidateQueries({ queryKey: ['swimmer'] });
      }
      client.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
