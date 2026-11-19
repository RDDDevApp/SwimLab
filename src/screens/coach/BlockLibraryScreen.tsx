import React, { useState } from 'react';
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
import { useRefreshOnFocus, useBlockLibrary } from '../../hooks';
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
import { C, FONTS, WORKOUT_TYPE_COLORS } from '../../config/tokens';

interface Props {
  navigation: any;
}

const BLOCK_TYPES = [
  { value: 'warmup', label: 'Échauffement' },
  { value: 'main', label: 'Corps de séance' },
  { value: 'cooldown', label: 'Récupération' },
  { value: 'other', label: 'Autre' },
];

export default function BlockLibraryScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [deleteTarget, setDeleteTarget] = useState<BlockLibraryRow | null>(
    null,
  );

  const { data: blocks = [], isLoading: loading, isFetching, refetch: loadBlocks } = useBlockLibrary(clubId);
  useRefreshOnFocus(loadBlocks);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await blockLibraryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Bloc supprimé', 'success');
      loadBlocks();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const renderBlock = ({ item }: { item: BlockLibraryRow }) => {
    const typeColors = WORKOUT_TYPE_COLORS[item.type] ?? WORKOUT_TYPE_COLORS.other;
    const subBlocks: SubBlock[] = item.content || [];

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <Chip
                compact
                style={[styles.typeChip, { backgroundColor: typeColors.bg }]}
              >
                <Text style={{ color: typeColors.color, fontFamily: FONTS.textStrong, fontSize: 12 }}>
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
                iconColor={C.danger}
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
          Bibliothèque de blocs
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Sauvegarde tes blocs favoris pour les réutiliser dans tes séances
        </Text>
      </View>

      {blocks.length === 0 && !loading ? (
        <EmptyState
          icon="bookshelf"
          title="Aucun bloc sauvegardé"
          subtitle="Sauvegarde des blocs depuis l'éditeur de séance pour les retrouver ici"
        />
      ) : (
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isFetching}
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
              Supprimer "{deleteTarget?.name}" de la bibliothèque ?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Annuler</Button>
            <Button onPress={handleDelete} textColor={C.danger}>
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
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    paddingHorizontal: 8,
  },
  subtitle: {
    color: C.inkMuted,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: C.surface,
    marginBottom: 10,
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
    fontFamily: FONTS.display,
    color: C.ink,
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
    backgroundColor: C.primarySoft,
    height: 26,
  },
  subBlockList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  subBlockText: {
    color: C.primary,
    marginBottom: 2,
  },
});
