import { lightTheme, darkTheme, getRPEColor, RPE_LABELS } from '../../config/theme';

describe('Theme', () => {
  describe('lightTheme', () => {
    it('should have SwimLab primary color', () => {
      expect(lightTheme.colors.primary).toBe('#0891B2');
    });

    it('should have white surface', () => {
      expect(lightTheme.colors.surface).toBe('#FFFFFF');
    });

    it('should have custom colors attached', () => {
      expect(lightTheme.custom).toBeDefined();
      expect(lightTheme.custom.primary.turquoise).toBe('#0891B2');
      expect(lightTheme.custom.primary.teal).toBe('#0e7490');
    });

    it('should have secondary colors', () => {
      expect(lightTheme.colors.secondary).toBe('#ec4899');
      expect(lightTheme.colors.tertiary).toBe('#D97706');
    });
  });

  describe('darkTheme', () => {
    it('should have same primary color as light theme', () => {
      expect(darkTheme.colors.primary).toBe(lightTheme.colors.primary);
    });

    it('should have dark surface', () => {
      expect(darkTheme.colors.surface).toBe('#1E293B');
    });

    it('should have dark background', () => {
      expect(darkTheme.colors.background).toBe('#0f172a');
    });
  });
});

describe('getRPEColor', () => {
  it('should return veryEasy color for RPE 6-8', () => {
    expect(getRPEColor(6)).toBe('#15803D');
    expect(getRPEColor(7)).toBe('#15803D');
    expect(getRPEColor(8)).toBe('#15803D');
  });

  it('should return easy color for RPE 9-10', () => {
    expect(getRPEColor(9)).toBe('#4D7C0F');
    expect(getRPEColor(10)).toBe('#4D7C0F');
  });

  it('should return light color for RPE 11-12', () => {
    expect(getRPEColor(11)).toBe('#65A30D');
    expect(getRPEColor(12)).toBe('#65A30D');
  });

  it('should return moderate color for RPE 13-14', () => {
    expect(getRPEColor(13)).toBe('#CA8A04');
    expect(getRPEColor(14)).toBe('#CA8A04');
  });

  it('should return hard color for RPE 15-16', () => {
    expect(getRPEColor(15)).toBe('#EA580C');
    expect(getRPEColor(16)).toBe('#EA580C');
  });

  it('should return veryHard color for RPE 17-18', () => {
    expect(getRPEColor(17)).toBe('#DC2626');
    expect(getRPEColor(18)).toBe('#DC2626');
  });

  it('should return maximal color for RPE 19-20', () => {
    expect(getRPEColor(19)).toBe('#991B1B');
    expect(getRPEColor(20)).toBe('#991B1B');
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
    expect(RPE_LABELS[13]).toBe('Un Peu Dur');
    expect(RPE_LABELS[20]).toBe('Maximal');
  });
});
