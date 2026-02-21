import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

export default function StatsBadge({ icon, label, value, color }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderColor: 'rgba(0,0,0,0.08)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    color: 'rgba(100,116,139,0.55)',
    fontWeight: '500',
  },
});
