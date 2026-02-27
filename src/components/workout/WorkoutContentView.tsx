import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Workout, WorkoutBlock, BLOCK_TYPE_LABELS } from '../../types';
import { migrateWorkoutContent } from '../../utils';

const blockTypeColors: Record<string, string> = {
  warmup: '#059669',
  main: '#0891B2',
  cooldown: '#7C3AED',
  other: '#4B5563',
};

interface Props {
  workout: Workout;
}

export default function WorkoutContentView({ workout }: Props) {
  const blocks: WorkoutBlock[] = useMemo(
    () => migrateWorkoutContent(workout.content).blocks,
    [workout.content],
  );

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
        const color = blockTypeColors[block.type] || '#4B5563';
        const blockDistance = block.sub_blocks.reduce(
          (sum, sb) => sum + sb.distance * sb.repetitions,
          0,
        );

        return (
          <Card
            key={block.id || bIndex}
            style={[styles.blockCard, { borderLeftColor: color }]}
          >
            <Card.Content>
              <View style={styles.blockHeader}>
                <Chip compact style={[styles.blockTypeChip, { backgroundColor: color + '18' }]}>
                  <Text style={{ color, fontWeight: '600', fontSize: 11 }}>
                    {BLOCK_TYPE_LABELS[block.type as keyof typeof BLOCK_TYPE_LABELS] || block.type}
                  </Text>
                </Chip>
                {block.name ? (
                  <Text variant="titleSmall" style={styles.blockName}>
                    {block.name}
                  </Text>
                ) : null}
                {blockDistance > 0 ? (
                  <Text variant="labelSmall" style={styles.blockDistance}>
                    {blockDistance}m
                  </Text>
                ) : null}
              </View>

              {block.sub_blocks.map((sb, sbIndex) => {
                const sbTotal = sb.distance * sb.repetitions;

                return (
                  <View key={sb.id || sbIndex} style={styles.subBlock}>
                    <Text variant="titleSmall" style={styles.subBlockTitle}>
                      {sb.repetitions > 1
                        ? `${sb.repetitions} x ${sb.distance}m`
                        : `${sb.distance}m`}
                      {sbTotal > 0 ? ` — ${sbTotal}m` : ''}
                    </Text>
                    {sb.departure ? (
                      <Text variant="bodySmall" style={styles.departure}>
                        Depart: {sb.departure}
                      </Text>
                    ) : null}
                    {sb.description ? (
                      <Text variant="bodySmall" style={styles.description}>
                        {sb.description}
                      </Text>
                    ) : null}
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 12,
  },
  descText: {
    color: 'rgba(100,116,139,0.65)',
  },
  blockCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
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
    color: '#1e293b',
    flex: 1,
  },
  blockDistance: {
    color: '#0891B2',
    fontWeight: 'bold',
  },
  subBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.50)',
  },
  subBlockTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  departure: {
    color: '#64748b',
    marginBottom: 2,
  },
  description: {
    color: '#64748b',
    fontStyle: 'italic',
  },
});
