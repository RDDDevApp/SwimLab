export { clubService } from './clubService';
export { groupService } from './groupService';
export { groupCoachService } from './groupCoachService';
export { trainingSlotService } from './trainingSlotService';
export { workoutService } from './workoutService';
export { workoutAssignmentService } from './workoutAssignmentService';
export { workoutSessionService } from './workoutSessionService';
export { profileService } from './profileService';
export { blockLibraryService } from './blockLibraryService';
export { notificationService } from './notificationService';
export { consentService } from './consentService';

// Re-export types
export type { ClubWithMembers } from './clubService';
export type { GroupWithDetails } from './groupService';
export type { AssignmentWithDetails } from './workoutAssignmentService';
export type { MemberConsent, ConsentInput } from './consentService';
export type { SessionWithProfile, GroupFeedbackStats, SwimmerHistoryEntry } from './workoutSessionService';
