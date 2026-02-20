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
    return data as unknown as BlockLibraryRow[];
  },

  async create(data: BlockLibraryInsert): Promise<BlockLibraryRow> {
    const { data: block, error } = await supabase
      .from('block_library')
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return block as unknown as BlockLibraryRow;
  },

  async update(
    id: string,
    data: BlockLibraryUpdate,
  ): Promise<BlockLibraryRow> {
    const { data: block, error } = await supabase
      .from('block_library')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return block as unknown as BlockLibraryRow;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('block_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
