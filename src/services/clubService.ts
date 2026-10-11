import { supabase } from '../config/supabase';
import { Club, ClubInsert, ClubUpdate, ClubMember } from '../types';

export interface ClubWithMembers extends Club {
  member_count?: number;
}

export const clubService = {
  /** Create a new club (coach only) */
  async create(data: Omit<ClubInsert, 'invitation_code' | 'invitation_code_coach'>): Promise<Club> {
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

  /** Join a club via invitation code. `role` is the account's role: the code type must match it. */
  async joinByCode(
    code: string,
    userId: string,
    role: 'coach' | 'swimmer',
  ): Promise<{ club: Club; detectedRole: 'coach' | 'swimmer' }> {
    // Try swimmer code first
    const { data: clubBySwimmerCode } = await supabase
      .from('clubs')
      .select('*')
      .eq('invitation_code', code)
      .maybeSingle();

    // Try coach code
    const { data: clubByCoachCode } = await supabase
      .from('clubs')
      .select('*')
      .eq('invitation_code_coach', code)
      .maybeSingle();

    const club = clubBySwimmerCode || clubByCoachCode;
    if (!club) throw new Error("Code d'invitation invalide");

    const detectedRole: 'coach' | 'swimmer' = clubByCoachCode ? 'coach' : 'swimmer';

    // Le type de code doit correspondre au compte : un code coach donnerait sinon
    // des droits de coach a un compte nageur (et inversement)
    if (detectedRole !== role) {
      throw new Error(
        role === 'swimmer'
          ? "Ce code est réservé aux coachs. Demande à ton coach le code nageur du club."
          : "Ce code est un code nageur. Demande le code coach au responsable du club.",
      );
    }

    // If joining as coach, verify not already coach in another club
    if (detectedRole === 'coach') {
      const { data: existingCoach } = await supabase
        .from('club_members')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'coach')
        .maybeSingle();

      if (existingCoach) {
        throw new Error('Vous etes deja coach dans un autre club. Un coach ne peut etre que dans un seul club.');
      }
    }

    // Check if already a member of this club
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
        role: detectedRole,
      });

    if (joinError) throw joinError;
    return { club, detectedRole };
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
