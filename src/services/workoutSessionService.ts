import { supabase } from '../config/supabase';
import { WorkoutSession } from '../types';

type SessionInsert = {
  workout_assignment_id: string;
  swimmer_id: string;
  attended?: boolean;
  is_guest?: boolean;
};

type FeedbackData = {
  rpe_score: number;
  feedback_text?: string;
  /** Fatigue musculaire 1-5 (optionnel, migration 013) */
  fatigue_score?: number | null;
  /** Sensation technique 1-5 (optionnel, migration 013) */
  technique_score?: number | null;
};

/** Payload d'update feedback ; retire les champs v2 si la migration 013 n'est pas appliquee */
function buildFeedbackPayload(feedback: FeedbackData, includeV2: boolean) {
  const payload: Record<string, unknown> = {
    rpe_score: feedback.rpe_score,
    feedback_text: feedback.feedback_text ?? null,
    completed_at: new Date().toISOString(),
  };
  if (includeV2) {
    if (feedback.fatigue_score !== undefined) payload.fatigue_score = feedback.fatigue_score;
    if (feedback.technique_score !== undefined) payload.technique_score = feedback.technique_score;
  }
  return payload;
}

function isMissingColumnError(err: any): boolean {
  return typeof err?.message === 'string' && err.message.includes('column');
}

export interface SessionWithProfile extends WorkoutSession {
  swimmer_name?: string;
}

export interface GroupFeedbackStats {
  total_swimmers: number;
  attended_count: number;
  average_rpe: number | null;
  rpe_distribution: Record<number, number>;
}

export interface SwimmerHistoryEntry {
  sessionId: string;
  assignmentId: string;
  scheduledDate: string;
  attended: boolean;
  rpeScore: number | null;
  feedbackText: string | null;
  workoutId: string;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
}

export const workoutSessionService = {
  /** Create a workout session (when marking attendance) */
  async create(data: SessionInsert): Promise<WorkoutSession> {
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return session;
  },

  /** Bulk create sessions for attendance (coach marks multiple swimmers + optional guests) */
  async bulkCreateAttendance(
    assignmentId: string,
    swimmerIds: string[],
    attendedIds: string[],
    guestIds: string[] = [],
  ): Promise<WorkoutSession[]> {
    const sessions = swimmerIds.map((swimmerId) => ({
      workout_assignment_id: assignmentId,
      swimmer_id: swimmerId,
      attended: attendedIds.includes(swimmerId),
      is_guest: guestIds.includes(swimmerId),
    }));

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(sessions)
      .select();

    if (error) throw error;
    return data;
  },

  /** Get a session by ID */
  async getById(sessionId: string): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Sessions de plusieurs assignments en une requete (anti N+1) */
  async getByAssignments(assignmentIds: string[]): Promise<WorkoutSession[]> {
    if (!assignmentIds.length) return [];

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .in('workout_assignment_id', assignmentIds);

    if (error) throw error;
    return data;
  },

  /** Activite recente des groupes d'un coach : derniers feedbacks recus.
   *  1 requete via embeds (sessions -> profiles + assignments -> workouts/slots),
   *  filtree par groupe via !inner join. */
  async getRecentActivityByGroups(
    groupIds: string[],
    limit = 10,
  ): Promise<
    {
      sessionId: string;
      swimmerName: string;
      rpeScore: number | null;
      feedbackText: string | null;
      workoutTitle: string;
      scheduledDate: string;
      completedAt: string;
    }[]
  > {
    if (!groupIds.length) return [];

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        'id, rpe_score, feedback_text, completed_at, profiles!swimmer_id(first_name, last_name), workout_assignments!inner(scheduled_date, workouts!workout_id(title), training_slots!inner(group_id))',
      )
      .in('workout_assignments.training_slots.group_id', groupIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as any[]).map((s) => ({
      sessionId: s.id,
      swimmerName: s.profiles
        ? `${s.profiles.first_name || ''} ${s.profiles.last_name || ''}`.trim()
        : 'Nageur',
      rpeScore: s.rpe_score,
      feedbackText: s.feedback_text,
      workoutTitle: s.workout_assignments?.workouts?.title || 'Seance',
      scheduledDate: s.workout_assignments?.scheduled_date || '',
      completedAt: s.completed_at,
    }));
  },

  /** Feedbacks RPE des groupes d'un coach sur une fenetre glissante
   *  (pour les alertes de surcharge). 1 requete via embeds + !inner. */
  async getRpeWindowByGroups(
    groupIds: string[],
    sinceDate: string,
  ): Promise<
    { swimmerId: string; swimmerName: string; rpeScore: number; scheduledDate: string }[]
  > {
    if (!groupIds.length) return [];

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        'swimmer_id, rpe_score, profiles!swimmer_id(first_name, last_name), workout_assignments!inner(scheduled_date, training_slots!inner(group_id))',
      )
      .in('workout_assignments.training_slots.group_id', groupIds)
      .gte('workout_assignments.scheduled_date', sinceDate)
      .not('rpe_score', 'is', null);

    if (error) throw error;

    return (data as any[]).map((s) => ({
      swimmerId: s.swimmer_id,
      swimmerName: s.profiles
        ? `${s.profiles.first_name || ''} ${s.profiles.last_name || ''}`.trim()
        : 'Nageur',
      rpeScore: s.rpe_score,
      scheduledDate: s.workout_assignments?.scheduled_date || '',
    }));
  },

  /** Get all sessions for a workout assignment */
  async getByAssignment(assignmentId: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('workout_assignment_id', assignmentId);

    if (error) throw error;
    return data;
  },

  /** Sessions d'un assignment avec le nom du nageur (embed profiles, 1 requete) */
  async getByAssignmentWithNames(assignmentId: string): Promise<SessionWithProfile[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, profiles!swimmer_id(first_name, last_name)')
      .eq('workout_assignment_id', assignmentId);

    if (error) throw error;

    return (data as any[]).map((s) => {
      const { profiles, ...session } = s;
      return {
        ...session,
        swimmer_name: profiles
          ? `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim()
          : undefined,
      };
    });
  },

  /** Get all sessions for a swimmer */
  async getBySwimmer(swimmerId: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('swimmer_id', swimmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Submit feedback (swimmer submits RPE + text + auto-evaluations v2) */
  async submitFeedback(
    sessionId: string,
    feedback: FeedbackData,
  ): Promise<WorkoutSession> {
    if (feedback.rpe_score < 6 || feedback.rpe_score > 20) {
      throw new Error('Le score RPE doit etre entre 6 et 20');
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update(buildFeedbackPayload(feedback, true) as any)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      // Migration 013 non appliquee : reessayer sans les champs v2
      if (isMissingColumnError(error)) {
        const { data: retryData, error: retryError } = await supabase
          .from('workout_sessions')
          .update(buildFeedbackPayload(feedback, false) as any)
          .eq('id', sessionId)
          .select()
          .single();
        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }
    return data;
  },

  /** Update feedback (swimmer can edit within 24h of submission) */
  async updateFeedback(
    sessionId: string,
    feedback: FeedbackData,
  ): Promise<WorkoutSession> {
    if (feedback.rpe_score < 6 || feedback.rpe_score > 20) {
      throw new Error('Le score RPE doit etre entre 6 et 20');
    }

    // Check if feedback was submitted less than 24h ago
    const { data: session, error: getErr } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('id', sessionId)
      .single();

    if (getErr) throw getErr;

    if (session.completed_at) {
      const completedAt = new Date(session.completed_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        throw new Error('La modification du feedback est limitee a 24h apres envoi');
      }
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update(buildFeedbackPayload(feedback, true) as any)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      if (isMissingColumnError(error)) {
        const { data: retryData, error: retryError } = await supabase
          .from('workout_sessions')
          .update(buildFeedbackPayload(feedback, false) as any)
          .eq('id', sessionId)
          .select()
          .single();
        if (retryError) throw retryError;
        return retryData;
      }
      throw error;
    }
    return data;
  },

  /** Get average RPE for multiple assignments (batch) */
  async getAverageRpeByAssignments(
    assignmentIds: string[],
  ): Promise<Record<string, number | null>> {
    if (!assignmentIds.length) return {};

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('workout_assignment_id, rpe_score')
      .in('workout_assignment_id', assignmentIds)
      .not('rpe_score', 'is', null);

    if (error) throw error;

    const result: Record<string, number | null> = {};
    const grouped: Record<string, number[]> = {};

    for (const s of sessions) {
      const aid = s.workout_assignment_id;
      if (!grouped[aid]) grouped[aid] = [];
      grouped[aid].push(s.rpe_score as number);
    }

    for (const id of assignmentIds) {
      const scores = grouped[id];
      result[id] = scores?.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
    }

    return result;
  },

  /** Get feedback stats for an assignment (coach view) */
  async getFeedbackStats(assignmentId: string): Promise<GroupFeedbackStats> {
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('workout_assignment_id', assignmentId);

    if (error) throw error;

    const attendedSessions = sessions.filter((s) => s.attended);
    const rpeScores = sessions
      .filter((s) => s.rpe_score !== null)
      .map((s) => s.rpe_score as number);

    const rpeDistribution: Record<number, number> = {};
    for (const score of rpeScores) {
      rpeDistribution[score] = (rpeDistribution[score] || 0) + 1;
    }

    return {
      total_swimmers: sessions.length,
      attended_count: attendedSessions.length,
      average_rpe: rpeScores.length
        ? rpeScores.reduce((a, b) => a + b, 0) / rpeScores.length
        : null,
      rpe_distribution: rpeDistribution,
    };
  },

  /** Get pending feedback sessions (attended but no feedback yet) with workout info.
   *  1 seule requete via embeds PostgREST (sessions -> assignments -> workouts). */
  async getPendingFeedback(
    swimmerId: string,
  ): Promise<{ sessionId: string; workoutTitle: string; scheduledDate: string }[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        'id, workout_assignments!workout_assignment_id(scheduled_date, workouts!workout_id(title))',
      )
      .eq('swimmer_id', swimmerId)
      .eq('attended', true)
      .is('completed_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data as any[]).map((s) => ({
      sessionId: s.id,
      workoutTitle: s.workout_assignments?.workouts?.title || 'Seance',
      scheduledDate: s.workout_assignments?.scheduled_date || '',
    }));
  },

  /** Get swimmer attendance stats */
  async getSwimmerStats(
    swimmerId: string,
  ): Promise<{ total: number; attended: number; averageRpe: number | null }> {
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('swimmer_id', swimmerId);

    if (error) throw error;

    const attended = sessions.filter((s) => s.attended).length;
    const rpeScores = sessions
      .filter((s) => s.rpe_score !== null)
      .map((s) => s.rpe_score as number);

    return {
      total: sessions.length,
      attended,
      averageRpe: rpeScores.length
        ? rpeScores.reduce((a, b) => a + b, 0) / rpeScores.length
        : null,
    };
  },

  /** Get swimmer full history with workout details (for stats & history screens).
   *  1 seule requete via embeds PostgREST (sessions -> assignments -> workouts). */
  async getSwimmerHistory(
    swimmerId: string,
  ): Promise<SwimmerHistoryEntry[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        '*, workout_assignments!workout_assignment_id(id, scheduled_date, workout_id, workouts!workout_id(id, title, type, total_distance))',
      )
      .eq('swimmer_id', swimmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as any[]).map((s) => {
      const a = s.workout_assignments;
      const w = a?.workouts;
      return {
        sessionId: s.id,
        assignmentId: s.workout_assignment_id,
        scheduledDate: a?.scheduled_date || '',
        attended: s.attended,
        rpeScore: s.rpe_score,
        feedbackText: s.feedback_text,
        workoutId: a?.workout_id || '',
        workoutTitle: w?.title || 'Seance',
        workoutType: w?.type || 'other',
        totalDistance: w?.total_distance || null,
      };
    });
  },
};
