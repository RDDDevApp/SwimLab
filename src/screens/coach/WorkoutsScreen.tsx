import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Workout, WORKOUT_TYPES } from '../../types';
import { workoutService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  navigation: any;
}

export default function WorkoutsScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);

  const loadWorkouts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workoutService.getByCoach(user.id);
      setWorkouts(data);
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadWorkouts();
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  const handleDuplicate = async (workout: Workout) => {
    if (!user || !clubId) return;
    try {
      await workoutService.create({
        club_id: clubId,
        coach_id: user.id,
        title: `${workout.title} (copie)`,
        type: workout.type,
        description: workout.description,
        content: workout.content,
        total_distance: workout.total_distance,
        is_published: false,
      });
      loadWorkouts();
    } catch (err) {
      console.error('Error duplicating workout:', err);
    }
  };

  const togglePublish = async (workout: Workout) => {
    try {
      if (workout.is_published) {
        await workoutService.unpublish(workout.id);
      } else {
        await workoutService.publish(workout.id);
      }
      loadWorkouts();
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Entrainements
        </Text>
      </View>

      {workouts.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Aucun entrainement cree
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Creez votre premier entrainement structure
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadWorkouts}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() =>
                navigation.navigate('CreateWorkout', { workout: item })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={() => handleDuplicate(item)}
                    />
                    <IconButton
                      icon={item.is_published ? 'eye' : 'eye-off'}
                      size={20}
                      onPress={() => togglePublish(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor="#EF4444"
                      onPress={() => setDeleteTarget(item)}
                    />
                  </View>
                </View>
                <View style={styles.chipRow}>
                  <Chip compact style={styles.chip}>
                    {WORKOUT_TYPES[item.type as keyof typeof WORKOUT_TYPES]}
                  </Chip>
                  {item.total_distance ? (
                    <Chip compact icon="ruler" style={styles.chip}>
                      {item.total_distance}m
                    </Chip>
                  ) : null}
                  <Chip
                    compact
                    style={[
                      styles.chip,
                      item.is_published ? styles.publishedChip : styles.draftChip,
                    ]}
                  >
                    {item.is_published ? 'Publie' : 'Brouillon'}
                  </Chip>
                </View>
                {item.description ? (
                  <Text variant="bodySmall" style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateWorkout')}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer la seance</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{deleteTarget?.title}" ? Cette action est irreversible.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Annuler</Button>
            <Button onPress={handleDelete} textColor="#EF4444">
              Supprimer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  list: {
    padding: 16,
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
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    height: 26,
  },
  publishedChip: {
    backgroundColor: '#D1FAE5',
  },
  draftChip: {
    backgroundColor: '#FEF3C7',
  },
  desc: {
    color: '#6B7280',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#06B6D4',
  },
});
