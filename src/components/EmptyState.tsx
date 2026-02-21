import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={48} color="rgba(255,255,255,0.30)" />
      <Text variant="bodyLarge" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  title: {
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
  },
});
