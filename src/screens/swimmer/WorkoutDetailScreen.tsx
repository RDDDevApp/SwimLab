import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Workout,
  WorkoutBlock,
  WORKOUT_TYPES,
  STROKE_LABELS,
  INTENSITY_LABELS,
} from '../../types';
import { workoutService } from '../../services';

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

  const blockTypeLabels: Record<string, string> = {
    warmup: 'Echauffement',
    main: 'Serie Principale',
    cooldown: 'Retour Calme',
    drill: 'Educatifs',
    sprint: 'Sprint',
    endurance: 'Endurance',
    other: 'Autre',
  };

  const blockTypeColors: Record<string, string> = {
    warmup: '#10B981',
    main: '#3B82F6',
    cooldown: '#8B5CF6',
    drill: '#F59E0B',
    sprint: '#EF4444',
    endurance: '#06B6D4',
    other: '#6B7280',
  };

  if (loading || !workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
      </SafeAreaView>
    );
  }

  const blocks: WorkoutBlock[] = workout.content?.blocks || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          {workout.title}
        </Text>
        <View style={styles.chipRow}>
          <Chip compact style={styles.typeChip}>
            {WORKOUT_TYPES[workout.type as keyof typeof WORKOUT_TYPES]}
          </Chip>
          {workout.total_distance ? (
            <Chip compact icon="ruler" style={styles.distanceChip}>
              {workout.total_distance}m
            </Chip>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {workout.description ? (
          <Card style={styles.descCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.descText}>
                {workout.description}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {blocks.map((block, bIndex) => {
          const color = blockTypeColors[block.type] || '#6B7280';

          return (
            <Card
              key={block.id || bIndex}
              style={[styles.blockCard, { borderLeftColor: color }]}
            >
              <Card.Content>
                <View style={styles.blockHeader}>
                  <Chip compact style={[styles.blockTypeChip, { backgroundColor: color + '20' }]}>
                    <Text style={{ color, fontWeight: '600', fontSize: 11 }}>
                      {blockTypeLabels[block.type] || block.type}
                    </Text>
                  </Chip>
                  {block.name ? (
                    <Text variant="titleSmall" style={styles.blockName}>
                      {block.name}
                    </Text>
                  ) : null}
                </View>

                {block.sub_blocks.map((sb, sbIndex) => {
                  // Compute distance from exercises if sub-block distance is 0
                  const sbDistance = sb.distance > 0
                    ? sb.distance
                    : sb.exercises.reduce((sum, ex) => sum + (ex.distance || 0), 0);

                  return (
                  <View key={sb.id || sbIndex} style={styles.subBlock}>
                    <Text variant="titleSmall" style={styles.subBlockTitle}>
                      {sb.title || `${sb.series}x${sbDistance}m`}
                    </Text>
                    {sb.departure ? (
                      <Text variant="bodySmall" style={styles.departure}>
                        Depart: {sb.departure}
                      </Text>
                    ) : null}
                    {sb.notes ? (
                      <Text variant="bodySmall" style={styles.notes}>
                        {sb.notes}
                      </Text>
                    ) : null}

                    {sb.exercises.map((ex, exIndex) => (
                      <View key={ex.id || exIndex} style={styles.exercise}>
                        <View style={styles.exerciseRow}>
                          <Chip compact style={styles.exChip}>
                            {ex.distance}m
                          </Chip>
                          <Chip compact style={styles.exChip}>
                            {STROKE_LABELS[ex.stroke as keyof typeof STROKE_LABELS] || ex.stroke}
                          </Chip>
                          <Chip compact style={styles.exChip}>
                            {INTENSITY_LABELS[ex.intensity as keyof typeof INTENSITY_LABELS] || ex.intensity}
                          </Chip>
                        </View>
                        {ex.target_time ? (
                          <Text variant="bodySmall" style={styles.targetTime}>
                            Objectif: {ex.target_time}
                          </Text>
                        ) : null}
                        {ex.notes ? (
                          <Text variant="bodySmall" style={styles.exNotes}>
                            {ex.notes}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                  );
                })}
              </Card.Content>
            </Card>
          );
        })}
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
    backgroundColor: '#CFFAFE',
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
    color: '#9CA3AF',
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  descText: {
    color: '#374151',
  },
  blockCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  blockTypeChip: {
    height: 26,
  },
  blockName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  subBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subBlockTitle: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  departure: {
    color: '#6B7280',
    marginBottom: 2,
  },
  notes: {
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  exercise: {
    marginTop: 6,
    paddingLeft: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  exChip: {
    height: 24,
  },
  targetTime: {
    color: '#6B7280',
    marginTop: 2,
  },
  exNotes: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
