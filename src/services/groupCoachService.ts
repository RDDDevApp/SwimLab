import { supabase } from '../config/supabase';
import { GroupCoach, Profile } from '../types';

type GroupCoachInsert = {
  group_id: string;
  coach_id: string;
  is_creator?: boolean;
};

export const groupCoachService = {
  /** Get all coaches for a group */
  async getByGroup(groupId: string): Promise<GroupCoach[]> {
    const { data, error } = await supabase
      .from('group_coaches')
      .select('*')
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  },

  /** Get all group_coaches entries for a coach (to find their groups) */
  async getByCoach(coachId: string): Promise<GroupCoach[]> {
    const { data, error } = await supabase
      .from('group_coaches')
      .select('*')
      .eq('coach_id', coachId);

    if (error) throw error;
    return data;
  },

  /** Get group IDs for a coach */
  async getGroupIds(coachId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('group_coaches')
      .select('group_id')
      .eq('coach_id', coachId);

    if (error) throw error;
    return data.map((gc) => gc.group_id);
  },

  /** Add a coach to a group */
  async addCoach(
    groupId: string,
    coachId: string,
    isCreator = false,
  ): Promise<GroupCoach> {
    const { data, error } = await supabase
      .from('group_coaches')
      .insert({ group_id: groupId, coach_id: coachId, is_creator: isCreator })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Remove a coach from a group (blocks if last coach) */
  async removeCoach(groupId: string, coachId: string): Promise<void> {
    const count = await this.getCoachCount(groupId);
    if (count <= 1) {
      throw new Error(
        'Impossible de retirer le dernier coach du groupe. Ajoutez un autre coach ou supprimez le groupe.',
      );
    }

    const { error } = await supabase
      .from('group_coaches')
      .delete()
      .eq('group_id', groupId)
      .eq('coach_id', coachId);

    if (error) throw error;
  },

  /** Get number of coaches in a group */
  async getCoachCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('group_coaches')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count ?? 0;
  },

  /** Check if a user is a coach of a specific group */
  async isCoachOfGroup(groupId: string, coachId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('group_coaches')
      .select('id')
      .eq('group_id', groupId)
      .eq('coach_id', coachId)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },

  /** Get coach profiles for a group (with full profile info) */
  async getCoachProfiles(groupId: string): Promise<(Profile & { is_creator: boolean })[]> {
    const coaches = await this.getByGroup(groupId);
    if (!coaches.length) return [];

    const coachIds = coaches.map((gc) => gc.coach_id);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', coachIds)
      .order('last_name');

    if (error) throw error;

    const creatorMap = new Map(coaches.map((gc) => [gc.coach_id, gc.is_creator]));
    return (profiles || []).map((p) => ({
      ...p,
      is_creator: creatorMap.get(p.id) ?? false,
    }));
  },
};
