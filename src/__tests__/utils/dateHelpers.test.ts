import {
  getWeekStart,
  getWeekDates,
  toISODate,
  formatShortDate,
  formatWeekRange,
  isSameDay,
  isToday,
  getDayOfWeek,
  formatTime,
} from '../../utils/dateHelpers';

describe('dateHelpers', () => {
  describe('getWeekStart', () => {
    it('should return Monday for a Wednesday', () => {
      const wed = new Date(2026, 1, 4); // Wed Feb 4, 2026
      const monday = getWeekStart(wed);
      expect(monday.getDay()).toBe(1); // Monday
      expect(monday.getDate()).toBe(2); // Feb 2
    });

    it('should return Monday for a Monday', () => {
      const mon = new Date(2026, 1, 2); // Mon Feb 2, 2026
      const monday = getWeekStart(mon);
      expect(monday.getDay()).toBe(1);
      expect(monday.getDate()).toBe(2);
    });

    it('should return previous Monday for a Sunday', () => {
      const sun = new Date(2026, 1, 8); // Sun Feb 8, 2026
      const monday = getWeekStart(sun);
      expect(monday.getDay()).toBe(1);
      expect(monday.getDate()).toBe(2);
    });
  });

  describe('getWeekDates', () => {
    it('should return 7 dates', () => {
      const dates = getWeekDates(new Date(2026, 1, 4));
      expect(dates).toHaveLength(7);
    });

    it('should start with Monday and end with Sunday', () => {
      const dates = getWeekDates(new Date(2026, 1, 4));
      expect(dates[0].getDay()).toBe(1); // Monday
      expect(dates[6].getDay()).toBe(0); // Sunday
    });

    it('should have consecutive days', () => {
      const dates = getWeekDates(new Date(2026, 1, 4));
      for (let i = 1; i < dates.length; i++) {
        const diff = dates[i].getDate() - dates[i - 1].getDate();
        expect(diff).toBe(1);
      }
    });
  });

  describe('toISODate', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
      expect(toISODate(new Date(2026, 11, 25))).toBe('2026-12-25');
    });

    it('should zero-pad month and day', () => {
      expect(toISODate(new Date(2026, 0, 1))).toBe('2026-01-01');
    });
  });

  describe('formatShortDate', () => {
    it('should format with French day and month abbreviations', () => {
      const mon = new Date(2026, 1, 2); // Monday Feb 2
      const result = formatShortDate(mon);
      expect(result).toBe('Lun 02 Fev');
    });

    it('should handle Sunday', () => {
      const sun = new Date(2026, 1, 8); // Sunday Feb 8
      const result = formatShortDate(sun);
      expect(result).toBe('Dim 08 Fev');
    });
  });

  describe('formatWeekRange', () => {
    it('should show start and end of week', () => {
      const result = formatWeekRange(new Date(2026, 1, 4));
      expect(result).toContain('02 Fev');
      expect(result).toContain('08 Fev');
      expect(result).toContain('2026');
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const a = new Date(2026, 1, 4, 10, 30);
      const b = new Date(2026, 1, 4, 22, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('should return false for different days', () => {
      const a = new Date(2026, 1, 4);
      const b = new Date(2026, 1, 5);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return JS day index (0=Sun, 1=Mon, ...)', () => {
      const mon = new Date(2026, 1, 2); // Monday
      expect(getDayOfWeek(mon)).toBe(1);

      const sun = new Date(2026, 1, 8); // Sunday
      expect(getDayOfWeek(sun)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format HH:MM:SS to HHhMM', () => {
      expect(formatTime('18:00:00')).toBe('18h00');
      expect(formatTime('09:30:00')).toBe('09h30');
    });

    it('should format HH:MM to HHhMM', () => {
      expect(formatTime('18:00')).toBe('18h00');
    });
  });
});
