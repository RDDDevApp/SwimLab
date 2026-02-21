import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  FAB,
  Portal,
  Dialog,
  Paragraph,
  IconButton,
  Checkbox,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { Profile, Group, GROUP_LEVELS } from '../../types';
import { groupService, profileService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
  route: any;
}

export default function GroupDetailScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add swimmer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [clubSwimmers, setClubSwimmers] = useState<Profile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addLoading, setAddLoading] = useState(false);

  // Remove member
  const [removeTarget, setRemoveTarget] = useState<Profile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupData, memberData] = await Promise.all([
        groupService.getById(groupId),
        groupService.getMembers(groupId),
      ]);
      setGroup(groupData);
      setMembers(memberData);
    } catch (err) {
      console.error('Error loading group detail:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openAddModal = async () => {
    if (!clubId) return;
    try {
      const swimmers = await profileService.getSwimmersByClub(clubId);
      const memberIds = new Set(members.map((m) => m.id));
      const available = swimmers.filter((s) => !memberIds.has(s.id));
      setClubSwimmers(available);
      setSelectedIds(new Set());
      setShowAddModal(true);
    } catch (err) {
      console.error('Error loading swimmers:', err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSwimmers = async () => {
    if (selectedIds.size === 0) return;
    setAddLoading(true);
    try {
      for (const swimmerId of selectedIds) {
        await groupService.addMember(groupId, swimmerId);
      }
      setShowAddModal(false);
      showSnackbar(`${selectedIds.size} nageur(s) ajoute(s)`, 'success');
      loadData();
    } catch (err) {
      showSnackbar('Erreur lors de l\'ajout', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await groupService.removeMember(groupId, removeTarget.id);
      setRemoveTarget(null);
      showSnackbar('Nageur retire du groupe', 'success');
      loadData();
    } catch (err) {
      showSnackbar('Erreur lors du retrait', 'error');
    }
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          {group?.name || 'Groupe'}
        </Text>
        {group?.level && (
          <Chip compact style={styles.levelChip}>
            {GROUP_LEVELS[group.level as keyof typeof GROUP_LEVELS]}
          </Chip>
        )}
      </View>

      <View style={styles.statsBar}>
        <Chip icon="account-group" style={styles.statChip}>
          {members.length} nageur{members.length !== 1 ? 's' : ''}
        </Chip>
        <Button
          mode="outlined"
          compact
          icon="account-plus"
          onPress={openAddModal}
        >
          Ajouter
        </Button>
      </View>

      {members.length === 0 && !loading ? (
        <EmptyState
          icon="account-plus"
          title="Aucun nageur dans ce groupe"
          subtitle="Ajoutez des nageurs de votre club a ce groupe"
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
          renderItem={({ item }) => (
            <Card style={styles.memberCard}>
              <Card.Content style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text variant="titleSmall" style={styles.memberName}>
                    {item.first_name} {item.last_name}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={18}
                  iconColor="#EF4444"
                  onPress={() => setRemoveTarget(item)}
                />
              </Card.Content>
            </Card>
          )}
        />
      )}

      <Button
        mode="contained"
        icon="clock-outline"
        style={styles.slotsBtn}
        onPress={() => navigation.navigate('Slots', { groupId })}
      >
        Voir les creneaux
      </Button>

      {/* Add swimmers dialog */}
      <Portal>
        <Dialog
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Ajouter des nageurs</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            {clubSwimmers.length === 0 ? (
              <Text variant="bodyMedium" style={styles.noSwimmers}>
                Aucun nageur disponible. Invitez des nageurs avec le code de votre club.
              </Text>
            ) : (
              <FlatList
                data={clubSwimmers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={selectedIds.has(item.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleSelection(item.id)}
                    />
                    <Text
                      variant="bodyMedium"
                      style={styles.checkboxLabel}
                      onPress={() => toggleSelection(item.id)}
                    >
                      {item.first_name} {item.last_name}
                    </Text>
                  </View>
                )}
              />
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAddModal(false)}>Annuler</Button>
            <Button
              onPress={handleAddSwimmers}
              loading={addLoading}
              disabled={addLoading || selectedIds.size === 0}
            >
              Ajouter ({selectedIds.size})
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Remove member dialog */}
        <Dialog visible={!!removeTarget} onDismiss={() => setRemoveTarget(null)}>
          <Dialog.Title>Retirer du groupe</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Retirer {removeTarget?.first_name} {removeTarget?.last_name} de ce groupe ?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRemoveTarget(null)}>Annuler</Button>
            <Button onPress={handleRemove} textColor="#EF4444">
              Retirer
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
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 16,
  },
  levelChip: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  statChip: {
    backgroundColor: '#DBEAFE',
  },
  list: {
    padding: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 6,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#1e293b',
    fontWeight: '600',
  },
  slotsBtn: {
    margin: 16,
  },
  dialog: {
    maxHeight: '70%',
  },
  dialogScroll: {
    maxHeight: 300,
    paddingHorizontal: 0,
  },
  noSwimmers: {
    color: '#64748b',
    textAlign: 'center',
    padding: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  checkboxLabel: {
    color: '#1e293b',
    marginLeft: 8,
  },
});
