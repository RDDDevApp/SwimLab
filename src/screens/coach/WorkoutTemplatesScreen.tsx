import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Portal,
  Dialog,
  Button,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutTemplateRow, WORKOUT_TYPES, WorkoutType } from '../../types';
import {
  workoutTemplateService,
  workoutService,
} from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
}

export default function WorkoutTemplatesScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [templates, setTemplates] = useState<WorkoutTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutTemplateRow | null>(
    null,
  );

  const [tableError, setTableError] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await workoutTemplateService.getByClub(clubId);
      setTemplates(data);
      setTableError(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('workout_templates') || msg.includes('schema cache') || msg.includes('relation')) {
        setTableError(true);
        showSnackbar('La table workout_templates n\'existe pas encore. Appliquez la migration 003.', 'error');
      }
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutTemplateService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Template supprime', 'success');
      loadTemplates();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleUseTemplate = async (template: WorkoutTemplateRow) => {
    if (!user || !clubId) return;
    try {
      const workout = await workoutService.create({
        club_id: clubId,
        coach_id: user.id,
        title: `${template.title}`,
        type: template.type as WorkoutType,
        description: template.description,
        content: template.content,
        total_distance: template.total_distance,
        is_published: false,
      });
      showSnackbar('Seance creee depuis le template', 'success');
      navigation.navigate('CreateWorkout', { workout });
    } catch (err) {
      showSnackbar('Erreur lors de la creation', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Chip icon="file-document-multiple" style={styles.countChip}>
            {templates.length} templates
          </Chip>
        </View>
        <Text variant="titleLarge" style={styles.title}>
          Templates de seances
        </Text>
      </View>

      {templates.length === 0 && !loading ? (
        <EmptyState
          icon="file-document-outline"
          title="Aucun template"
          subtitle="Sauvegardez une seance comme template depuis la liste des entrainements"
        />
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadTemplates}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#EF4444"
                    onPress={() => setDeleteTarget(item)}
                  />
                </View>
                <View style={styles.chipRow}>
                  <Chip compact style={styles.chip}>
                    {WORKOUT_TYPES[item.type as keyof typeof WORKOUT_TYPES]}
                  </Chip>
                  {item.total_distance ? (
                    <Chip compact icon="ruler" style={styles.chip}>
                      {item.total_distance}m
                    </Chip>
                  ) : null}
                  <Chip compact style={styles.blockChip}>
                    {item.content?.blocks?.length || 0} blocs
                  </Chip>
                </View>
                {item.description ? (
                  <Text
                    variant="bodySmall"
                    style={styles.desc}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                ) : null}
                <Button
                  mode="contained-tonal"
                  icon="plus"
                  onPress={() => handleUseTemplate(item)}
                  style={styles.useBtn}
                  compact
                >
                  Utiliser ce template
                </Button>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <Portal>
        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Title>Supprimer le template</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer le template "{deleteTarget?.title}" ?
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countChip: {
    backgroundColor: '#FEF3C7',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    height: 26,
  },
  blockChip: {
    height: 26,
    backgroundColor: '#E0E7FF',
  },
  desc: {
    color: '#6B7280',
    marginTop: 8,
  },
  useBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
