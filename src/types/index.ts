// Re-export all database types
export * from './database.types';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  CoachApp: undefined;
  SwimmerApp: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  ClubSetup: undefined;
  JoinClub: undefined;
};

export type CoachTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Workouts: undefined;
  Groups: undefined;
  Profile: undefined;
};

export type CoachStackParamList = {
  CoachTabs: undefined;
  CreateGroup: { clubId?: string } | undefined;
  GroupDetail: { groupId: string };
  Slots: { groupId?: string } | undefined;
  CreateSlot: { groupId?: string; slot?: any } | undefined;
  CreateWorkout: { workout?: any; clubId?: string } | undefined;
  AssignWorkout: { slotId: string; slotName: string; date: string };
  Attendance: { assignmentId: string; groupId: string; workoutTitle?: string };
  WorkoutStats: { assignmentId: string; workoutTitle?: string };
  ExerciseLibrary: undefined;
  CreateExercise: { exercise?: any } | undefined;
  WorkoutTemplates: undefined;
  WorkoutHistory: undefined;
};

export type SwimmerStackParamList = {
  SwimmerTabs: undefined;
  Feedback: { sessionId: string; workoutTitle?: string };
  WorkoutDetail: { workoutId: string; workoutTitle?: string };
  SwimmerHistory: undefined;
};

export type SwimmerTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Stats: undefined;
  Profile: undefined;
};

// Day of Week
export const DAYS_OF_WEEK = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Group Levels
export const GROUP_LEVELS = {
  beginner: 'Debutant',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
  competition: 'Competition',
} as const;

export type GroupLevel = keyof typeof GROUP_LEVELS;

// Workout Types
export const WORKOUT_TYPES = {
  endurance: 'Endurance',
  sprint: 'Sprint',
  technique: 'Technique',
  recovery: 'Recuperation',
  other: 'Autre',
} as const;

export type WorkoutType = keyof typeof WORKOUT_TYPES;

// Stroke Types (French labels)
export const STROKE_LABELS = {
  freestyle: 'Crawl',
  backstroke: 'Dos',
  breaststroke: 'Brasse',
  butterfly: 'Papillon',
  individual_medley: '4 Nages',
  choice: 'Choix',
  kick: 'Jambes',
  pull: 'Bras',
  drill: 'Educatifs',
  fins: 'Palmes',
  pull_buoy: 'Pull-Buoy',
  paddles: 'Plaquettes',
} as const;

// Intensity Labels (French)
export const INTENSITY_LABELS = {
  recovery: 'Recuperation',
  easy: 'Facile',
  moderate: 'Modere',
  threshold: 'Soutenu',
  hard: 'Intense',
  sprint: 'Sprint',
} as const;

// Exercise Library Categories (French)
export const EXERCISE_CATEGORIES = {
  warmup: 'Echauffement',
  main: 'Corps de seance',
  cooldown: 'Retour au calme',
  drill: 'Educatifs',
  sprint: 'Sprint',
  endurance: 'Endurance',
  kick: 'Jambes',
  pull: 'Bras',
  other: 'Autre',
} as const;

export type ExerciseCategory = keyof typeof EXERCISE_CATEGORIES;
