/**
 * Parcours émargement → feedback, de bout en bout côté app :
 * le coach fait l'appel, le nageur présent voit un feedback en attente,
 * l'envoie (avec ou sans la migration 013), puis peut le corriger pendant 24 h.
 * Supabase est simulé : les règles de sécurité (RLS) se vérifient contre la vraie API.
 */
import { createMockQueryBuilder } from '../../__mocks__/supabase';

const mockFrom = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: { from: (...args: any[]) => mockFrom(...args) },
}));

import { workoutSessionService } from '../../services/workoutSessionService';

describe('parcours émargement puis feedback', () => {
  beforeEach(() => jest.clearAllMocks());

  it('le coach fait l’appel : présents, absents et nageur invité', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    await workoutSessionService.bulkCreateAttendance(
      'assign-1',
      ['sophie', 'lucas', 'emma', 'invite'],
      ['sophie', 'emma', 'invite'],
      ['invite'],
    );

    expect(mockFrom).toHaveBeenCalledWith('workout_sessions');
    expect(builder.insert).toHaveBeenCalledWith([
      { workout_assignment_id: 'assign-1', swimmer_id: 'sophie', attended: true, is_guest: false },
      { workout_assignment_id: 'assign-1', swimmer_id: 'lucas', attended: false, is_guest: false },
      { workout_assignment_id: 'assign-1', swimmer_id: 'emma', attended: true, is_guest: false },
      { workout_assignment_id: 'assign-1', swimmer_id: 'invite', attended: true, is_guest: true },
    ]);
  });

  it('le nageur présent voit son feedback en attente, avec le titre de la séance', async () => {
    const builder = createMockQueryBuilder({
      data: [
        {
          id: 'sess-1',
          workout_assignments: { scheduled_date: '2026-11-17', workouts: { title: 'Pyramide' } },
        },
        { id: 'sess-2', workout_assignments: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const pending = await workoutSessionService.getPendingFeedback('sophie');

    // Seulement les séances où il était présent et sans feedback
    expect(builder.eq).toHaveBeenCalledWith('swimmer_id', 'sophie');
    expect(builder.eq).toHaveBeenCalledWith('attended', true);
    expect(builder.is).toHaveBeenCalledWith('completed_at', null);
    expect(pending).toEqual([
      { sessionId: 'sess-1', workoutTitle: 'Pyramide', scheduledDate: '2026-11-17' },
      { sessionId: 'sess-2', workoutTitle: 'Séance', scheduledDate: '' },
    ]);
  });

  it('le nageur envoie son ressenti complet (RPE, texte, fatigue, technique)', async () => {
    const builder = createMockQueryBuilder({ data: { id: 'sess-1' }, error: null });
    mockFrom.mockReturnValue(builder);

    await workoutSessionService.submitFeedback('sess-1', {
      rpe_score: 15,
      feedback_text: 'Dur sur la fin',
      fatigue_score: 4,
      technique_score: 3,
    });

    const payload = builder.update.mock.calls[0][0];
    expect(payload).toMatchObject({
      rpe_score: 15,
      feedback_text: 'Dur sur la fin',
      fatigue_score: 4,
      technique_score: 3,
    });
    expect(payload.completed_at).toEqual(expect.any(String));
    expect(builder.eq).toHaveBeenCalledWith('id', 'sess-1');
  });

  it('sans la migration 013, le feedback part quand même, sans fatigue ni technique', async () => {
    const failing = createMockQueryBuilder({
      data: null,
      error: { message: 'column "fatigue_score" does not exist' },
    });
    const retry = createMockQueryBuilder({ data: { id: 'sess-1', rpe_score: 12 }, error: null });
    mockFrom.mockReturnValueOnce(failing).mockReturnValueOnce(retry);

    const result = await workoutSessionService.submitFeedback('sess-1', {
      rpe_score: 12,
      fatigue_score: 2,
      technique_score: 5,
    });

    expect(result.rpe_score).toBe(12);
    const retryPayload = retry.update.mock.calls[0][0];
    expect(retryPayload).not.toHaveProperty('fatigue_score');
    expect(retryPayload).not.toHaveProperty('technique_score');
    expect(retryPayload.rpe_score).toBe(12);
  });

  it('une autre erreur n’est pas masquée par le second essai', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({ data: null, error: { message: 'permission denied' } }),
    );
    await expect(workoutSessionService.submitFeedback('sess-1', { rpe_score: 12 })).rejects.toEqual({
      message: 'permission denied',
    });
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('le nageur corrige son ressenti dans les 24 h, mais plus après', async () => {
    const recent = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const old = new Date(Date.now() - 30 * 3600 * 1000).toISOString();

    const read = createMockQueryBuilder({ data: { completed_at: recent }, error: null });
    const write = createMockQueryBuilder({ data: { id: 'sess-1', rpe_score: 13 }, error: null });
    mockFrom.mockReturnValueOnce(read).mockReturnValueOnce(write);
    await expect(
      workoutSessionService.updateFeedback('sess-1', { rpe_score: 13 }),
    ).resolves.toMatchObject({ rpe_score: 13 });

    mockFrom.mockReturnValueOnce(createMockQueryBuilder({ data: { completed_at: old }, error: null }));
    await expect(workoutSessionService.updateFeedback('sess-1', { rpe_score: 13 })).rejects.toThrow(
      '24 h',
    );
  });
});
