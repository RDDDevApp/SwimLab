import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useWorkout } from '../../hooks';
import WorkoutContentView from '../../components/workout/WorkoutContentView';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
  route: any;
}

export default function WorkoutDetailScreen({ navigation, route }: Props) {
  const { workoutId, workoutTitle } = route.params;

  // Une erreur veut dire : séance pas encore dévoilée (programme secret) ou supprimée
  const { data: workout, isLoading: loading, isError: unavailable } = useWorkout(workoutId, {
    retry: false,
  });

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
            {unavailable
              ? 'Ce programme sera dévoilé à la fin de la séance.'
              : 'Chargement...'}
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
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
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
    backgroundColor: C.surface,
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
    color: C.inkMuted,
  },
});
