import { useQuery } from '@tanstack/react-query';
import {
  blockLibraryService,
  groupService,
  trainingSlotService,
  workoutService,
} from '../services';
import { queryKeys } from './queryKeys';

/** Groupes d'un coach (écran « Mes groupes »). */
export function useCoachGroups(coachId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coachGroups(coachId ?? ''),
    queryFn: () => groupService.getByCoach(coachId!),
    enabled: !!coachId,
  });
}

/** Créneaux d'un groupe, ou de tous les groupes du coach si aucun groupe n'est donné. */
export function useTrainingSlots(coachId: string | undefined, groupId?: string) {
  return useQuery({
    queryKey: queryKeys.trainingSlots(coachId ?? '', groupId),
    queryFn: () =>
      groupId ? trainingSlotService.getByGroup(groupId) : trainingSlotService.getByCoach(coachId!),
    enabled: !!coachId,
  });
}

/** Séances créées par un coach. */
export function useCoachWorkouts(coachId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coachWorkouts(coachId ?? ''),
    queryFn: () => workoutService.getByCoach(coachId!),
    enabled: !!coachId,
  });
}

/** Bibliothèque de blocs du club. */
export function useBlockLibrary(clubId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.blockLibrary(clubId ?? ''),
    queryFn: () => blockLibraryService.getByClub(clubId!),
    enabled: !!clubId,
  });
}

/**
 * Une séance. Côté nageur, une erreur veut souvent dire « pas encore dévoilée »
 * (programme secret) : pas de nouvel essai dans ce cas.
 */
export function useWorkout(workoutId: string | undefined, options: { retry?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.workout(workoutId ?? ''),
    queryFn: () => workoutService.getById(workoutId!),
    enabled: !!workoutId,
    ...(options.retry === false ? { retry: false } : {}),
  });
}
