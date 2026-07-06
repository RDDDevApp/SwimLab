import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  variant?: 'cyan' | 'teal';
}

export default function AnimatedBackground({ variant = 'cyan' }: Props) {
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb2X = useSharedValue(0);
  const orb2Y = useSharedValue(0);

  const color1 = variant === 'teal' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(34, 211, 238, 0.15)';
  const color2 = variant === 'teal' ? 'rgba(13, 148, 136, 0.15)' : 'rgba(59, 130, 246, 0.15)';

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);

    orb1X.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 10000, easing }),
        withTiming(0, { duration: 10000, easing }),
      ),
      -1,
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 10000, easing }),
        withTiming(0, { duration: 10000, easing }),
      ),
      -1,
    );

    // Delay orb2 start slightly
    const timeout = setTimeout(() => {
      orb2X.value = withRepeat(
        withSequence(
          withTiming(-30, { duration: 12500, easing }),
          withTiming(0, { duration: 12500, easing }),
        ),
        -1,
      );
      orb2Y.value = withRepeat(
        withSequence(
          withTiming(50, { duration: 12500, easing }),
          withTiming(0, { duration: 12500, easing }),
        ),
        -1,
      );
    }, 2000);

    return () => clearTimeout(timeout);
  }, [orb1X, orb1Y, orb2X, orb2Y]);

  const animatedOrb1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }));

  const animatedOrb2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Animated.View
        style={[
          styles.orb,
          { top: 20, left: -40, width: 200, height: 200, backgroundColor: color1 },
          animatedOrb1,
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          { bottom: 100, right: -60, width: 250, height: 250, backgroundColor: color2 },
          animatedOrb2,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 1,
  },
});
