import { useQuery } from '@tanstack/react-query';
import { clubService, groupService, workoutService } from '../services';
import { queryKeys } from './queryKeys';

/** Infos du club. */
export function useClub(clubId: string | undefined | null) {
  return useQuery({
    queryKey: queryKeys.club(clubId ?? ''),
    queryFn: () => clubService.getById(clubId!),
    enabled: !!clubId,
  });
}

/** Groupes d'un coach. */
export function useGroups(coachId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups(coachId ?? ''),
    queryFn: () => groupService.getByCoach(coachId!),
    enabled: !!coachId,
  });
}

/** Seances (workouts) d'un coach. */
export function useWorkouts(coachId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workouts(coachId ?? ''),
    queryFn: () => workoutService.getByCoach(coachId!),
    enabled: !!coachId,
  });
}
