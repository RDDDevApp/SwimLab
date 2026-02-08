import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { groupService } from '../../services/groupService';

describe('groupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a group', async () => {
      const mockGroup = {
        id: 'group-1',
        club_id: 'club-1',
        coach_id: 'coach-1',
        name: 'Poussins',
        level: 'beginner',
      };
      const builder = createMockQueryBuilder({ data: mockGroup, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupService.create({
        club_id: 'club-1',
        coach_id: 'coach-1',
        name: 'Poussins',
        level: 'beginner',
      });

      expect(result).toEqual(mockGroup);
      expect(builder.insert).toHaveBeenCalled();
    });
  });

  describe('getByClub', () => {
    it('should return groups ordered by name', async () => {
      const groups = [
        { id: 'g1', name: 'Avenir' },
        { id: 'g2', name: 'Poussins' },
      ];
      const builder = createMockQueryBuilder({ data: groups, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupService.getByClub('club-1');

      expect(result).toEqual(groups);
      expect(builder.eq).toHaveBeenCalledWith('club_id', 'club-1');
      expect(builder.order).toHaveBeenCalledWith('name');
    });
  });

  describe('getByCoach', () => {
    it('should return groups for a coach', async () => {
      const groups = [{ id: 'g1', name: 'Compet', coach_id: 'coach-1' }];
      const builder = createMockQueryBuilder({ data: groups, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupService.getByCoach('coach-1');

      expect(result).toEqual(groups);
      expect(builder.eq).toHaveBeenCalledWith('coach_id', 'coach-1');
    });
  });

  describe('getBySwimmer', () => {
    it('should return groups a swimmer belongs to', async () => {
      const memberships = [{ group_id: 'g1' }];
      const groups = [{ id: 'g1', name: 'Mon Groupe' }];

      const memberBuilder = createMockQueryBuilder({ data: memberships, error: null });
      const groupBuilder = createMockQueryBuilder({ data: groups, error: null });

      mockFrom
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(groupBuilder);

      const result = await groupService.getBySwimmer('swimmer-1');

      expect(result).toEqual(groups);
    });

    it('should return empty array if swimmer has no groups', async () => {
      const memberBuilder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(memberBuilder);

      const result = await groupService.getBySwimmer('swimmer-1');

      expect(result).toEqual([]);
    });
  });

  describe('addMember', () => {
    it('should add a swimmer to a group', async () => {
      const mockMember = { id: 'gm-1', group_id: 'g1', user_id: 'u1' };
      const builder = createMockQueryBuilder({ data: mockMember, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupService.addMember('g1', 'u1');

      expect(result).toEqual(mockMember);
      expect(builder.insert).toHaveBeenCalledWith({ group_id: 'g1', user_id: 'u1' });
    });
  });

  describe('removeMember', () => {
    it('should remove a swimmer from a group', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(groupService.removeMember('g1', 'u1')).resolves.toBeUndefined();
    });
  });

  describe('getMembers', () => {
    it('should return member profiles', async () => {
      const memberships = [{ user_id: 'u1' }, { user_id: 'u2' }];
      const profiles = [
        { id: 'u1', first_name: 'Alice', last_name: 'Dupont' },
        { id: 'u2', first_name: 'Bob', last_name: 'Martin' },
      ];

      const memberBuilder = createMockQueryBuilder({ data: memberships, error: null });
      const profileBuilder = createMockQueryBuilder({ data: profiles, error: null });

      mockFrom
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(profileBuilder);

      const result = await groupService.getMembers('g1');

      expect(result).toHaveLength(2);
    });

    it('should return empty array if group has no members', async () => {
      const memberBuilder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(memberBuilder);

      const result = await groupService.getMembers('g1');

      expect(result).toEqual([]);
    });
  });

  describe('getMemberCount', () => {
    it('should return member count', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null, count: 5 });
      // Override the then to also return count
      builder.then = jest.fn((resolve: any) => resolve({ data: null, error: null, count: 5 }));
      mockFrom.mockReturnValue(builder);

      const result = await groupService.getMemberCount('g1');

      expect(result).toBe(5);
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const updated = { id: 'g1', name: 'Nouveau Nom' };
      const builder = createMockQueryBuilder({ data: updated, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await groupService.update('g1', { name: 'Nouveau Nom' });

      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a group', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(groupService.delete('g1')).resolves.toBeUndefined();
    });
  });
});
