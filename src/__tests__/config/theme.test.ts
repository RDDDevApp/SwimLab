import { lightTheme, getRPEColor, getRPETextColor, RPE_LABELS } from '../../config/theme';
import { C, FONTS } from '../../config/tokens';

describe('Theme (DA « La vague »)', () => {
  describe('lightTheme', () => {
    it('uses the DA colors', () => {
      expect(lightTheme.colors.primary).toBe('#044fb3');
      expect(lightTheme.colors.background).toBe('#f1f7fc');
      expect(lightTheme.colors.surface).toBe('#ffffff');
      expect(lightTheme.colors.onSurface).toBe('#06184a');
      expect(lightTheme.colors.error).toBe(C.danger);
    });

    it('keeps cards white: no MD3 elevation tint', () => {
      expect(lightTheme.colors.elevation.level1).toBe(C.surface);
      expect(lightTheme.colors.elevation.level3).toBe(C.surface);
    });

    it('sets titles in Sora and text in Figtree', () => {
      expect(lightTheme.fonts.headlineMedium.fontFamily).toBe(FONTS.display);
      expect(lightTheme.fonts.titleMedium.fontFamily).toBe(FONTS.displaySemi);
      expect(lightTheme.fonts.bodyMedium.fontFamily).toBe(FONTS.text);
      expect(lightTheme.fonts.labelLarge.fontFamily).toBe(FONTS.textStrong);
    });

    it('makes buttons pill-shaped (roundness × 5 ≥ 24)', () => {
      expect(lightTheme.roundness * 5).toBeGreaterThanOrEqual(24);
    });
  });
});

describe('getRPEColor', () => {
  it('goes from clear water to dark plum', () => {
    expect(getRPEColor(6)).toBe(C.rpe1);
    expect(getRPEColor(8)).toBe(C.rpe1);
    expect(getRPEColor(9)).toBe(C.rpe2);
    expect(getRPEColor(10)).toBe(C.rpe2);
    expect(getRPEColor(11)).toBe(C.rpe3);
    expect(getRPEColor(12)).toBe(C.rpe3);
    expect(getRPEColor(13)).toBe(C.rpe4);
    expect(getRPEColor(14)).toBe(C.rpe4);
    expect(getRPEColor(15)).toBe(C.rpe5);
    expect(getRPEColor(16)).toBe(C.rpe5);
    expect(getRPEColor(17)).toBe(C.rpe6);
    expect(getRPEColor(18)).toBe(C.rpe6);
    expect(getRPEColor(19)).toBe(C.rpe7);
    expect(getRPEColor(20)).toBe(C.rpe7);
  });
});

describe('getRPETextColor', () => {
  it('writes the number in night blue up to 14, white above', () => {
    expect(getRPETextColor(6)).toBe(C.onVif);
    expect(getRPETextColor(14)).toBe(C.onVif);
    expect(getRPETextColor(15)).toBe(C.onAbysse);
    expect(getRPETextColor(20)).toBe(C.onAbysse);
  });
});

describe('RPE_LABELS', () => {
  it('should have labels for all RPE values 6-20', () => {
    for (let rpe = 6; rpe <= 20; rpe++) {
      expect(RPE_LABELS[rpe]).toBeDefined();
      expect(typeof RPE_LABELS[rpe]).toBe('string');
    }
  });

  it('should have correct boundary labels', () => {
    expect(RPE_LABELS[6]).toBe('Repos');
    expect(RPE_LABELS[13]).toBe('Un peu dur');
    expect(RPE_LABELS[20]).toBe('Maximal');
  });
});
