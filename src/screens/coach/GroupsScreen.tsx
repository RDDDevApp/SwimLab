import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Group, GROUP_LEVELS } from '../../types';
import { groupService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  navigation: any;
}

export default function GroupsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await groupService.getByCoach(user.id);
      setGroups(data);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await groupService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes Groupes
        </Text>
      </View>

      {groups.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Aucun groupe pour le moment
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Creez votre premier groupe d'entrainement
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
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
                    iconColor="#EF4444"
                    onPress={() => setDeleteTarget(item)}
                  />
                </View>
                <View style={styles.chipRow}>
                  {item.level && (
                    <Chip compact style={styles.chip}>
                      {GROUP_LEVELS[item.level as keyof typeof GROUP_LEVELS]}
                    </Chip>
                  )}
                  <Chip compact icon="clock-outline" style={styles.chip}>
                    Voir creneaux
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
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer le groupe</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{deleteTarget?.name}" ? Cette action est irreversible.
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
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
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginTop: 4,
  },
  chip: {
    height: 26,
  },
  desc: {
    color: '#6B7280',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#06B6D4',
  },
});
