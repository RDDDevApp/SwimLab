import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SwimmerCalendarScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes Entrainements
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          Aucun entrainement a venir
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Rejoignez un club pour voir vos entrainements
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
