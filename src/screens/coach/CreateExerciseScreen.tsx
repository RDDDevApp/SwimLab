import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StrokeType,
  IntensityType,
  STROKE_LABELS,
  INTENSITY_LABELS,
  EXERCISE_CATEGORIES,
  ExerciseCategory,
} from '../../types';
import { exerciseLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import PickerSelect from '../../components/PickerSelect';

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateExerciseScreen({ navigation, route }: Props) {
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const editing = route?.params?.exercise;

  const [name, setName] = useState(editing?.name || '');
  const [distance, setDistance] = useState(String(editing?.distance || 100));
  const [stroke, setStroke] = useState<string>(editing?.stroke || 'freestyle');
  const [intensity, setIntensity] = useState<string>(
    editing?.intensity || 'moderate',
  );
  const [category, setCategory] = useState<string>(
    editing?.category || 'other',
  );
  const [notes, setNotes] = useState(editing?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strokeOptions = Object.entries(STROKE_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const intensityOptions = Object.entries(INTENSITY_LABELS).map(
    ([key, label]) => ({
      value: key,
      label,
    }),
  );

  const categoryOptions = Object.entries(EXERCISE_CATEGORIES).map(
    ([key, label]) => ({
      value: key,
      label,
    }),
  );

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    if (!user || !clubId) return;

    setLoading(true);
    setError('');

    try {
      if (editing) {
        await exerciseLibraryService.update(editing.id, {
          name: name.trim(),
          distance: parseInt(distance, 10) || 100,
          stroke: stroke as StrokeType,
          intensity: intensity as IntensityType,
          category,
          notes: notes.trim() || null,
        });
        showSnackbar('Exercice modifie', 'success');
      } else {
        await exerciseLibraryService.create({
          club_id: clubId,
          coach_id: user.id,
          name: name.trim(),
          distance: parseInt(distance, 10) || 100,
          stroke: stroke as StrokeType,
          intensity: intensity as IntensityType,
          category,
          notes: notes.trim() || null,
        });
        showSnackbar('Exercice cree', 'success');
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {editing ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          label="Nom de l'exercice"
          placeholder="Ex: 4x100m Crawl"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            label="Distance (m)"
            value={distance}
            onChangeText={setDistance}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.flex1]}
          />
          <PickerSelect
            label="Categorie"
            value={category}
            options={categoryOptions}
            onChange={setCategory}
            style={styles.flex1}
          />
        </View>

        <View style={styles.row}>
          <PickerSelect
            label="Nage"
            value={stroke}
            options={strokeOptions}
            onChange={setStroke}
            style={styles.flex1}
          />
          <PickerSelect
            label="Intensite"
            value={intensity}
            options={intensityOptions}
            onChange={setIntensity}
            style={styles.flex1}
          />
        </View>

        <TextInput
          label="Notes (optionnel)"
          placeholder="Description, consignes..."
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveBtn}
        >
          {editing ? 'Enregistrer' : 'Creer l\'exercice'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#8B5CF6',
  },
});
