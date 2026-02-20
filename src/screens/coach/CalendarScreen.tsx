import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { trainingSlotService, workoutAssignmentService, workoutService, workoutSessionService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { getWeekDates, formatWeekRange, toISODate, getMonthCalendarDates, formatMonthYear, getMonthDateRange } from '../../utils/dateHelpers';
import WeekView from '../../components/calendar/WeekView';
import MonthView from '../../components/calendar/MonthView';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
}

type ViewMode = 'week' | 'month';

export default function CalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [rpeMap, setRpeMap] = useState<Record<string, number | null>>({});
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthCalendarDates(currentDate);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const coachSlots = await trainingSlotService.getByCoach(user.id);
      setSlots(coachSlots);

      if (coachSlots.length > 0) {
        const slotIds = coachSlots.map((s) => s.id);

        let startDate: string;
        let endDate: string;
        if (viewMode === 'month') {
          const range = getMonthDateRange(currentDate);
          startDate = range.startDate;
          endDate = range.endDate;
        } else {
          const dates = getWeekDates(currentDate);
          startDate = toISODate(dates[0]);
          endDate = toISODate(dates[6]);
        }

        const rangeAssignments = await workoutAssignmentService.getByDateRange(
          slotIds,
          startDate,
          endDate,
        );
        setAssignments(rangeAssignments);

        const uniqueWorkoutIds = [...new Set(rangeAssignments.map((a) => a.workout_id))];
        const titles: Record<string, string> = {};
        for (const wId of uniqueWorkoutIds) {
          try {
            const workout = await workoutService.getById(wId);
            titles[wId] = workout.title;
          } catch {}
        }
        setWorkoutTitles(titles);

        const markedIds = rangeAssignments
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
        setWorkoutTitles({});
      }
    } catch (err) {
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [user, currentDate, viewMode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const goToPrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleMonthDayPress = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  const headerLabel = viewMode === 'month'
    ? formatMonthYear(currentDate)
    : formatWeekRange(currentDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="headlineMedium" style={styles.title}>
            Calendrier
          </Text>
          <SegmentedButtons
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
            density="small"
            style={styles.segmented}
            buttons={[
              { value: 'week', label: 'Sem', style: styles.segBtn },
              { value: 'month', label: 'Mois', style: styles.segBtn },
            ]}
          />
        </View>
        <View style={styles.weekNav}>
          <IconButton icon="chevron-left" onPress={goToPrev} />
          <Text
            variant="titleSmall"
            style={styles.weekRange}
            onPress={goToToday}
          >
            {headerLabel}
          </Text>
          <IconButton icon="chevron-right" onPress={goToNext} />
        </View>
      </View>

      {slots.length === 0 && !loading ? (
        <EmptyState
          icon="calendar-blank"
          title="Aucun creneau configure"
          subtitle="Creez des creneaux pour voir votre calendrier"
        />
      ) : viewMode === 'month' ? (
        <ScrollView>
          <MonthView
            dates={monthDates}
            currentMonth={currentDate.getMonth()}
            slots={slots}
            assignments={assignments}
            rpeMap={rpeMap}
            onDayPress={handleMonthDayPress}
          />
        </ScrollView>
      ) : (
        <WeekView
          dates={weekDates}
          slots={slots}
          assignments={assignments}
          rpeMap={rpeMap}
          workoutTitles={workoutTitles}
          onSlotPress={(slot, date, assignment) => {
            const workoutTitle = workoutTitles[assignment.workout_id];
            navigation.navigate('SessionDetail', {
              slot,
              date: toISODate(date),
              assignment,
              workoutTitle,
            });
          }}
          onEmptySlotPress={(slot, date) => {
            navigation.navigate('SessionDetail', {
              slot,
              date: toISODate(date),
              assignment: null,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  segmented: {
    maxWidth: 160,
  },
  segBtn: {
    minWidth: 60,
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
});
