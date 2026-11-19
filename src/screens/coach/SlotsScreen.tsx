import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useRefreshOnFocus, useTrainingSlots } from '../../hooks';
import { TrainingSlot } from '../../types';
import { trainingSlotService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import SlotCard from '../../components/SlotCard';
import EmptyState from '../../components/EmptyState';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
  route?: any;
}

export default function SlotsScreen({ navigation, route }: Props) {
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [deleteTarget, setDeleteTarget] = useState<TrainingSlot | null>(null);

  const groupId = route?.params?.groupId;

  const { data: slots = [], isLoading: loading, isFetching, refetch: loadSlots } = useTrainingSlots(user?.id, groupId);
  useRefreshOnFocus(loadSlots);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await trainingSlotService.delete(deleteTarget.id);
      setDeleteTarget(null);
      showSnackbar('Créneau supprimé', 'success');
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
          Créneaux
        </Text>
      </View>

      {slots.length === 0 && !loading ? (
        <EmptyState
          icon="clock-outline"
          title="Aucun créneau pour le moment"
          subtitle="Crée ton premier créneau d'entraînement"
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
          refreshing={isFetching}
          onRefresh={loadSlots}
        />
      )}

      <FAB
        icon="plus"
        color={C.onPrimary}
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSlot', { groupId })}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Supprimer le créneau</Dialog.Title>
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: C.primary,
    borderRadius: 999,
  },
});
