import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Portal, Dialog, Button, Paragraph, Divider } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { Workout, WorkoutBlock, BLOCK_TYPE_LABELS } from '../../types';
import { workoutService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';
import { exportWorkoutPdf } from '../../utils/workoutPdfExport';

const BLOCK_COLORS: Record<string, string> = {
  warmup: '#10B981',
  main: '#0891B2',
  cooldown: '#8B5CF6',
  other: '#64748b',
};

interface Props {
  navigation: any;
}

export default function WorkoutsScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadWorkouts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workoutService.getByCoach(user.id);
      setWorkouts(data);
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Seance supprimee', 'success');
      loadWorkouts();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleDuplicate = async (workout: Workout) => {
    if (!user || !clubId) return;
    try {
      await workoutService.create({
        club_id: clubId,
        coach_id: user.id,
        title: `${workout.title} (copie)`,
        type: workout.type || 'other',
        description: workout.description,
        content: workout.content,
        total_distance: workout.total_distance,
        is_published: false,
      });
      showSnackbar('Seance dupliquee', 'success');
      loadWorkouts();
    } catch (err) {
      showSnackbar('Erreur lors de la duplication', 'error');
    }
  };

  const togglePublish = async (workout: Workout) => {
    try {
      if (workout.is_published) {
        await workoutService.unpublish(workout.id);
        showSnackbar('Seance depubliee', 'success');
      } else {
        await workoutService.publish(workout.id);
        showSnackbar('Seance publiee', 'success');
      }
      loadWorkouts();
    } catch (err) {
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderExpandedContent = (item: Workout) => {
    const blocks: WorkoutBlock[] = item.content?.blocks || [];

    return (
      <View style={styles.expandedContent}>
        <Divider style={styles.expandDivider} />

        {item.description ? (
          <Text variant="bodySmall" style={styles.expandDesc}>
            {item.description}
          </Text>
        ) : null}

        {blocks.map((block, bIndex) => {
          const color = BLOCK_COLORS[block.type] || BLOCK_COLORS.other;
          const blockDist = block.sub_blocks.reduce(
            (sum, sb) => sum + sb.distance * sb.repetitions,
            0,
          );

          return (
            <View
              key={block.id || bIndex}
              style={[styles.blockItem, { borderLeftColor: color }]}
            >
              <View style={styles.blockHeader}>
                <Text style={[styles.blockType, { color }]}>
                  {BLOCK_TYPE_LABELS[block.type as keyof typeof BLOCK_TYPE_LABELS] || block.type}
                </Text>
                {block.name ? (
                  <Text variant="labelMedium" style={styles.blockName}>
                    {block.name}
                  </Text>
                ) : null}
                {blockDist > 0 ? (
                  <Text variant="labelSmall" style={styles.blockDist}>
                    {blockDist}m
                  </Text>
                ) : null}
              </View>

              {block.sub_blocks.map((sb, sbIndex) => (
                <Text
                  key={sb.id || sbIndex}
                  variant="bodySmall"
                  style={styles.subBlockLine}
                >
                  {sb.repetitions > 1
                    ? `${sb.repetitions} x ${sb.distance}m`
                    : `${sb.distance}m`}
                  {sb.departure ? `  dep. ${sb.departure}` : ''}
                  {sb.description ? ` — ${sb.description}` : ''}
                </Text>
              ))}
            </View>
          );
        })}

        <View style={styles.expandBtnRow}>
          <Button
            mode="contained"
            icon="pencil"
            compact
            onPress={() => navigation.navigate('CreateWorkout', { workout: item })}
            style={styles.editBtn}
            labelStyle={styles.editBtnLabel}
          >
            Modifier
          </Button>
          <Button
            mode="outlined"
            icon="file-pdf-box"
            compact
            onPress={async () => {
              try {
                await exportWorkoutPdf(item);
              } catch (err: any) {
                showSnackbar(err.message || 'Erreur export PDF', 'error');
              }
            }}
            style={styles.pdfBtn}
            labelStyle={styles.editBtnLabel}
          >
            PDF
          </Button>
        </View>
      </View>
    );
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Entrainements
        </Text>
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            icon="bookshelf"
            onPress={() => navigation.navigate('BlockLibrary')}
            compact
            style={styles.headerBtn}
          >
            Biblio Blocs
          </Button>
          <Button
            mode="outlined"
            icon="history"
            onPress={() => navigation.navigate('WorkoutHistory')}
            compact
            style={styles.headerBtn}
          >
            Historique
          </Button>
          <Button
            mode="outlined"
            icon="creation"
            onPress={() => navigation.navigate('GenerateWorkout')}
            compact
            style={styles.headerBtn}
            textColor="#7C3AED"
          >
            IA
          </Button>
        </View>
      </View>

      {workouts.length === 0 && !loading ? (
        <EmptyState
          icon="dumbbell"
          title="Aucun entrainement cree"
          subtitle="Creez votre premier entrainement structure"
        />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadWorkouts}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card
                style={styles.card}
                onPress={() => toggleExpand(item.id)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <IconButton
                        icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        style={styles.chevron}
                      />
                      <Text variant="titleMedium" style={styles.cardTitle}>
                        {item.title}
                      </Text>
                    </View>
                    <View style={styles.cardActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => navigation.navigate('CreateWorkout', { workout: item })}
                      />
                      <IconButton
                        icon="content-copy"
                        size={20}
                        onPress={() => handleDuplicate(item)}
                      />
                      <IconButton
                        icon={item.is_published ? 'eye' : 'eye-off'}
                        size={20}
                        onPress={() => togglePublish(item)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="#EF4444"
                        onPress={() => setDeleteTarget(item)}
                      />
                    </View>
                  </View>
                  <View style={styles.chipRow}>
                    {item.total_distance ? (
                      <Chip compact icon="ruler" style={styles.chip}>
                        {item.total_distance}m
                      </Chip>
                    ) : null}
                    <Chip
                      compact
                      style={[
                        styles.chip,
                        item.is_published ? styles.publishedChip : styles.draftChip,
                      ]}
                    >
                      {item.is_published ? 'Publie' : 'Brouillon'}
                    </Chip>
                    {!isExpanded && item.content?.blocks ? (
                      <Chip compact style={styles.chip}>
                        {item.content.blocks.length} blocs
                      </Chip>
                    ) : null}
                  </View>

                  {isExpanded && renderExpandedContent(item)}
                </Card.Content>
              </Card>
            );
          }}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateWorkout')}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer la seance</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{deleteTarget?.title}" ? Cette action est irreversible.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Annuler</Button>
            <Button onPress={handleDelete} textColor="#EF4444">
              Supprimer
            </Button>
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
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  headerBtn: {
    borderColor: 'rgba(255, 255, 255, 0.60)',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chevron: {
    margin: 0,
    marginLeft: -8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginLeft: 24,
  },
  chip: {
    height: 26,
  },
  publishedChip: {
    backgroundColor: '#D1FAE5',
  },
  draftChip: {
    backgroundColor: '#FEF3C7',
  },
  // Expanded content
  expandedContent: {
    marginTop: 8,
    marginLeft: 24,
  },
  expandDivider: {
    marginBottom: 10,
  },
  expandDesc: {
    color: '#0891b2',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  blockItem: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 10,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  blockType: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  blockName: {
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  blockDist: {
    color: '#0891B2',
    fontWeight: 'bold',
  },
  subBlockLine: {
    color: 'rgba(100,116,139,0.65)',
    marginBottom: 2,
    paddingLeft: 4,
  },
  expandBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  editBtn: {
    backgroundColor: '#0891B2',
  },
  pdfBtn: {
    borderColor: '#0891B2',
  },
  editBtnLabel: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0891B2',
  },
});
