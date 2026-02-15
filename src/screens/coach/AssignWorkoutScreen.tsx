import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip, RadioButton, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Workout, WORKOUT_TYPES } from '../../types';
import { workoutService, workoutAssignmentService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';

interface Props {
  navigation: any;
  route: any;
}

export default function AssignWorkoutScreen({ navigation, route }: Props) {
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { slotId, slotName, date } = route.params;

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    if (!user) return;
    try {
      const data = await workoutService.getByCoach(user.id);
      // Only show published workouts
      setWorkouts(data.filter((w) => w.is_published));
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) {
      setError('Selectionnez une seance');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await workoutAssignmentService.create({
        workout_id: selectedId,
        training_slot_id: slotId,
        scheduled_date: date,
      });
      showSnackbar('Seance assignee', 'success');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'attribution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Assigner une seance
        </Text>
        <View style={styles.slotInfo}>
          <Chip icon="clock-outline" compact>
            {slotName}
          </Chip>
          <Chip icon="calendar" compact>
            {formatDate(date)}
          </Chip>
        </View>
      </View>

      {workouts.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Aucune seance publiee
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Creez et publiez une seance d'abord
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateWorkout')}
            style={styles.createBtn}
          >
            Creer une seance
          </Button>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              style={[
                styles.workoutCard,
                selectedId === item.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedId(item.id)}
            >
              <Card.Content style={styles.cardContent}>
                <RadioButton
                  value={item.id}
                  status={selectedId === item.id ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedId(item.id)}
                />
                <View style={styles.cardInfo}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Chip compact style={styles.typeChip}>
                      {WORKOUT_TYPES[item.type as keyof typeof WORKOUT_TYPES]}
                    </Chip>
                    {item.total_distance && (
                      <Text variant="bodySmall" style={styles.distance}>
                        {item.total_distance}m
                      </Text>
                    )}
                  </View>
                  {item.description && (
                    <Text variant="bodySmall" style={styles.desc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}

      {workouts.length > 0 && (
        <View style={styles.footer}>
          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}
          <Button
            mode="contained"
            onPress={handleAssign}
            loading={submitting}
            disabled={submitting || !selectedId}
          >
            Assigner la seance
          </Button>
        </View>
      )}
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
  slotInfo: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  list: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  distance: {
    color: '#06B6D4',
    fontWeight: '600',
  },
  desc: {
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  createBtn: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
