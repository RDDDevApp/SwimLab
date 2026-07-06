export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          role: 'coach' | 'swimmer';
          notification_feedback: boolean;
          notification_reminder: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          role: 'coach' | 'swimmer';
          notification_feedback?: boolean;
          notification_reminder?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          role?: 'coach' | 'swimmer';
          notification_feedback?: boolean;
          notification_reminder?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          invitation_code: string;
          invitation_code_coach: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          invitation_code?: string;
          invitation_code_coach?: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          invitation_code?: string;
          invitation_code_coach?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: 'coach' | 'swimmer';
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          role: 'coach' | 'swimmer';
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          role?: 'coach' | 'swimmer';
          joined_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          description: string | null;
          level: 'beginner' | 'intermediate' | 'advanced' | 'competition' | null;
          schedule_info: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          name: string;
          description?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'competition' | null;
          schedule_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          name?: string;
          description?: string | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'competition' | null;
          schedule_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_coaches: {
        Row: {
          id: string;
          group_id: string;
          coach_id: string;
          is_creator: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          coach_id: string;
          is_creator?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          coach_id?: string;
          is_creator?: boolean;
          joined_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      training_slots: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          day_of_week: number;
          start_time: string;
          duration_minutes: number;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          day_of_week: number;
          start_time: string;
          duration_minutes: number;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          day_of_week?: number;
          start_time?: string;
          duration_minutes?: number;
          location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          club_id: string | null;
          coach_id: string;
          title: string;
          type: string | null;
          description: string | null;
          content: WorkoutContent;
          total_distance: number | null;
          estimated_duration: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string | null;
          coach_id: string;
          title: string;
          type?: string | null;
          description?: string | null;
          content?: WorkoutContent;
          total_distance?: number | null;
          estimated_duration?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          coach_id?: string;
          title?: string;
          type?: string | null;
          description?: string | null;
          content?: WorkoutContent;
          total_distance?: number | null;
          estimated_duration?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_assignments: {
        Row: {
          id: string;
          workout_id: string;
          training_slot_id: string;
          scheduled_date: string;
          coach_id: string | null;
          is_completed: boolean;
          attendance_marked: boolean;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          training_slot_id: string;
          scheduled_date: string;
          coach_id?: string | null;
          is_completed?: boolean;
          attendance_marked?: boolean;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          training_slot_id?: string;
          scheduled_date?: string;
          coach_id?: string | null;
          is_completed?: boolean;
          attendance_marked?: boolean;
          assigned_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          workout_assignment_id: string;
          swimmer_id: string;
          is_guest: boolean;
          attended: boolean;
          rpe_score: number | null;
          feedback_text: string | null;
          performances: Json;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workout_assignment_id: string;
          swimmer_id: string;
          is_guest?: boolean;
          attended?: boolean;
          rpe_score?: number | null;
          feedback_text?: string | null;
          performances?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workout_assignment_id?: string;
          swimmer_id?: string;
          is_guest?: boolean;
          attended?: boolean;
          rpe_score?: number | null;
          feedback_text?: string | null;
          performances?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      block_library: {
        Row: {
          id: string;
          club_id: string;
          coach_id: string;
          name: string;
          type: string;
          content: Json;
          total_distance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          coach_id: string;
          name: string;
          type: string;
          content: Json;
          total_distance: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          coach_id?: string;
          name?: string;
          type?: string;
          content?: Json;
          total_distance?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: 'ios' | 'android' | 'web';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: 'ios' | 'android' | 'web';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: 'ios' | 'android' | 'web';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
};

// ---- V0.5 Tables (Sprint 7) ----

// Block Library (replaces exercise_library and workout_templates)
export interface BlockLibraryRow {
  id: string;
  club_id: string;
  coach_id: string;
  name: string;
  type: BlockType;
  content: SubBlock[];
  total_distance: number;
  created_at: string;
}

export interface BlockLibraryInsert {
  id?: string;
  club_id: string;
  coach_id: string;
  name: string;
  type: BlockType;
  content: SubBlock[];
  total_distance: number;
  created_at?: string;
}

export interface BlockLibraryUpdate {
  name?: string;
  type?: BlockType;
  content?: SubBlock[];
  total_distance?: number;
}

// Workout Content Types
export interface WorkoutContent {
  blocks: WorkoutBlock[];
}

export type BlockType = 'warmup' | 'main' | 'cooldown' | 'other';

export interface WorkoutBlock {
  id: string;
  type: BlockType;
  name: string;
  sub_blocks: SubBlock[];
}

export interface SubBlock {
  id: string;
  distance: number;
  repetitions: number;
  description?: string;
  departure?: string;
}

export type StrokeType =
  | 'freestyle'
  | 'backstroke'
  | 'breaststroke'
  | 'butterfly'
  | 'individual_medley'
  | 'choice'
  | 'kick'
  | 'pull'
  | 'drill'
  | 'fins'
  | 'pull_buoy'
  | 'paddles';

export type IntensityType =
  | 'recovery'
  | 'easy'
  | 'moderate'
  | 'threshold'
  | 'hard'
  | 'sprint';

// Helper types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Club = Database['public']['Tables']['clubs']['Row'];
export type ClubMember = Database['public']['Tables']['club_members']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type GroupCoach = Database['public']['Tables']['group_coaches']['Row'];
export type GroupCoachInsert = Database['public']['Tables']['group_coaches']['Insert'];
export type TrainingSlot = Database['public']['Tables']['training_slots']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutAssignment = Database['public']['Tables']['workout_assignments']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ClubUpdate = Database['public']['Tables']['clubs']['Update'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];

// V0.5 convenience aliases
export type BlockLibrary = BlockLibraryRow;
