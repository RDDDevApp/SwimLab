import { supabase } from '../config/supabase';
import { WorkoutSession } from '../types';

type SessionInsert = {
  workout_assignment_id: string;
  swimmer_id: string;
  attended?: boolean;
};

type FeedbackData = {
  rpe_score: number;
  feedback_text?: string;
};

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

  /** Bulk create sessions for attendance (coach marks multiple swimmers) */
  async bulkCreateAttendance(
    assignmentId: string,
    swimmerIds: string[],
    attendedIds: string[],
  ): Promise<WorkoutSession[]> {
    const sessions = swimmerIds.map((swimmerId) => ({
      workout_assignment_id: assignmentId,
      swimmer_id: swimmerId,
      attended: attendedIds.includes(swimmerId),
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

  /** Get all sessions for a workout assignment */
  async getByAssignment(assignmentId: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('workout_assignment_id', assignmentId);

    if (error) throw error;
    return data;
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

  /** Submit feedback (swimmer submits RPE + text) */
  async submitFeedback(
    sessionId: string,
    feedback: FeedbackData,
  ): Promise<WorkoutSession> {
    if (feedback.rpe_score < 6 || feedback.rpe_score > 20) {
      throw new Error('Le score RPE doit etre entre 6 et 20');
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        rpe_score: feedback.rpe_score,
        feedback_text: feedback.feedback_text ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
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

  /** Get swimmer full history with workout details (for stats & history screens) */
  async getSwimmerHistory(
    swimmerId: string,
  ): Promise<SwimmerHistoryEntry[]> {
    // Step 1: Get all sessions for swimmer
    const { data: sessions, error: sessErr } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('swimmer_id', swimmerId)
      .order('created_at', { ascending: false });

    if (sessErr) throw sessErr;
    if (!sessions.length) return [];

    // Step 2: Get assignment details with workout info
    const assignmentIds = [
      ...new Set(sessions.map((s) => s.workout_assignment_id)),
    ];

    const { data: assignments, error: assErr } = await supabase
      .from('workout_assignments')
      .select('id, scheduled_date, workout_id')
      .in('id', assignmentIds);

    if (assErr) throw assErr;

    // Step 3: Get workout details
    const workoutIds = [
      ...new Set((assignments || []).map((a) => a.workout_id)),
    ];

    const { data: workouts, error: wErr } = await supabase
      .from('workouts')
      .select('id, title, type, total_distance')
      .in('id', workoutIds);

    if (wErr) throw wErr;

    // Step 4: Build lookup maps
    const assignmentMap = new Map(
      (assignments || []).map((a) => [a.id, a]),
    );
    const workoutMap = new Map(
      (workouts || []).map((w) => [w.id, w]),
    );

    // Step 5: Enrich sessions
    return sessions.map((s) => {
      const a = assignmentMap.get(s.workout_assignment_id);
      const w = a ? workoutMap.get(a.workout_id) : null;
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
