import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton, Divider } from 'react-native-paper';
import { WorkoutBlock, SubBlock } from '../../types';
import SubBlockEditor from './SubBlockEditor';
import PickerSelect from '../PickerSelect';

interface BlockEditorProps {
  block: WorkoutBlock;
  onChange: (block: WorkoutBlock) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const BLOCK_TYPES = [
  { value: 'warmup', label: 'Echauffement' },
  { value: 'main', label: 'Corps de seance' },
  { value: 'cooldown', label: 'Retour au calme' },
  { value: 'drill', label: 'Educatifs' },
  { value: 'sprint', label: 'Sprint' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'other', label: 'Autre' },
];

const BLOCK_COLORS: Record<string, string> = {
  warmup: '#10B981',
  main: '#06B6D4',
  cooldown: '#8B5CF6',
  drill: '#F59E0B',
  sprint: '#EF4444',
  endurance: '#3B82F6',
  other: '#6B7280',
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
}: BlockEditorProps) {
  const addSubBlock = () => {
    const newSubBlock: SubBlock = {
      id: generateId(),
      title: '',
      series: 1,
      distance: 0,
      exercises: [],
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

  const totalDistance = block.sub_blocks.reduce((sum, sb) => {
    const sbDist = sb.exercises.reduce((s, ex) => s + ex.distance, 0) * sb.series;
    return sum + sbDist;
  }, 0);

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
            label="Type de bloc"
            value={block.type}
            options={BLOCK_TYPES}
            onChange={(v) => onChange({ ...block, type: v as WorkoutBlock['type'] })}
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
            iconColor="#EF4444"
            onPress={onRemove}
          />
        </View>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  divider: {
    marginVertical: 10,
  },
  addBtn: {
    alignSelf: 'flex-start',
    borderColor: '#D1D5DB',
  },
});
