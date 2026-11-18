import { Appearance, Platform, TextStyle } from 'react-native';

/**
 * Design tokens SwimLab — DA « La vague » (novembre 2026).
 *
 * Source : l'artefact « SwimLab Design System »
 * (https://claude.ai/artifact/6BwZAeMxRjq5g3SfvU2s1F, project/tokens.json).
 * Règles d'usage : son README (fonds calmes, couleur vive là où il se passe
 * quelque chose, vagues pleines sans dégradé, tout ce qui se touche en galet).
 *
 * Aucune couleur en dur dans les écrans : toujours passer par `C.<nom>`.
 * Thème « Clair » ou « Nuit » : choisi au lancement selon le réglage du téléphone
 * (ou du navigateur). Les styles étant calculés au chargement, un changement de
 * réglage s'applique au prochain lancement de l'app.
 */

const light = {
  bg: '#f1f7fc',
  surface: '#ffffff',
  surfaceSunken: '#e1edf7',
  line: '#c9dbea',
  lineStrong: '#5f7da3',
  ink: '#06184a',
  inkMuted: '#465a82',
  primary: '#044fb3',
  onPrimary: '#ffffff',
  primarySoft: '#dcebfb',
  onPrimarySoft: '#033f91',
  link: '#044fb3',
  focus: '#b3186a',
  success: '#04645c',
  successSoft: '#d3f5ee',
  warning: '#8a4b00',
  warningSoft: '#fdf0c4',
  danger: '#b3134f',
  dangerSoft: '#fde0ea',
  /** Voile derrière une feuille ou une fenêtre (abysse à 50 %). */
  scrim: 'rgba(1, 35, 110, 0.5)',
};

const dark: typeof light = {
  bg: '#030d33',
  surface: '#0a1f5c',
  surfaceSunken: '#010720',
  line: '#1c3580',
  lineStrong: '#6f8fd0',
  ink: '#f0f7ff',
  inkMuted: '#a9bfe6',
  primary: '#3fd0e6',
  onPrimary: '#030d33',
  primarySoft: '#12307f',
  onPrimarySoft: '#d3ecff',
  link: '#6fdcf0',
  focus: '#fddc3c',
  success: '#4ce9b7',
  successSoft: '#063f4f',
  warning: '#fddc3c',
  warningSoft: '#4a3a06',
  danger: '#ff8fb4',
  dangerSoft: '#541334',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

/** Couleurs de marque : identiques dans les deux thèmes. */
const brand = {
  abysse: '#01236e',
  onAbysse: '#ffffff',
  ocean: '#044fb3',
  lagon: '#01b2c0',
  turquoise: '#04d9c7',
  soleil: '#fddc3c',
  mangue: '#f5a31f',
  rose: '#ee3d80',
  /** Texte et icônes sur lagon, turquoise, soleil, mangue, rose : jamais du blanc. */
  onVif: '#06184a',
  focusOnAbysse: '#fddc3c',
  // Effort ressenti : de l'eau claire (facile) à la prune sombre (maximal)
  rpe1: '#b9f1e6',
  rpe2: '#5fdccd',
  rpe3: '#16b6c6',
  rpe4: '#ec7f22',
  rpe5: '#d12c6e',
  rpe6: '#a81b68',
  rpe7: '#5c0f4a',
} as const;

export const PALETTE = {
  light: { ...light, ...brand },
  dark: { ...dark, ...brand },
};

/** Vrai si le téléphone (ou le navigateur) est réglé en mode sombre au lancement. */
export const IS_DARK = (() => {
  try {
    // Appearance peut manquer quand les tests simulent react-native
    return Appearance?.getColorScheme?.() === 'dark';
  } catch {
    return false;
  }
})();

/** Couleurs du thème courant : « Clair » ou « Nuit ». */
export const C = IS_DARK ? PALETTE.dark : PALETTE.light;
export type ColorName = keyof typeof C;

// ─── Typographie ────────────────────────────────────────────────────────────
// Sora pour les titres et les grands chiffres, Figtree pour tout le reste.
// Une famille par graisse (chargées dans App.tsx) : pas de fontWeight avec elles,
// sinon Android et le web inventent un faux gras.

export const FONTS = {
  displaySemi: 'Sora_600SemiBold',
  display: 'Sora_700Bold',
  text: 'Figtree_400Regular',
  textMedium: 'Figtree_500Medium',
  textStrong: 'Figtree_600SemiBold',
  textBold: 'Figtree_700Bold',
} as const;

export const TYPE = {
  display: { fontFamily: FONTS.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title1: { fontFamily: FONTS.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.28 },
  title2: { fontFamily: FONTS.displaySemi, fontSize: 20, lineHeight: 26 },
  title3: { fontFamily: FONTS.displaySemi, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: FONTS.text, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: FONTS.textStrong, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: FONTS.text, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: FONTS.textStrong, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
} satisfies Record<string, TextStyle>;

/** Chiffres alignés (chronos, tableaux) : ils ne bougent pas quand ils changent. */
export const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };

// ─── Espace, formes, ombres ─────────────────────────────────────────────────

export const SPACING = {
  xs: 4, // space-1 : entre une icône et son texte
  sm: 8, // space-2 : entre deux pastilles
  md: 12, // space-3 : entre deux lignes d'une carte
  lg: 16, // space-4 : marge des écrans et des cartes
  xl: 24, // space-6 : entre deux cartes, intérieur des cartes vedettes
  xxl: 32, // space-8 : entre deux grandes parties
} as const;

export const RADIUS = {
  sm: 12, // champs, vignettes
  md: 20, // cartes
  lg: 28, // cartes vedettes, feuilles
  xl: 28,
  pill: 999, // tout ce qui se touche
} as const;

/** Hauteur minimale de tout ce qui se touche (on utilise l'app les mains mouillées). */
export const TOUCH_MIN = 48;

/**
 * Ombre cross-platform : `boxShadow` sur web (les props shadow* y sont
 * dépréciées par react-native-web), shadow* + elevation sur natif.
 * Teinte par défaut : abysse.
 */
export function shadow(
  opacity: number,
  radius: number,
  offsetY = 4,
  elevation = 3,
  color = '1, 35, 110',
) {
  // Platform peut manquer quand les tests simulent react-native
  if (Platform?.OS === 'web') {
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

/** Ombres de la DA : une carte se détache par son ombre, pas par une bordure. */
export const SHADOW = IS_DARK
  ? ({ card: shadow(0.4, 20, 6, 3, '0, 0, 0'), float: shadow(0.55, 32, 12, 8, '0, 0, 0') } as const)
  : ({ card: shadow(0.1, 20, 6, 3), float: shadow(0.22, 32, 12, 8) } as const);

/** Surface de carte standard (remplace l'ancien effet de verre). */
export const CARD = {
  backgroundColor: C.surface,
  borderRadius: RADIUS.md,
  ...SHADOW.card,
} as const;

// ─── Couleurs métier ────────────────────────────────────────────────────────

/**
 * Pastilles de type de séance ou de bloc : `bg` est la couleur de la pastille,
 * `color` celle du libellé et de l'icône posés dessus. Toujours avec le nom.
 */
export const WORKOUT_TYPE_COLORS: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  endurance: { color: C.onVif, bg: C.lagon, label: 'Endurance' },
  sprint: { color: C.onVif, bg: C.mangue, label: 'Sprint' },
  technique: { color: C.onVif, bg: C.rose, label: 'Technique' },
  recovery: { color: C.onVif, bg: C.turquoise, label: 'Récupération' },
  // Types de blocs (éditeur de séances)
  warmup: { color: C.onVif, bg: C.turquoise, label: 'Échauffement' },
  main: { color: C.onVif, bg: C.lagon, label: 'Corps de séance' },
  cooldown: { color: C.onVif, bg: C.turquoise, label: 'Récupération' },
  other: { color: C.onPrimarySoft, bg: C.primarySoft, label: 'Autre' },
} as const;

/** Paliers de badges : `color` pour le texte et l'icône, `bg` pour le fond. */
export const BADGE_TIERS = {
  bronze: { color: C.warning, bg: C.warningSoft, label: 'Bronze' },
  silver: { color: C.inkMuted, bg: C.surfaceSunken, label: 'Argent' },
  gold: { color: C.onVif, bg: C.soleil, label: 'Or' },
  diamond: { color: C.onVif, bg: C.lagon, label: 'Diamant' },
} as const;

export type BadgeTier = keyof typeof BADGE_TIERS;

/** Textes neutres (ancien nom, gardé pour les écrans existants). */
export const TEXT_COLORS = {
  primary: C.ink,
  secondary: C.inkMuted,
  muted: C.inkMuted,
} as const;
