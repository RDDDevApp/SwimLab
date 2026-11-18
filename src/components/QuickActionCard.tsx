import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { C, RADIUS, SHADOW, SPACING, TYPE } from '../config/tokens';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  delay?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

export default function QuickActionCard({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  delay = 0,
}: QuickActionCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // DA : les raccourcis restent calmes (pas de couleur vive) ; iconColor n'est plus utilisé.
  void iconColor;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(delay)} style={{ width: CARD_WIDTH }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {/* Arrow top right */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward-outline" size={16} color={C.inkMuted} />
        </View>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name={icon as any} size={24} color={C.onPrimarySoft} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    minHeight: 140,
    ...SHADOW.card,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  arrowContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPE.title3,
    color: C.ink,
    marginBottom: 2,
  },
  subtitle: {
    ...TYPE.caption,
    color: C.inkMuted,
  },
});
