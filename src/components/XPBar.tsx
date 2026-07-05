import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TEXT_COLORS } from '../config/tokens';

interface Props {
  /** XP dans le niveau courant */
  currentXP: number;
  /** XP requis pour passer au niveau suivant */
  nextLevelXP: number;
  level: number;
  compact?: boolean;
}

/** Barre d'XP avec niveau — header nageur et profil (gamification Phase 5). */
export default function XPBar({ currentXP, nextLevelXP, level, compact }: Props) {
  const pct = nextLevelXP > 0 ? Math.min(100, (currentXP / nextLevelXP) * 100) : 0;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [pct, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.row}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>Niv. {level}</Text>
          </View>
          <Text style={styles.xpText}>
            {currentXP} / {nextLevelXP} XP
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelPill: {
    backgroundColor: 'rgba(8, 145, 178, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0891B2',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_COLORS.secondary,
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.20)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0891B2',
  },
});
