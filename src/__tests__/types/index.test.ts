import {
  DAYS_OF_WEEK,
  GROUP_LEVELS,
  STROKE_LABELS,
  INTENSITY_LABELS,
} from '../../types';

describe('Constants', () => {
  describe('DAYS_OF_WEEK', () => {
    it('should have 7 days', () => {
      expect(DAYS_OF_WEEK).toHaveLength(7);
    });

    it('should start with Dimanche (French convention)', () => {
      expect(DAYS_OF_WEEK[0]).toBe('Dimanche');
    });

    it('should end with Samedi', () => {
      expect(DAYS_OF_WEEK[6]).toBe('Samedi');
    });

    it('should have all weekdays in order', () => {
      expect(DAYS_OF_WEEK).toEqual([
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
      ]);
    });
  });

  describe('GROUP_LEVELS', () => {
    it('should have 4 levels', () => {
      expect(Object.keys(GROUP_LEVELS)).toHaveLength(4);
    });

    it('should have correct French labels', () => {
      expect(GROUP_LEVELS.beginner).toBe('Debutant');
      expect(GROUP_LEVELS.intermediate).toBe('Intermediaire');
      expect(GROUP_LEVELS.advanced).toBe('Avance');
      expect(GROUP_LEVELS.competition).toBe('Competition');
    });
  });

  describe('STROKE_LABELS', () => {
    it('should have 12 stroke types', () => {
      expect(Object.keys(STROKE_LABELS)).toHaveLength(12);
    });

    it('should have the 4 main competitive strokes in French', () => {
      expect(STROKE_LABELS.freestyle).toBe('Crawl');
      expect(STROKE_LABELS.backstroke).toBe('Dos');
      expect(STROKE_LABELS.breaststroke).toBe('Brasse');
      expect(STROKE_LABELS.butterfly).toBe('Papillon');
    });

    it('should have equipment labels', () => {
      expect(STROKE_LABELS.fins).toBe('Palmes');
      expect(STROKE_LABELS.pull_buoy).toBe('Pull-Buoy');
      expect(STROKE_LABELS.paddles).toBe('Plaquettes');
    });
  });

  describe('INTENSITY_LABELS', () => {
    it('should have 6 intensity levels', () => {
      expect(Object.keys(INTENSITY_LABELS)).toHaveLength(6);
    });

    it('should be ordered from recovery to sprint', () => {
      const keys = Object.keys(INTENSITY_LABELS);
      expect(keys[0]).toBe('recovery');
      expect(keys[keys.length - 1]).toBe('sprint');
    });
  });
});
