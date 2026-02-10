import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WorkoutAssignment, WorkoutSession, WORKOUT_TYPES } from '../../types';
import {
  groupService,
  trainingSlotService,
  workoutAssignmentService,
  workoutSessionService,
  workoutService,
} from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { toISODate, formatShortDate } from '../../utils/dateHelpers';

interface EnrichedAssignment {
  assignment: WorkoutAssignment;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
  slotName: string;
  session: WorkoutSession | null;
}

interface Props {
  navigation: any;
}

export default function SwimmerCalendarScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [items, setItems] = useState<EnrichedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get groups the swimmer belongs to
      const groups = await groupService.getBySwimmer(user.id);
      if (!groups.length) {
        setItems([]);
        return;
      }

      // Get slots for all groups
      const allSlots = [];
      for (const group of groups) {
        const slots = await trainingSlotService.getByGroup(group.id);
        allSlots.push(...slots);
      }
      if (!allSlots.length) {
        setItems([]);
        return;
      }

      // Get assignments for next 14 days
      const today = new Date();
      const in14Days = new Date();
      in14Days.setDate(today.getDate() + 14);
      const slotIds = allSlots.map((s) => s.id);
      const assignments = await workoutAssignmentService.getByDateRange(
        slotIds,
        toISODate(today),
        toISODate(in14Days),
      );

      // Get swimmer's sessions
      const sessions = await workoutSessionService.getBySwimmer(user.id);

      // Enrich assignments
      const enriched: EnrichedAssignment[] = [];
      for (const assignment of assignments) {
        const slot = allSlots.find((s) => s.id === assignment.training_slot_id);
        let workoutTitle = 'Seance';
        let workoutType = 'other';
        let totalDistance: number | null = null;

        try {
          const workout = await workoutService.getById(assignment.workout_id);
          workoutTitle = workout.title;
          workoutType = workout.type;
          totalDistance = workout.total_distance;
        } catch {}

        const session = sessions.find(
          (s) => s.workout_assignment_id === assignment.id,
        ) || null;

        enriched.push({
          assignment,
          workoutTitle,
          workoutType,
          totalDistance,
          slotName: slot?.name || '',
          session,
        });
      }

      setItems(enriched);
    } catch (err) {
      console.error('Error loading swimmer calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getStatusBadge = (item: EnrichedAssignment) => {
    const { assignment, session } = item;
    const isPast = new Date(assignment.scheduled_date + 'T23:59:59') < new Date();

    if (session?.completed_at) {
      return { label: 'Feedback donne', color: '#D1FAE5', textColor: '#065F46' };
    }
    if (session?.attended && !session?.completed_at) {
      return { label: 'Donner feedback', color: '#FEF3C7', textColor: '#92400E' };
    }
    if (session && !session.attended) {
      return { label: 'Absent', color: '#FEE2E2', textColor: '#991B1B' };
    }
    if (isPast && assignment.attendance_marked) {
      return { label: 'Non marque', color: '#F3F4F6', textColor: '#6B7280' };
    }
    return { label: 'A venir', color: '#DBEAFE', textColor: '#1E40AF' };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mes Entrainements
        </Text>
      </View>

      {items.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Aucun entrainement a venir
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Rejoignez un club pour voir vos entrainements
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.assignment.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item);
            const canFeedback =
              item.session?.attended && !item.session?.completed_at;

            return (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.dateCol}>
                      <Text variant="titleSmall" style={styles.date}>
                        {formatShortDate(
                          new Date(item.assignment.scheduled_date + 'T00:00:00'),
                        )}
                      </Text>
                      <Text variant="bodySmall" style={styles.slotName}>
                        {item.slotName}
                      </Text>
                    </View>
                    <Chip
                      compact
                      style={[styles.badge, { backgroundColor: badge.color }]}
                      textStyle={{ color: badge.textColor, fontSize: 11 }}
                    >
                      {badge.label}
                    </Chip>
                  </View>

                  <Text variant="titleMedium" style={styles.workoutTitle}>
                    {item.workoutTitle}
                  </Text>

                  <View style={styles.chipRow}>
                    <Chip compact style={styles.chip}>
                      {WORKOUT_TYPES[item.workoutType as keyof typeof WORKOUT_TYPES] || item.workoutType}
                    </Chip>
                    {item.totalDistance ? (
                      <Chip compact icon="ruler" style={styles.chip}>
                        {item.totalDistance}m
                      </Chip>
                    ) : null}
                  </View>

                  {canFeedback && (
                    <Button
                      mode="contained"
                      compact
                      style={styles.feedbackBtn}
                      onPress={() =>
                        navigation.navigate('Feedback', {
                          sessionId: item.session!.id,
                          workoutTitle: item.workoutTitle,
                        })
                      }
                    >
                      Donner mon ressenti
                    </Button>
                  )}
                </Card.Content>
              </Card>
            );
          }}
        />
      )}
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
    marginBottom: 8,
  },
  dateCol: {},
  date: {
    color: '#1F2937',
    fontWeight: '600',
  },
  slotName: {
    color: '#6B7280',
  },
  badge: {
    height: 26,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 26,
  },
  feedbackBtn: {
    marginTop: 12,
  },
});
