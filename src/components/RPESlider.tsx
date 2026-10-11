import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { getRPEColor, RPE_LABELS } from '../config/theme';

interface RPESliderProps {
  value: number;
  onChange: (value: number) => void;
}

/** Glow colore dynamique, boxShadow sur web (shadow* deprecies par RN-web) */
function glow(color: string, radius: number, elevation = 0) {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px 0px ${radius}px ${color}66` } as const;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: radius,
    ...(elevation ? { elevation } : {}),
  } as const;
}

export default function RPESlider({ value, onChange }: RPESliderProps) {
  const color = getRPEColor(value);
  const label = RPE_LABELS[value] || '';

  const rpeValues = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <View style={styles.container}>
      <View style={styles.valueDisplay}>
        <Text style={[styles.valueText, { color }]}>
          {value}
        </Text>
        <Text style={[styles.label, { color }]}>
          {label}
        </Text>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${((value - 6) / 14) * 100}%`,
              backgroundColor: color,
            },
            glow(color, 8),
          ]}
        />
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
                {
                  backgroundColor: isSelected ? bgColor : 'rgba(255, 255, 255, 0.40)',
                  borderColor: isSelected ? bgColor : 'rgba(0,0,0,0.08)',
                },
                isSelected && {
                  ...glow(bgColor, 10, 5),
                  transform: [{ scale: 1.15 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.scaleText,
                  { color: isSelected ? '#FFFFFF' : '#64748b' },
                ]}
              >
                {rpeVal}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLeft}>Repos</Text>
        <Text style={styles.legendRight}>Maximal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderColor: 'rgba(0,0,0,0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  valueText: {
    fontWeight: '800',
    fontSize: 52,
  },
  label: {
    fontWeight: '700',
    marginTop: 4,
    fontSize: 16,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  scaleButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleText: {
    fontWeight: '700',
    fontSize: 13,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  legendLeft: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 13,
  },
  legendRight: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
});
