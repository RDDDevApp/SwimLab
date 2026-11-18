import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { blockLibraryService } from '../../services/blockLibraryService';

const block = {
  id: 'b1',
  club_id: 'club-1',
  name: 'Pyramide',
  type: 'main',
  content: [{ id: 'sb1', distance: 100, repetitions: 4 }],
  total_distance: 400,
};

describe('blockLibraryService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists the club blocks sorted by name', async () => {
    const builder = createMockQueryBuilder({ data: [block], error: null });
    mockFrom.mockReturnValue(builder);

    await expect(blockLibraryService.getByClub('club-1')).resolves.toEqual([block]);
    expect(mockFrom).toHaveBeenCalledWith('block_library');
    expect(builder.eq).toHaveBeenCalledWith('club_id', 'club-1');
    expect(builder.order).toHaveBeenCalledWith('name', { ascending: true });
  });

  it('creates, updates and deletes a block', async () => {
    const builder = createMockQueryBuilder({ data: block, error: null });
    mockFrom.mockReturnValue(builder);

    await expect(blockLibraryService.create(block as any)).resolves.toEqual(block);
    expect(builder.insert).toHaveBeenCalledWith(block);

    await blockLibraryService.update('b1', { name: 'Pyramide 2' });
    expect(builder.update).toHaveBeenCalledWith({ name: 'Pyramide 2' });
    expect(builder.eq).toHaveBeenCalledWith('id', 'b1');

    await blockLibraryService.delete('b1');
    expect(builder.delete).toHaveBeenCalled();
  });

  it('throws the database error', async () => {
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: { message: 'denied' } }));
    await expect(blockLibraryService.getByClub('club-1')).rejects.toEqual({ message: 'denied' });
  });
});
