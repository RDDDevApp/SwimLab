import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { TEXT_COLORS } from '../config/tokens';

interface Props {
  /** Nombre de semaines de streak */
  count: number;
  label?: string;
  size?: 'small' | 'large';
}

/** Compteur de streak avec flamme animee (pulse subtil). */
export default function StreakFlame({ count, label, size = 'small' }: Props) {
  const scale = useSharedValue(1);
  const active = count > 0;

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
      );
    } else {
      scale.value = 1;
    }
  }, [active, scale]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconSize = size === 'large' ? 28 : 18;
  const countSize = size === 'large' ? 24 : 15;

  return (
    <View style={styles.container}>
      <Animated.View style={flameStyle}>
        <Ionicons name="flame" size={iconSize} color={active ? '#F97316' : '#94a3b8'} />
      </Animated.View>
      <Text style={[styles.count, { fontSize: countSize }, !active && styles.inactive]}>
        {count}
      </Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontWeight: '800',
    color: TEXT_COLORS.primary,
  },
  inactive: {
    color: TEXT_COLORS.muted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_COLORS.secondary,
    marginLeft: 2,
  },
});
