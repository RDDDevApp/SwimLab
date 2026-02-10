/**
 * RPESlider logic tests — Sprint 3-4
 * Tests RPE scale generation, color mapping, and label accuracy.
 */

import { getRPEColor, RPE_LABELS } from '../../config/theme';

describe('RPESlider logic', () => {
  describe('RPE scale range', () => {
    const rpeValues = Array.from({ length: 15 }, (_, i) => i + 6);

    it('should generate values from 6 to 20', () => {
      expect(rpeValues[0]).toBe(6);
      expect(rpeValues[rpeValues.length - 1]).toBe(20);
      expect(rpeValues).toHaveLength(15);
    });

    it('should have a label for every RPE value', () => {
      for (const val of rpeValues) {
        expect(RPE_LABELS[val]).toBeDefined();
        expect(RPE_LABELS[val].length).toBeGreaterThan(0);
      }
    });

    it('should have a color for every RPE value', () => {
      for (const val of rpeValues) {
        const color = getRPEColor(val);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe('RPE color boundaries', () => {
    it('should change color at boundary 8→9', () => {
      expect(getRPEColor(8)).not.toBe(getRPEColor(9));
    });

    it('should change color at boundary 10→11', () => {
      expect(getRPEColor(10)).not.toBe(getRPEColor(11));
    });

    it('should change color at boundary 12→13', () => {
      expect(getRPEColor(12)).not.toBe(getRPEColor(13));
    });

    it('should change color at boundary 14→15', () => {
      expect(getRPEColor(14)).not.toBe(getRPEColor(15));
    });

    it('should change color at boundary 16→17', () => {
      expect(getRPEColor(16)).not.toBe(getRPEColor(17));
    });

    it('should change color at boundary 18→19', () => {
      expect(getRPEColor(18)).not.toBe(getRPEColor(19));
    });
  });

  describe('RPE label pairing', () => {
    it('should have paired labels (6-7 same, 8-9 same, etc.)', () => {
      expect(RPE_LABELS[7]).toBe(RPE_LABELS[8]);  // Tres Tres Facile
      expect(RPE_LABELS[9]).toBe(RPE_LABELS[10]);  // Tres Facile
      expect(RPE_LABELS[11]).toBe(RPE_LABELS[12]); // Facile
      expect(RPE_LABELS[13]).toBe(RPE_LABELS[14]); // Un Peu Dur
      expect(RPE_LABELS[15]).toBe(RPE_LABELS[16]); // Dur
      expect(RPE_LABELS[17]).toBe(RPE_LABELS[18]); // Tres Dur
      expect(RPE_LABELS[19]).toBe(RPE_LABELS[20]); // Maximal
    });

    it('should have unique label at RPE 6 (Repos)', () => {
      expect(RPE_LABELS[6]).toBe('Repos');
      expect(RPE_LABELS[6]).not.toBe(RPE_LABELS[7]);
    });
  });

  describe('RPE color consistency within ranges', () => {
    it('should have same color within 6-8 range', () => {
      expect(getRPEColor(6)).toBe(getRPEColor(7));
      expect(getRPEColor(7)).toBe(getRPEColor(8));
    });

    it('should have same color within 9-10 range', () => {
      expect(getRPEColor(9)).toBe(getRPEColor(10));
    });

    it('should have same color within 11-12 range', () => {
      expect(getRPEColor(11)).toBe(getRPEColor(12));
    });

    it('should have same color within 13-14 range', () => {
      expect(getRPEColor(13)).toBe(getRPEColor(14));
    });

    it('should have same color within 15-16 range', () => {
      expect(getRPEColor(15)).toBe(getRPEColor(16));
    });

    it('should have same color within 17-18 range', () => {
      expect(getRPEColor(17)).toBe(getRPEColor(18));
    });

    it('should have same color within 19-20 range', () => {
      expect(getRPEColor(19)).toBe(getRPEColor(20));
    });
  });
});
