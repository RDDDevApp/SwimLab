import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Mock groupCoachService to avoid circular dependency issues
jest.mock('../../services/groupCoachService', () => ({
  groupCoachService: {
    getGroupIds: jest.fn().mockResolvedValue(['g1', 'g2']),
  },
}));

import { trainingSlotService } from '../../services/trainingSlotService';

describe('trainingSlotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a training slot without coach_id', async () => {
      const mockSlot = {
        id: 'slot-1',
        group_id: 'g1',
        name: 'Mardi soir',
        day_of_week: 2,
        start_time: '18:00',
        duration_minutes: 90,
      };
      const builder = createMockQueryBuilder({ data: mockSlot, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await trainingSlotService.create({
        group_id: 'g1',
        name: 'Mardi soir',
        day_of_week: 2,
        start_time: '18:00',
        duration_minutes: 90,
      });

      expect(result).toEqual(mockSlot);
    });
  });

  describe('getByGroup', () => {
    it('should return active slots ordered by day and time', async () => {
      const slots = [
        { id: 's1', day_of_week: 1, start_time: '18:00' },
        { id: 's2', day_of_week: 3, start_time: '17:30' },
      ];
      const builder = createMockQueryBuilder({ data: slots, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await trainingSlotService.getByGroup('g1');

      expect(result).toEqual(slots);
      expect(builder.eq).toHaveBeenCalledWith('group_id', 'g1');
      expect(builder.eq).toHaveBeenCalledWith('is_active', true);
      expect(builder.order).toHaveBeenCalledWith('day_of_week');
      expect(builder.order).toHaveBeenCalledWith('start_time');
    });
  });

  describe('getByCoach', () => {
    it('should return slots for groups where the coach is assigned', async () => {
      const slots = [{ id: 's1', day_of_week: 2 }];
      const builder = createMockQueryBuilder({ data: slots, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await trainingSlotService.getByCoach('c1');

      expect(result).toEqual(slots);
      // Should use in('group_id', ...) instead of eq('coach_id', ...)
      expect(builder.in).toHaveBeenCalledWith('group_id', ['g1', 'g2']);
    });
  });

  describe('getByDay', () => {
    it('should return slots for a specific day via group_coaches', async () => {
      const slots = [{ id: 's1', day_of_week: 2 }];
      const builder = createMockQueryBuilder({ data: slots, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await trainingSlotService.getByDay('c1', 2);

      expect(result).toEqual(slots);
      expect(builder.in).toHaveBeenCalledWith('group_id', ['g1', 'g2']);
      expect(builder.eq).toHaveBeenCalledWith('day_of_week', 2);
    });
  });

  describe('deactivate', () => {
    it('should set is_active to false', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await trainingSlotService.deactivate('slot-1');

      expect(builder.update).toHaveBeenCalledWith({ is_active: false });
      expect(builder.eq).toHaveBeenCalledWith('id', 'slot-1');
    });
  });

  describe('update', () => {
    it('should update a slot', async () => {
      const updated = { id: 'slot-1', name: 'Jeudi matin' };
      const builder = createMockQueryBuilder({ data: updated, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await trainingSlotService.update('slot-1', { name: 'Jeudi matin' });

      expect(result).toEqual(updated);
    });
  });
});
