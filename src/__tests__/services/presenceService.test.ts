import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { presenceService } from '../../services/presenceService';

const missingTable = { message: 'relation "session_presence" does not exist', code: '42P01' };

describe('presenceService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('declare', () => {
    it('upserts one declaration per swimmer and session, with a trimmed reason', async () => {
      const row = { id: 'p1', status: 'absent', reason: 'Malade' };
      const builder = createMockQueryBuilder({ data: row, error: null });
      mockFrom.mockReturnValue(builder);

      await expect(presenceService.declare('a1', 's1', 'absent', '  Malade ')).resolves.toEqual(row);

      const [payload, options] = builder.upsert.mock.calls[0];
      expect(options).toEqual({ onConflict: 'workout_assignment_id,swimmer_id' });
      expect(payload).toMatchObject({
        workout_assignment_id: 'a1',
        swimmer_id: 's1',
        status: 'absent',
        reason: 'Malade',
      });
    });

    it('stores no reason when it is empty', async () => {
      const builder = createMockQueryBuilder({ data: {}, error: null });
      mockFrom.mockReturnValue(builder);
      await presenceService.declare('a1', 's1', 'present', '   ');
      expect(builder.upsert.mock.calls[0][0].reason).toBeNull();
    });

    it('explains that the migration is missing', async () => {
      mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: missingTable }));
      await expect(presenceService.declare('a1', 's1', 'present')).rejects.toThrow('migration 014');
    });
  });

  describe('reads', () => {
    it('makes no request without sessions', async () => {
      await expect(presenceService.getBySwimmer('s1', [])).resolves.toEqual([]);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('reads the swimmer declarations for the given sessions', async () => {
      const builder = createMockQueryBuilder({ data: [{ id: 'p1' }], error: null });
      mockFrom.mockReturnValue(builder);

      await expect(presenceService.getBySwimmer('s1', ['a1', 'a2'])).resolves.toEqual([{ id: 'p1' }]);
      expect(builder.eq).toHaveBeenCalledWith('swimmer_id', 's1');
      expect(builder.in).toHaveBeenCalledWith('workout_assignment_id', ['a1', 'a2']);
    });

    it('returns an empty list when the table does not exist yet', async () => {
      mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: missingTable }));
      await expect(presenceService.getByAssignment('a1')).resolves.toEqual([]);
    });

    it('throws other errors', async () => {
      mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: { message: 'timeout' } }));
      await expect(presenceService.getByAssignment('a1')).rejects.toEqual({ message: 'timeout' });
    });
  });
});
