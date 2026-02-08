import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { profileService } from '../../services/profileService';

describe('profileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return a profile by user ID', async () => {
      const profile = {
        id: 'u1',
        first_name: 'Jean',
        last_name: 'Dupont',
        role: 'coach',
      };
      const builder = createMockQueryBuilder({ data: profile, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await profileService.getById('u1');

      expect(result).toEqual(profile);
      expect(builder.eq).toHaveBeenCalledWith('id', 'u1');
      expect(builder.single).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const updated = { id: 'u1', first_name: 'Pierre' };
      const builder = createMockQueryBuilder({ data: updated, error: null });
      mockFrom.mockReturnValue(builder);

      const result = await profileService.update('u1', { first_name: 'Pierre' });

      expect(result).toEqual(updated);
      expect(builder.update).toHaveBeenCalledWith({ first_name: 'Pierre' });
    });
  });

  describe('getSwimmersByClub', () => {
    it('should return swimmer profiles for a club', async () => {
      const members = [{ user_id: 'u1' }, { user_id: 'u2' }];
      const profiles = [
        { id: 'u1', first_name: 'Alice', role: 'swimmer' },
        { id: 'u2', first_name: 'Bob', role: 'swimmer' },
      ];

      const memberBuilder = createMockQueryBuilder({ data: members, error: null });
      const profileBuilder = createMockQueryBuilder({ data: profiles, error: null });

      mockFrom
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(profileBuilder);

      const result = await profileService.getSwimmersByClub('club-1');

      expect(result).toHaveLength(2);
      expect(memberBuilder.eq).toHaveBeenCalledWith('role', 'swimmer');
    });

    it('should return empty array if no swimmers in club', async () => {
      const memberBuilder = createMockQueryBuilder({ data: [], error: null });
      mockFrom.mockReturnValue(memberBuilder);

      const result = await profileService.getSwimmersByClub('club-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCoachesByClub', () => {
    it('should return coach profiles for a club', async () => {
      const members = [{ user_id: 'u1' }];
      const profiles = [{ id: 'u1', first_name: 'Coach', role: 'coach' }];

      const memberBuilder = createMockQueryBuilder({ data: members, error: null });
      const profileBuilder = createMockQueryBuilder({ data: profiles, error: null });

      mockFrom
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(profileBuilder);

      const result = await profileService.getCoachesByClub('club-1');

      expect(result).toHaveLength(1);
      expect(memberBuilder.eq).toHaveBeenCalledWith('role', 'coach');
    });
  });
});
