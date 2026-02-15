import { supabase } from '../config/supabase';
import {
  WorkoutTemplateRow,
  WorkoutTemplateInsert,
  WorkoutTemplateUpdate,
} from '../types';

export const workoutTemplateService = {
  async getByClub(clubId: string): Promise<WorkoutTemplateRow[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(data: WorkoutTemplateInsert): Promise<WorkoutTemplateRow> {
    const { data: template, error } = await supabase
      .from('workout_templates')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  async update(
    id: string,
    data: WorkoutTemplateUpdate,
  ): Promise<WorkoutTemplateRow> {
    const { data: template, error } = await supabase
      .from('workout_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return template;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
