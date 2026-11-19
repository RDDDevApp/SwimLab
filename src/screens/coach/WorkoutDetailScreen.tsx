import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Chip,
  Button,
  IconButton,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useRefreshOnFocus, useWorkout } from '../../hooks';
import { workoutService } from '../../services';
import { useSnackbarStore } from '../../stores/snackbarStore';
import WorkoutContentView from '../../components/workout/WorkoutContentView';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
  route: any;
}

export default function WorkoutDetailScreen({ navigation, route }: Props) {
  const { workoutId } = route.params;
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [showDelete, setShowDelete] = useState(false);
  const { data: workout, isLoading: loading, refetch: loadWorkout } = useWorkout(workoutId);
  useRefreshOnFocus(loadWorkout);

  const togglePublish = async () => {
    if (!workout) return;
    try {
      if (workout.is_published) {
        await workoutService.unpublish(workout.id);
        showSnackbar('Séance dépubliée', 'success');
      } else {
        await workoutService.publish(workout.id);
        showSnackbar('Séance publiée', 'success');
      }
      loadWorkout();
    } catch (err) {
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
  };

  const handleDelete = async () => {
    if (!workout) return;
    try {
      await workoutService.delete(workout.id);
      setShowDelete(false);
      showSnackbar('Séance supprimée', 'success');
      navigation.goBack();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  if (loading || !workout) {
    return (
      <GradientScreen>
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
        </View>
        <View style={styles.loading}>
          <Text variant="bodyMedium" style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <View style={styles.headerActions}>
            <IconButton
              icon="pencil"
              size={22}
              onPress={() =>
                navigation.navigate('CreateWorkout', { workout })
              }
            />
            <IconButton
              icon={workout.is_published ? 'eye' : 'eye-off'}
              size={22}
              onPress={togglePublish}
            />
            <IconButton
              icon="delete"
              size={22}
              iconColor={C.danger}
              onPress={() => setShowDelete(true)}
            />
          </View>
        </View>
        <Text variant="titleLarge" style={styles.title}>
          {workout.title}
        </Text>
        <View style={styles.chipRow}>
          {workout.total_distance ? (
            <Chip compact icon="ruler" style={styles.distanceChip}>
              {workout.total_distance}m
            </Chip>
          ) : null}
          <Chip
            compact
            style={
              workout.is_published ? styles.publishedChip : styles.draftChip
            }
          >
            {workout.is_published ? 'Publiée' : 'Brouillon'}
          </Chip>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <WorkoutContentView workout={workout} />

        <Button
          mode="contained"
          icon="pencil"
          onPress={() => navigation.navigate('CreateWorkout', { workout })}
          style={styles.editBtn}
        >
          Modifier cette séance
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showDelete} onDismiss={() => setShowDelete(false)}>
          <Dialog.Title>Supprimer la séance</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Supprimer "{workout.title}" ? Cette action est irréversible.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDelete(false)}>Annuler</Button>
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
    padding: 8,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    paddingHorizontal: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 4,
  },
  distanceChip: {
    backgroundColor: C.primarySoft,
    height: 26,
  },
  publishedChip: {
    backgroundColor: C.successSoft,
    height: 26,
  },
  draftChip: {
    backgroundColor: C.warningSoft,
    height: 26,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  editBtn: {
    marginTop: 16,
    backgroundColor: C.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: C.inkMuted,
  },
});
