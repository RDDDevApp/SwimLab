import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { workoutAssignmentService } from '../../services/workoutAssignmentService';

describe('workoutAssignmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an assignment', async () => {
      const assignment = {
        id: 'a1',
        workout_id: 'w1',
        training_slot_id: 's1',
        scheduled_date: '2026-02-10',
      };
      const builder = createMockQueryBuilder({ data: assignment, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutAssignmentService.create({
        workout_id: 'w1',
        training_slot_id: 's1',
        scheduled_date: '2026-02-10',
      });

      expect(result).toEqual(assignment);
      expect(builder.insert).toHaveBeenCalled();
    });
  });

  describe('getByDateRange', () => {
    it('should return assignments within date range', async () => {
      const assignments = [
        { id: 'a1', scheduled_date: '2026-02-10' },
        { id: 'a2', scheduled_date: '2026-02-12' },
      ];
      const builder = createMockQueryBuilder({ data: assignments, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutAssignmentService.getByDateRange(
        ['s1', 's2'],
        '2026-02-09',
        '2026-02-15',
      );

      expect(result).toEqual(assignments);
      expect(builder.gte).toHaveBeenCalledWith('scheduled_date', '2026-02-09');
      expect(builder.lte).toHaveBeenCalledWith('scheduled_date', '2026-02-15');
    });

    it('should return empty array for empty slot IDs', async () => {
      const result = await workoutAssignmentService.getByDateRange([], '2026-02-09', '2026-02-15');
      expect(result).toEqual([]);
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe('getByDate', () => {
    it('should return assignments for a specific date', async () => {
      const assignments = [{ id: 'a1', scheduled_date: '2026-02-10' }];
      const builder = createMockQueryBuilder({ data: assignments, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutAssignmentService.getByDate(
        ['s1'],
        '2026-02-10',
      );

      expect(result).toEqual(assignments);
      expect(builder.eq).toHaveBeenCalledWith('scheduled_date', '2026-02-10');
    });
  });

  describe('markCompleted', () => {
    it('should mark assignment as completed', async () => {
      const updated = { id: 'a1', is_completed: true };
      const builder = createMockQueryBuilder({ data: updated, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutAssignmentService.markCompleted('a1');

      expect(result.is_completed).toBe(true);
      expect(builder.update).toHaveBeenCalledWith({ is_completed: true });
    });
  });

  describe('markAttendance', () => {
    it('should mark attendance as done', async () => {
      const updated = { id: 'a1', attendance_marked: true };
      const builder = createMockQueryBuilder({ data: updated, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutAssignmentService.markAttendance('a1');

      expect(result.attendance_marked).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete an assignment', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(
        workoutAssignmentService.delete('a1'),
      ).resolves.toBeUndefined();
    });
  });
});
