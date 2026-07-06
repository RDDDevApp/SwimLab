jest.mock('../../config/supabase', () => ({
  supabase: { from: jest.fn() },
}));

import {
  computeGamification,
  computeStreakWeeks,
  computeEarnedBadges,
} from '../../services/gamificationService';
import { getLevelInfo, XP_RULES } from '../../config/gamification';
import type { SwimmerHistoryEntry } from '../../services/workoutSessionService';

function entry(overrides: Partial<SwimmerHistoryEntry>): SwimmerHistoryEntry {
  return {
    sessionId: Math.random().toString(36),
    assignmentId: 'a1',
    scheduledDate: '2026-07-01',
    attended: true,
    rpeScore: null,
    feedbackText: null,
    workoutId: 'w1',
    workoutTitle: 'Seance',
    workoutType: 'other',
    totalDistance: 2000,
    ...overrides,
  };
}

/** Lundi de la semaine de `now` decale de `weeksAgo` semaines, + `dayOffset` jours */
function dateInWeek(now: Date, weeksAgo: number, dayOffset = 0): string {
  const d = new Date(now);
  const dayIdx = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayIdx - weeksAgo * 7 + dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const NOW = new Date('2026-07-06T12:00:00'); // un lundi

describe('computeStreakWeeks', () => {
  it('returns 0 with no attended sessions', () => {
    expect(computeStreakWeeks([], NOW)).toBe(0);
    expect(
      computeStreakWeeks([entry({ attended: false })], NOW),
    ).toBe(0);
  });

  it('counts consecutive weeks with at least one session', () => {
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 0) }),
      entry({ scheduledDate: dateInWeek(NOW, 1, 2) }),
      entry({ scheduledDate: dateInWeek(NOW, 2, 4) }),
    ];
    expect(computeStreakWeeks(history, NOW)).toBe(3);
  });

  it('forgives the current week without a session yet', () => {
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 1) }),
      entry({ scheduledDate: dateInWeek(NOW, 2) }),
    ];
    expect(computeStreakWeeks(history, NOW)).toBe(2);
  });

  it('breaks the streak on a missed week', () => {
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 0) }),
      // semaine 1 manquee
      entry({ scheduledDate: dateInWeek(NOW, 2) }),
      entry({ scheduledDate: dateInWeek(NOW, 3) }),
    ];
    expect(computeStreakWeeks(history, NOW)).toBe(1);
  });

  it('counts a week only once with multiple sessions', () => {
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 0, 0) }),
      entry({ scheduledDate: dateInWeek(NOW, 0, 2) }),
      entry({ scheduledDate: dateInWeek(NOW, 0, 4) }),
    ];
    expect(computeStreakWeeks(history, NOW)).toBe(1);
  });
});

describe('computeGamification (formule XP)', () => {
  it('computes XP from sessions, feedbacks, streak and distance', () => {
    // 2 seances assistees cette semaine et la precedente (streak 2),
    // 1 feedback, 2000m chacune
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 0), rpeScore: 14 }),
      entry({ scheduledDate: dateInWeek(NOW, 1) }),
    ];
    const stats = computeGamification(history, NOW);

    const expectedXP =
      2 * XP_RULES.perSession + // 100
      1 * XP_RULES.perFeedback + // 20
      2 * XP_RULES.perStreakWeek + // 60
      Math.floor(4000 / 100) * XP_RULES.per100m; // 40

    expect(stats.totalXP).toBe(expectedXP);
    expect(stats.totalSessions).toBe(2);
    expect(stats.feedbackCount).toBe(1);
    expect(stats.streakWeeks).toBe(2);
    expect(stats.totalKm).toBe(4);
  });

  it('ignores absent sessions for XP and distance', () => {
    const history = [
      entry({ scheduledDate: dateInWeek(NOW, 0), attended: false }),
    ];
    const stats = computeGamification(history, NOW);
    expect(stats.totalXP).toBe(0);
    expect(stats.totalSessions).toBe(0);
  });
});

describe('getLevelInfo', () => {
  it('starts at level 1 with 0 XP', () => {
    const info = getLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.currentXP).toBe(0);
    expect(info.nextLevelXP).toBe(200);
  });

  it('reaches level 2 at 200 XP', () => {
    expect(getLevelInfo(199).level).toBe(1);
    expect(getLevelInfo(200).level).toBe(2);
  });

  it('computes progress within the current level', () => {
    const info = getLevelInfo(350); // niveau 2 (200), suivant 500
    expect(info.level).toBe(2);
    expect(info.currentXP).toBe(150);
    expect(info.nextLevelXP).toBe(300);
  });
});

describe('computeEarnedBadges (seuils)', () => {
  it('awards no badges below all thresholds', () => {
    const stats = computeGamification([], NOW);
    expect(computeEarnedBadges(stats)).toHaveLength(0);
  });

  it('awards the 10-session badge at exactly 10 sessions', () => {
    const history = Array.from({ length: 10 }, (_, i) =>
      entry({ scheduledDate: dateInWeek(NOW, i), totalDistance: 0 }),
    );
    const stats = computeGamification(history, NOW);
    const ids = computeEarnedBadges(stats).map((b) => b.id);
    expect(ids).toContain('sessions_10');
    expect(ids).not.toContain('sessions_50');
  });

  it('awards volume badges based on km swum', () => {
    // 10 seances de 1000m = 10 km
    const history = Array.from({ length: 10 }, (_, i) =>
      entry({ scheduledDate: dateInWeek(NOW, i), totalDistance: 1000 }),
    );
    const stats = computeGamification(history, NOW);
    const ids = computeEarnedBadges(stats).map((b) => b.id);
    expect(ids).toContain('volume_10');
    expect(ids).not.toContain('volume_50');
  });
});
