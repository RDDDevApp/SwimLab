import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import {
  Workout,
  WorkoutBlock,
  STROKE_LABELS,
  INTENSITY_LABELS,
} from '../../types';

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

interface Props {
  workout: Workout;
}

export default function WorkoutContentView({ workout }: Props) {
  const blocks: WorkoutBlock[] = workout.content?.blocks || [];

  return (
    <View>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
