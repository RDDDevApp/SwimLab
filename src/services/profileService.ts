import { supabase } from '../config/supabase';
import { Profile, ProfileUpdate } from '../types';

export const profileService = {
  /** Get a profile by ID */
  async getById(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Update a profile */
  async update(userId: string, data: ProfileUpdate): Promise<Profile> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  /** Get all swimmers in a club */
  async getSwimmersByClub(clubId: string): Promise<Profile[]> {
    const { data: members, error: memberError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId)
      .eq('role', 'swimmer');

    if (memberError) throw memberError;
    if (!members.length) return [];

    const userIds = members.map((m) => m.user_id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .order('last_name');

    if (error) throw error;
    return data;
  },

  /** Get all coaches in a club */
  async getCoachesByClub(clubId: string): Promise<Profile[]> {
    const { data: members, error: memberError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId)
      .eq('role', 'coach');

    if (memberError) throw memberError;
    if (!members.length) return [];

    const userIds = members.map((m) => m.user_id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .order('last_name');

    if (error) throw error;
    return data;
  },
};
