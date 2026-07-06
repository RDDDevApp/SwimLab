import { supabase } from '../config/supabase';
import { WorkoutBlock, WorkoutContent } from '../types';

export interface GenerateWorkoutParams {
  objective: 'endurance' | 'sprint' | 'technique' | 'recovery';
  level: 'debutant' | 'intermediaire' | 'avance';
  minutes: number;
  poolLength: 25 | 50;
  notes?: string;
}

export interface GeneratedWorkout {
  title: string;
  description: string;
  content: WorkoutContent;
  totalDistance: number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Generation de seances par IA via l'Edge Function `generate-workout`
 * (qui porte la cle Anthropic cote serveur — jamais dans l'app).
 */
export const aiService = {
  async generateWorkout(params: GenerateWorkoutParams): Promise<GeneratedWorkout> {
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: params,
    });

    if (error) {
      throw new Error(
        "Generation indisponible — l'Edge Function generate-workout n'est pas deployee ou a echoue",
      );
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    if (!Array.isArray(data?.blocks) || data.blocks.length === 0) {
      throw new Error('Reponse IA invalide');
    }

    // Ajouter les ids client attendus par l'editeur
    const blocks: WorkoutBlock[] = data.blocks.map((b: any) => ({
      id: generateId(),
      type: b.type,
      name: b.name,
      sub_blocks: (b.sub_blocks || []).map((sb: any) => ({
        id: generateId(),
        distance: sb.distance,
        repetitions: sb.repetitions,
        description: sb.description,
        departure: sb.departure,
      })),
    }));

    const totalDistance = blocks.reduce(
      (sum, block) =>
        sum + block.sub_blocks.reduce((s, sb) => s + sb.distance * sb.repetitions, 0),
      0,
    );

    return {
      title: data.title,
      description: data.description,
      content: { blocks },
      totalDistance,
    };
  },
};
