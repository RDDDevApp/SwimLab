import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';

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

  const iconBgColor = iconColor + '20'; // 12% opacity
  const blobColor = iconColor + '30'; // 19% opacity

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(delay)} style={{ width: CARD_WIDTH }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {/* Arrow top right */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward-outline" size={16} color={iconColor} style={{ opacity: 0.5 }} />
        </View>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon as any} size={24} color={iconColor} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Decorative blob */}
        <View style={[styles.blob, { backgroundColor: blobColor }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    minHeight: 140,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  arrowContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  blob: {
    position: 'absolute',
    bottom: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
});
