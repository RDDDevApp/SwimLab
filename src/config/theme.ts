import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// SwimLab Brand Colors – adapted for light pastel gradient
const colors = {
  primary: {
    turquoise: '#0891B2',
    teal: '#115E59',
  },
  secondary: {
    pink: '#DB2777',
    orange: '#D97706',
  },
  accent: {
    yellow: '#D97706',
    electricBlue: '#2563EB',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F3F4F6',
    gray: '#6B7280',
    darkGray: '#374151',
    dark: '#1B4332',
    black: '#111827',
  },
  semantic: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
  rpe: {
    veryEasy: '#15803D',    // 6-8
    easy: '#4D7C0F',         // 9-10
    light: '#65A30D',        // 11-12
    moderate: '#CA8A04',     // 13-14
    hard: '#EA580C',         // 15-16
    veryHard: '#DC2626',     // 17-18
    maximal: '#991B1B',      // 19-20
  },
};

// Light Theme (primary – matches pastel gradient)
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
    outlineVariant: '#D1D5DB',
  },
  custom: colors,
};

// Dark Theme (kept for reference)
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
