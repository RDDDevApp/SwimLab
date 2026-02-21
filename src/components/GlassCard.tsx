import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';

interface Props {
  children: React.ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function GlassCard({ children, elevated, onPress, style }: Props) {
  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: 24,
    shadowOpacity: 0.10,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
