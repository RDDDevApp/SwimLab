import { supabase } from '../config/supabase';
import { Club, ClubInsert, ClubUpdate, ClubMember } from '../types';

export interface ClubWithMembers extends Club {
  member_count?: number;
}

export const clubService = {
  /** Create a new club (coach only) */
  async create(data: Omit<ClubInsert, 'invitation_code'>): Promise<Club> {
    const { data: club, error } = await supabase
      .from('clubs')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // Auto-add the owner as a coach member
    const { error: memberError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: data.owner_id,
        role: 'coach',
      });

    if (memberError) throw memberError;

    return club;
  },

  /** Get a club by ID */
  async getById(clubId: string): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Get all clubs for a user */
  async getByUser(userId: string): Promise<Club[]> {
    const { data: memberships, error: memberError } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;
    if (!memberships.length) return [];

    const clubIds = memberships.map((m) => m.club_id);
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .in('id', clubIds);

    if (error) throw error;
    return data;
  },

  /** Update a club */
  async update(clubId: string, data: ClubUpdate): Promise<Club> {
    const { data: club, error } = await supabase
      .from('clubs')
      .update(data)
      .eq('id', clubId)
      .select()
      .single();

    if (error) throw error;
    return club;
  },

  /** Delete a club */
  async delete(clubId: string): Promise<void> {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);

    if (error) throw error;
  },

  /** Join a club via invitation code */
  async joinByCode(
    code: string,
    userId: string,
    role: 'coach' | 'swimmer',
  ): Promise<Club> {
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('invitation_code', code)
      .single();

    if (clubError) throw new Error('Code d\'invitation invalide');

    // Check if already a member
    const { data: existing } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', club.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) throw new Error('Vous etes deja membre de ce club');

    const { error: joinError } = await supabase
      .from('club_members')
      .insert({
        club_id: club.id,
        user_id: userId,
        role,
      });

    if (joinError) throw joinError;
    return club;
  },

  /** Get all members of a club */
  async getMembers(clubId: string): Promise<ClubMember[]> {
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId);

    if (error) throw error;
    return data;
  },

  /** Remove a member from a club */
  async removeMember(clubId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
