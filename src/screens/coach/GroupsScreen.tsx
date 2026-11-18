import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useRefreshOnFocus, useCoachGroups } from '../../hooks';
import { Group, GROUP_LEVELS } from '../../types';
import { groupService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
}

export default function GroupsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const { data: groups = [], isLoading: loading, isFetching, refetch: loadGroups } = useCoachGroups(user?.id);
  useRefreshOnFocus(loadGroups);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await groupService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Groupe supprimé', 'success');
      loadGroups();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes groupes
        </Text>
      </View>

      {groups.length === 0 && !loading ? (
        <EmptyState
          icon="account-group"
          title="Aucun groupe pour le moment"
          subtitle="Crée ton premier groupe d'entraînement"
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isFetching}
          onRefresh={loadGroups}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() =>
                navigation.navigate('GroupDetail', { groupId: item.id })
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
                    iconColor={C.danger}
                    onPress={() => setDeleteTarget(item)}
                  />
                </View>
                <View style={styles.chipRow}>
                  {item.level && (
                    <Chip compact style={styles.chip}>
                      {GROUP_LEVELS[item.level as keyof typeof GROUP_LEVELS]}
                    </Chip>
                  )}
                  <Chip
                    compact
                    icon="clock-outline"
                    style={styles.chip}
                    onPress={() => navigation.navigate('Slots', { groupId: item.id })}
                    accessibilityLabel={`Voir les créneaux du groupe ${item.name}`}
                  >
                    Voir créneaux
                  </Chip>
                </View>
                {item.description ? (
                  <Text variant="bodySmall" style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        color={C.onPrimary}
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer le groupe</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{deleteTarget?.name}" ? Cette action est irréversible.
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
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: C.inkMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    color: C.inkMuted,
    textAlign: 'center',
    marginTop: 8,
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
  cardTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    height: 26,
  },
  desc: {
    color: C.inkMuted,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: C.primary,
    borderRadius: 999,
  },
});
