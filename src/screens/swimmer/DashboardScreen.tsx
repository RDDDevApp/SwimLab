import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import {
  groupService,
  trainingSlotService,
  workoutAssignmentService,
  workoutSessionService,
  workoutService,
  clubService,
} from '../../services';
import { WorkoutAssignment, WorkoutSession, WORKOUT_TYPES, Club } from '../../types';
import { toISODate, formatShortDate } from '../../utils/dateHelpers';

interface UpcomingWorkout {
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

export default function SwimmerDashboardScreen({ navigation }: Props) {
  const { profile, user, clubId, signOut } = useAuthStore();
  const [upcoming, setUpcoming] = useState<UpcomingWorkout[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState({ total: 0, attended: 0, averageRpe: null as number | null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load club info
      if (clubId) {
        const clubData = await clubService.getById(clubId);
        setClub(clubData);
      }

      // Load swimmer stats
      const swimmerStats = await workoutSessionService.getSwimmerStats(user.id);
      setStats(swimmerStats);

      // Load upcoming workouts
      const groups = await groupService.getBySwimmer(user.id);
      if (!groups.length) {
        setUpcoming([]);
        return;
      }

      const allSlots = [];
      for (const group of groups) {
        const slots = await trainingSlotService.getByGroup(group.id);
        allSlots.push(...slots);
      }
      if (!allSlots.length) {
        setUpcoming([]);
        return;
      }

      const today = new Date();
      const in14Days = new Date();
      in14Days.setDate(today.getDate() + 14);
      const slotIds = allSlots.map((s) => s.id);
      const assignments = await workoutAssignmentService.getByDateRange(
        slotIds,
        toISODate(today),
        toISODate(in14Days),
      );

      const sessions = await workoutSessionService.getBySwimmer(user.id);

      const enriched: UpcomingWorkout[] = [];
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

        const session =
          sessions.find((s) => s.workout_assignment_id === assignment.id) || null;

        enriched.push({
          assignment,
          workoutTitle,
          workoutType,
          totalDistance,
          slotName: slot?.name || '',
          session,
        });
      }

      // Show max 3 upcoming
      setUpcoming(enriched.slice(0, 3));
    } catch (err) {
      console.error('Error loading swimmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user, clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getStatusBadge = (item: UpcomingWorkout) => {
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={styles.greeting}>
              Bonjour, {profile?.first_name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Nageur{club ? ` - ${club.name}` : ''}
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
            style={styles.avatar}
          />
        </View>

        {stats.total > 0 && (
          <Card style={styles.card} onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}>
            <Card.Content>
              <View style={styles.statsHeader}>
                <Text variant="titleMedium">Mes statistiques</Text>
                <Chip compact icon="chart-line" style={styles.statsChip}>
                  Voir plus
                </Chip>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {stats.attended}
                  </Text>
                  <Text variant="bodySmall">Presences</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {stats.total > 0
                      ? Math.round((stats.attended / stats.total) * 100)
                      : 0}
                    %
                  </Text>
                  <Text variant="bodySmall">Assiduite</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {stats.averageRpe ? stats.averageRpe.toFixed(1) : '-'}
                  </Text>
                  <Text variant="bodySmall">RPE moy.</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Prochains entrainements
            </Text>

            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : upcoming.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Aucun entrainement a venir
                </Text>
              </View>
            ) : (
              upcoming.map((item) => {
                const badge = getStatusBadge(item);
                const canFeedback =
                  item.session?.attended && !item.session?.completed_at;

                return (
                  <Card
                    key={item.assignment.id}
                    style={styles.workoutCard}
                    onPress={() =>
                      navigation.navigate('WorkoutDetail', {
                        workoutId: item.assignment.workout_id,
                        workoutTitle: item.workoutTitle,
                      })
                    }
                  >
                    <Card.Content>
                      <View style={styles.workoutHeader}>
                        <Text variant="labelMedium" style={styles.date}>
                          {formatShortDate(
                            new Date(item.assignment.scheduled_date + 'T00:00:00'),
                          )}
                        </Text>
                        <Chip
                          compact
                          style={[styles.badge, { backgroundColor: badge.color }]}
                          textStyle={{ color: badge.textColor, fontSize: 11 }}
                        >
                          {badge.label}
                        </Chip>
                      </View>
                      <Text variant="titleSmall" style={styles.workoutTitle}>
                        {item.workoutTitle}
                      </Text>
                      <View style={styles.chipRow}>
                        <Chip compact style={styles.chip} textStyle={styles.chipText}>
                          {WORKOUT_TYPES[item.workoutType as keyof typeof WORKOUT_TYPES] || item.workoutType}
                        </Chip>
                        {item.totalDistance ? (
                          <Chip compact icon="ruler" style={styles.chip} textStyle={styles.chipText}>
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
              })
            )}
          </Card.Content>
        </Card>

        {stats.total > 0 && (
          <Button
            mode="outlined"
            icon="history"
            onPress={() => navigation.navigate('SwimmerHistory')}
            style={styles.historyBtn}
          >
            Voir mon historique
          </Button>
        )}

        {!clubId && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Rejoindre un club</Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                Demandez le code d'invitation a votre coach.
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.logoutButton}
          textColor="#EF4444"
        >
          Se deconnecter
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
  },
  avatar: {
    backgroundColor: '#EC4899',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    marginTop: 8,
    color: '#6B7280',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsChip: {
    backgroundColor: '#EDE9FE',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#EC4899',
    fontWeight: 'bold',
  },
  loader: {
    paddingVertical: 24,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
  },
  workoutCard: {
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: '#6B7280',
    fontWeight: '600',
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
    backgroundColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 11,
  },
  feedbackBtn: {
    marginTop: 12,
  },
  historyBtn: {
    borderColor: '#D1D5DB',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
