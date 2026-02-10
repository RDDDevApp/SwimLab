import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { getRPEColor, RPE_LABELS } from '../config/theme';

interface RPESliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RPESlider({ value, onChange }: RPESliderProps) {
  const color = getRPEColor(value);
  const label = RPE_LABELS[value] || '';

  // Build RPE scale buttons (6-20)
  const rpeValues = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <View style={styles.container}>
      <View style={styles.valueDisplay}>
        <Text variant="displaySmall" style={[styles.valueText, { color }]}>
          {value}
        </Text>
        <Text variant="titleMedium" style={[styles.label, { color }]}>
          {label}
        </Text>
      </View>

      <View style={styles.scaleRow}>
        {rpeValues.map((rpeVal) => {
          const isSelected = rpeVal === value;
          const bgColor = getRPEColor(rpeVal);

          return (
            <Pressable
              key={rpeVal}
              onPress={() => onChange(rpeVal)}
              style={[
                styles.scaleButton,
                { backgroundColor: isSelected ? bgColor : '#F3F4F6' },
                isSelected && styles.selectedButton,
              ]}
            >
              <Text
                variant="labelSmall"
                style={[
                  styles.scaleText,
                  { color: isSelected ? '#FFFFFF' : '#6B7280' },
                ]}
              >
                {rpeVal}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <Text variant="bodySmall" style={styles.legendLeft}>
          Repos
        </Text>
        <Text variant="bodySmall" style={styles.legendRight}>
          Maximal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  valueText: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    transform: [{ scale: 1.15 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  scaleText: {
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendLeft: {
    color: '#22C55E',
  },
  legendRight: {
    color: '#DC2626',
  },
});
