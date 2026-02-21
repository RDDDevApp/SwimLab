import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  IconButton,
  Portal,
  Dialog,
  Paragraph,
  TextInput,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import {
  BlockLibraryRow,
  BlockType,
  SubBlock,
  BLOCK_TYPE_LABELS,
} from '../../types';
import { blockLibraryService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';
import PickerSelect from '../../components/PickerSelect';

interface Props {
  navigation: any;
}

const BLOCK_COLORS: Record<string, string> = {
  warmup: '#10B981',
  main: '#0891B2',
  cooldown: '#8B5CF6',
  other: '#64748b',
};

const BLOCK_TYPES = [
  { value: 'warmup', label: 'Echauffement' },
  { value: 'main', label: 'Corps de seance' },
  { value: 'cooldown', label: 'Recuperation' },
  { value: 'other', label: 'Autre' },
];

export default function BlockLibraryScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [blocks, setBlocks] = useState<BlockLibraryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BlockLibraryRow | null>(
    null,
  );

  const loadBlocks = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await blockLibraryService.getByClub(clubId);
      setBlocks(data);
    } catch (err) {
      console.error('Error loading block library:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      loadBlocks();
    }, [loadBlocks]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await blockLibraryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Bloc supprime', 'success');
      loadBlocks();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const renderBlock = ({ item }: { item: BlockLibraryRow }) => {
    const color = BLOCK_COLORS[item.type] || BLOCK_COLORS.other;
    const subBlocks: SubBlock[] = item.content || [];

    return (
      <Card style={[styles.card, { borderLeftColor: color }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <Chip
                compact
                style={[styles.typeChip, { backgroundColor: color + '20' }]}
              >
                <Text style={{ color, fontWeight: '600', fontSize: 11 }}>
                  {BLOCK_TYPE_LABELS[item.type as keyof typeof BLOCK_TYPE_LABELS] || item.type}
                </Text>
              </Chip>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {item.name}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <Chip compact style={styles.distanceChip}>
                {item.total_distance}m
              </Chip>
              <IconButton
                icon="delete"
                size={20}
                iconColor="#EF4444"
                onPress={() => setDeleteTarget(item)}
              />
            </View>
          </View>

          {subBlocks.length > 0 ? (
            <View style={styles.subBlockList}>
              {subBlocks.map((sb, i) => (
                <Text key={i} variant="bodySmall" style={styles.subBlockText}>
                  {sb.repetitions > 1
                    ? `${sb.repetitions} x ${sb.distance}m`
                    : `${sb.distance}m`}
                  {sb.description ? ` — ${sb.description}` : ''}
                </Text>
              ))}
            </View>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="headlineMedium" style={styles.title}>
          Bibliotheque de blocs
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Sauvegardez vos blocs favoris pour les reutiliser dans vos seances
        </Text>
      </View>

      {blocks.length === 0 && !loading ? (
        <EmptyState
          icon="bookshelf"
          title="Aucun bloc sauvegarde"
          subtitle="Sauvegardez des blocs depuis l'editeur de seance pour les retrouver ici"
        />
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadBlocks}
          renderItem={renderBlock}
        />
      )}

      <Portal>
        <Dialog
          visible={!!deleteTarget}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Title>Supprimer le bloc</Dialog.Title>
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
    paddingTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 8,
  },
  subtitle: {
    color: '#64748b',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 26,
  },
  distanceChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
    height: 26,
  },
  subBlockList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.50)',
  },
  subBlockText: {
    color: '#0891b2',
    marginBottom: 2,
  },
});
