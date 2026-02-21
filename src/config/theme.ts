import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// SwimLab Brand Colors – slate/blue palette (mockup-aligned)
const colors = {
  primary: {
    turquoise: '#0891B2',
    teal: '#0e7490',
  },
  secondary: {
    pink: '#ec4899',
    orange: '#D97706',
  },
  accent: {
    yellow: '#eab308',
    electricBlue: '#6366f1',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F1F5F9',
    gray: '#64748b',
    darkGray: '#475569',
    dark: '#1e293b',
    black: '#0f172a',
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

// Light Theme (primary – matches blue-50 gradient)
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
    background: '#EFF6FF',
    error: colors.semantic.error,
    errorContainer: '#FEE2E2',
    onPrimary: colors.neutral.white,
    onPrimaryContainer: colors.primary.teal,
    onSecondary: colors.neutral.white,
    onSurface: colors.neutral.dark,
    onSurfaceVariant: colors.neutral.darkGray,
    onBackground: colors.neutral.dark,
    outline: colors.neutral.gray,
    outlineVariant: '#CBD5E1',
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
