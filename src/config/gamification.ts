/**
 * Gamification SwimLab — constantes de calcul.
 *
 * Philosophie : CALCULER, PAS TRACKER. L'XP est une fonction pure des
 * donnees deja collectees (workout_sessions) — pas de colonne xp en base,
 * pas de derive possible, retroactif pour tous les utilisateurs existants.
 */

/** Bareme XP */
export const XP_RULES = {
  perSession: 50, // par seance assistee
  perFeedback: 20, // par feedback envoye
  perStreakWeek: 30, // par semaine de streak courante
  per100m: 1, // par 100 m nages
} as const;

/**
 * Seuils cumules de niveaux (XP total requis pour ATTEINDRE le niveau).
 * Progression triangulaire : chaque niveau demande ~200 XP de plus que le precedent.
 */
export const LEVEL_THRESHOLDS = [
  0, // niveau 1
  200, // niveau 2
  500, // niveau 3
  1000, // niveau 4
  1700, // niveau 5
  2600, // niveau 6
  3700, // niveau 7
  5000, // niveau 8
  6500, // niveau 9
  8200, // niveau 10
  10200, // niveau 11
  12500, // niveau 12
];

export interface LevelInfo {
  level: number;
  /** XP accumules dans le niveau courant */
  currentXP: number;
  /** XP requis pour passer au niveau suivant */
  nextLevelXP: number;
}

export function getLevelInfo(totalXP: number): LevelInfo {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const currentBase = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextBase =
    LEVEL_THRESHOLDS[level] ?? currentBase + 2500; // au-dela du bareme : paliers de 2500
  return {
    level,
    currentXP: totalXP - currentBase,
    nextLevelXP: nextBase - currentBase,
  };
}
