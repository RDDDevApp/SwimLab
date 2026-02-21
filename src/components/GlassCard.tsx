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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 24,
    shadowOpacity: 0.10,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
