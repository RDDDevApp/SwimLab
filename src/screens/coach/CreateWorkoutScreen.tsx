import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Divider,
  Chip,
  Portal,
  Dialog,
  Card,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import {
  WorkoutBlock,
  WorkoutContent,
  BlockLibraryRow,
  SubBlock,
  BlockType,
  BLOCK_TYPE_LABELS,
} from '../../types';
import { workoutService, blockLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import BlockEditor from '../../components/workout/BlockEditor';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const BLOCK_COLORS: Record<string, string> = {
  warmup: '#10B981',
  main: '#06B6D4',
  cooldown: '#8B5CF6',
  other: '#6B7280',
};

interface Props {
  navigation: any;
  route?: any;
}

export default function CreateWorkoutScreen({ navigation, route }: Props) {
  const { user, clubId: storeClubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
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

  // Library modal state
  const [libraryBlocks, setLibraryBlocks] = useState<BlockLibraryRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
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

  const loadLibrary = async () => {
    if (!clubId) return;
    setLibraryLoading(true);
    try {
      const data = await blockLibraryService.getByClub(clubId);
      setLibraryBlocks(data);
    } catch (err) {
      console.error('Error loading library:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

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
    setImportTargetIndex(blockIndex);
    loadLibrary();
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
          type: 'other',
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

      <Portal>
        <Dialog
          visible={importTargetIndex !== null}
          onDismiss={() => setImportTargetIndex(null)}
          style={styles.dialog}
        >
          <Dialog.Title>Importer depuis la bibliotheque</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            {libraryLoading ? (
              <View style={styles.dialogEmpty}>
                <Text variant="bodyMedium" style={styles.dialogEmptyText}>
                  Chargement...
                </Text>
              </View>
            ) : libraryBlocks.length === 0 ? (
              <View style={styles.dialogEmpty}>
                <Text variant="bodyMedium" style={styles.dialogEmptyText}>
                  Aucun bloc dans la bibliotheque
                </Text>
                <Text variant="bodySmall" style={styles.dialogEmptySubtext}>
                  Sauvegardez des blocs avec le bouton "Sauvegarder dans biblio"
                </Text>
              </View>
            ) : (
              <FlatList
                data={libraryBlocks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const color = BLOCK_COLORS[item.type] || BLOCK_COLORS.other;
                  return (
                    <TouchableOpacity onPress={() => handleImportBlock(item)}>
                      <Card style={[styles.libCard, { borderLeftColor: color }]}>
                        <Card.Content>
                          <View style={styles.libCardHeader}>
                            <View style={styles.libCardLeft}>
                              <Chip
                                compact
                                style={[
                                  styles.libTypeChip,
                                  { backgroundColor: color + '20' },
                                ]}
                              >
                                <Text
                                  style={{
                                    color,
                                    fontWeight: '600',
                                    fontSize: 11,
                                  }}
                                >
                                  {BLOCK_TYPE_LABELS[
                                    item.type as keyof typeof BLOCK_TYPE_LABELS
                                  ] || item.type}
                                </Text>
                              </Chip>
                              <Text
                                variant="titleSmall"
                                style={styles.libCardTitle}
                              >
                                {item.name}
                              </Text>
                            </View>
                            <Chip compact style={styles.libDistChip}>
                              {item.total_distance}m
                            </Chip>
                          </View>
                          {(item.content || []).length > 0 ? (
                            <Text
                              variant="bodySmall"
                              style={styles.libCardSub}
                              numberOfLines={2}
                            >
                              {(item.content as SubBlock[])
                                .map((sb) =>
                                  sb.repetitions > 1
                                    ? `${sb.repetitions}x${sb.distance}m`
                                    : `${sb.distance}m`,
                                )
                                .join(' + ')}
                            </Text>
                          ) : null}
                        </Card.Content>
                      </Card>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setImportTargetIndex(null)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
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
    color: '#FFFFFF',
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
  // Import dialog
  dialog: {
    maxHeight: '80%',
  },
  dialogScroll: {
    paddingHorizontal: 0,
    maxHeight: 400,
  },
  dialogEmpty: {
    padding: 24,
    alignItems: 'center',
  },
  dialogEmptyText: {
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
  },
  dialogEmptySubtext: {
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginTop: 4,
  },
  libCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
  },
  libCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libCardLeft: {
    flex: 1,
    gap: 4,
  },
  libCardTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  libTypeChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  libDistChip: {
    backgroundColor: '#CFFAFE',
    height: 24,
  },
  libCardSub: {
    color: 'rgba(255,255,255,0.50)',
    marginTop: 4,
  },
});
