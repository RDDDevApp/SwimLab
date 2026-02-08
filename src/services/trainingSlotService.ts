import { supabase } from '../config/supabase';
import { TrainingSlot } from '../types';

type TrainingSlotInsert = {
  group_id: string;
  coach_id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  location?: string | null;
  is_active?: boolean;
};

type TrainingSlotUpdate = Partial<Omit<TrainingSlotInsert, 'group_id' | 'coach_id'>>;

export const trainingSlotService = {
  /** Create a new training slot */
  async create(data: TrainingSlotInsert): Promise<TrainingSlot> {
    const { data: slot, error } = await supabase
      .from('training_slots')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return slot;
  },

  /** Get a slot by ID */
  async getById(slotId: string): Promise<TrainingSlot> {
    const { data, error } = await supabase
      .from('training_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Get all slots for a group */
  async getByGroup(groupId: string): Promise<TrainingSlot[]> {
    const { data, error } = await supabase
      .from('training_slots')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return data;
  },

  /** Get all slots for a coach */
  async getByCoach(coachId: string): Promise<TrainingSlot[]> {
    const { data, error } = await supabase
      .from('training_slots')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return data;
  },

  /** Get slots for a specific day of week */
  async getByDay(coachId: string, dayOfWeek: number): Promise<TrainingSlot[]> {
    const { data, error } = await supabase
      .from('training_slots')
      .select('*')
      .eq('coach_id', coachId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('start_time');

    if (error) throw error;
    return data;
  },

  /** Update a slot */
  async update(slotId: string, data: TrainingSlotUpdate): Promise<TrainingSlot> {
    const { data: slot, error } = await supabase
      .from('training_slots')
      .update(data)
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return slot;
  },

  /** Deactivate a slot (soft delete) */
  async deactivate(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('training_slots')
      .update({ is_active: false })
      .eq('id', slotId);

    if (error) throw error;
  },

  /** Delete a slot (hard delete) */
  async delete(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('training_slots')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
  },
};
