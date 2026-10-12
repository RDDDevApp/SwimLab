import { supabase } from '../config/supabase';

export type PresenceStatus = 'present' | 'absent';

export interface SessionPresence {
  id: string;
  workout_assignment_id: string;
  swimmer_id: string;
  status: PresenceStatus;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Presence declaree (migration 014) : le nageur annonce a l'avance
 * s'il sera present ou absent a une seance. Le coach lit les declarations
 * et l'emargement se pre-remplit.
 *
 * Toutes les methodes echouent proprement si la table n'existe pas encore
 * (migration non appliquee) : les lectures renvoient [] et les ecritures
 * remontent une erreur explicite.
 */
export const presenceService = {
  /** Declarer (ou modifier) sa presence pour une seance */
  async declare(
    assignmentId: string,
    swimmerId: string,
    status: PresenceStatus,
    reason?: string,
  ): Promise<SessionPresence> {
    const { data, error } = await (supabase as any)
      .from('session_presence')
      .upsert(
        {
          workout_assignment_id: assignmentId,
          swimmer_id: swimmerId,
          status,
          reason: reason?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'workout_assignment_id,swimmer_id' },
      )
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        throw new Error('Fonctionnalité indisponible (migration 014 requise)');
      }
      throw error;
    }
    return data as SessionPresence;
  },

  /** Declarations du nageur pour une liste d'assignments */
  async getBySwimmer(
    swimmerId: string,
    assignmentIds: string[],
  ): Promise<SessionPresence[]> {
    if (!assignmentIds.length) return [];

    const { data, error } = await (supabase as any)
      .from('session_presence')
      .select('*')
      .eq('swimmer_id', swimmerId)
      .in('workout_assignment_id', assignmentIds);

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []) as SessionPresence[];
  },

  /** Toutes les declarations d'un assignment (vue coach / emargement) */
  async getByAssignment(assignmentId: string): Promise<SessionPresence[]> {
    const { data, error } = await (supabase as any)
      .from('session_presence')
      .select('*')
      .eq('workout_assignment_id', assignmentId);

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data || []) as SessionPresence[];
  },
};

function isMissingTableError(err: any): boolean {
  const msg = typeof err?.message === 'string' ? err.message : '';
  return msg.includes('session_presence') || msg.includes('relation') || err?.code === '42P01';
}
