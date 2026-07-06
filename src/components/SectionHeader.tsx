import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TEXT_COLORS } from '../config/tokens';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Titre de section standard avec action "Voir tout" optionnelle. */
export default function SectionHeader({ title, actionLabel = 'Voir tout', onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onAction && (
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward-outline" size={14} color="#0891B2" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLORS.primary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0891B2',
  },
});
