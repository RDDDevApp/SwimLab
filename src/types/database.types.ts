/**
 * Types de la base pour l'app.
 *
 * Le schéma vient de `supabase.generated.ts` (généré depuis la vraie base : à
 * régénérer après chaque migration). Ici, on y superpose seulement les précisions
 * que la base ne sait pas exprimer : rôles, niveaux, plateforme et contenu des
 * séances (JSON structuré).
 */
import type { Database as GeneratedDatabase, Json } from './supabase.generated';

export type { Json };

type Generated = GeneratedDatabase['public']['Tables'];
type Override<T, R> = Omit<T, keyof R> & R;

/** Remplace les colonnes données dans Row, Insert et Update d'une table générée. */
type Refine<
  Name extends keyof Generated,
  Row extends Partial<Generated[Name]['Row']> | Record<string, unknown>,
> = {
  Row: Override<Generated[Name]['Row'], Row>;
  Insert: Override<Generated[Name]['Insert'], Partial<Row>>;
  Update: Override<Generated[Name]['Update'], Partial<Row>>;
  Relationships: Generated[Name]['Relationships'];
};

export type UserRole = 'coach' | 'swimmer';
export type GroupLevelKey = 'beginner' | 'intermediate' | 'advanced' | 'competition';

type RefinedTables = {
  profiles: Refine<'profiles', { role: UserRole }>;
  club_members: Refine<'club_members', { role: UserRole }>;
  groups: Refine<'groups', { level: GroupLevelKey | null }>;
  workouts: Refine<'workouts', { content: WorkoutContent }>;
  push_tokens: Refine<'push_tokens', { platform: 'ios' | 'android' | 'web' }>;
  block_library: Refine<'block_library', { type: BlockType; content: SubBlock[] }>;
};

export type Database = Omit<GeneratedDatabase, 'public'> & {
  public: Omit<GeneratedDatabase['public'], 'Tables'> & {
    Tables: Omit<Generated, keyof RefinedTables> & RefinedTables;
  };
};

export type BlockLibraryRow = Database['public']['Tables']['block_library']['Row'];
export type BlockLibraryInsert = Database['public']['Tables']['block_library']['Insert'];
export type BlockLibraryUpdate = Database['public']['Tables']['block_library']['Update'];

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

export type SoloSessionRow = Database['public']['Tables']['solo_sessions']['Row'];
export type SessionPresenceRow = Database['public']['Tables']['session_presence']['Row'];
export type SwimmerBadgeRow = Database['public']['Tables']['swimmer_badges']['Row'];
export type PersonalRecordRow = Database['public']['Tables']['personal_records']['Row'];
export type MemberConsentRow = Database['public']['Tables']['member_consents']['Row'];

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
