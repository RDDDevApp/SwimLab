export { clubService } from './clubService';
export { groupService } from './groupService';
export { trainingSlotService } from './trainingSlotService';
export { workoutService } from './workoutService';
export { workoutAssignmentService } from './workoutAssignmentService';
export { workoutSessionService } from './workoutSessionService';
export { profileService } from './profileService';
export { blockLibraryService } from './blockLibraryService';

// Re-export types
export type { ClubWithMembers } from './clubService';
export type { GroupWithDetails } from './groupService';
export type { AssignmentWithDetails } from './workoutAssignmentService';
export type { SessionWithProfile, GroupFeedbackStats, SwimmerHistoryEntry } from './workoutSessionService';
