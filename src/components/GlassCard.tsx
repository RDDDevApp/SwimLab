import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS, RADIUS } from '../config/tokens';

interface Props {
  children: React.ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  /**
   * Vrai flou (BlurView) derriere la carte — iOS uniquement, les cartes
   * elevees l'activent par defaut. Android garde le fallback rgba (perf).
   */
  blur?: boolean;
}

const BLUR_SUPPORTED = Platform.OS === 'ios';

export default function GlassCard({ children, elevated, onPress, style, blur }: Props) {
  const useBlur = BLUR_SUPPORTED && (blur ?? !!elevated);

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    useBlur && styles.blurCard,
    style,
  ];

  const inner = useBlur ? (
    <>
      <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
      {children}
    </>
  ) : (
    children
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.card.backgroundColor,
    borderColor: GLASS.card.borderColor,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 16,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  elevated: {
    backgroundColor: GLASS.elevated.backgroundColor,
    borderColor: GLASS.elevated.borderColor,
    borderRadius: RADIUS.xl,
    shadowOpacity: 0.1,
  },
  blurCard: {
    // Le BlurView absolu doit etre clippe par le rayon de la carte
    overflow: 'hidden',
    // La teinte rgba passe en leger par-dessus le flou
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
