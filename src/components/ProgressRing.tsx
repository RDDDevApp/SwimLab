import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TEXT_COLORS } from '../config/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** Progression 0-100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Texte central (par defaut le pourcentage) */
  label?: string;
  /** Legende sous le ring */
  caption?: string;
}

/** Anneau de progression anime (defis, assiduite, objectifs). */
export default function ProgressRing({
  progress,
  size = 84,
  strokeWidth = 8,
  color = '#0891B2',
  trackColor = 'rgba(148, 163, 184, 0.20)',
  label,
  caption,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));

  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(clamped, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value / 100),
  }));

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.label, { fontSize: size / 4.2 }]}>
            {label ?? `${Math.round(clamped)}%`}
          </Text>
        </View>
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    color: TEXT_COLORS.primary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_COLORS.secondary,
    textAlign: 'center',
  },
});
