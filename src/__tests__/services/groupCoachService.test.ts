import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { groupCoachService } from '../../services/groupCoachService';

describe('groupCoachService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByGroup', () => {
    it('should return coaches for a group', async () => {
      const coaches = [
        { id: 'gc-1', group_id: 'g1', coach_id: 'c1', is_creator: true },
        { id: 'gc-2', group_id: 'g1', coach_id: 'c2', is_creator: false },
      ];
      const builder = createMockQueryBuilder({ data: coaches, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.getByGroup('g1');

      expect(result).toEqual(coaches);
      expect(builder.eq).toHaveBeenCalledWith('group_id', 'g1');
    });
  });

  describe('getGroupIds', () => {
    it('should return group IDs for a coach', async () => {
      const data = [{ group_id: 'g1' }, { group_id: 'g2' }];
      const builder = createMockQueryBuilder({ data, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.getGroupIds('c1');

      expect(result).toEqual(['g1', 'g2']);
      expect(builder.eq).toHaveBeenCalledWith('coach_id', 'c1');
    });
  });

  describe('addCoach', () => {
    it('should add a coach to a group', async () => {
      const mockGC = { id: 'gc-1', group_id: 'g1', coach_id: 'c1', is_creator: true };
      const builder = createMockQueryBuilder({ data: mockGC, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.addCoach('g1', 'c1', true);

      expect(result).toEqual(mockGC);
      expect(builder.insert).toHaveBeenCalledWith({
        group_id: 'g1',
        coach_id: 'c1',
        is_creator: true,
      });
    });
  });

  describe('getCoachCount', () => {
    it('should return the count of coaches', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null, count: 3 });
      builder.then = jest.fn((resolve: any) => resolve({ data: null, error: null, count: 3 }));
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.getCoachCount('g1');

      expect(result).toBe(3);
    });
  });

  describe('isCoachOfGroup', () => {
    it('should return true if coach is in group', async () => {
      const builder = createMockQueryBuilder({ data: { id: 'gc-1' }, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.isCoachOfGroup('g1', 'c1');

      expect(result).toBe(true);
    });

    it('should return false if coach is not in group', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupCoachService.isCoachOfGroup('g1', 'c99');

      expect(result).toBe(false);
    });
  });

  describe('getCoachProfiles', () => {
    it('should return coach profiles with is_creator flag', async () => {
      const coaches = [
        { id: 'gc-1', group_id: 'g1', coach_id: 'c1', is_creator: true, joined_at: '2024-01-01' },
      ];
      const profiles = [
        { id: 'c1', first_name: 'Thomas', last_name: 'Coach', role: 'coach' },
      ];

      const coachBuilder = createMockQueryBuilder({ data: coaches, error: null });
      const profileBuilder = createMockQueryBuilder({ data: profiles, error: null });

      mockFrom
        .mockReturnValueOnce(coachBuilder)
        .mockReturnValueOnce(profileBuilder);

      const result = await groupCoachService.getCoachProfiles('g1');

      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Thomas');
      expect(result[0].is_creator).toBe(true);
    });

    it('should return empty array if group has no coaches', async () => {
      const coachBuilder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(coachBuilder);

      const result = await groupCoachService.getCoachProfiles('g1');

      expect(result).toEqual([]);
    });
  });
});
