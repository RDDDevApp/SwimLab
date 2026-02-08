import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { workoutSessionService } from '../../services/workoutSessionService';

describe('workoutSessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit RPE feedback', async () => {
      const session = {
        id: 's1',
        rpe_score: 14,
        feedback_text: 'Bonne seance',
        completed_at: '2026-02-08T10:00:00.000Z',
      };
      const builder = createMockQueryBuilder({ data: session, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutSessionService.submitFeedback('s1', {
        rpe_score: 14,
        feedback_text: 'Bonne seance',
      });

      expect(result.rpe_score).toBe(14);
      expect(builder.update).toHaveBeenCalled();
    });

    it('should reject RPE score below 6', async () => {
      await expect(
        workoutSessionService.submitFeedback('s1', { rpe_score: 3 }),
      ).rejects.toThrow('Le score RPE doit etre entre 6 et 20');
    });

    it('should reject RPE score above 20', async () => {
      await expect(
        workoutSessionService.submitFeedback('s1', { rpe_score: 25 }),
      ).rejects.toThrow('Le score RPE doit etre entre 6 et 20');
    });
  });

  describe('bulkCreateAttendance', () => {
    it('should create sessions for all swimmers with correct attended status', async () => {
      const sessions = [
        { id: 's1', swimmer_id: 'u1', attended: true },
        { id: 's2', swimmer_id: 'u2', attended: false },
        { id: 's3', swimmer_id: 'u3', attended: true },
      ];
      const builder = createMockQueryBuilder({ data: sessions, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutSessionService.bulkCreateAttendance(
        'assignment-1',
        ['u1', 'u2', 'u3'],
        ['u1', 'u3'], // only u1 and u3 attended
      );

      expect(result).toHaveLength(3);
      expect(builder.insert).toHaveBeenCalledWith([
        { workout_assignment_id: 'assignment-1', swimmer_id: 'u1', attended: true },
        { workout_assignment_id: 'assignment-1', swimmer_id: 'u2', attended: false },
        { workout_assignment_id: 'assignment-1', swimmer_id: 'u3', attended: true },
      ]);
    });
  });

  describe('getFeedbackStats', () => {
    it('should calculate correct stats from sessions', async () => {
      const sessions = [
        { id: 's1', attended: true, rpe_score: 12 },
        { id: 's2', attended: true, rpe_score: 14 },
        { id: 's3', attended: false, rpe_score: null },
        { id: 's4', attended: true, rpe_score: 16 },
      ];
      const builder = createMockQueryBuilder({ data: sessions, error: null });
      mockFrom.mockReturnValue(builder);

      const stats = await workoutSessionService.getFeedbackStats('a1');

      expect(stats.total_swimmers).toBe(4);
      expect(stats.attended_count).toBe(3);
      expect(stats.average_rpe).toBe(14); // (12+14+16)/3
      expect(stats.rpe_distribution).toEqual({ 12: 1, 14: 1, 16: 1 });
    });

    it('should return null average for no RPE scores', async () => {
      const sessions = [
        { id: 's1', attended: true, rpe_score: null },
        { id: 's2', attended: false, rpe_score: null },
      ];
      const builder = createMockQueryBuilder({ data: sessions, error: null });
      mockFrom.mockReturnValue(builder);

      const stats = await workoutSessionService.getFeedbackStats('a1');

      expect(stats.average_rpe).toBeNull();
      expect(stats.attended_count).toBe(1);
    });
  });

  describe('getSwimmerStats', () => {
    it('should calculate swimmer statistics', async () => {
      const sessions = [
        { id: 's1', attended: true, rpe_score: 13 },
        { id: 's2', attended: true, rpe_score: 15 },
        { id: 's3', attended: false, rpe_score: null },
      ];
      const builder = createMockQueryBuilder({ data: sessions, error: null });
      mockFrom.mockReturnValue(builder);

      const stats = await workoutSessionService.getSwimmerStats('swimmer-1');

      expect(stats.total).toBe(3);
      expect(stats.attended).toBe(2);
      expect(stats.averageRpe).toBe(14); // (13+15)/2
    });
  });

  describe('getBySwimmer', () => {
    it('should return sessions ordered by creation date descending', async () => {
      const sessions = [{ id: 's2' }, { id: 's1' }];
      const builder = createMockQueryBuilder({ data: sessions, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutSessionService.getBySwimmer('swimmer-1');

      expect(result).toEqual(sessions);
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});
