import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { getRPEColor, getRPETextColor, RPE_LABELS } from '../config/theme';
import { C, FONTS, RADIUS, SPACING, TABULAR, TYPE } from '../config/tokens';

interface RPESliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Échelle RPE de la DA : chaque valeur est un galet coloré par son palier, de
 * l'eau claire (facile) à la prune sombre (maximal). Le chiffre est toujours
 * écrit ; la valeur choisie est entourée d'un anneau `ink` et nommée en dessous.
 */
export default function RPESlider({ value, onChange }: RPESliderProps) {
  const label = RPE_LABELS[value] || '';
  const rpeValues = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <View style={styles.container}>
      <View style={styles.valueDisplay}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.scaleRow}>
        {rpeValues.map((rpeVal) => {
          const isSelected = rpeVal === value;
          return (
            <Pressable
              key={rpeVal}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${rpeVal}, ${RPE_LABELS[rpeVal]}`}
              onPress={() => onChange(rpeVal)}
              style={({ pressed }) => [
                styles.scaleButton,
                { backgroundColor: getRPEColor(rpeVal) },
                isSelected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.scaleText, { color: getRPETextColor(rpeVal) }]}>{rpeVal}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legend}>Repos</Text>
        <Text style={styles.legend}>Maximal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  valueText: {
    ...TYPE.display,
    fontSize: 52,
    lineHeight: 58,
    color: C.ink,
    ...TABULAR,
  },
  label: {
    ...TYPE.bodyStrong,
    color: C.ink,
    marginTop: SPACING.xs,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  scaleButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: C.ink,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  scaleText: {
    fontFamily: FONTS.textBold,
    fontSize: 15,
    ...TABULAR,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  legend: {
    ...TYPE.caption,
    color: C.inkMuted,
  },
});
