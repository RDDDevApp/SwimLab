import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { C, RADIUS, SHADOW, SPACING } from '../config/tokens';

interface Props {
  children: React.ReactNode;
  /** Carte un peu plus présente (rayon des cartes vedettes). */
  elevated?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Ancien flou iOS : sans effet, la DA n'a ni verre ni flou. */
  blur?: boolean;
}

/**
 * Carte de la DA « La vague » : fond `surface`, coins `radius-md`, détachée par
 * `shadow-card` (jamais par une bordure). Le nom est historique.
 */
export default function GlassCard({ children, elevated, onPress, style }: Props) {
  const cardStyle = [styles.card, elevated && styles.elevated, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  elevated: {
    borderRadius: RADIUS.lg,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
