import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Workout, WorkoutBlock, BLOCK_TYPE_LABELS } from '../../types';
import { migrateWorkoutContent } from '../../utils';
import { C, FONTS, WORKOUT_TYPE_COLORS } from '../../config/tokens';

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
        const typeColors = WORKOUT_TYPE_COLORS[block.type] ?? WORKOUT_TYPE_COLORS.other;
        const blockDistance = block.sub_blocks.reduce(
          (sum, sb) => sum + sb.distance * sb.repetitions,
          0,
        );

        return (
          <Card
            key={block.id || bIndex}
            style={styles.blockCard}
          >
            <Card.Content>
              <View style={styles.blockHeader}>
                <Chip compact style={[styles.blockTypeChip, { backgroundColor: typeColors.bg }]}>
                  <Text style={{ color: typeColors.color, fontFamily: FONTS.textStrong, fontSize: 12 }}>
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
                        Départ: {sb.departure}
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
    backgroundColor: C.surface,
    marginBottom: 12,
  },
  descText: {
    color: C.inkMuted,
  },
  blockCard: {
    backgroundColor: C.surface,
    marginBottom: 12,
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
    fontFamily: FONTS.textStrong,
    color: C.ink,
    flex: 1,
  },
  blockDistance: {
    color: C.primary,
    fontFamily: FONTS.textBold,
  },
  subBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  subBlockTitle: {
    fontFamily: FONTS.displaySemi,
    color: C.ink,
    marginBottom: 2,
  },
  departure: {
    color: C.inkMuted,
    marginBottom: 2,
  },
  description: {
    color: C.inkMuted,
    fontStyle: 'italic',
  },
});
