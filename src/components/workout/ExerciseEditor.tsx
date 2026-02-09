import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';
import { Exercise, STROKE_LABELS, INTENSITY_LABELS, StrokeType, IntensityType } from '../../types';
import PickerSelect from '../PickerSelect';

interface ExerciseEditorProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onRemove: () => void;
}

export default function ExerciseEditor({ exercise, onChange, onRemove }: ExerciseEditorProps) {
  const strokeOptions = Object.entries(STROKE_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const intensityOptions = Object.entries(INTENSITY_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text variant="labelSmall" style={styles.label}>Exercice</Text>
        <IconButton
          icon="close"
          size={16}
          iconColor="#EF4444"
          onPress={onRemove}
          style={styles.removeBtn}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Distance (m)"
          value={String(exercise.distance || '')}
          onChangeText={(v) =>
            onChange({ ...exercise, distance: parseInt(v, 10) || 0 })
          }
          mode="outlined"
          keyboardType="numeric"
          dense
          style={[styles.input, styles.smallInput]}
        />
        <PickerSelect
          label="Nage"
          value={exercise.stroke}
          options={strokeOptions}
          onChange={(v) => onChange({ ...exercise, stroke: v as StrokeType })}
          style={styles.flex1}
        />
      </View>

      <View style={styles.row}>
        <PickerSelect
          label="Intensite"
          value={exercise.intensity}
          options={intensityOptions}
          onChange={(v) => onChange({ ...exercise, intensity: v as IntensityType })}
          style={styles.flex1}
        />
        <TextInput
          label="Notes"
          value={exercise.notes || ''}
          onChangeText={(v) => onChange({ ...exercise, notes: v })}
          mode="outlined"
          dense
          style={[styles.input, styles.flex1]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#6B7280',
  },
  removeBtn: {
    margin: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  smallInput: {
    width: 100,
  },
  flex1: {
    flex: 1,
  },
});
