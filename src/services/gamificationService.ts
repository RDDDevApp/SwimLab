import { supabase } from '../config/supabase';
import { XP_RULES, getLevelInfo, LevelInfo } from '../config/gamification';
import { BADGE_CATALOG, BadgeDef, BadgeMetric } from '../config/badges';
import type { SwimmerHistoryEntry } from './workoutSessionService';

export interface GamificationStats {
  totalXP: number;
  levelInfo: LevelInfo;
  streakWeeks: number;
  totalSessions: number;
  totalKm: number;
  feedbackCount: number;
}

export interface AwardedBadge {
  badge_id: string;
  awarded_at: string;
}

/** Cle de semaine ISO-ish : lundi de la semaine en YYYY-MM-DD */
function weekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIdx = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - dayIdx);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Streak = semaines CONSECUTIVES avec au moins 1 seance assistee,
 * en remontant depuis la semaine courante (ou la precedente si la semaine
 * courante n'a pas encore de seance — on pardonne la semaine en cours).
 */
export function computeStreakWeeks(
  history: SwimmerHistoryEntry[],
  now: Date = new Date(),
): number {
  const attendedWeeks = new Set(
    history
      .filter((h) => h.attended && h.scheduledDate)
      .map((h) => weekKey(h.scheduledDate)),
  );
  if (attendedWeeks.size === 0) return 0;

  const cursor = new Date(now);
  const dayIdx = (cursor.getDay() + 6) % 7;
  cursor.setDate(cursor.getDate() - dayIdx);
  cursor.setHours(0, 0, 0, 0);

  const keyOf = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // La semaine courante sans seance ne casse pas le streak : on la saute
  if (!attendedWeeks.has(keyOf(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
  }

  let streak = 0;
  while (attendedWeeks.has(keyOf(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** XP total = fonction pure de l'historique (voir XP_RULES). */
export function computeGamification(
  history: SwimmerHistoryEntry[],
  now: Date = new Date(),
): GamificationStats {
  const attended = history.filter((h) => h.attended);
  const totalSessions = attended.length;
  const totalMeters = attended.reduce((sum, h) => sum + (h.totalDistance || 0), 0);
  const feedbackCount = history.filter((h) => h.rpeScore !== null).length;
  const streakWeeks = computeStreakWeeks(history, now);

  const totalXP =
    totalSessions * XP_RULES.perSession +
    feedbackCount * XP_RULES.perFeedback +
    streakWeeks * XP_RULES.perStreakWeek +
    Math.floor(totalMeters / 100) * XP_RULES.per100m;

  return {
    totalXP,
    levelInfo: getLevelInfo(totalXP),
    streakWeeks,
    totalSessions,
    totalKm: totalMeters / 1000,
    feedbackCount,
  };
}

function metricValue(stats: GamificationStats, metric: BadgeMetric): number {
  switch (metric) {
    case 'sessions':
      return stats.totalSessions;
    case 'volumeKm':
      return stats.totalKm;
    case 'feedbacks':
      return stats.feedbackCount;
    case 'streakWeeks':
      return stats.streakWeeks;
  }
}

/** Badges gagnes d'apres les stats (pur, sans DB). */
export function computeEarnedBadges(stats: GamificationStats): BadgeDef[] {
  return BADGE_CATALOG.filter((b) => metricValue(stats, b.metric) >= b.threshold);
}

function isMissingTableError(err: any): boolean {
  const msg = typeof err?.message === 'string' ? err.message : '';
  return msg.includes('swimmer_badges') || msg.includes('relation') || err?.code === '42P01';
}

export const gamificationService = {
  computeGamification,
  computeStreakWeeks,
  computeEarnedBadges,

  /** Attributions stockees du nageur (renvoie [] si migration 015 absente). */
  async getAwardedBadges(swimmerId: string): Promise<AwardedBadge[]> {
    const { data, error } = await (supabase as any)
      .from('swimmer_badges')
      .select('badge_id, awarded_at')
      .eq('swimmer_id', swimmerId);

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []) as AwardedBadge[];
  },

  /**
   * Attribution lazy et IDEMPOTENTE : insere les badges gagnes mais pas
   * encore stockes. La contrainte unique(swimmer_id, badge_id) rend le
   * double-award impossible. Renvoie les badges nouvellement attribues.
   */
  async checkAndAward(
    swimmerId: string,
    stats: GamificationStats,
  ): Promise<BadgeDef[]> {
    const earned = computeEarnedBadges(stats);
    if (!earned.length) return [];

    let existing: AwardedBadge[] = [];
    try {
      existing = await this.getAwardedBadges(swimmerId);
    } catch {
      return [];
    }
    const existingIds = new Set(existing.map((b) => b.badge_id));
    const toAward = earned.filter((b) => !existingIds.has(b.id));
    if (!toAward.length) return [];

    const { error } = await (supabase as any).from('swimmer_badges').upsert(
      toAward.map((b) => ({ swimmer_id: swimmerId, badge_id: b.id })),
      { onConflict: 'swimmer_id,badge_id', ignoreDuplicates: true },
    );

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return toAward;
  },
};
