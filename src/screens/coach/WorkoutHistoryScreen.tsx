import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import {
  workoutAssignmentService,
  workoutService,
  workoutSessionService,
  groupService,
  trainingSlotService,
} from '../../services';
import { useAuthStore } from '../../stores/authStore';
import EmptyState from '../../components/EmptyState';
import { toISODate } from '../../utils/dateHelpers';

interface HistoryItem {
  assignmentId: string;
  scheduledDate: string;
  workoutTitle: string;
  workoutType?: string;
  totalDistance: number | null;
  groupName: string;
  attendedCount: number;
  totalSwimmers: number;
  averageRpe: number | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

interface Props {
  navigation: any;
}

export default function WorkoutHistoryScreen({ navigation }: Props) {
  const { user, clubId } = useAuthStore();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !clubId) return;
    setLoading(true);
    try {
      // Get all groups for this coach
      const groups = await groupService.getByCoach(user.id);
      if (!groups.length) {
        setItems([]);
        return;
      }

      // Get all slots
      const allSlots = [];
      for (const group of groups) {
        const slots = await trainingSlotService.getByGroup(group.id);
        for (const slot of slots) {
          allSlots.push({ ...slot, groupName: group.name });
        }
      }
      if (!allSlots.length) {
        setItems([]);
        return;
      }

      // Get past assignments (last 90 days)
      const today = new Date();
      const ago90 = new Date();
      ago90.setDate(today.getDate() - 90);
      const slotIds = allSlots.map((s) => s.id);

      const assignments = await workoutAssignmentService.getByDateRange(
        slotIds,
        toISODate(ago90),
        toISODate(today),
      );

      // Only keep past assignments with attendance marked
      const pastAssignments = assignments.filter(
        (a) =>
          a.scheduled_date <= toISODate(today) && a.attendance_marked,
      );

      if (!pastAssignments.length) {
        setItems([]);
        return;
      }

      // Get workout details
      const workoutIds = [
        ...new Set(pastAssignments.map((a) => a.workout_id)),
      ];
      const workouts = new Map<string, any>();
      for (const wId of workoutIds) {
        try {
          const w = await workoutService.getById(wId);
          workouts.set(wId, w);
        } catch {}
      }

      // Get feedback stats (batch RPE)
      const assignmentIds = pastAssignments.map((a) => a.id);
      const rpeMap =
        await workoutSessionService.getAverageRpeByAssignments(assignmentIds);

      // Build items
      const result: HistoryItem[] = [];
      for (const a of pastAssignments) {
        const slot = allSlots.find((s) => s.id === a.training_slot_id);
        const workout = workouts.get(a.workout_id);

        result.push({
          assignmentId: a.id,
          scheduledDate: a.scheduled_date,
          workoutTitle: workout?.title || 'Seance',
          workoutType: workout?.type || 'other',
          totalDistance: workout?.total_distance || null,
          groupName: slot?.groupName || '',
          attendedCount: 0, // will load if needed
          totalSwimmers: 0,
          averageRpe: rpeMap[a.id] ?? null,
        });
      }

      // Sort by date descending
      result.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
      setItems(result);
    } catch (err) {
      console.error('Error loading coach history:', err);
    } finally {
      setLoading(false);
    }
  }, [user, clubId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  function getRpeColor(rpe: number): { bg: string; text: string } {
    if (rpe <= 12) return { bg: '#D1FAE5', text: '#065F46' };
    if (rpe <= 15) return { bg: '#FEF3C7', text: '#92400E' };
    return { bg: '#FEE2E2', text: '#991B1B' };
  }

  return (
    <GradientScreen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Chip icon="history" style={styles.countChip}>
            {items.length} seances
          </Chip>
        </View>
        <Text variant="titleLarge" style={styles.title}>
          Historique des seances
        </Text>
      </View>

      {items.length === 0 && !loading ? (
        <EmptyState
          icon="history"
          title="Aucun historique"
          subtitle="Les seances passees apparaitront ici"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.assignmentId}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() =>
                navigation.navigate('WorkoutStats', {
                  assignmentId: item.assignmentId,
                  workoutTitle: item.workoutTitle,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="labelMedium" style={styles.date}>
                    {formatDate(item.scheduledDate)}
                  </Text>
                  <Chip compact style={styles.groupChip}>
                    {item.groupName}
                  </Chip>
                </View>
                <Text variant="titleSmall" style={styles.workoutTitle}>
                  {item.workoutTitle}
                </Text>
                <View style={styles.chipRow}>
                  {item.totalDistance ? (
                    <Chip compact icon="ruler" style={styles.chip}>
                      {item.totalDistance}m
                    </Chip>
                  ) : null}
                  {item.averageRpe !== null && (
                    <Chip
                      compact
                      style={[
                        styles.rpeChip,
                        {
                          backgroundColor: getRpeColor(item.averageRpe).bg,
                        },
                      ]}
                      textStyle={{
                        color: getRpeColor(item.averageRpe).text,
                        fontSize: 11,
                      }}
                    >
                      RPE {item.averageRpe.toFixed(1)}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1B4332',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  segmented: {
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: 'rgba(27,67,50,0.50)',
    fontWeight: '600',
  },
  groupChip: {
    backgroundColor: '#E0E7FF',
    height: 26,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1B4332',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  rpeChip: {
    height: 26,
  },
});
