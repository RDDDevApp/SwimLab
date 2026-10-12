const mockInvoke = jest.fn();
jest.mock('../../config/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: any[]) => mockInvoke(...args) },
  },
}));

import { aiService } from '../../services/aiService';

const params = {
  objective: 'endurance' as const,
  level: 'intermediaire' as const,
  minutes: 60,
  poolLength: 25 as const,
};

describe('aiService.generateWorkout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls the generate-workout function and adds client ids', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        title: 'Endurance',
        description: 'Séance continue',
        blocks: [
          { type: 'warmup', name: 'Échauffement', sub_blocks: [{ distance: 200, repetitions: 2 }] },
          { type: 'main', name: 'Corps', sub_blocks: [{ distance: 100, repetitions: 10, departure: "1'45" }] },
        ],
      },
      error: null,
    });

    const result = await aiService.generateWorkout(params);

    expect(mockInvoke).toHaveBeenCalledWith('generate-workout', { body: params });
    expect(result.title).toBe('Endurance');
    expect(result.totalDistance).toBe(1400);
    expect(result.content.blocks).toHaveLength(2);
    expect(result.content.blocks[0].id).toEqual(expect.any(String));
    expect(result.content.blocks[1].sub_blocks[0].id).toEqual(expect.any(String));
  });

  it('shows the message sent by the function (daily limit, invalid params)', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: {
        context: {
          json: () => Promise.resolve({ error: 'Tu as atteint la limite de 10 séances générées par jour. Réessaie demain.' }),
        },
      },
    });

    await expect(aiService.generateWorkout(params)).rejects.toThrow(
      'Tu as atteint la limite de 10 séances générées par jour. Réessaie demain.',
    );
  });

  it('falls back to a generic message when the function is unreachable', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Failed to send a request' } });

    await expect(aiService.generateWorkout(params)).rejects.toThrow(
      "La génération par IA n'est pas encore disponible. Réessaie plus tard.",
    );
  });

  it('rejects an empty workout', async () => {
    mockInvoke.mockResolvedValue({ data: { title: 'Vide', blocks: [] }, error: null });

    await expect(aiService.generateWorkout(params)).rejects.toThrow('Réponse IA invalide');
  });
});
