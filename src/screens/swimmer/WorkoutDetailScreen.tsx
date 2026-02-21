import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { Workout } from '../../types';
import { workoutService } from '../../services';
import WorkoutContentView from '../../components/workout/WorkoutContentView';

interface Props {
  navigation: any;
  route: any;
}

export default function WorkoutDetailScreen({ navigation, route }: Props) {
  const { workoutId, workoutTitle } = route.params;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await workoutService.getById(workoutId);
      setWorkout(data);
    } catch (err) {
      console.error('Error loading workout:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !workout) {
    return (
      <GradientScreen>
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
        </View>
        <View style={styles.loading}>
          <Text variant="bodyMedium" style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          {workout.title}
        </Text>
        <View style={styles.chipRow}>
          {workout.total_distance ? (
            <Chip compact icon="ruler" style={styles.distanceChip}>
              {workout.total_distance}m
            </Chip>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <WorkoutContentView workout={workout} />
      </ScrollView>
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
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 4,
  },
  typeChip: {
    height: 26,
  },
  distanceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    height: 26,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
  },
});
