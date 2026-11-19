// Types générés depuis la base de production (Supabase « generate_typescript_types »,
// 18 novembre 2026, migrations jusqu'à la 023). NE PAS MODIFIER À LA MAIN :
// régénérer après chaque migration et remplacer ce fichier.
// Les précisions de l'app (rôle, niveau, contenu de séance…) sont dans database.types.ts.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_generations: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      block_library: {
        Row: {
          club_id: string
          coach_id: string
          content: Json
          created_at: string
          id: string
          name: string
          total_distance: number
          type: string
        }
        Insert: {
          club_id: string
          coach_id: string
          content?: Json
          created_at?: string
          id?: string
          name: string
          total_distance?: number
          type: string
        }
        Update: {
          club_id?: string
          coach_id?: string
          content?: Json
          created_at?: string
          id?: string
          name?: string
          total_distance?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_library_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_library_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invitation_code: string
          invitation_code_coach: string
          logo_url: string | null
          monthly_distance_goal: number | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invitation_code?: string
          invitation_code_coach?: string
          logo_url?: string | null
          monthly_distance_goal?: number | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invitation_code?: string
          invitation_code_coach?: string
          logo_url?: string | null
          monthly_distance_goal?: number | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_coaches: {
        Row: {
          coach_id: string
          group_id: string
          id: string
          is_creator: boolean
          joined_at: string
        }
        Insert: {
          coach_id: string
          group_id: string
          id?: string
          is_creator?: boolean
          joined_at?: string
        }
        Update: {
          coach_id?: string
          group_id?: string
          id?: string
          is_creator?: boolean
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_coaches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          club_id: string
          created_at: string
          description: string | null
          id: string
          level: string | null
          name: string
          schedule_info: string | null
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          name: string
          schedule_info?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          name?: string
          schedule_info?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      member_consents: {
        Row: {
          birth_date: string | null
          created_at: string
          parent_email: string | null
          parent_notified_at: string | null
          parental_consent_at: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          parent_email?: string | null
          parent_notified_at?: string | null
          parental_consent_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          parent_email?: string | null
          parent_notified_at?: string | null
          parental_consent_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          created_at: string
          distance_m: number
          id: string
          note: string | null
          pool_length: number
          recorded_at: string
          stroke: string
          swimmer_id: string
          time_ms: number
        }
        Insert: {
          created_at?: string
          distance_m: number
          id?: string
          note?: string | null
          pool_length?: number
          recorded_at?: string
          stroke: string
          swimmer_id: string
          time_ms: number
        }
        Update: {
          created_at?: string
          distance_m?: number
          id?: string
          note?: string | null
          pool_length?: number
          recorded_at?: string
          stroke?: string
          swimmer_id?: string
          time_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          notification_feedback: boolean | null
          notification_reminder: boolean | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          notification_feedback?: boolean | null
          notification_reminder?: boolean | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          notification_feedback?: boolean | null
          notification_reminder?: boolean | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_presence: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          status: string
          swimmer_id: string
          updated_at: string
          workout_assignment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          status: string
          swimmer_id: string
          updated_at?: string
          workout_assignment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          swimmer_id?: string
          updated_at?: string
          workout_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_presence_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_presence_workout_assignment_id_fkey"
            columns: ["workout_assignment_id"]
            isOneToOne: false
            referencedRelation: "workout_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      solo_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          fatigue_score: number | null
          feedback_text: string | null
          id: string
          rpe_score: number | null
          scheduled_date: string
          swimmer_id: string
          technique_score: number | null
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          fatigue_score?: number | null
          feedback_text?: string | null
          id?: string
          rpe_score?: number | null
          scheduled_date: string
          swimmer_id: string
          technique_score?: number | null
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          fatigue_score?: number | null
          feedback_text?: string | null
          id?: string
          rpe_score?: number | null
          scheduled_date?: string
          swimmer_id?: string
          technique_score?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solo_sessions_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solo_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      swimmer_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          swimmer_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          swimmer_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          swimmer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swimmer_badges_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_slots: {
        Row: {
          created_at: string
          day_of_week: number
          duration_minutes: number
          group_id: string
          id: string
          is_active: boolean
          location: string | null
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          duration_minutes: number
          group_id: string
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          group_id?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_slots_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_assignments: {
        Row: {
          assigned_at: string
          attendance_marked: boolean
          coach_id: string | null
          id: string
          is_completed: boolean
          scheduled_date: string
          training_slot_id: string
          workout_id: string
        }
        Insert: {
          assigned_at?: string
          attendance_marked?: boolean
          coach_id?: string | null
          id?: string
          is_completed?: boolean
          scheduled_date: string
          training_slot_id: string
          workout_id: string
        }
        Update: {
          assigned_at?: string
          attendance_marked?: boolean
          coach_id?: string | null
          id?: string
          is_completed?: boolean
          scheduled_date?: string
          training_slot_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_training_slot_id_fkey"
            columns: ["training_slot_id"]
            isOneToOne: false
            referencedRelation: "training_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          attended: boolean
          completed_at: string | null
          created_at: string
          fatigue_score: number | null
          feedback_text: string | null
          id: string
          is_guest: boolean
          performances: Json | null
          rpe_score: number | null
          swimmer_id: string
          technique_score: number | null
          updated_at: string
          workout_assignment_id: string
        }
        Insert: {
          attended?: boolean
          completed_at?: string | null
          created_at?: string
          fatigue_score?: number | null
          feedback_text?: string | null
          id?: string
          is_guest?: boolean
          performances?: Json | null
          rpe_score?: number | null
          swimmer_id: string
          technique_score?: number | null
          updated_at?: string
          workout_assignment_id: string
        }
        Update: {
          attended?: boolean
          completed_at?: string | null
          created_at?: string
          fatigue_score?: number | null
          feedback_text?: string | null
          id?: string
          is_guest?: boolean
          performances?: Json | null
          rpe_score?: number | null
          swimmer_id?: string
          technique_score?: number | null
          updated_at?: string
          workout_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_swimmer_id_profiles_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_assignment_id_fkey"
            columns: ["workout_assignment_id"]
            isOneToOne: false
            referencedRelation: "workout_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          club_id: string | null
          coach_id: string
          content: Json
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          is_published: boolean
          show_before_session: boolean
          title: string
          total_distance: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          coach_id: string
          content?: Json
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          show_before_session?: boolean
          title: string
          total_distance?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          coach_id?: string
          content?: Json
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_published?: boolean
          show_before_session?: boolean
          title?: string
          total_distance?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_coaches_in_group: { Args: { p_group_id: string }; Returns: number }
      delete_my_account: { Args: never; Returns: undefined }
      get_assignments_for_slots: {
        Args: { p_end_date: string; p_slot_ids: string[]; p_start_date: string }
        Returns: {
          assigned_at: string
          attendance_marked: boolean
          coach_id: string | null
          id: string
          is_completed: boolean
          scheduled_date: string
          training_slot_id: string
          workout_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "workout_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_coach_assignment_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_coach_club_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_coach_group_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_coach_training_slot_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_coach_visible_workout_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_member_group_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_member_training_slot_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_swimmer_slot_ids: { Args: { p_user_id: string }; Returns: string[] }
      get_swimmer_workout_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_club_ids: { Args: { p_user_id: string }; Returns: string[] }
      is_coach_in_group_club: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
