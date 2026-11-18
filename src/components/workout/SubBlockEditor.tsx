import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';
import { SubBlock } from '../../types';
import { C, FONTS } from '../../config/tokens';

interface SubBlockEditorProps {
  subBlock: SubBlock;
  onChange: (subBlock: SubBlock) => void;
  onRemove: () => void;
}

export default function SubBlockEditor({
  subBlock,
  onChange,
  onRemove,
}: SubBlockEditorProps) {
  const totalDistance = subBlock.distance * subBlock.repetitions;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text variant="labelSmall" style={styles.totalLabel}>
          {totalDistance}m
        </Text>
        <IconButton
          icon="close"
          size={16}
          iconColor={C.danger}
          onPress={onRemove}
          style={styles.removeBtn}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Distance (m)"
          value={subBlock.distance > 0 ? String(subBlock.distance) : ''}
          onChangeText={(v) =>
            onChange({ ...subBlock, distance: parseInt(v, 10) || 0 })
          }
          mode="outlined"
          dense
          keyboardType="numeric"
          style={[styles.input, styles.flex1]}
        />
        <Text style={styles.multiply}>x</Text>
        <TextInput
          label="Rep."
          value={String(subBlock.repetitions)}
          onChangeText={(v) =>
            onChange({ ...subBlock, repetitions: parseInt(v, 10) || 1 })
          }
          mode="outlined"
          dense
          keyboardType="numeric"
          style={[styles.input, styles.repInput]}
        />
        <TextInput
          label="Départ"
          placeholder="1'30"
          value={subBlock.departure || ''}
          onChangeText={(v) => onChange({ ...subBlock, departure: v })}
          mode="outlined"
          dense
          style={[styles.input, styles.departInput]}
        />
      </View>

      <TextInput
        label="Description (optionnel)"
        placeholder="Ex. : 4 nages, 1 crawl 1 spé…"
        value={subBlock.description || ''}
        onChangeText={(v) => onChange({ ...subBlock, description: v })}
        mode="outlined"
        dense
        style={styles.descInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    color: C.primary,
    fontFamily: FONTS.textBold,
    fontSize: 13,
  },
  removeBtn: {
    margin: 0,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surface,
  },
  flex1: {
    flex: 1,
  },
  multiply: {
    color: C.inkMuted,
    fontFamily: FONTS.textBold,
    fontSize: 16,
  },
  repInput: {
    width: 60,
  },
  departInput: {
    width: 80,
  },
  descInput: {
    backgroundColor: C.surface,
  },
});
