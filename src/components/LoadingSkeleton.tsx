import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.block} />
      <View style={styles.block} />
      <View style={styles.blockSmall} />
      <ActivityIndicator style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  block: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    opacity: 0.5,
  },
  blockSmall: {
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    opacity: 0.3,
  },
  spinner: {
    marginTop: 16,
  },
});
