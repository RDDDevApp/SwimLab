import { supabase } from '../config/supabase';
import {
  BlockLibraryRow,
  BlockLibraryInsert,
  BlockLibraryUpdate,
} from '../types';

export const blockLibraryService = {
  async getByClub(clubId: string): Promise<BlockLibraryRow[]> {
    const { data, error } = await supabase
      .from('block_library')
      .select('*')
      .eq('club_id', clubId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(data: BlockLibraryInsert): Promise<BlockLibraryRow> {
    const { data: block, error } = await supabase
      .from('block_library')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return block;
  },

  async update(
    id: string,
    data: BlockLibraryUpdate,
  ): Promise<BlockLibraryRow> {
    const { data: block, error } = await supabase
      .from('block_library')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return block;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('block_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
