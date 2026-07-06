import { useEffect, useMemo, useRef } from 'react';
import { useSwimmerHistory } from './useSwimmerData';
import {
  gamificationService,
  computeGamification,
  GamificationStats,
} from '../services/gamificationService';

/**
 * Stats de gamification du nageur, calculees depuis l'historique (cache
 * TanStack). Declenche l'attribution lazy des badges (idempotente) une
 * fois par session d'ecran quand les stats changent.
 */
export function useGamification(swimmerId: string | undefined): GamificationStats {
  const { data: history = [] } = useSwimmerHistory(swimmerId);

  const stats = useMemo(() => computeGamification(history), [history]);

  const lastAwardKey = useRef('');
  useEffect(() => {
    if (!swimmerId || history.length === 0) return;
    const key = `${stats.totalSessions}-${stats.feedbackCount}-${stats.streakWeeks}`;
    if (key === lastAwardKey.current) return;
    lastAwardKey.current = key;
    gamificationService.checkAndAward(swimmerId, stats).catch(() => {});
  }, [swimmerId, history.length, stats]);

  return stats;
}
