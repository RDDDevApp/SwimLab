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
    if (!assignment) return 'rgba(255,255,255,0.25)'; // dim - slot exists but no assignment
    if (!assignment.attendance_marked) return '#3B82F6'; // blue - assigned
    if (rpeMap?.[assignment.id] != null) return '#34D399'; // green - feedback done
    return '#FB923C'; // orange - attendance done, feedback pending
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
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Text variant="labelSmall" style={styles.headerText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    color: 'rgba(255,255,255,0.50)',
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
    backgroundColor: 'rgba(0, 201, 219, 0.15)',
  },
  dayNumber: {
    fontWeight: '500',
    color: '#FFFFFF',
    fontSize: 14,
  },
  otherMonthDay: {
    color: 'rgba(255,255,255,0.25)',
  },
  todayNumber: {
    color: '#00C9DB',
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
