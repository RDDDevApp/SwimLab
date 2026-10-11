import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TEXT_COLORS, shadow } from '../config/tokens';

interface Props {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/**
 * Toggle segmente avec pouce anime (ex: Semaine / Mois).
 * Remplace les toggles ad hoc des calendriers.
 */
export default function SegmentedToggle({ options, selectedIndex, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const segmentWidth = width / options.length;

  useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withTiming(selectedIndex * segmentWidth, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {segmentWidth > 0 && (
        <Animated.View style={[styles.thumb, { width: segmentWidth - 4 }, thumbStyle]} />
      )}
      {options.map((option, i) => (
        <Pressable
          key={option}
          style={styles.segment}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onChange(i);
          }}
        >
          <Text style={[styles.label, i === selectedIndex && styles.labelActive]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 12,
    padding: 2,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    ...shadow(0.08, 6, 2, 2),
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_COLORS.secondary,
  },
  labelActive: {
    color: '#0891B2',
    fontWeight: '800',
  },
});
