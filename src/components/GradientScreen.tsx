import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OCEAN_GRADIENT } from '../config/gradients';

interface Props {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

export default function GradientScreen({ children, edges = ['top'], style }: Props) {
  return (
    <LinearGradient
      colors={[...OCEAN_GRADIENT.colors]}
      start={OCEAN_GRADIENT.start}
      end={OCEAN_GRADIENT.end}
      style={styles.gradient}
    >
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
});
