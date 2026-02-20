import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Workout, WorkoutBlock, BLOCK_TYPE_LABELS } from '../../types';

const blockTypeColors: Record<string, string> = {
  warmup: '#10B981',
  main: '#06B6D4',
  cooldown: '#8B5CF6',
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
                <Chip compact style={[styles.blockTypeChip, { backgroundColor: color + '20' }]}>
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
    flex: 1,
  },
  blockDistance: {
    color: '#06B6D4',
    fontWeight: 'bold',
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
    marginBottom: 2,
  },
  departure: {
    color: '#6B7280',
    marginBottom: 2,
  },
  description: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
