import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Chip,
  Switch,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import {
  WorkoutBlock,
  WorkoutContent,
  BlockLibraryRow,
  SubBlock,
} from '../../types';
import { workoutService, blockLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import BlockEditor from '../../components/workout/BlockEditor';
import BlockPickerModal from '../../components/workout/BlockPickerModal';
import { migrateWorkoutContent } from '../../utils';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateWorkoutScreen({ navigation, route }: Props) {
  const { user, clubId: storeClubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const editingWorkout = route?.params?.workout;
  // Pre-remplissage (generation IA) : { title, description, content }
  const prefill = route?.params?.prefill;

  const defaultBlocks: WorkoutBlock[] = [
    { id: generateId(), type: 'warmup', name: 'Echauffement', sub_blocks: [] },
    { id: generateId(), type: 'main', name: 'Corps de seance', sub_blocks: [] },
    { id: generateId(), type: 'cooldown', name: 'Recuperation', sub_blocks: [] },
  ];

  const [title, setTitle] = useState(editingWorkout?.title || prefill?.title || '');
  const [description, setDescription] = useState(
    editingWorkout?.description || prefill?.description || '',
  );
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(() => {
    if (editingWorkout?.content) {
      return migrateWorkoutContent(editingWorkout.content).blocks;
    }
    if (prefill?.content) {
      return migrateWorkoutContent(prefill.content).blocks;
    }
    return defaultBlocks;
  });
  // Par défaut, le programme reste secret pour les nageurs jusqu'à la fin de la séance
  const initialShowBefore = editingWorkout?.show_before_session ?? false;
  const [showBeforeSession, setShowBeforeSession] = useState<boolean>(initialShowBefore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Library picker state
  const [importTargetIndex, setImportTargetIndex] = useState<number | null>(null);

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

  const handleSaveToLibrary = async (blockIndex: number) => {
    if (!user || !clubId) return;
    const block = blocks[blockIndex];
    if (!block.name.trim()) {
      showSnackbar('Donnez un nom au bloc avant de le sauvegarder', 'error');
      return;
    }
    try {
      const totalDist = block.sub_blocks.reduce(
        (sum, sb) => sum + sb.distance * sb.repetitions,
        0,
      );
      await blockLibraryService.create({
        club_id: clubId,
        coach_id: user.id,
        name: block.name.trim(),
        type: block.type,
        content: block.sub_blocks,
        total_distance: totalDist,
      });
      showSnackbar('Bloc sauvegarde dans la bibliotheque', 'success');
    } catch (err) {
      showSnackbar('Erreur lors de la sauvegarde du bloc', 'error');
    }
  };

  const handleOpenImport = (blockIndex: number) => {
    if (!clubId) {
      showSnackbar('Bibliotheque de blocs indisponible en mode solo', 'info');
      return;
    }
    setImportTargetIndex(blockIndex);
  };

  const handleImportBlock = (libBlock: BlockLibraryRow) => {
    if (importTargetIndex === null) return;
    const newSubBlocks: SubBlock[] = (libBlock.content || []).map((sb) => ({
      ...sb,
      id: generateId(),
    }));
    const updated = [...blocks];
    updated[importTargetIndex] = {
      ...updated[importTargetIndex],
      name: libBlock.name,
      type: libBlock.type,
      sub_blocks: newSubBlocks,
    };
    setBlocks(updated);
    setImportTargetIndex(null);
    showSnackbar('Bloc importe depuis la bibliotheque', 'success');
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
    // Envoyé seulement s'il change : la colonne n'existe qu'après la migration 020
    const visibility =
      showBeforeSession !== initialShowBefore ? { show_before_session: showBeforeSession } : {};

    try {
      if (editingWorkout) {
        await workoutService.update(editingWorkout.id, {
          title: title.trim(),
          description: description.trim() || null,
          content,
          total_distance: totalDistance,
          is_published: publish,
          ...visibility,
        });
      } else {
        await workoutService.create({
          club_id: clubId,
          coach_id: user.id,
          title: title.trim(),
          type: 'other',
          description: description.trim() || null,
          content,
          total_distance: totalDistance,
          is_published: publish,
          ...visibility,
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
    <GradientScreen>
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

        {clubId ? (
          <View style={styles.visibilityRow}>
            <View style={styles.visibilityText}>
              <Text style={styles.visibilityTitle}>Montrer le programme avant la séance</Text>
              <Text style={styles.visibilityHint}>
                Désactivé : les nageurs découvrent le programme à la fin de la séance.
              </Text>
            </View>
            <Switch value={showBeforeSession} onValueChange={setShowBeforeSession} />
          </View>
        ) : null}

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
            onSaveToLibrary={() => handleSaveToLibrary(index)}
            onReplaceFromLibrary={() => handleOpenImport(index)}
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

      <BlockPickerModal
        visible={importTargetIndex !== null}
        clubId={clubId || ''}
        onDismiss={() => setImportTargetIndex(null)}
        onSelect={handleImportBlock}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  distanceChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
    marginRight: 8,
  },
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  visibilityText: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  visibilityHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  addBlockBtn: {
    borderColor: '#0891B2',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
