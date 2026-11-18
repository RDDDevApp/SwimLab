import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { soloService } from '../../services/soloService';

describe('soloService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('plans a personal session', async () => {
    const row = { id: 'solo-1', swimmer_id: 's1', workout_id: 'w1', scheduled_date: '2026-11-20' };
    const builder = createMockQueryBuilder({ data: row, error: null });
    mockFrom.mockReturnValue(builder);

    await expect(soloService.planSession('s1', 'w1', '2026-11-20')).resolves.toEqual(row);
    expect(builder.insert).toHaveBeenCalledWith({
      swimmer_id: 's1',
      workout_id: 'w1',
      scheduled_date: '2026-11-20',
    });
  });

  it('lists upcoming sessions with the workout title and distance', async () => {
    const builder = createMockQueryBuilder({
      data: [
        { id: 'solo-1', workouts: { title: 'Endurance', total_distance: 3000 } },
        { id: 'solo-2', workouts: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const result = await soloService.getUpcoming('s1');

    expect(builder.is).toHaveBeenCalledWith('completed_at', null);
    expect(result[0]).toMatchObject({ id: 'solo-1', workoutTitle: 'Endurance', totalDistance: 3000 });
    expect(result[0]).not.toHaveProperty('workouts');
    expect(result[1]).toMatchObject({ workoutTitle: 'Séance', totalDistance: null });
  });

  it('reads only completed sessions for the history', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);
    await soloService.getHistory('s1');
    expect(builder.not).toHaveBeenCalledWith('completed_at', 'is', null);
  });

  it('returns an empty list when the table does not exist yet', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'relation "solo_sessions" does not exist' } }),
    );
    await expect(soloService.getUpcoming('s1')).resolves.toEqual([]);
  });

  describe('completeSession', () => {
    it('refuses an RPE outside 6-20 without calling the database', async () => {
      await expect(soloService.completeSession('solo-1', { rpe_score: 5 })).rejects.toThrow('entre 6 et 20');
      await expect(soloService.completeSession('solo-1', { rpe_score: 21 })).rejects.toThrow('entre 6 et 20');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('marks the session done with its feedback', async () => {
      const builder = createMockQueryBuilder({ data: { id: 'solo-1' }, error: null });
      mockFrom.mockReturnValue(builder);

      await soloService.completeSession('solo-1', { rpe_score: 14, feedback_text: 'Bien' });

      const payload = builder.update.mock.calls[0][0];
      expect(payload).toMatchObject({
        rpe_score: 14,
        feedback_text: 'Bien',
        fatigue_score: null,
        technique_score: null,
      });
      expect(payload.completed_at).toEqual(expect.any(String));
      expect(builder.eq).toHaveBeenCalledWith('id', 'solo-1');
    });
  });

  it('deletes a planned session', async () => {
    const builder = createMockQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);
    await soloService.deleteSession('solo-1');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'solo-1');
  });
});
