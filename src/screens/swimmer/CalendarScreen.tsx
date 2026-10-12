import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
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
import { WORKOUT_TYPE_COLORS } from '../../config/tokens';
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

export default function SwimmerCalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<EnrichedAssignment[]>([]);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekDates = getWeekDates(currentDate);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const groups = await groupService.getBySwimmer(user.id);
      if (!groups.length) {
        setItems([]);
        setSlots([]);
        return;
      }

      // Creneaux de tous les groupes en 1 requete (anti N+1)
      const allSlots = await trainingSlotService.getByGroups(groups.map((g) => g.id));
      setSlots(allSlots);

      if (!allSlots.length) {
        setItems([]);
        return;
      }

      const dates = getWeekDates(currentDate);
      const startDate = toISODate(dates[0]);
      const endDate = toISODate(dates[6]);
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
        sessions = await workoutSessionService.getBySwimmer(user.id);
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

      setItems(enriched);
    } catch (err) {
      console.error('Error loading swimmer calendar:', err);
      setError('Erreur de chargement du calendrier');
    } finally {
      setLoading(false);
    }
  }, [user, currentDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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
      return { color: '#10B981', label: 'Feedback donné' };       // Green
    }
    if (session?.attended && !session?.completed_at) {
      return { color: '#F59E0B', label: 'Feedback à donner' };    // Orange
    }
    if (session && !session.attended) {
      return { color: 'rgba(100,116,139,0.45)', label: 'Absent' };               // Gray
    }
    if (isPast && !assignment.attendance_marked) {
      return { color: 'rgba(100,116,139,0.45)', label: 'Non marqué' };           // Gray
    }
    return { color: '#3B82F6', label: 'À venir' };               // Blue
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
                            <Ionicons name="lock-closed-outline" size={14} color="#64748b" />
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
                              <AnimatedCountdown target={sessionStart} color="#ec4899" />
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
                          <View style={[styles.statusDot, { backgroundColor: 'rgba(100,116,139,0.45)' }]} />
                          <Text variant="labelMedium" style={styles.slotName}>
                            {slot.name}
                          </Text>
                        </View>
                        <Text style={[styles.statusLabel, { color: 'rgba(100,116,139,0.45)' }]}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  weekRange: {
    color: '#0891b2',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  errorText: {
    color: '#92400E',
    fontSize: 13,
  },
  list: {
    padding: 12,
    gap: 8,
  },
  dayColumn: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  dayHeader: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  todayHeader: {
    backgroundColor: 'rgba(219, 39, 119, 0.12)',
  },
  dayLabel: {
    color: '#0891b2',
    fontWeight: '600',
  },
  todayLabel: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
  emptyDay: {
    padding: 12,
  },
  emptyText: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.50)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  slotItemEmpty: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.50)',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
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
    color: '#1e293b',
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  slotTime: {
    color: '#64748b',
    marginTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
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
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  typeChipText: {
    fontSize: 11,
    color: '#0891b2',
    fontWeight: '500',
  },
  countdownChip: {
    backgroundColor: 'rgba(219, 39, 119, 0.10)',
  },
});
