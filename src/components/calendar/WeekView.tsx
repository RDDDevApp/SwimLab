import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { TrainingSlot, WorkoutAssignment } from '../../types';
import { formatShortDate, isToday, getDayOfWeek, formatTime } from '../../utils/dateHelpers';

interface WeekViewProps {
  dates: Date[];
  slots: TrainingSlot[];
  assignments: WorkoutAssignment[];
  rpeMap?: Record<string, number | null>;
  workoutTitles?: Record<string, string>;
  onSlotPress: (slot: TrainingSlot, date: Date, assignment: WorkoutAssignment) => void;
  onEmptySlotPress?: (slot: TrainingSlot, date: Date) => void;
}

const getRpeColor = (rpe: number) => {
  if (rpe <= 12) return { bg: '#D1FAE5', text: '#065F46' };
  if (rpe <= 15) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#FEE2E2', text: '#991B1B' };
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
        const dateStr = date.toISOString().split('T')[0];

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
                    <Text variant="labelMedium" style={styles.slotName}>
                      {slot.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.slotTime}>
                      {formatTime(slot.start_time)} - {slot.duration_minutes}min
                    </Text>
                    {assignment ? (
                      <View>
                        {workoutTitle ? (
                          <Text variant="bodySmall" style={styles.workoutTitle}>
                            {workoutTitle}
                          </Text>
                        ) : null}
                        <View style={styles.chipRow}>
                          <Chip
                            compact
                            style={assignment.attendance_marked ? styles.markedChip : styles.assignedChip}
                            textStyle={assignment.attendance_marked ? styles.markedChipText : styles.assignedChipText}
                          >
                            {assignment.attendance_marked ? 'Emarge' : 'A emerger'}
                          </Chip>
                          {rpeMap && rpeMap[assignment.id] != null && (() => {
                            const rpe = rpeMap[assignment.id]!;
                            const colors = getRpeColor(rpe);
                            return (
                              <Chip
                                compact
                                style={[styles.rpeChip, { backgroundColor: colors.bg }]}
                                textStyle={[styles.rpeChipText, { color: colors.text }]}
                              >
                                RPE {rpe.toFixed(1)}
                              </Chip>
                            );
                          })()}
                        </View>
                      </View>
                    ) : (
                      <Text variant="bodySmall" style={styles.noAssignment}>
                        + Assigner seance
                      </Text>
                    )}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  todayColumn: {
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  dayHeader: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  todayHeader: {
    backgroundColor: '#CFFAFE',
  },
  dayLabel: {
    color: '#374151',
    fontWeight: '600',
  },
  todayLabel: {
    color: '#0E7490',
    fontWeight: 'bold',
  },
  emptyDay: {
    padding: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  slotItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  slotFilled: {
    backgroundColor: '#F0FDFA',
  },
  slotEmpty: {
    backgroundColor: '#FFFFFF',
  },
  slotName: {
    color: '#1F2937',
    fontWeight: '600',
  },
  slotTime: {
    color: '#6B7280',
    marginTop: 2,
  },
  workoutTitle: {
    color: '#0E7490',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  assignedChip: {
    backgroundColor: '#CFFAFE',
    height: 26,
  },
  assignedChipText: {
    fontSize: 11,
    color: '#0E7490',
  },
  markedChip: {
    backgroundColor: '#D1FAE5',
    height: 26,
  },
  markedChipText: {
    fontSize: 11,
    color: '#065F46',
  },
  rpeChip: {
    height: 26,
  },
  rpeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noAssignment: {
    color: '#06B6D4',
    marginTop: 6,
    fontWeight: '500',
  },
});
