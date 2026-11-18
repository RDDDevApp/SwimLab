import React, { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { queryKeys, useRefreshOnFocus } from '../../hooks';
import { WorkoutAssignment, WorkoutSession, TrainingSlot } from '../../types';
import {
  groupService,
  trainingSlotService,
  workoutAssignmentService,
  workoutSessionService,
  workoutService,
} from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { getWeekDates, formatWeekRange, toISODate, formatShortDate, isToday, getDayOfWeek, formatTime } from '../../utils/dateHelpers';
import { WORKOUT_TYPE_COLORS, C, FONTS } from '../../config/tokens';
import AnimatedCountdown from '../../components/AnimatedCountdown';
import { Ionicons } from '@expo/vector-icons';
import { formatRevealTime, isSessionRevealed } from '../../utils/workoutVisibility';

interface EnrichedAssignment {
  assignment: WorkoutAssignment;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
  slotName: string;
  slot: TrainingSlot;
  session: WorkoutSession | null;
  /** Programme visible : séance finie, émargement fait ou montré par le coach */
  revealed: boolean;
}

interface Props {
  navigation: any;
}

/** Créneaux des groupes du nageur et séances de la semaine, avec la règle du programme secret. */
async function fetchSwimmerWeek(
  swimmerId: string,
  startDate: string,
  endDate: string,
): Promise<{ items: EnrichedAssignment[]; slots: TrainingSlot[] }> {
  const groups = await groupService.getBySwimmer(swimmerId);
  if (!groups.length) return { items: [], slots: [] };

  // Creneaux de tous les groupes en 1 requete (anti N+1)
  const allSlots = await trainingSlotService.getByGroups(groups.map((g) => g.id));
  if (!allSlots.length) return { items: [], slots: allSlots };

  const slotIds = allSlots.map((s) => s.id);

  // Try RPC first (bypasses RLS chain), then direct query as fallback
  let assignments: WorkoutAssignment[] = [];
  try {
    assignments = await workoutAssignmentService.getByDateRangeRpc(
      slotIds,
      startDate,
      endDate,
    );
  } catch (rpcErr) {
    // RPC not available - migration 004 not applied, try direct query
    console.log('RPC not available (apply migration 004):', rpcErr);
    try {
      assignments = await workoutAssignmentService.getByDateRange(
        slotIds,
        startDate,
        endDate,
      );
    } catch (assignErr) {
      console.error('Assignment fetch error:', assignErr);
    }
  }

  let sessions: WorkoutSession[] = [];
  try {
    sessions = await workoutSessionService.getBySwimmer(swimmerId);
  } catch (sessErr) {
    console.error('Session fetch error:', sessErr);
  }

  // Workouts en batch (anti N+1)
  const workoutIds = [...new Set(assignments.map((a) => a.workout_id))];
  let workoutById = new Map<
    string,
    { title: string; type: string | null; total_distance: number | null; show_before_session?: boolean }
  >();
  try {
    const workouts = await workoutService.getByIds(workoutIds);
    workoutById = new Map(workouts.map((w) => [w.id, w]));
  } catch {}

  const enriched: EnrichedAssignment[] = [];
  for (const assignment of assignments) {
    const slot = allSlots.find((s) => s.id === assignment.training_slot_id);
    if (!slot) continue;
    const workout = workoutById.get(assignment.workout_id);

    const session = sessions.find(
      (s) => s.workout_assignment_id === assignment.id,
    ) || null;

    const revealed = isSessionRevealed({
      scheduledDate: assignment.scheduled_date,
      startTime: slot.start_time,
      durationMinutes: slot.duration_minutes,
      attendanceMarked: assignment.attendance_marked,
      showBeforeSession: workout?.show_before_session,
    });

    enriched.push({
      assignment,
      // Programme secret jusqu'à la fin de la séance : ni titre, ni type, ni volume
      workoutTitle: revealed ? workout?.title || 'Séance' : 'Programme secret',
      workoutType: revealed ? workout?.type || 'other' : 'other',
      totalDistance: revealed ? (workout?.total_distance ?? null) : null,
      slotName: slot.name,
      slot,
      session,
      revealed,
    });
  }

  return { items: enriched, slots: allSlots };
}

export default function SwimmerCalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDates = getWeekDates(currentDate);
  const startDate = toISODate(weekDates[0]);
  const endDate = toISODate(weekDates[6]);

  const { data, isError, refetch } = useQuery({
    queryKey: queryKeys.swimmerWeek(user?.id ?? '', startDate),
    queryFn: () => fetchSwimmerWeek(user!.id, startDate, endDate),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });
  useRefreshOnFocus(refetch);
  const { items = [], slots = [] } = data ?? {};
  const error = isError ? 'Erreur de chargement du calendrier' : null;

  const goToPrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusDot = (item: EnrichedAssignment) => {
    const { assignment, session } = item;
    const isPast = new Date(assignment.scheduled_date + 'T23:59:59') < new Date();

    if (session?.completed_at) {
      return { color: C.success, label: 'Feedback donné' };       // Green
    }
    if (session?.attended && !session?.completed_at) {
      return { color: C.warning, label: 'Feedback à donner' };    // Orange
    }
    if (session && !session.attended) {
      return { color: C.inkMuted, label: 'Absent' };               // Gray
    }
    if (isPast && !assignment.attendance_marked) {
      return { color: C.inkMuted, label: 'Non marqué' };           // Gray
    }
    return { color: C.primary, label: 'À venir' };               // Blue
  };

  const getItemsForDate = (dateStr: string) => {
    return items.filter((item) => item.assignment.scheduled_date === dateStr);
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter((s) => s.day_of_week === dayOfWeek);
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes entraînements
        </Text>
        <View style={styles.weekNav}>
          <IconButton icon="chevron-left" onPress={goToPrevWeek} />
          <Text
            variant="titleSmall"
            style={styles.weekRange}
            onPress={goToToday}
          >
            {formatWeekRange(currentDate)}
          </Text>
          <IconButton icon="chevron-right" onPress={goToNextWeek} />
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {weekDates.map((date) => {
          const dateStr = toISODate(date);
          const dayOfWeek = getDayOfWeek(date);
          const today = isToday(date);
          const dayItems = getItemsForDate(dateStr);
          const daySlots = getSlotsForDay(dayOfWeek);

          return (
            <View
              key={dateStr}
              style={[styles.dayColumn, today && styles.todayColumn]}
            >
              <View style={[styles.dayHeader, today && styles.todayHeader]}>
                <Text
                  variant="labelLarge"
                  style={[styles.dayLabel, today && styles.todayLabel]}
                >
                  {formatShortDate(date)}
                </Text>
              </View>

              {daySlots.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Text variant="bodySmall" style={styles.emptyText}>
                    Pas de créneau
                  </Text>
                </View>
              ) : (
                daySlots.map((slot) => {
                  const item = dayItems.find((i) => i.slot.id === slot.id);

                  if (item) {
                    const dot = getStatusDot(item);
                    const typeCfg =
                      WORKOUT_TYPE_COLORS[item.workoutType] || WORKOUT_TYPE_COLORS.other;
                    const isUpcomingToday = today && dot.label === 'À venir';
                    const sessionStart = isUpcomingToday
                      ? new Date(
                          `${item.assignment.scheduled_date}T${item.slot.start_time || '00:00'}`,
                        )
                      : null;
                    return (
                      <Pressable
                        key={slot.id}
                        style={styles.slotItem}
                        onPress={() => {
                          navigation.navigate('SessionDetail', {
                            assignment: item.assignment,
                            workoutTitle: item.workoutTitle,
                            totalDistance: item.totalDistance,
                            slotName: item.slotName,
                            slot: item.slot,
                            session: item.session,
                            revealed: item.revealed,
                          });
                        }}
                      >
                        <View style={styles.slotHeader}>
                          <View style={styles.slotNameRow}>
                            <View style={[styles.statusDot, { backgroundColor: dot.color }]} />
                            <Text variant="labelMedium" style={styles.slotName}>
                              {item.slotName}
                            </Text>
                          </View>
                          <Text style={[styles.statusLabel, { color: dot.color }]}>
                            {dot.label}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.slotTime}>
                          {formatTime(item.slot.start_time)} - {item.slot.duration_minutes}min
                        </Text>
                        <View style={styles.titleRow}>
                          {!item.revealed && (
                            <Ionicons name="lock-closed-outline" size={14} color={C.inkMuted} />
                          )}
                          <Text variant="titleSmall" style={styles.workoutTitle}>
                            {item.workoutTitle}
                          </Text>
                        </View>
                        <View style={styles.chipRow}>
                          {item.revealed ? (
                            <View style={[styles.typeChip, { backgroundColor: typeCfg.bg }]}>
                              <Text style={[styles.typeChipText, { color: typeCfg.color }]}>
                                {typeCfg.label}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.typeChip}>
                              <Text style={styles.typeChipText}>
                                Dévoilé à {formatRevealTime({
                                  scheduledDate: item.assignment.scheduled_date,
                                  startTime: item.slot.start_time,
                                  durationMinutes: item.slot.duration_minutes,
                                })}
                              </Text>
                            </View>
                          )}
                          {item.totalDistance ? (
                            <View style={styles.typeChip}>
                              <Text style={styles.typeChipText}>
                                {item.totalDistance}m
                              </Text>
                            </View>
                          ) : null}
                          {sessionStart && (
                            <View style={[styles.typeChip, styles.countdownChip]}>
                              <AnimatedCountdown target={sessionStart} color={C.danger} />
                            </View>
                          )}
                        </View>
                      </Pressable>
                    );
                  }

                  // Slot without assignment - show as gray
                  return (
                    <View key={slot.id} style={styles.slotItemEmpty}>
                      <View style={styles.slotHeader}>
                        <View style={styles.slotNameRow}>
                          <View style={[styles.statusDot, { backgroundColor: C.lineStrong }]} />
                          <Text variant="labelMedium" style={styles.slotName}>
                            {slot.name}
                          </Text>
                        </View>
                        <Text style={[styles.statusLabel, { color: C.inkMuted }]}>
                          Pas de séance
                        </Text>
                      </View>
                      <Text variant="bodySmall" style={styles.slotTime}>
                        {formatTime(slot.start_time)} - {slot.duration_minutes}min
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          );
        })}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  weekRange: {
    color: C.primary,
    fontFamily: FONTS.textMedium,
  },
  errorBanner: {
    backgroundColor: C.warningSoft,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: C.warning,
    fontSize: 13,
  },
  list: {
    padding: 12,
    gap: 8,
  },
  dayColumn: {
    backgroundColor: C.surface,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: C.primary,
  },
  dayHeader: {
    padding: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  todayHeader: {
    backgroundColor: C.primarySoft,
  },
  dayLabel: {
    color: C.primary,
    fontFamily: FONTS.textStrong,
  },
  todayLabel: {
    color: C.onPrimarySoft,
    fontFamily: FONTS.textBold,
  },
  emptyDay: {
    padding: 12,
  },
  emptyText: {
    color: C.inkMuted,
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: C.surface,
  },
  slotItemEmpty: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: C.surface,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  slotName: {
    color: C.ink,
    fontFamily: FONTS.textStrong,
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: FONTS.textStrong,
  },
  slotTime: {
    color: C.inkMuted,
    marginTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginTop: 4,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  typeChipText: {
    fontSize: 11,
    color: C.primary,
    fontFamily: FONTS.textMedium,
  },
  countdownChip: {
    backgroundColor: C.dangerSoft,
  },
});
