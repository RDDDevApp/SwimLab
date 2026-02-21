import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { isToday, toISODate, getDayOfWeek } from '../../utils/dateHelpers';

interface MonthViewProps {
  dates: Date[];
  currentMonth: number;
  slots: TrainingSlot[];
  assignments: WorkoutAssignment[];
  rpeMap?: Record<string, number | null>;
  onDayPress: (date: Date) => void;
}

const DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const getDotsForDay = (
  date: Date,
  slots: TrainingSlot[],
  assignments: WorkoutAssignment[],
  rpeMap?: Record<string, number | null>,
) => {
  const dayOfWeek = getDayOfWeek(date);
  const dateStr = toISODate(date);
  const daySlots = slots.filter((s) => s.day_of_week === dayOfWeek);

  return daySlots.map((slot) => {
    const assignment = assignments.find(
      (a) => a.training_slot_id === slot.id && a.scheduled_date === dateStr,
    );
    if (!assignment) return 'rgba(27,67,50,0.20)';
    if (!assignment.attendance_marked) return '#2563EB';
    if (rpeMap?.[assignment.id] != null) return '#059669';
    return '#EA580C';
  });
};

export default function MonthView({
  dates,
  currentMonth,
  slots,
  assignments,
  rpeMap,
  onDayPress,
}: MonthViewProps) {
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Text variant="labelSmall" style={styles.headerText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date) => {
            const today = isToday(date);
            const isCurrentMonth = date.getMonth() === currentMonth;
            const dots = getDotsForDay(date, slots, assignments, rpeMap);

            return (
              <Pressable
                key={toISODate(date)}
                style={[
                  styles.dayCell,
                  today && styles.todayCell,
                ]}
                onPress={() => onDayPress(date)}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.otherMonthDay,
                    today && styles.todayNumber,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {dots.length > 0 && (
                  <View style={styles.dotsRow}>
                    {dots.slice(0, 3).map((color, i) => (
                      <View
                        key={i}
                        style={[styles.dot, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    margin: 12,
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  headerText: {
    color: 'rgba(27,67,50,0.50)',
    fontWeight: '600',
    fontSize: 12,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 48,
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
  },
  dayNumber: {
    fontWeight: '500',
    color: '#1B4332',
    fontSize: 14,
  },
  otherMonthDay: {
    color: 'rgba(27,67,50,0.25)',
  },
  todayNumber: {
    color: '#0891B2',
    fontWeight: 'bold',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
