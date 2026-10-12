import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip, RadioButton, HelperText } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { Workout } from '../../types';
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
      setError('Sélectionne une séance');
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
      showSnackbar('Séance assignée', 'success');
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
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Assigner une séance
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
            Aucune séance publiée
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Crée et publie d'abord une séance
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateWorkout')}
            style={styles.createBtn}
          >
            Créer une séance
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
                    {item.total_distance ? (
                      <Text variant="bodySmall" style={styles.distance}>
                        {item.total_distance}m
                      </Text>
                    ) : null}
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
            Assigner la séance
          </Button>
        </View>
      )}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#0891B2',
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
    color: '#1e293b',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  distance: {
    color: '#0891B2',
    fontWeight: '600',
  },
  desc: {
    color: '#64748b',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  createBtn: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.60)',
  },
});
