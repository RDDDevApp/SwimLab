import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, IconButton, Text, Divider } from 'react-native-paper';
import { SubBlock, Exercise, ExerciseLibraryRow } from '../../types';
import ExerciseEditor from './ExerciseEditor';
import ExercisePickerModal from './ExercisePickerModal';

interface SubBlockEditorProps {
  subBlock: SubBlock;
  onChange: (subBlock: SubBlock) => void;
  onRemove: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function SubBlockEditor({
  subBlock,
  onChange,
  onRemove,
}: SubBlockEditorProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const addFromLibrary = (libExercise: ExerciseLibraryRow) => {
    const newExercise: Exercise = {
      id: generateId(),
      distance: libExercise.distance,
      stroke: libExercise.stroke,
      intensity: libExercise.intensity,
      notes: libExercise.notes || undefined,
    };
    onChange({ ...subBlock, exercises: [...subBlock.exercises, newExercise] });
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      distance: 100,
      stroke: 'freestyle',
      intensity: 'moderate',
    };
    onChange({ ...subBlock, exercises: [...subBlock.exercises, newExercise] });
  };

  const updateExercise = (index: number, exercise: Exercise) => {
    const updated = [...subBlock.exercises];
    updated[index] = exercise;
    onChange({ ...subBlock, exercises: updated });
  };

  const removeExercise = (index: number) => {
    const updated = subBlock.exercises.filter((_, i) => i !== index);
    onChange({ ...subBlock, exercises: updated });
  };

  const totalDistance = subBlock.exercises.reduce(
    (sum, ex) => sum + ex.distance,
    0,
  ) * subBlock.series;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={styles.label}>Sous-bloc</Text>
        <Text variant="labelSmall" style={styles.distance}>{totalDistance}m</Text>
        <IconButton
          icon="close"
          size={18}
          iconColor="#EF4444"
          onPress={onRemove}
          style={styles.removeBtn}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Titre"
          value={subBlock.title}
          onChangeText={(v) => onChange({ ...subBlock, title: v })}
          mode="outlined"
          dense
          style={[styles.input, styles.flex2]}
        />
        <TextInput
          label="Series"
          value={String(subBlock.series)}
          onChangeText={(v) =>
            onChange({ ...subBlock, series: parseInt(v, 10) || 1 })
          }
          mode="outlined"
          dense
          keyboardType="numeric"
          style={[styles.input, styles.flex1]}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Depart"
          placeholder="Ex: 1'30"
          value={subBlock.departure || ''}
          onChangeText={(v) => onChange({ ...subBlock, departure: v })}
          mode="outlined"
          dense
          style={[styles.input, styles.flex1]}
        />
        <TextInput
          label="Notes"
          value={subBlock.notes || ''}
          onChangeText={(v) => onChange({ ...subBlock, notes: v })}
          mode="outlined"
          dense
          style={[styles.input, styles.flex2]}
        />
      </View>

      <Divider style={styles.divider} />

      {subBlock.exercises.map((exercise, index) => (
        <ExerciseEditor
          key={exercise.id}
          exercise={exercise}
          onChange={(ex) => updateExercise(index, ex)}
          onRemove={() => removeExercise(index)}
        />
      ))}

      <View style={styles.addRow}>
        <Button
          mode="text"
          icon="plus"
          onPress={addExercise}
          compact
          style={styles.addBtn}
        >
          Exercice vide
        </Button>
        <Button
          mode="text"
          icon="bookshelf"
          onPress={() => setPickerVisible(true)}
          compact
          style={styles.addBtn}
        >
          Bibliotheque
        </Button>
      </View>

      <ExercisePickerModal
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        onSelect={addFromLibrary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#374151',
    flex: 1,
  },
  distance: {
    color: '#06B6D4',
    fontWeight: 'bold',
    marginRight: 4,
  },
  removeBtn: {
    margin: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  divider: {
    marginVertical: 8,
  },
  addRow: {
    flexDirection: 'row',
    gap: 4,
  },
  addBtn: {
    alignSelf: 'flex-start',
  },
});
