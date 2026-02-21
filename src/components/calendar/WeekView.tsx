import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { formatShortDate, isToday, getDayOfWeek, formatTime, toISODate } from '../../utils/dateHelpers';

interface WeekViewProps {
  dates: Date[];
  slots: TrainingSlot[];
  assignments: WorkoutAssignment[];
  rpeMap?: Record<string, number | null>;
  workoutTitles?: Record<string, string>;
  onSlotPress: (slot: TrainingSlot, date: Date, assignment: WorkoutAssignment) => void;
  onEmptySlotPress?: (slot: TrainingSlot, date: Date) => void;
}

const getSlotStatus = (
  assignment: WorkoutAssignment | undefined,
  rpeMap?: Record<string, number | null>,
) => {
  if (!assignment) return { color: 'rgba(255,255,255,0.30)', label: 'Non assigne' };
  if (!assignment.attendance_marked) return { color: '#3B82F6', label: 'A emarger' };
  if (rpeMap?.[assignment.id] != null) return { color: '#34D399', label: 'Emarger' };
  return { color: '#FB923C', label: 'Feedback manquant' };
};

export default function WeekView({
  dates,
  slots,
  assignments,
  rpeMap,
  workoutTitles,
  onSlotPress,
  onEmptySlotPress,
}: WeekViewProps) {
  const getSlotAssignment = (slot: TrainingSlot, dateStr: string) => {
    return assignments.find(
      (a) => a.training_slot_id === slot.id && a.scheduled_date === dateStr,
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {dates.map((date) => {
        const dayOfWeek = getDayOfWeek(date);
        const daySlots = slots.filter((s) => s.day_of_week === dayOfWeek);
        const today = isToday(date);
        const dateStr = toISODate(date);

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
                const assignment = getSlotAssignment(slot, dateStr);
                const workoutTitle = assignment && workoutTitles
                  ? workoutTitles[assignment.workout_id]
                  : undefined;

                const status = getSlotStatus(assignment, rpeMap);

                return (
                  <Pressable
                    key={slot.id}
                    style={[
                      styles.slotItem,
                      assignment ? styles.slotFilled : styles.slotEmpty,
                    ]}
                    onPress={() =>
                      assignment
                        ? onSlotPress(slot, date, assignment)
                        : onEmptySlotPress?.(slot, date)
                    }
                  >
                    <View style={styles.slotHeader}>
                      <View style={styles.slotNameRow}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text variant="labelMedium" style={styles.slotName}>
                          {slot.name}
                        </Text>
                      </View>
                      <Text style={[styles.statusLabel, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.slotTime}>
                      {formatTime(slot.start_time)} - {slot.duration_minutes}min
                    </Text>
                    {assignment && workoutTitle ? (
                      <Text variant="bodySmall" style={styles.workoutTitle}>
                        {workoutTitle}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  dayColumn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: '#00C9DB',
  },
  dayHeader: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  todayHeader: {
    backgroundColor: 'rgba(0, 201, 219, 0.15)',
  },
  dayLabel: {
    color: '#67E8F9',
    fontWeight: '600',
  },
  todayLabel: {
    color: '#00C9DB',
    fontWeight: 'bold',
  },
  emptyDay: {
    padding: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.30)',
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  slotFilled: {
    backgroundColor: 'rgba(0, 201, 219, 0.08)',
  },
  slotEmpty: {
    backgroundColor: 'transparent',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  slotTime: {
    color: 'rgba(255,255,255,0.50)',
    marginTop: 2,
    marginLeft: 18,
  },
  workoutTitle: {
    color: '#67E8F9',
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 18,
    fontStyle: 'italic',
  },
});
