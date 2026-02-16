import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  FAB,
  Card,
  Chip,
  IconButton,
  Portal,
  Dialog,
  Button,
  Paragraph,
  Searchbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ExerciseLibraryRow,
  STROKE_LABELS,
  INTENSITY_LABELS,
  EXERCISE_CATEGORIES,
} from '../../types';
import { exerciseLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
}

export default function ExerciseLibraryScreen({ navigation }: Props) {
  const { clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [exercises, setExercises] = useState<ExerciseLibraryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ExerciseLibraryRow | null>(
    null,
  );

  const [tableError, setTableError] = useState(false);

  const loadExercises = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await exerciseLibraryService.getByClub(clubId);
      setExercises(data);
      setTableError(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('exercise_library') || msg.includes('schema cache') || msg.includes('relation')) {
        setTableError(true);
        showSnackbar('La table exercise_library n\'existe pas encore. Appliquez la migration 003.', 'error');
      }
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await exerciseLibraryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Exercice supprime', 'success');
      loadExercises();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Chip icon="bookshelf" style={styles.countChip}>
            {exercises.length} exercices
          </Chip>
        </View>
        <Text variant="titleLarge" style={styles.title}>
          Bibliotheque d'exercices
        </Text>
        <Searchbar
          placeholder="Rechercher un exercice..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
      </View>

      {filtered.length === 0 && !loading ? (
        <EmptyState
          icon="book-open-variant"
          title={
            search
              ? 'Aucun resultat'
              : 'Bibliotheque vide'
          }
          subtitle={
            search
              ? 'Essayez un autre terme de recherche'
              : 'Ajoutez vos exercices favoris pour les reutiliser'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadExercises}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() =>
                navigation.navigate('CreateExercise', { exercise: item })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    {item.name}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#EF4444"
                    onPress={() => setDeleteTarget(item)}
                  />
                </View>
                <View style={styles.chipRow}>
                  <Chip compact icon="ruler" style={styles.chip}>
                    {item.distance}m
                  </Chip>
                  <Chip compact style={styles.chip}>
                    {STROKE_LABELS[item.stroke] || item.stroke}
                  </Chip>
                  <Chip compact style={styles.chip}>
                    {INTENSITY_LABELS[item.intensity] || item.intensity}
                  </Chip>
                  {item.category && (
                    <Chip compact style={styles.categoryChip}>
                      {EXERCISE_CATEGORIES[
                        item.category as keyof typeof EXERCISE_CATEGORIES
                      ] || item.category}
                    </Chip>
                  )}
                </View>
                {item.notes ? (
                  <Text
                    variant="bodySmall"
                    style={styles.notes}
                    numberOfLines={2}
                  >
                    {item.notes}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateExercise')}
      />

      <Portal>
        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Title>Supprimer l'exercice</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{deleteTarget?.name}" de la bibliotheque ?
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
    backgroundColor: '#CFFAFE',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    backgroundColor: '#F3F4F6',
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
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
  categoryChip: {
    height: 26,
    backgroundColor: '#EDE9FE',
  },
  notes: {
    color: '#6B7280',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
  },
});
