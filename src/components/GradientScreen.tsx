import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../config/tokens';

interface Props {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

/**
 * Fond d'écran de la DA « La vague » : un `bg` uni et calme.
 * (Le nom est historique : il n'y a plus de dégradé.)
 */
export default function GradientScreen({ children, edges = ['top'], style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
});
