import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import GlassCard from './GlassCard';

interface WeeklyBarChartProps {
  data: number[];
  activeColor?: string;
  title?: string;
  label?: string;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const BAR_HEIGHT = 128;

function AnimatedBar({ height, color, delay }: { height: number; color: string; delay: number }) {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withDelay(
      delay,
      withTiming(height, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    );
  }, [height, delay, animatedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${animatedHeight.value}%` as any,
    backgroundColor: animatedHeight.value > 0 ? color : 'transparent',
  }));

  return (
    <Animated.View style={[styles.barFill, animatedStyle]} />
  );
}

export default function WeeklyBarChart({
  data,
  activeColor = '#06B6D4',
  title = 'Ma semaine',
  label,
}: WeeklyBarChartProps) {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: activeColor }]} />
          <View style={[styles.dot, { backgroundColor: '#cbd5e1' }]} />
        </View>
      </View>

      <View style={styles.chartRow}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.column}>
            <View style={styles.barBackground}>
              <AnimatedBar height={data[i]} color={activeColor} delay={500 + i * 100} />
            </View>
            <Text style={styles.dayLabel}>{day}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: BAR_HEIGHT + 24,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barBackground: {
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    opacity: 0.85,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
});
