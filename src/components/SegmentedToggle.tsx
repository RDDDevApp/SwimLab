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
import { C, FONTS, RADIUS, TOUCH_MIN } from '../config/tokens';

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
        <Animated.View style={[styles.thumb, { width: segmentWidth - 8 }, thumbStyle]} />
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
    backgroundColor: C.surfaceSunken,
    borderRadius: RADIUS.pill,
    padding: 4,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: C.primary,
    borderRadius: RADIUS.pill,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_MIN - 8,
    zIndex: 1,
  },
  label: {
    fontFamily: FONTS.textStrong,
    fontSize: 14,
    color: C.inkMuted,
  },
  labelActive: {
    color: C.onPrimary,
  },
});
