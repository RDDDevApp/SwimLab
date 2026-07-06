import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { soloService } from '../services/soloService';
import { workoutService } from '../services';

/** Donnees du dashboard solo : mes seances perso + planifications a venir. */
export function useSoloDashboard(swimmerId: string | undefined) {
  return useQuery({
    queryKey: ['solo', 'dashboard', swimmerId ?? ''],
    queryFn: async () => {
      const [workouts, upcoming] = await Promise.all([
        workoutService.getSoloWorkouts(swimmerId!),
        soloService.getUpcoming(swimmerId!),
      ]);
      return { workouts, upcoming };
    },
    enabled: !!swimmerId,
  });
}

/** Planifier une seance solo, avec invalidation du dashboard. */
export function usePlanSoloSession(swimmerId: string | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ workoutId, date }: { workoutId: string; date: string }) =>
      soloService.planSession(swimmerId!, workoutId, date),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['solo'] });
    },
  });
}

/** Auto-emargement + feedback d'une seance solo. */
export function useCompleteSoloSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      rpe,
      comment,
    }: {
      sessionId: string;
      rpe: number;
      comment?: string;
    }) => soloService.completeSession(sessionId, { rpe_score: rpe, feedback_text: comment }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['solo'] });
      // L'historique/stats/XP du nageur incluent les seances solo
      client.invalidateQueries({ queryKey: ['swimmer'] });
    },
  });
}

/** Supprimer une seance solo planifiee. */
export function useDeleteSoloSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => soloService.deleteSession(sessionId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['solo'] });
    },
  });
}
