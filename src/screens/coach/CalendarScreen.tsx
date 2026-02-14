import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { trainingSlotService, workoutAssignmentService, workoutService, workoutSessionService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { getWeekDates, formatWeekRange, toISODate } from '../../utils/dateHelpers';
import WeekView from '../../components/calendar/WeekView';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
}

export default function CalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [rpeMap, setRpeMap] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(currentDate);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const coachSlots = await trainingSlotService.getByCoach(user.id);
      setSlots(coachSlots);

      if (coachSlots.length > 0) {
        const slotIds = coachSlots.map((s) => s.id);
        const dates = getWeekDates(currentDate);
        const startDate = toISODate(dates[0]);
        const endDate = toISODate(dates[6]);
        const weekAssignments = await workoutAssignmentService.getByDateRange(
          slotIds,
          startDate,
          endDate,
        );
        setAssignments(weekAssignments);

        // Load RPE averages for marked assignments
        const markedIds = weekAssignments
          .filter((a) => a.attendance_marked)
          .map((a) => a.id);
        if (markedIds.length > 0) {
          try {
            const rpeData = await workoutSessionService.getAverageRpeByAssignments(markedIds);
            setRpeMap(rpeData);
          } catch {}
        } else {
          setRpeMap({});
        }
      } else {
        setAssignments([]);
        setRpeMap({});
      }
    } catch (err) {
      console.error('Error loading calendar:', err);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Calendrier
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

      {slots.length === 0 && !loading ? (
        <EmptyState
          icon="calendar-blank"
          title="Aucun creneau configure"
          subtitle="Creez des creneaux pour voir votre calendrier"
        />
      ) : (
        <WeekView
          dates={weekDates}
          slots={slots}
          assignments={assignments}
          rpeMap={rpeMap}
          onSlotPress={async (slot, date, assignment) => {
            let workoutTitle: string | undefined;
            try {
              const workout = await workoutService.getById(assignment.workout_id);
              workoutTitle = workout.title;
            } catch {}

            if (assignment.attendance_marked) {
              navigation.navigate('WorkoutStats', {
                assignmentId: assignment.id,
                workoutTitle,
              });
            } else {
              navigation.navigate('Attendance', {
                assignmentId: assignment.id,
                groupId: slot.group_id,
                workoutTitle,
              });
            }
          }}
          onEmptySlotPress={(slot, date) => {
            navigation.navigate('AssignWorkout', {
              slotId: slot.id,
              slotName: slot.name,
              date: toISODate(date),
            });
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  weekRange: {
    color: '#374151',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
