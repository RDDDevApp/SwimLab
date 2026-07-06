import { useQuery } from '@tanstack/react-query';
import { workoutSessionService, groupService } from '../services';
import { toISODate } from '../utils/dateHelpers';

export interface RpeAlert {
  swimmerId: string;
  swimmerName: string;
  avg7d: number;
  baseline28d: number;
  delta: number;
}

/** Ecart minimal (points RPE) entre moyenne 7j et baseline 28j pour alerter */
const ALERT_THRESHOLD = 2.5;
/** Minimum de feedbacks requis sur chaque fenetre pour un signal fiable */
const MIN_SAMPLES_7D = 2;
const MIN_SAMPLES_28D = 4;

/**
 * Alertes de surcharge : nageurs dont le RPE moyen sur 7 jours depasse
 * leur baseline 28 jours de >= 2,5 points. Calcul client pur sur une
 * seule requete fenetree.
 */
export function useRpeAlerts(coachId: string | undefined) {
  return useQuery({
    queryKey: ['coach', 'rpeAlerts', coachId ?? ''],
    queryFn: async (): Promise<RpeAlert[]> => {
      const groups = await groupService.getByCoach(coachId!);
      if (!groups.length) return [];

      const now = new Date();
      const since28d = toISODate(new Date(now.getTime() - 28 * 86400000));
      const since7d = toISODate(new Date(now.getTime() - 7 * 86400000));

      const rows = await workoutSessionService.getRpeWindowByGroups(
        groups.map((g) => g.id),
        since28d,
      );

      // Grouper par nageur
      const bySwimmer = new Map<
        string,
        { name: string; recent: number[]; all: number[] }
      >();
      for (const row of rows) {
        let bucket = bySwimmer.get(row.swimmerId);
        if (!bucket) {
          bucket = { name: row.swimmerName, recent: [], all: [] };
          bySwimmer.set(row.swimmerId, bucket);
        }
        bucket.all.push(row.rpeScore);
        if (row.scheduledDate >= since7d) {
          bucket.recent.push(row.rpeScore);
        }
      }

      const alerts: RpeAlert[] = [];
      for (const [swimmerId, { name, recent, all }] of bySwimmer) {
        if (recent.length < MIN_SAMPLES_7D || all.length < MIN_SAMPLES_28D) continue;
        const avg7d = recent.reduce((a, b) => a + b, 0) / recent.length;
        const baseline28d = all.reduce((a, b) => a + b, 0) / all.length;
        const delta = avg7d - baseline28d;
        if (delta >= ALERT_THRESHOLD) {
          alerts.push({
            swimmerId,
            swimmerName: name,
            avg7d: Math.round(avg7d * 10) / 10,
            baseline28d: Math.round(baseline28d * 10) / 10,
            delta: Math.round(delta * 10) / 10,
          });
        }
      }

      return alerts.sort((a, b) => b.delta - a.delta);
    },
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000,
  });
}
