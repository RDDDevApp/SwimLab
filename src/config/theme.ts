import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// SwimLab Brand Colors (from VISION.md)
const colors = {
  primary: {
    turquoise: '#06B6D4',
    teal: '#115E59',
  },
  secondary: {
    pink: '#EC4899',
    orange: '#F59E0B',
  },
  accent: {
    yellow: '#FBBF24',
    electricBlue: '#3B82F6',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F3F4F6',
    gray: '#9CA3AF',
    darkGray: '#4B5563',
    dark: '#1F2937',
    black: '#111827',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  rpe: {
    veryEasy: '#22C55E',    // 6-8
    easy: '#84CC16',         // 9-10
    light: '#A3E635',        // 11-12
    moderate: '#FACC15',     // 13-14
    hard: '#FB923C',         // 15-16
    veryHard: '#F87171',     // 17-18
    maximal: '#DC2626',      // 19-20
  },
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.turquoise,
    primaryContainer: '#CFFAFE',
    secondary: colors.secondary.pink,
    secondaryContainer: '#FCE7F3',
    tertiary: colors.secondary.orange,
    tertiaryContainer: '#FEF3C7',
    surface: colors.neutral.white,
    surfaceVariant: colors.neutral.lightGray,
    background: colors.neutral.lightGray,
    error: colors.semantic.error,
    errorContainer: '#FEE2E2',
    onPrimary: colors.neutral.white,
    onPrimaryContainer: colors.primary.teal,
    onSecondary: colors.neutral.white,
    onSurface: colors.neutral.dark,
    onSurfaceVariant: colors.neutral.darkGray,
    onBackground: colors.neutral.dark,
    outline: colors.neutral.gray,
    outlineVariant: '#E5E7EB',
  },
  custom: colors,
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.turquoise,
    primaryContainer: colors.primary.teal,
    secondary: colors.secondary.pink,
    secondaryContainer: '#831843',
    tertiary: colors.secondary.orange,
    tertiaryContainer: '#92400E',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    background: colors.neutral.black,
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: colors.neutral.black,
    onPrimaryContainer: '#CFFAFE',
    onSecondary: colors.neutral.black,
    onSurface: colors.neutral.lightGray,
    onSurfaceVariant: colors.neutral.gray,
    onBackground: colors.neutral.lightGray,
    outline: colors.neutral.darkGray,
    outlineVariant: '#475569',
  },
  custom: colors,
};

export type AppTheme = typeof lightTheme;

// RPE Labels (from PRODUCT_SPEC)
export const RPE_LABELS: Record<number, string> = {
  6: 'Repos',
  7: 'Tres Tres Facile',
  8: 'Tres Tres Facile',
  9: 'Tres Facile',
  10: 'Tres Facile',
  11: 'Facile',
  12: 'Facile',
  13: 'Un Peu Dur',
  14: 'Un Peu Dur',
  15: 'Dur',
  16: 'Dur',
  17: 'Tres Dur',
  18: 'Tres Dur',
  19: 'Maximal',
  20: 'Maximal',
};

export const getRPEColor = (rpe: number): string => {
  if (rpe <= 8) return colors.rpe.veryEasy;
  if (rpe <= 10) return colors.rpe.easy;
  if (rpe <= 12) return colors.rpe.light;
  if (rpe <= 14) return colors.rpe.moderate;
  if (rpe <= 16) return colors.rpe.hard;
  if (rpe <= 18) return colors.rpe.veryHard;
  return colors.rpe.maximal;
};
