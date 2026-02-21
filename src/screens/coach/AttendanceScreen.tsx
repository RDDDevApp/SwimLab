import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Checkbox, Button, Card, Chip, HelperText } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { Profile } from '../../types';
import {
  groupService,
  workoutSessionService,
  workoutAssignmentService,
  notificationService,
} from '../../services';
import { useSnackbarStore } from '../../stores/snackbarStore';

interface Props {
  navigation: any;
  route: any;
}

export default function AttendanceScreen({ navigation, route }: Props) {
  const { assignmentId, groupId, workoutTitle } = route.params;
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [swimmers, setSwimmers] = useState<Profile[]>([]);
  const [attendedIds, setAttendedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSwimmers();
  }, []);

  const loadSwimmers = async () => {
    try {
      const members = await groupService.getMembers(groupId);
      setSwimmers(members);
      // All checked by default
      setAttendedIds(new Set(members.map((m) => m.id)));
    } catch (err) {
      console.error('Error loading swimmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwimmer = (swimmerId: string) => {
    setAttendedIds((prev) => {
      const next = new Set(prev);
      if (next.has(swimmerId)) {
        next.delete(swimmerId);
      } else {
        next.add(swimmerId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setAttendedIds(new Set(swimmers.map((m) => m.id)));
  };

  const deselectAll = () => {
    setAttendedIds(new Set());
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const swimmerIds = swimmers.map((s) => s.id);
      const attendedArray = Array.from(attendedIds);

      await workoutSessionService.bulkCreateAttendance(
        assignmentId,
        swimmerIds,
        attendedArray,
      );
      await workoutAssignmentService.markAttendance(assignmentId);

      // Send push notifications to attended swimmers for feedback
      try {
        await notificationService.notifyFeedbackRequired(
          attendedArray,
          workoutTitle || 'la seance',
        );
      } catch {}

      showSnackbar('Emargement valide', 'success');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'emargement');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = attendedIds.size;
  const totalCount = swimmers.length;

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Emargement
        </Text>
        {workoutTitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {workoutTitle}
          </Text>
        )}
      </View>

      <View style={styles.statsBar}>
        <Chip icon="account-check" style={styles.statChip}>
          {presentCount}/{totalCount} presents
        </Chip>
        <View style={styles.quickActions}>
          <Button compact onPress={selectAll}>
            Tous
          </Button>
          <Button compact onPress={deselectAll}>
            Aucun
          </Button>
        </View>
      </View>

      <FlatList
        data={swimmers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.swimmerCard,
              attendedIds.has(item.id) && styles.presentCard,
            ]}
            onPress={() => toggleSwimmer(item.id)}
          >
            <Card.Content style={styles.swimmerRow}>
              <Checkbox
                status={attendedIds.has(item.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleSwimmer(item.id)}
              />
              <Text variant="bodyLarge" style={styles.swimmerName}>
                {item.first_name} {item.last_name}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      <View style={styles.footer}>
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          Valider l'emargement ({presentCount}/{totalCount})
        </Button>
      </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1B4332',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: 'rgba(27,67,50,0.50)',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  statChip: {
    backgroundColor: '#D1FAE5',
  },
  quickActions: {
    flexDirection: 'row',
  },
  list: {
    padding: 12,
  },
  swimmerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 6,
  },
  presentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  swimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swimmerName: {
    marginLeft: 8,
    color: '#1B4332',
  },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
});
