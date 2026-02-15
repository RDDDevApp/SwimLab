import { supabase } from '../config/supabase';
import {
  ExerciseLibraryRow,
  ExerciseLibraryInsert,
  ExerciseLibraryUpdate,
} from '../types';

export const exerciseLibraryService = {
  async getByClub(clubId: string): Promise<ExerciseLibraryRow[]> {
    const { data, error } = await supabase
      .from('exercise_library')
      .select('*')
      .eq('club_id', clubId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(data: ExerciseLibraryInsert): Promise<ExerciseLibraryRow> {
    const { data: exercise, error } = await supabase
      .from('exercise_library')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return exercise;
  },

  async update(
    id: string,
    data: ExerciseLibraryUpdate,
  ): Promise<ExerciseLibraryRow> {
    const { data: exercise, error } = await supabase
      .from('exercise_library')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return exercise;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercise_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
