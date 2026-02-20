import { createMockQueryBuilder } from '../../__mocks__/supabase';
import { WorkoutContent } from '../../types';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { workoutService } from '../../services/workoutService';

describe('workoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a workout', async () => {
      const mockWorkout = {
        id: 'w-1',
        title: 'Endurance 2000m',
        type: 'endurance',
        club_id: 'club-1',
        coach_id: 'coach-1',
      };
      const builder = createMockQueryBuilder({ data: mockWorkout, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutService.create({
        title: 'Endurance 2000m',
        type: 'endurance',
        club_id: 'club-1',
        coach_id: 'coach-1',
      });

      expect(result).toEqual(mockWorkout);
    });
  });

  describe('getByCoach', () => {
    it('should return workouts ordered by creation date descending', async () => {
      const workouts = [
        { id: 'w-2', title: 'Sprint' },
        { id: 'w-1', title: 'Endurance' },
      ];
      const builder = createMockQueryBuilder({ data: workouts, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutService.getByCoach('coach-1');

      expect(result).toEqual(workouts);
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('getPublished', () => {
    it('should only return published workouts', async () => {
      const builder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(builder);

      await workoutService.getPublished('club-1');

      expect(builder.eq).toHaveBeenCalledWith('club_id', 'club-1');
      expect(builder.eq).toHaveBeenCalledWith('is_published', true);
    });
  });

  describe('publish', () => {
    it('should set is_published to true', async () => {
      const published = { id: 'w-1', is_published: true };
      const builder = createMockQueryBuilder({ data: published, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutService.publish('w-1');

      expect(result.is_published).toBe(true);
      expect(builder.update).toHaveBeenCalledWith({ is_published: true });
    });
  });

  describe('unpublish', () => {
    it('should set is_published to false', async () => {
      const unpublished = { id: 'w-1', is_published: false };
      const builder = createMockQueryBuilder({ data: unpublished, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await workoutService.unpublish('w-1');

      expect(result.is_published).toBe(false);
      expect(builder.update).toHaveBeenCalledWith({ is_published: false });
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance from content blocks', () => {
      const content: WorkoutContent = {
        blocks: [
          {
            id: 'b1',
            type: 'warmup',
            name: 'Echauffement',
            sub_blocks: [
              {
                id: 'sb1',
                distance: 400,
                repetitions: 1,
              },
            ],
          },
          {
            id: 'b2',
            type: 'main',
            name: 'Corps',
            sub_blocks: [
              {
                id: 'sb2',
                distance: 100,
                repetitions: 8,
              },
            ],
          },
          {
            id: 'b3',
            type: 'cooldown',
            name: 'Retour au calme',
            sub_blocks: [
              {
                id: 'sb3',
                distance: 200,
                repetitions: 1,
              },
            ],
          },
        ],
      };

      // 400 + (100 * 8) + 200 = 1400
      expect(workoutService.calculateTotalDistance(content)).toBe(1400);
    });

    it('should return 0 for empty blocks', () => {
      expect(workoutService.calculateTotalDistance({ blocks: [] })).toBe(0);
    });

    it('should handle multiple sub-blocks in a block', () => {
      const content: WorkoutContent = {
        blocks: [
          {
            id: 'b1',
            type: 'main',
            name: '4 Nages',
            sub_blocks: [
              {
                id: 'sb1',
                distance: 200,
                repetitions: 4,
              },
            ],
          },
        ],
      };

      // 200 * 4 = 800
      expect(workoutService.calculateTotalDistance(content)).toBe(800);
    });
  });
});
