import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';
import { TrainingSlot, DAYS_OF_WEEK } from '../types';
import { formatTime } from '../utils/dateHelpers';
import { C, FONTS } from '../config/tokens';

interface SlotCardProps {
  slot: TrainingSlot;
  onEdit?: (slot: TrainingSlot) => void;
  onDelete?: (slot: TrainingSlot) => void;
}

export default function SlotCard({ slot, onEdit, onDelete }: SlotCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>{slot.name}</Text>
            <View style={styles.chips}>
              <Chip icon="calendar" compact style={styles.chip}>
                {DAYS_OF_WEEK[slot.day_of_week]}
              </Chip>
              <Chip icon="clock-outline" compact style={styles.chip}>
                {formatTime(slot.start_time)} - {slot.duration_minutes}min
              </Chip>
            </View>
            {slot.location && (
              <Text variant="bodySmall" style={styles.location}>
                {slot.location}
              </Text>
            )}
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <IconButton icon="pencil" size={20} onPress={() => onEdit(slot)} />
            )}
            {onDelete && (
              <IconButton icon="delete" size={20} iconColor={C.danger} onPress={() => onDelete(slot)} />
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.textBold,
    color: C.ink,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 28,
  },
  location: {
    color: C.inkMuted,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
  },
});
