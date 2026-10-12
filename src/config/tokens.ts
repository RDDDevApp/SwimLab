import { Platform } from 'react-native';

/**
 * Design tokens SwimLab — Design System 2.0
 *
 * Source unique pour l'espacement, les rayons, les surfaces glass et les
 * couleurs semantiques des types de seance. Utilises par les composants du
 * kit (GlassCard, SegmentedToggle, ProgressRing...) et les ecrans refondus.
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

/** Presets de surfaces glassmorphism (sur fond gradient blue-50) */
export const GLASS = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderColor: 'rgba(255, 255, 255, 0.50)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
  },
} as const;

/** Couleurs semantiques par type de bloc/seance (alignees prototype Figma V1) */
export const WORKOUT_TYPE_COLORS: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  endurance: { color: '#0891B2', bg: 'rgba(8, 145, 178, 0.12)', label: 'Endurance' },
  sprint: { color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', label: 'Sprint' },
  technique: { color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', label: 'Technique' },
  recovery: { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', label: 'Récupération' },
  // Types de blocs (editeur de seances)
  warmup: { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', label: 'Échauffement' },
  main: { color: '#0891B2', bg: 'rgba(8, 145, 178, 0.12)', label: 'Corps de séance' },
  cooldown: { color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', label: 'Récupération' },
  other: { color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)', label: 'Autre' },
} as const;

/** Tiers de badges gamification (Phase 5) */
export const BADGE_TIERS = {
  bronze: { color: '#B45309', bg: 'rgba(180, 83, 9, 0.15)', label: 'Bronze' },
  silver: { color: '#64748B', bg: 'rgba(100, 116, 139, 0.15)', label: 'Argent' },
  gold: { color: '#CA8A04', bg: 'rgba(202, 138, 4, 0.15)', label: 'Or' },
  diamond: { color: '#0891B2', bg: 'rgba(8, 145, 178, 0.15)', label: 'Diamant' },
} as const;

export type BadgeTier = keyof typeof BADGE_TIERS;

/** Textes neutres */
export const TEXT_COLORS = {
  primary: '#1e293b',
  secondary: '#64748b',
  muted: '#94a3b8',
} as const;

/**
 * Ombre cross-platform : `boxShadow` sur web (les props shadow* y sont
 * depreciees par react-native-web), shadow* + elevation sur natif.
 */
export function shadow(
  opacity: number,
  radius: number,
  offsetY = 4,
  elevation = 3,
  color = '30, 41, 59', // slate-800 en RGB
) {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(${color}, ${opacity})`,
    } as const;
  }
  return {
    shadowColor: `rgb(${color})`,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  } as const;
}
