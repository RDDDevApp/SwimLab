import { supabase } from '../config/supabase';
import { WorkoutAssignment } from '../types';

type AssignmentInsert = {
  workout_id: string;
  training_slot_id: string;
  scheduled_date: string;
};

export interface AssignmentWithDetails extends WorkoutAssignment {
  workout_title?: string;
  workout_type?: string;
  slot_name?: string;
  group_name?: string;
}

export const workoutAssignmentService = {
  /** Assign a workout to a training slot on a specific date (upsert to avoid duplicate key errors) */
  async create(data: AssignmentInsert): Promise<WorkoutAssignment> {
    const { data: assignment, error } = await supabase
      .from('workout_assignments')
      .upsert(data, { onConflict: 'training_slot_id,scheduled_date' })
      .select()
      .single();

    if (error) throw error;
    return assignment;
  },

  /** Get an assignment by ID */
  async getById(assignmentId: string): Promise<WorkoutAssignment> {
    const { data, error } = await supabase
      .from('workout_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Get assignments for a date range (for calendar view) */
  async getByDateRange(
    slotIds: string[],
    startDate: string,
    endDate: string,
  ): Promise<WorkoutAssignment[]> {
    if (!slotIds.length) return [];

    const { data, error } = await supabase
      .from('workout_assignments')
      .select('*')
      .in('training_slot_id', slotIds)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date');

    if (error) throw error;
    return data;
  },

  /** Get assignments for a specific date */
  async getByDate(
    slotIds: string[],
    date: string,
  ): Promise<WorkoutAssignment[]> {
    if (!slotIds.length) return [];

    const { data, error } = await supabase
      .from('workout_assignments')
      .select('*')
      .in('training_slot_id', slotIds)
      .eq('scheduled_date', date)
      .order('scheduled_date');

    if (error) throw error;
    return data;
  },

  /** Mark assignment as completed */
  async markCompleted(assignmentId: string): Promise<WorkoutAssignment> {
    const { data, error } = await supabase
      .from('workout_assignments')
      .update({ is_completed: true })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Mark attendance as done for an assignment */
  async markAttendance(assignmentId: string): Promise<WorkoutAssignment> {
    const { data, error } = await supabase
      .from('workout_assignments')
      .update({ attendance_marked: true })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Get assignments via RPC (bypasses RLS chain issues for swimmers) */
  async getByDateRangeRpc(
    slotIds: string[],
    startDate: string,
    endDate: string,
  ): Promise<WorkoutAssignment[]> {
    if (!slotIds.length) return [];

    const { data, error } = await (supabase.rpc as any)('get_assignments_for_slots', {
      p_slot_ids: slotIds,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data || [];
  },

  /** Delete an assignment */
  async delete(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
  },
};
