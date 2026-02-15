import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DAYS_OF_WEEK } from '../../types';
import { trainingSlotService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateSlotScreen({ navigation, route }: Props) {
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const editingSlot = route?.params?.slot;

  const [name, setName] = useState(editingSlot?.name || '');
  const [dayOfWeek, setDayOfWeek] = useState<string>(
    String(editingSlot?.day_of_week ?? 1),
  );
  const [startTime, setStartTime] = useState(editingSlot?.start_time || '18:00');
  const [duration, setDuration] = useState(
    String(editingSlot?.duration_minutes ?? 90),
  );
  const [location, setLocation] = useState(editingSlot?.location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupId = route?.params?.groupId;

  const dayButtons = DAYS_OF_WEEK.slice(1).concat(DAYS_OF_WEEK[0]).map((day, i) => ({
    value: String(i === 6 ? 0 : i + 1),
    label: day.slice(0, 3),
  }));

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Le nom du creneau est requis');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (editingSlot) {
        await trainingSlotService.update(editingSlot.id, {
          name: name.trim(),
          day_of_week: Number(dayOfWeek),
          start_time: startTime,
          duration_minutes: Number(duration),
          location: location.trim() || null,
        });
      } else {
        await trainingSlotService.create({
          group_id: groupId,
          coach_id: user.id,
          name: name.trim(),
          day_of_week: Number(dayOfWeek),
          start_time: startTime,
          duration_minutes: Number(duration),
          location: location.trim() || null,
        });
      }
      showSnackbar(editingSlot ? 'Creneau modifie' : 'Creneau cree', 'success');
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
        <Text variant="titleLarge" style={styles.title}>
          {editingSlot ? 'Modifier le creneau' : 'Nouveau creneau'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          label="Nom du creneau"
          placeholder="Ex: Mardi soir Compet"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>Jour</Text>
        <SegmentedButtons
          value={dayOfWeek}
          onValueChange={setDayOfWeek}
          buttons={dayButtons}
          style={styles.segmented}
        />

        <View style={styles.row}>
          <TextInput
            label="Heure debut"
            placeholder="18:00"
            value={startTime}
            onChangeText={setStartTime}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            label="Duree (min)"
            placeholder="90"
            value={duration}
            onChangeText={setDuration}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>

        <TextInput
          label="Lieu (optionnel)"
          placeholder="Ex: Piscine Olympique"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
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
          style={styles.saveButton}
        >
          {editingSlot ? 'Modifier' : 'Creer le creneau'}
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
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  form: {
    padding: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    color: '#374151',
    marginTop: 4,
  },
  segmented: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
});
