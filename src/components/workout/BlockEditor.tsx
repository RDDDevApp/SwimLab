import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { WorkoutBlock, SubBlock, BlockType, BLOCK_TYPE_LABELS } from '../../types';
import SubBlockEditor from './SubBlockEditor';
import PickerSelect from '../PickerSelect';

interface BlockEditorProps {
  block: WorkoutBlock;
  onChange: (block: WorkoutBlock) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSaveToLibrary?: () => void;
  onReplaceFromLibrary?: () => void;
}

const BLOCK_TYPES = [
  { value: 'warmup', label: 'Échauffement' },
  { value: 'main', label: 'Corps de séance' },
  { value: 'cooldown', label: 'Récupération' },
  { value: 'other', label: 'Autre' },
];

const BLOCK_COLORS: Record<string, string> = {
  warmup: '#059669',
  main: '#0891B2',
  cooldown: '#7C3AED',
  other: '#4B5563',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function BlockEditor({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSaveToLibrary,
  onReplaceFromLibrary,
}: BlockEditorProps) {
  const addSubBlock = () => {
    const newSubBlock: SubBlock = {
      id: generateId(),
      distance: 0,
      repetitions: 1,
    };
    onChange({ ...block, sub_blocks: [...block.sub_blocks, newSubBlock] });
  };

  const updateSubBlock = (index: number, subBlock: SubBlock) => {
    const updated = [...block.sub_blocks];
    updated[index] = subBlock;
    onChange({ ...block, sub_blocks: updated });
  };

  const removeSubBlock = (index: number) => {
    const updated = block.sub_blocks.filter((_, i) => i !== index);
    onChange({ ...block, sub_blocks: updated });
  };

  const totalDistance = block.sub_blocks.reduce(
    (sum, sb) => sum + sb.distance * sb.repetitions,
    0,
  );

  const accentColor = BLOCK_COLORS[block.type] || BLOCK_COLORS.other;

  return (
    <View style={[styles.container, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.moveButtons}>
            {onMoveUp && (
              <IconButton icon="chevron-up" size={18} onPress={onMoveUp} style={styles.moveBtn} />
            )}
            {onMoveDown && (
              <IconButton icon="chevron-down" size={18} onPress={onMoveDown} style={styles.moveBtn} />
            )}
          </View>
          <PickerSelect
            label="Type"
            value={block.type}
            options={BLOCK_TYPES}
            onChange={(v) => {
              const newType = v as BlockType;
              const newName = block.name || BLOCK_TYPE_LABELS[newType] || '';
              onChange({ ...block, type: newType, name: newName });
            }}
            style={styles.typePicker}
          />
        </View>
        <View style={styles.headerRight}>
          <Text variant="titleSmall" style={[styles.distance, { color: accentColor }]}>
            {totalDistance}m
          </Text>
          <IconButton
            icon="delete"
            size={20}
            iconColor="#DC2626"
            onPress={onRemove}
          />
        </View>
      </View>

      <TextInput
        label="Nom du bloc"
        value={block.name}
        onChangeText={(v) => onChange({ ...block, name: v })}
        mode="outlined"
        dense
        style={styles.nameInput}
      />

      <Divider style={styles.divider} />

      {block.sub_blocks.map((subBlock, index) => (
        <SubBlockEditor
          key={subBlock.id}
          subBlock={subBlock}
          onChange={(sb) => updateSubBlock(index, sb)}
          onRemove={() => removeSubBlock(index)}
        />
      ))}

      <Button
        mode="outlined"
        icon="plus"
        onPress={addSubBlock}
        compact
        style={styles.addBtn}
      >
        Ajouter sous-bloc
      </Button>

      <View style={styles.libraryRow}>
        {onSaveToLibrary && (
          <Button
            mode="text"
            icon="content-save"
            onPress={onSaveToLibrary}
            compact
            style={styles.libBtn}
          >
            Sauvegarder dans biblio
          </Button>
        )}
        {onReplaceFromLibrary && (
          <Button
            mode="text"
            icon="swap-horizontal"
            onPress={onReplaceFromLibrary}
            compact
            style={styles.libBtn}
          >
            Depuis biblio
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.60)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moveButtons: {
    marginRight: 4,
  },
  moveBtn: {
    margin: 0,
    padding: 0,
  },
  typePicker: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontWeight: 'bold',
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    marginTop: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 10,
  },
  addBtn: {
    alignSelf: 'flex-start',
    borderColor: 'rgba(0, 0, 0, 0.15)',
    marginBottom: 8,
  },
  libraryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.60)',
    paddingTop: 8,
  },
  libBtn: {
    alignSelf: 'flex-start',
  },
});
