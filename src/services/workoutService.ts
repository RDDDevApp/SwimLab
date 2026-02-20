import { supabase } from '../config/supabase';
import { Workout, WorkoutInsert, WorkoutUpdate, WorkoutContent } from '../types';

export const workoutService = {
  /** Create a new workout */
  async create(data: WorkoutInsert): Promise<Workout> {
    const { data: workout, error } = await supabase
      .from('workouts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return workout;
  },

  /** Get a workout by ID */
  async getById(workoutId: string): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Get all workouts for a club */
  async getByClub(clubId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Get all workouts for a coach */
  async getByCoach(coachId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Get published workouts for a club */
  async getPublished(clubId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /** Update a workout */
  async update(workoutId: string, data: WorkoutUpdate): Promise<Workout> {
    const { data: workout, error } = await supabase
      .from('workouts')
      .update(data)
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return workout;
  },

  /** Publish a workout */
  async publish(workoutId: string): Promise<Workout> {
    return workoutService.update(workoutId, { is_published: true });
  },

  /** Unpublish a workout */
  async unpublish(workoutId: string): Promise<Workout> {
    return workoutService.update(workoutId, { is_published: false });
  },

  /** Delete a workout */
  async delete(workoutId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
  },

  /** Calculate total distance from workout content */
  calculateTotalDistance(content: WorkoutContent): number {
    return content.blocks.reduce((total, block) => {
      const blockDistance = block.sub_blocks.reduce((subTotal, sub) => {
        return subTotal + sub.distance * sub.repetitions;
      }, 0);
      return total + blockDistance;
    }, 0);
  },
};
