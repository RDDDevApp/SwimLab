import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { C } from '../config/tokens';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={48} color={C.inkMuted} />
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
    color: C.inkMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: C.inkMuted,
    textAlign: 'center',
  },
});
