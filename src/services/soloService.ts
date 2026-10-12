import { supabase } from '../config/supabase';

export interface SoloSession {
  id: string;
  swimmer_id: string;
  workout_id: string;
  scheduled_date: string;
  completed_at: string | null;
  rpe_score: number | null;
  feedback_text: string | null;
  fatigue_score: number | null;
  technique_score: number | null;
  created_at: string;
}

export interface SoloSessionWithWorkout extends SoloSession {
  workoutTitle: string;
  totalDistance: number | null;
}

/**
 * Mode nageur solo (migration 016) : planification et auto-emargement de
 * seances personnelles, sans club ni creneau. Les lectures renvoient []
 * si la table n'existe pas encore ; les ecritures remontent une erreur
 * explicite.
 */
export const soloService = {
  /** Planifier une seance personnelle a une date */
  async planSession(
    swimmerId: string,
    workoutId: string,
    scheduledDate: string,
  ): Promise<SoloSession> {
    const { data, error } = await (supabase as any)
      .from('solo_sessions')
      .insert({
        swimmer_id: swimmerId,
        workout_id: workoutId,
        scheduled_date: scheduledDate,
      })
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        throw new Error('Fonctionnalité indisponible (migration 016 requise)');
      }
      throw error;
    }
    return data as SoloSession;
  },

  /** Seances planifiees (a venir + non completees passees), avec titre du workout */
  async getUpcoming(swimmerId: string): Promise<SoloSessionWithWorkout[]> {
    const { data, error } = await (supabase as any)
      .from('solo_sessions')
      .select('*, workouts!workout_id(title, total_distance)')
      .eq('swimmer_id', swimmerId)
      .is('completed_at', null)
      .order('scheduled_date', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data as any[]).map(mapWithWorkout);
  },

  /** Historique des seances solo completees */
  async getHistory(swimmerId: string): Promise<SoloSessionWithWorkout[]> {
    const { data, error } = await (supabase as any)
      .from('solo_sessions')
      .select('*, workouts!workout_id(title, total_distance)')
      .eq('swimmer_id', swimmerId)
      .not('completed_at', 'is', null)
      .order('scheduled_date', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data as any[]).map(mapWithWorkout);
  },

  /** Auto-emargement : marquer la seance faite avec feedback */
  async completeSession(
    sessionId: string,
    feedback: {
      rpe_score: number;
      feedback_text?: string;
      fatigue_score?: number | null;
      technique_score?: number | null;
    },
  ): Promise<SoloSession> {
    if (feedback.rpe_score < 6 || feedback.rpe_score > 20) {
      throw new Error('Le score RPE doit être entre 6 et 20');
    }

    const { data, error } = await (supabase as any)
      .from('solo_sessions')
      .update({
        completed_at: new Date().toISOString(),
        rpe_score: feedback.rpe_score,
        feedback_text: feedback.feedback_text ?? null,
        fatigue_score: feedback.fatigue_score ?? null,
        technique_score: feedback.technique_score ?? null,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as SoloSession;
  },

  /** Supprimer une seance planifiee */
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('solo_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },
};

function mapWithWorkout(row: any): SoloSessionWithWorkout {
  const { workouts, ...session } = row;
  return {
    ...session,
    workoutTitle: workouts?.title || 'Séance',
    totalDistance: workouts?.total_distance ?? null,
  };
}

function isMissingTableError(err: any): boolean {
  const msg = typeof err?.message === 'string' ? err.message : '';
  return msg.includes('solo_sessions') || msg.includes('relation') || err?.code === '42P01';
}
