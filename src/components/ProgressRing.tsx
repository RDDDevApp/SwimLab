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
import { C, FONTS, TABULAR, TYPE } from '../config/tokens';

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
  strokeWidth = 12,
  color,
  trackColor = C.surfaceSunken,
  label,
  caption,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  // Objectif atteint : l'anneau passe en soleil
  const strokeColor = color ?? (clamped >= 100 ? C.soleil : C.lagon);

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
            stroke={strokeColor}
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
    fontFamily: FONTS.display,
    color: C.ink,
    ...TABULAR,
  },
  caption: {
    ...TYPE.label,
    color: C.inkMuted,
    textAlign: 'center',
  },
});
