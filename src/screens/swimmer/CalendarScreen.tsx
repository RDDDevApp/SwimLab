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

interface EnrichedAssignment {
  assignment: WorkoutAssignment;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
  slotName: string;
  slot: TrainingSlot;
  session: WorkoutSession | null;
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

      const allSlots: TrainingSlot[] = [];
      for (const group of groups) {
        const groupSlots = await trainingSlotService.getByGroup(group.id);
        allSlots.push(...groupSlots);
      }
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

      const enriched: EnrichedAssignment[] = [];
      for (const assignment of assignments) {
        const slot = allSlots.find((s) => s.id === assignment.training_slot_id);
        if (!slot) continue;
        let workoutTitle = 'Seance';
        let workoutType = 'other';
        let totalDistance: number | null = null;

        try {
          const workout = await workoutService.getById(assignment.workout_id);
          workoutTitle = workout.title;
          workoutType = workout.type || 'other';
          totalDistance = workout.total_distance;
        } catch {}

        const session = sessions.find(
          (s) => s.workout_assignment_id === assignment.id,
        ) || null;

        enriched.push({
          assignment,
          workoutTitle,
          workoutType,
          totalDistance,
          slotName: slot.name,
          slot,
          session,
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
      return { color: '#10B981', label: 'Feedback donne' };       // Green
    }
    if (session?.attended && !session?.completed_at) {
      return { color: '#F59E0B', label: 'Feedback a donner' };    // Orange
    }
    if (session && !session.attended) {
      return { color: 'rgba(27,67,50,0.45)', label: 'Absent' };               // Gray
    }
    if (isPast && !assignment.attendance_marked) {
      return { color: 'rgba(27,67,50,0.45)', label: 'Non marque' };           // Gray
    }
    return { color: '#3B82F6', label: 'A venir' };               // Blue
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
          Mes Entrainements
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
                    Pas de creneau
                  </Text>
                </View>
              ) : (
                daySlots.map((slot) => {
                  const item = dayItems.find((i) => i.slot.id === slot.id);

                  if (item) {
                    const dot = getStatusDot(item);
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
                        <Text variant="titleSmall" style={styles.workoutTitle}>
                          {item.workoutTitle}
                        </Text>
                        <View style={styles.chipRow}>
                          {item.totalDistance ? (
                            <View style={styles.typeChip}>
                              <Text style={styles.typeChipText}>
                                {item.totalDistance}m
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  }

                  // Slot without assignment - show as gray
                  return (
                    <View key={slot.id} style={styles.slotItemEmpty}>
                      <View style={styles.slotHeader}>
                        <View style={styles.slotNameRow}>
                          <View style={[styles.statusDot, { backgroundColor: 'rgba(27,67,50,0.45)' }]} />
                          <Text variant="labelMedium" style={styles.slotName}>
                            {slot.name}
                          </Text>
                        </View>
                        <Text style={[styles.statusLabel, { color: 'rgba(27,67,50,0.45)' }]}>
                          Pas de seance
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1B4332',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  weekRange: {
    color: '#0E7490',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: '#DB2777',
  },
  dayHeader: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  todayHeader: {
    backgroundColor: 'rgba(219, 39, 119, 0.12)',
  },
  dayLabel: {
    color: '#0E7490',
    fontWeight: '600',
  },
  todayLabel: {
    color: '#DB2777',
    fontWeight: 'bold',
  },
  emptyDay: {
    padding: 12,
  },
  emptyText: {
    color: 'rgba(27,67,50,0.50)',
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  slotItemEmpty: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    color: '#1B4332',
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  slotTime: {
    color: 'rgba(27,67,50,0.50)',
    marginTop: 2,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1B4332',
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
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  typeChipText: {
    fontSize: 11,
    color: '#0E7490',
    fontWeight: '500',
  },
});
