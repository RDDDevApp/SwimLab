import { createMockQueryBuilder } from '../../__mocks__/supabase';

// Mock supabase before importing the service
const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { clubService } from '../../services/clubService';

describe('clubService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a club and add the owner as coach member', async () => {
      const mockClub = {
        id: 'club-1',
        name: 'Dauphins FC',
        owner_id: 'user-1',
        invitation_code: 'ABC12345',
        description: null,
        logo_url: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };

      // First call: insert club
      const clubBuilder = createMockQueryBuilder({ data: mockClub, error: null });
      // Second call: insert club_member
      const memberBuilder = createMockQueryBuilder({ data: { id: 'member-1' }, error: null });

      mockFrom
        .mockReturnValueOnce(clubBuilder)
        .mockReturnValueOnce(memberBuilder);

      const result = await clubService.create({
        name: 'Dauphins FC',
        owner_id: 'user-1',
      });

      expect(result).toEqual(mockClub);
      expect(mockFrom).toHaveBeenCalledWith('clubs');
      expect(mockFrom).toHaveBeenCalledWith('club_members');
      expect(clubBuilder.insert).toHaveBeenCalledWith({
        name: 'Dauphins FC',
        owner_id: 'user-1',
      });
    });

    it('should throw if club creation fails', async () => {
      const builder = createMockQueryBuilder({
        data: null,
        error: { message: 'DB error' },
      });
      mockFrom.mockReturnValue(builder);

      await expect(
        clubService.create({ name: 'Test', owner_id: 'user-1' }),
      ).rejects.toEqual({ message: 'DB error' });
    });
  });

  describe('getById', () => {
    it('should return a club by ID', async () => {
      const mockClub = { id: 'club-1', name: 'Test Club' };
      const builder = createMockQueryBuilder({ data: mockClub, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await clubService.getById('club-1');

      expect(result).toEqual(mockClub);
      expect(builder.eq).toHaveBeenCalledWith('id', 'club-1');
      expect(builder.single).toHaveBeenCalled();
    });
  });

  describe('getByUser', () => {
    it('should return clubs for a user', async () => {
      const memberships = [{ club_id: 'club-1' }, { club_id: 'club-2' }];
      const clubs = [
        { id: 'club-1', name: 'Club A' },
        { id: 'club-2', name: 'Club B' },
      ];

      const memberBuilder = createMockQueryBuilder({ data: memberships, error: null });
      const clubBuilder = createMockQueryBuilder({ data: clubs, error: null });

      mockFrom
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(clubBuilder);

      const result = await clubService.getByUser('user-1');

      expect(result).toEqual(clubs);
      expect(mockFrom).toHaveBeenCalledWith('club_members');
      expect(mockFrom).toHaveBeenCalledWith('clubs');
    });

    it('should return empty array if user has no memberships', async () => {
      const memberBuilder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(memberBuilder);

      const result = await clubService.getByUser('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('joinByCode', () => {
    it('should join a club with a valid invitation code', async () => {
      const mockClub = { id: 'club-1', name: 'Test', invitation_code: 'CODE123' };

      const findBuilder = createMockQueryBuilder({ data: mockClub, error: null });
      const checkBuilder = createMockQueryBuilder({ data: null, error: null });
      const joinBuilder = createMockQueryBuilder({ data: { id: 'member-1' }, error: null });

      mockFrom
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(checkBuilder)
        .mockReturnValueOnce(joinBuilder);

      const result = await clubService.joinByCode('CODE123', 'user-1', 'swimmer');

      expect(result).toEqual(mockClub);
    });

    it('should throw for invalid invitation code', async () => {
      const builder = createMockQueryBuilder({
        data: null,
        error: { message: 'Not found' },
      });
      mockFrom.mockReturnValue(builder);

      await expect(
        clubService.joinByCode('INVALID', 'user-1', 'swimmer'),
      ).rejects.toThrow('Code d\'invitation invalide');
    });
  });

  describe('update', () => {
    it('should update a club', async () => {
      const updatedClub = { id: 'club-1', name: 'New Name' };
      const builder = createMockQueryBuilder({ data: updatedClub, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await clubService.update('club-1', { name: 'New Name' });

      expect(result).toEqual(updatedClub);
      expect(builder.update).toHaveBeenCalledWith({ name: 'New Name' });
    });
  });

  describe('delete', () => {
    it('should delete a club', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(clubService.delete('club-1')).resolves.toBeUndefined();
      expect(builder.delete).toHaveBeenCalled();
    });
  });

  describe('getMembers', () => {
    it('should return club members', async () => {
      const members = [
        { id: 'm1', club_id: 'club-1', user_id: 'u1', role: 'coach' },
        { id: 'm2', club_id: 'club-1', user_id: 'u2', role: 'swimmer' },
      ];
      const builder = createMockQueryBuilder({ data: members, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await clubService.getMembers('club-1');

      expect(result).toHaveLength(2);
      expect(builder.eq).toHaveBeenCalledWith('club_id', 'club-1');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the club', async () => {
      const builder = createMockQueryBuilder({ data: null, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(
        clubService.removeMember('club-1', 'user-1'),
      ).resolves.toBeUndefined();
      expect(builder.eq).toHaveBeenCalledWith('club_id', 'club-1');
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });
});
