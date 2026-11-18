import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Portal, Dialog, Button, Card, Chip, Searchbar } from 'react-native-paper';
import { BlockLibraryRow, SubBlock, BLOCK_TYPE_LABELS } from '../../types';
import { blockLibraryService } from '../../services';
import { C, FONTS, WORKOUT_TYPE_COLORS } from '../../config/tokens';

interface BlockPickerModalProps {
  visible: boolean;
  clubId: string;
  onDismiss: () => void;
  onSelect: (block: BlockLibraryRow) => void;
}

export default function BlockPickerModal({
  visible,
  clubId,
  onDismiss,
  onSelect,
}: BlockPickerModalProps) {
  const [blocks, setBlocks] = useState<BlockLibraryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible && clubId) {
      loadBlocks();
    }
    if (!visible) {
      setSearch('');
    }
  }, [visible, clubId]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const data = await blockLibraryService.getByClub(clubId);
      setBlocks(data);
    } catch (err) {
      console.error('BlockPickerModal: error loading blocks', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return blocks;
    const q = search.toLowerCase().trim();
    return blocks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (BLOCK_TYPE_LABELS[b.type as keyof typeof BLOCK_TYPE_LABELS] || '')
          .toLowerCase()
          .includes(q),
    );
  }, [blocks, search]);

  const handleSelect = (block: BlockLibraryRow) => {
    onSelect(block);
    onDismiss();
  };

  const renderItem = ({ item }: { item: BlockLibraryRow }) => {
    const typeColors = WORKOUT_TYPE_COLORS[item.type] ?? WORKOUT_TYPE_COLORS.other;
    const subBlocks = (item.content || []) as SubBlock[];

    return (
      <TouchableOpacity onPress={() => handleSelect(item)}>
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
                <Text variant="titleSmall" style={styles.cardTitle}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Chip compact style={styles.distChip}>
                  {item.total_distance}m
                </Chip>
              </View>
            </View>
            {subBlocks.length > 0 && (
              <Text variant="bodySmall" style={styles.subBlockPreview} numberOfLines={2}>
                {subBlocks
                  .map((sb) =>
                    sb.repetitions > 1
                      ? `${sb.repetitions}x${sb.distance}m`
                      : `${sb.distance}m`,
                  )
                  .join(' + ')}
              </Text>
            )}
            <Text variant="labelSmall" style={styles.subBlockCount}>
              {subBlocks.length} sous-bloc{subBlocks.length !== 1 ? 's' : ''}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Importer depuis la bibliothèque</Dialog.Title>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Rechercher un bloc..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
          />
        </View>
        <Dialog.ScrollArea style={styles.scrollArea}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Chargement...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {blocks.length === 0
                  ? 'Aucun bloc dans la bibliothèque'
                  : 'Aucun résultat'}
              </Text>
              {blocks.length === 0 && (
                <Text variant="bodySmall" style={styles.emptySubtext}>
                  Sauvegarde des blocs avec le bouton « Sauvegarder dans biblio »
                </Text>
              )}
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Fermer</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    backgroundColor: C.surfaceSunken,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 400,
  },
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardRight: {
    marginLeft: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  distChip: {
    backgroundColor: C.primarySoft,
    height: 24,
  },
  cardTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
  },
  subBlockPreview: {
    color: C.inkMuted,
    marginTop: 4,
  },
  subBlockCount: {
    color: C.inkMuted,
    marginTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: C.inkMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    color: C.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
