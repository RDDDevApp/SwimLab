import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WorkoutBlock,
  WorkoutContent,
  BLOCK_TYPE_LABELS,
} from '../../types';
import { workoutService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import BlockEditor from '../../components/workout/BlockEditor';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateWorkoutScreen({ navigation, route }: Props) {
  const { user, clubId: storeClubId } = useAuthStore();
  const editingWorkout = route?.params?.workout;

  const defaultBlocks: WorkoutBlock[] = [
    { id: generateId(), type: 'warmup', name: 'Echauffement', sub_blocks: [] },
    { id: generateId(), type: 'main', name: 'Corps de seance', sub_blocks: [] },
    { id: generateId(), type: 'cooldown', name: 'Recuperation', sub_blocks: [] },
  ];

  const [title, setTitle] = useState(editingWorkout?.title || '');
  const [description, setDescription] = useState(
    editingWorkout?.description || '',
  );
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(
    editingWorkout?.content?.blocks || defaultBlocks,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clubId = route?.params?.clubId || storeClubId;

  const totalDistance = blocks.reduce((sum, block) => {
    return (
      sum +
      block.sub_blocks.reduce((bSum, sb) => {
        return bSum + sb.distance * sb.repetitions;
      }, 0)
    );
  }, 0);

  const addBlock = () => {
    const newBlock: WorkoutBlock = {
      id: generateId(),
      type: blocks.length === 0 ? 'warmup' : 'main',
      name: '',
      sub_blocks: [],
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, block: WorkoutBlock) => {
    const updated = [...blocks];
    updated[index] = block;
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBlocks(updated);
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    const content: WorkoutContent = { blocks };

    try {
      if (editingWorkout) {
        await workoutService.update(editingWorkout.id, {
          title: title.trim(),
          description: description.trim() || null,
          content,
          total_distance: totalDistance,
          is_published: publish,
        });
      } else {
        await workoutService.create({
          club_id: clubId,
          coach_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          content,
          total_distance: totalDistance,
          is_published: publish,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Chip icon="ruler" style={styles.distanceChip}>
            {totalDistance}m
          </Chip>
        </View>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {editingWorkout ? 'Modifier la seance' : 'Nouvelle seance'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          label="Titre de la seance"
          placeholder="Ex: Endurance 2000m"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={2}
          style={styles.input}
        />

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Structure de la seance
        </Text>

        {blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(index, b)}
            onRemove={() => removeBlock(index)}
            onMoveUp={index > 0 ? () => moveBlock(index, -1) : undefined}
            onMoveDown={
              index < blocks.length - 1 ? () => moveBlock(index, 1) : undefined
            }
          />
        ))}

        <Button
          mode="outlined"
          icon="plus"
          onPress={addBlock}
          style={styles.addBlockBtn}
        >
          Ajouter un bloc
        </Button>

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleSave(false)}
            loading={loading}
            disabled={loading}
            style={styles.flex1}
          >
            Brouillon
          </Button>
          <Button
            mode="contained"
            onPress={() => handleSave(true)}
            loading={loading}
            disabled={loading}
            style={styles.flex1}
          >
            Publier
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  distanceChip: {
    backgroundColor: '#CFFAFE',
    marginRight: 8,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  addBlockBtn: {
    borderColor: '#06B6D4',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
