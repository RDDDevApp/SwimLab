import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { TrainingSlot } from '../../types';
import { trainingSlotService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import SlotCard from '../../components/SlotCard';
import EmptyState from '../../components/EmptyState';

interface Props {
  navigation: any;
  route?: any;
}

export default function SlotsScreen({ navigation, route }: Props) {
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [slots, setSlots] = useState<TrainingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TrainingSlot | null>(null);

  const groupId = route?.params?.groupId;

  const loadSlots = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = groupId
        ? await trainingSlotService.getByGroup(groupId)
        : await trainingSlotService.getByCoach(user.id);
      setSlots(data);
    } catch (err) {
      console.error('Error loading slots:', err);
    } finally {
      setLoading(false);
    }
  }, [user, groupId]);

  useFocusEffect(
    useCallback(() => {
      loadSlots();
    }, [loadSlots]),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await trainingSlotService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Creneau supprime', 'success');
      loadSlots();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="headlineMedium" style={styles.title}>
          Creneaux
        </Text>
      </View>

      {slots.length === 0 && !loading ? (
        <EmptyState
          icon="clock-outline"
          title="Aucun creneau pour le moment"
          subtitle="Creez votre premier creneau d'entrainement"
        />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SlotCard
              slot={item}
              onEdit={(slot) =>
                navigation.navigate('CreateSlot', { slot, groupId })
              }
              onDelete={(slot) => setDeleteTarget(slot)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadSlots}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSlot', { groupId })}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer le creneau</Dialog.Title>
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1B4332',
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
    color: 'rgba(27,67,50,0.50)',
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(27,67,50,0.50)',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0891B2',
  },
});
