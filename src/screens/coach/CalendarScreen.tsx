import React, { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import SegmentedToggle from '../../components/SegmentedToggle';
import GradientScreen from '../../components/GradientScreen';
import { queryKeys, useRefreshOnFocus } from '../../hooks';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { trainingSlotService, workoutAssignmentService, workoutService, workoutSessionService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { getWeekDates, formatWeekRange, toISODate, getMonthCalendarDates, formatMonthYear, getMonthDateRange } from '../../utils/dateHelpers';
import WeekView from '../../components/calendar/WeekView';
import MonthView from '../../components/calendar/MonthView';
import EmptyState from '../../components/EmptyState';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
}

type ViewMode = 'week' | 'month';

interface CoachCalendarData {
  slots: TrainingSlot[];
  assignments: WorkoutAssignment[];
  rpeMap: Record<string, number | null>;
  workoutTitles: Record<string, string>;
}

/** Créneaux du coach, séances de la période, titres et RPE moyen des séances émargées. */
async function fetchCoachCalendar(
  coachId: string,
  startDate: string,
  endDate: string,
): Promise<CoachCalendarData> {
  const slots = await trainingSlotService.getByCoach(coachId);
  if (slots.length === 0) return { slots, assignments: [], rpeMap: {}, workoutTitles: {} };

  const assignments = await workoutAssignmentService.getByDateRange(
    slots.map((s) => s.id),
    startDate,
    endDate,
  );

  // Titres des séances en une requête (anti N+1) ; un échec n'empêche pas l'affichage
  const workoutTitles: Record<string, string> = {};
  try {
    const workouts = await workoutService.getByIds([...new Set(assignments.map((a) => a.workout_id))]);
    for (const w of workouts) workoutTitles[w.id] = w.title;
  } catch {}

  let rpeMap: Record<string, number | null> = {};
  const markedIds = assignments.filter((a) => a.attendance_marked).map((a) => a.id);
  if (markedIds.length > 0) {
    try {
      rpeMap = await workoutSessionService.getAverageRpeByAssignments(markedIds);
    } catch {}
  }
  return { slots, assignments, rpeMap, workoutTitles };
}

export default function CalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthCalendarDates(currentDate);

  const { startDate, endDate } =
    viewMode === 'month'
      ? getMonthDateRange(currentDate)
      : { startDate: toISODate(weekDates[0]), endDate: toISODate(weekDates[6]) };

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: queryKeys.coachCalendar(user?.id ?? '', startDate, endDate),
    queryFn: () => fetchCoachCalendar(user!.id, startDate, endDate),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });
  useRefreshOnFocus(refetch);
  const { slots = [], assignments = [], rpeMap = {}, workoutTitles = {} } = data ?? {};

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
    <GradientScreen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="headlineMedium" style={styles.title}>
            Calendrier
          </Text>
          <View style={styles.segmented}>
            <SegmentedToggle
              options={['Semaine', 'Mois']}
              selectedIndex={viewMode === 'week' ? 0 : 1}
              onChange={(i) => setViewMode(i === 0 ? 'week' : 'month')}
            />
          </View>
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
          title="Aucun créneau configuré"
          subtitle="Crée des créneaux pour voir ton calendrier"
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
  },
  segmented: {
    width: 170,
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
});
