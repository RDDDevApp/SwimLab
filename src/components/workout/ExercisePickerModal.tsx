import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Card,
  Chip,
  Button,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import {
  ExerciseLibraryRow,
  STROKE_LABELS,
  INTENSITY_LABELS,
} from '../../types';
import { exerciseLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface ExercisePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (exercise: ExerciseLibraryRow) => void;
}

export default function ExercisePickerModal({
  visible,
  onDismiss,
  onSelect,
}: ExercisePickerModalProps) {
  const { clubId } = useAuthStore();
  const [exercises, setExercises] = useState<ExerciseLibraryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible && clubId) {
      setLoading(true);
      exerciseLibraryService
        .getByClub(clubId)
        .then(setExercises)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [visible, clubId]);

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Choisir un exercice
          </Text>
          <IconButton icon="close" size={20} onPress={onDismiss} />
        </View>

        <Searchbar
          placeholder="Rechercher..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {loading
                ? 'Chargement...'
                : exercises.length === 0
                  ? 'Aucun exercice dans la bibliotheque'
                  : 'Aucun resultat'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <Card
                style={styles.card}
                onPress={() => {
                  onSelect(item);
                  onDismiss();
                }}
              >
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleSmall" style={styles.cardTitle}>
                    {item.name}
                  </Text>
                  <View style={styles.chipRow}>
                    <Chip compact style={styles.chip}>
                      {item.distance}m
                    </Chip>
                    <Chip compact style={styles.chip}>
                      {STROKE_LABELS[item.stroke] || item.stroke}
                    </Chip>
                    <Chip compact style={styles.chip}>
                      {INTENSITY_LABELS[item.intensity] || item.intensity}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        )}

        <Button mode="outlined" onPress={onDismiss} style={styles.closeBtn}>
          Fermer
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchbar: {
    backgroundColor: '#F3F4F6',
    elevation: 0,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  list: {
    maxHeight: 400,
  },
  card: {
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  cardContent: {
    paddingVertical: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    height: 24,
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
  },
  closeBtn: {
    marginTop: 12,
  },
});
