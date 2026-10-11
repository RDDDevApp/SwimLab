import { useQuery } from '@tanstack/react-query';
import {
  clubService,
  groupService,
  trainingSlotService,
  workoutService,
  workoutAssignmentService,
  workoutSessionService,
} from '../services';
import type { SwimmerHistoryEntry } from '../services';
import { presenceService, SessionPresence } from '../services/presenceService';
import { Club, Group, WorkoutAssignment, WorkoutSession } from '../types';
import { toISODate } from '../utils/dateHelpers';
import { formatRevealTime, isSessionRevealed } from '../utils/workoutVisibility';

/* ─── Coach ─── */

export interface CoachActivityEntry {
  sessionId: string;
  swimmerName: string;
  rpeScore: number | null;
  feedbackText: string | null;
  workoutTitle: string;
  scheduledDate: string;
  completedAt: string;
}

export interface CoachMonthlyStats {
  attendancePct: number | null;
  distanceSwumKm: number;
  distancePlannedKm: number;
  distancePct: number | null;
}

export interface CoachDashboardData {
  groups: Group[];
  groupCount: number;
  workoutCount: number;
  swimmerCount: number;
  club: Club | null;
  nextSession: {
    title: string;
    date: string;
    groupName: string;
    assignmentId: string;
    groupId: string;
  } | null;
  recentActivity: CoachActivityEntry[];
  monthly: CoachMonthlyStats;
  pendingFeedbackCount: number;
}

async function fetchCoachDashboard(
  coachId: string,
  clubId: string,
): Promise<CoachDashboardData> {
  const [groups, workouts, club] = await Promise.all([
    groupService.getByCoach(coachId),
    workoutService.getByCoach(coachId),
    clubService.getById(clubId),
  ]);

  const groupIds = groups.map((g) => g.id);
  const groupNameById = new Map(groups.map((g) => [g.id, g.name]));

  const [memberIds, slots, recentActivity] = await Promise.all([
    groupService.getMemberIdsByGroups(groupIds),
    trainingSlotService.getByGroups(groupIds),
    workoutSessionService.getRecentActivityByGroups(groupIds, 10),
  ]);

  const slotIds = slots.map((s) => s.id);
  const now = new Date();
  const today = toISODate(now);

  // Prochaine seance (7 jours glissants)
  let nextSession: CoachDashboardData['nextSession'] = null;
  const nextWeek = toISODate(new Date(now.getTime() + 7 * 86400000));
  const upcomingAssignments = slotIds.length
    ? await workoutAssignmentService.getByDateRange(slotIds, today, nextWeek)
    : [];
  if (upcomingAssignments.length > 0) {
    const assignment = upcomingAssignments[0];
    const slot = slots.find((s) => s.id === assignment.training_slot_id);
    let title = 'Seance';
    try {
      const workout = await workoutService.getById(assignment.workout_id);
      title = workout.title;
    } catch {}
    nextSession = {
      title,
      date: assignment.scheduled_date,
      groupName: slot ? groupNameById.get(slot.group_id) || '' : '',
      assignmentId: assignment.id,
      groupId: slot?.group_id || '',
    };
  }

  // Defis du mois : assiduite + distance nagee vs planifiee (donnees reelles)
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  let monthAssignments: WorkoutAssignment[] = [];
  let monthSessions: WorkoutSession[] = [];
  if (slotIds.length) {
    monthAssignments = await workoutAssignmentService.getByDateRange(
      slotIds,
      monthStart,
      monthEnd,
    );
    monthSessions = await workoutSessionService.getByAssignments(
      monthAssignments.map((a) => a.id),
    );
  }

  const workoutIds = [...new Set(monthAssignments.map((a) => a.workout_id))];
  const monthWorkouts = await workoutService.getByIds(workoutIds);
  const distanceByWorkout = new Map(monthWorkouts.map((w) => [w.id, w.total_distance || 0]));
  const workoutByAssignment = new Map(monthAssignments.map((a) => [a.id, a.workout_id]));

  const attended = monthSessions.filter((s) => s.attended);
  const attendancePct = monthSessions.length
    ? Math.round((attended.length / monthSessions.length) * 100)
    : null;

  // Nage vs planifie compares au niveau des sessions marquees (meme base)
  const distanceSwum = attended.reduce((sum, s) => {
    const wId = workoutByAssignment.get(s.workout_assignment_id);
    return sum + (wId ? distanceByWorkout.get(wId) || 0 : 0);
  }, 0);
  const distancePlanned = monthSessions.reduce((sum, s) => {
    const wId = workoutByAssignment.get(s.workout_assignment_id);
    return sum + (wId ? distanceByWorkout.get(wId) || 0 : 0);
  }, 0);

  const pendingFeedbackCount = monthSessions.filter(
    (s) => s.attended && !s.completed_at,
  ).length;

  return {
    groups,
    groupCount: groups.length,
    workoutCount: workouts.length,
    swimmerCount: memberIds.length,
    club,
    nextSession,
    recentActivity,
    monthly: {
      attendancePct,
      distanceSwumKm: distanceSwum / 1000,
      distancePlannedKm: distancePlanned / 1000,
      distancePct:
        distancePlanned > 0 ? Math.round((distanceSwum / distancePlanned) * 100) : null,
    },
    pendingFeedbackCount,
  };
}

export function useCoachDashboard(coachId: string | undefined, clubId: string | null) {
  return useQuery({
    queryKey: ['coach', 'dashboard', coachId ?? '', clubId ?? ''],
    queryFn: () => fetchCoachDashboard(coachId!, clubId!),
    enabled: !!coachId && !!clubId,
  });
}

/* ─── Nageur ─── */

export interface SwimmerUpcomingWorkout {
  assignment: WorkoutAssignment;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
  slotName: string;
  session: WorkoutSession | null;
  /** Programme visible (séance finie, émargement fait ou montré par le coach) */
  revealed: boolean;
  /** Heure de fin, affichée tant que le programme est secret (« 20h30 ») */
  revealTime: string;
}

export interface SwimmerDashboardData {
  club: Club | null;
  stats: { total: number; attended: number; averageRpe: number | null };
  history: SwimmerHistoryEntry[];
  pending: { sessionId: string; workoutTitle: string; scheduledDate: string }[];
  upcoming: SwimmerUpcomingWorkout[];
  /** Declaration de presence du nageur pour la prochaine seance (migration 014) */
  nextPresence: SessionPresence | null;
}

async function fetchSwimmerDashboard(
  swimmerId: string,
  clubId: string | null,
): Promise<SwimmerDashboardData> {
  const [club, stats, history, pending] = await Promise.all([
    clubId ? clubService.getById(clubId) : Promise.resolve(null),
    workoutSessionService.getSwimmerStats(swimmerId),
    workoutSessionService.getSwimmerHistory(swimmerId),
    workoutSessionService.getPendingFeedback(swimmerId),
  ]);

  let upcoming: SwimmerUpcomingWorkout[] = [];
  if (clubId) {
    const groups = await groupService.getBySwimmer(swimmerId);
    if (groups.length) {
      const slots = await trainingSlotService.getByGroups(groups.map((g) => g.id));
      if (slots.length) {
        const now = new Date();
        const assignments = await workoutAssignmentService.getByDateRange(
          slots.map((s) => s.id),
          toISODate(now),
          toISODate(new Date(now.getTime() + 14 * 86400000)),
        );

        // Workouts en batch (anti N+1) + sessions du nageur
        const [workouts, sessions] = await Promise.all([
          workoutService.getByIds([...new Set(assignments.map((a) => a.workout_id))]),
          workoutSessionService.getBySwimmer(swimmerId),
        ]);
        const workoutById = new Map(workouts.map((w) => [w.id, w]));

        upcoming = assignments.slice(0, 3).map((assignment) => {
          const slot = slots.find((s) => s.id === assignment.training_slot_id);
          const workout = workoutById.get(assignment.workout_id);
          const timing = {
            scheduledDate: assignment.scheduled_date,
            startTime: slot?.start_time,
            durationMinutes: slot?.duration_minutes,
          };
          const revealed = isSessionRevealed({
            ...timing,
            attendanceMarked: assignment.attendance_marked,
            showBeforeSession: (workout as { show_before_session?: boolean } | undefined)?.show_before_session,
          });
          return {
            assignment,
            // Programme secret : ni titre, ni type, ni volume avant la fin de la séance
            workoutTitle: revealed ? workout?.title || 'Séance' : `Séance ${slot?.name || ''}`.trim(),
            workoutType: revealed ? workout?.type || 'other' : 'other',
            totalDistance: revealed ? (workout?.total_distance ?? null) : null,
            slotName: slot?.name || '',
            revealed,
            revealTime: formatRevealTime(timing),
            session:
              sessions.find((s) => s.workout_assignment_id === assignment.id) || null,
          };
        });
      }
    }
  }

  // Presence declaree pour la prochaine seance (renvoie [] si migration 014 absente)
  let nextPresence: SessionPresence | null = null;
  if (upcoming.length > 0) {
    try {
      const declarations = await presenceService.getBySwimmer(swimmerId, [
        upcoming[0].assignment.id,
      ]);
      nextPresence = declarations[0] || null;
    } catch {}
  }

  return { club, stats, history, pending, upcoming, nextPresence };
}

export function useSwimmerDashboard(swimmerId: string | undefined, clubId: string | null) {
  return useQuery({
    queryKey: ['swimmer', 'dashboard', swimmerId ?? '', clubId ?? ''],
    queryFn: () => fetchSwimmerDashboard(swimmerId!, clubId),
    enabled: !!swimmerId,
  });
}
