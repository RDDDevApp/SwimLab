import { formatRevealTime, isSessionRevealed, sessionEndDate } from '../../utils/workoutVisibility';

const session = {
  scheduledDate: '2026-10-12',
  startTime: '19:00:00',
  durationMinutes: 90,
  attendanceMarked: false,
  showBeforeSession: false,
};

describe('workout visibility for swimmers', () => {
  it('computes the end of the session from start time and duration', () => {
    const end = sessionEndDate(session);
    expect(end.getHours()).toBe(20);
    expect(end.getMinutes()).toBe(30);
    expect(formatRevealTime(session)).toBe('20h30');
  });

  it('keeps an upcoming session secret', () => {
    expect(isSessionRevealed(session, new Date('2026-10-12T18:00:00'))).toBe(false);
  });

  it('keeps the program secret during the session', () => {
    expect(isSessionRevealed(session, new Date('2026-10-12T20:00:00'))).toBe(false);
  });

  it('reveals the program once the session is over', () => {
    expect(isSessionRevealed(session, new Date('2026-10-12T20:30:00'))).toBe(true);
  });

  it('reveals the program as soon as attendance is taken', () => {
    expect(isSessionRevealed({ ...session, attendanceMarked: true }, new Date('2026-10-12T19:15:00'))).toBe(true);
  });

  it('reveals the program early when the coach chose to show it', () => {
    expect(isSessionRevealed({ ...session, showBeforeSession: true }, new Date('2026-10-10T08:00:00'))).toBe(true);
  });
});
