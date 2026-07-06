import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Affordance de pression standard du kit : scale 0.98 + retour haptique leger.
 * A utiliser pour toute surface tappable (cartes, tuiles, lignes de liste).
 */
export default function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled,
  haptic = true,
  style,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (haptic) {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
