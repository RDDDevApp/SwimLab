import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { C, FONTS, IS_DARK } from './tokens';

/**
 * Thème React Native Paper aligné sur la DA « La vague » (voir tokens.ts).
 */

// Titres en Sora, tout le reste en Figtree. Pas de fontWeight : une famille par graisse.
type Variant = keyof typeof MD3LightTheme.fonts;
const FAMILY_BY_VARIANT: Record<Variant, string> = {
  displayLarge: FONTS.display,
  displayMedium: FONTS.display,
  displaySmall: FONTS.display,
  headlineLarge: FONTS.display,
  headlineMedium: FONTS.display,
  headlineSmall: FONTS.display,
  titleLarge: FONTS.displaySemi,
  titleMedium: FONTS.displaySemi,
  titleSmall: FONTS.displaySemi,
  labelLarge: FONTS.textStrong,
  labelMedium: FONTS.textStrong,
  labelSmall: FONTS.textStrong,
  bodyLarge: FONTS.text,
  bodyMedium: FONTS.text,
  bodySmall: FONTS.text,
  default: FONTS.text,
};
const fonts = Object.fromEntries(
  (Object.keys(FAMILY_BY_VARIANT) as Variant[]).map((variant) => [
    variant,
    { ...MD3LightTheme.fonts?.[variant], fontFamily: FAMILY_BY_VARIANT[variant], fontWeight: 'normal' },
  ]),
) as typeof MD3LightTheme.fonts;

// Couleurs historiques (theme.custom), remappées sur la DA.
const colors = {
  primary: { turquoise: C.primary, teal: C.onPrimarySoft },
  secondary: { pink: C.rose, orange: C.mangue },
  accent: { yellow: C.soleil, electricBlue: C.ocean },
  neutral: {
    white: C.surface,
    lightGray: C.surfaceSunken,
    gray: C.inkMuted,
    darkGray: C.inkMuted,
    dark: C.ink,
    black: C.ink,
  },
  semantic: { success: C.success, warning: C.warning, error: C.danger, info: C.primary },
  rpe: {
    veryEasy: C.rpe1, // 6-8
    easy: C.rpe2, // 9-10
    light: C.rpe3, // 11-12
    moderate: C.rpe4, // 13-14
    hard: C.rpe5, // 15-16
    veryHard: C.rpe6, // 17-18
    maximal: C.rpe7, // 19-20
  },
};

/** Thème Paper du thème courant (« Clair » ou « Nuit », voir tokens.ts). */
export const lightTheme = {
  ...(IS_DARK ? MD3DarkTheme : MD3LightTheme),
  dark: IS_DARK,
  // Boutons MD3 : rayon = 5 × roundness. 5 → 25 px : un galet sur un bouton de 40 à 48 px.
  roundness: 5,
  fonts,
  colors: {
    ...(IS_DARK ? MD3DarkTheme : MD3LightTheme).colors,
    primary: C.primary,
    onPrimary: C.onPrimary,
    primaryContainer: C.primarySoft,
    onPrimaryContainer: C.onPrimarySoft,
    secondary: C.ocean,
    onSecondary: C.onAbysse,
    secondaryContainer: C.primarySoft,
    onSecondaryContainer: C.onPrimarySoft,
    tertiary: C.rose,
    onTertiary: C.onVif,
    tertiaryContainer: C.warningSoft,
    onTertiaryContainer: C.ink,
    background: C.bg,
    onBackground: C.ink,
    surface: C.surface,
    onSurface: C.ink,
    surfaceVariant: C.surfaceSunken,
    onSurfaceVariant: C.inkMuted,
    surfaceDisabled: C.surfaceSunken,
    onSurfaceDisabled: C.inkMuted,
    outline: C.lineStrong,
    outlineVariant: C.line,
    error: C.danger,
    onError: C.onPrimary,
    errorContainer: C.dangerSoft,
    onErrorContainer: C.ink,
    inverseSurface: C.abysse,
    inverseOnSurface: C.onAbysse,
    inversePrimary: C.soleil,
    backdrop: C.scrim,
    // Pas de teinte d'élévation MD3 : une carte reste blanche, l'ombre la détache.
    elevation: {
      level0: 'transparent',
      level1: C.surface,
      level2: C.surface,
      level3: C.surface,
      level4: C.surface,
      level5: C.surface,
    },
  },
  custom: colors,
};

export type AppTheme = typeof lightTheme;

// RPE Labels (from PRODUCT_SPEC)
export const RPE_LABELS: Record<number, string> = {
  6: 'Repos',
  7: 'Très très facile',
  8: 'Très très facile',
  9: 'Très facile',
  10: 'Très facile',
  11: 'Facile',
  12: 'Facile',
  13: 'Un peu dur',
  14: 'Un peu dur',
  15: 'Dur',
  16: 'Dur',
  17: 'Très dur',
  18: 'Très dur',
  19: 'Maximal',
  20: 'Maximal',
};

/** Couleur de fond d'un palier RPE (pastille, segment de jauge). */
export const getRPEColor = (rpe: number): string => {
  if (rpe <= 8) return colors.rpe.veryEasy;
  if (rpe <= 10) return colors.rpe.easy;
  if (rpe <= 12) return colors.rpe.light;
  if (rpe <= 14) return colors.rpe.moderate;
  if (rpe <= 16) return colors.rpe.hard;
  if (rpe <= 18) return colors.rpe.veryHard;
  return colors.rpe.maximal;
};

/** Couleur du chiffre posé sur `getRPEColor(rpe)` : bleu nuit jusqu'à 14, blanc au-delà. */
export const getRPETextColor = (rpe: number): string => (rpe <= 14 ? C.onVif : C.onAbysse);
