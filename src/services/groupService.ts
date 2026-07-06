import { supabase } from '../config/supabase';
import { Group, GroupInsert, GroupUpdate, GroupMember, Profile } from '../types';
import { groupCoachService } from './groupCoachService';

export interface GroupWithDetails extends Group {
  member_count?: number;
  members?: Profile[];
}

export const groupService = {
  /** Create a new group and add the creator as coach */
  async create(data: GroupInsert, coachId: string): Promise<Group> {
    const { data: group, error } = await supabase
      .from('groups')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // Auto-add the creator as coach of the group
    await groupCoachService.addCoach(group.id, coachId, true);

    return group;
  },

  /** Get a group by ID */
  async getById(groupId: string): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  /** Get all groups for a club */
  async getByClub(clubId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('club_id', clubId)
      .order('name');

    if (error) throw error;
    return data;
  },

  /** Get all groups for a coach (via group_coaches junction table) */
  async getByCoach(coachId: string): Promise<Group[]> {
    const groupIds = await groupCoachService.getGroupIds(coachId);
    if (!groupIds.length) return [];

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('name');

    if (error) throw error;
    return data;
  },

  /** Get groups a swimmer belongs to */
  async getBySwimmer(swimmerId: string): Promise<Group[]> {
    const { data: memberships, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', swimmerId);

    if (memberError) throw memberError;
    if (!memberships.length) return [];

    const groupIds = memberships.map((m) => m.group_id);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('name');

    if (error) throw error;
    return data;
  },

  /** Update a group */
  async update(groupId: string, data: GroupUpdate): Promise<Group> {
    const { data: group, error } = await supabase
      .from('groups')
      .update(data)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return group;
  },

  /** Delete a group */
  async delete(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  /** Add a swimmer to a group */
  async addMember(groupId: string, userId: string): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Remove a swimmer from a group */
  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /** IDs uniques des nageurs de plusieurs groupes en une seule requete (anti N+1) */
  async getMemberIdsByGroups(groupIds: string[]): Promise<string[]> {
    if (!groupIds.length) return [];

    const { data, error } = await supabase
      .from('group_members')
      .select('user_id')
      .in('group_id', groupIds);

    if (error) throw error;
    return [...new Set((data || []).map((m) => m.user_id))];
  },

  /** Get all members of a group with their profiles */
  async getMembers(groupId: string): Promise<Profile[]> {
    const { data: memberships, error: memberError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (memberError) throw memberError;
    if (!memberships.length) return [];

    const userIds = memberships.map((m) => m.user_id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
      .order('last_name');

    if (error) throw error;
    return data;
  },

  /** Get member count for a group */
  async getMemberCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count ?? 0;
  },
};
