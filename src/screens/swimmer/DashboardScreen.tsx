import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
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
import type { SwimmerHistoryEntry } from '../../services';
import { WorkoutAssignment, WorkoutSession, Club } from '../../types';
import { toISODate, formatShortDate } from '../../utils/dateHelpers';

interface UpcomingWorkout {
  assignment: WorkoutAssignment;
  workoutTitle: string;
  workoutType: string;
  totalDistance: number | null;
  slotName: string;
  session: WorkoutSession | null;
}

interface Achievements {
  totalKm: number;
  totalSessions: number;
  currentStreak: number;
}

interface Props {
  navigation: any;
}

function computeAchievements(history: SwimmerHistoryEntry[]): Achievements {
  const attended = history
    .filter((h) => h.attended)
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  const totalKm = attended.reduce((sum, h) => sum + (h.totalDistance || 0), 0) / 1000;
  const totalSessions = attended.length;

  // Compute current streak: consecutive attended sessions (by date, most recent first)
  let currentStreak = 0;
  const seenDates = new Set<string>();
  for (const session of attended) {
    if (!seenDates.has(session.scheduledDate)) {
      seenDates.add(session.scheduledDate);
      currentStreak++;
    }
  }

  // Actually compute streak by checking gaps - a gap > 10 days breaks the streak
  currentStreak = 0;
  const sortedDates = [...seenDates].sort().reverse();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
      continue;
    }
    const current = new Date(sortedDates[i - 1] + 'T00:00:00');
    const prev = new Date(sortedDates[i] + 'T00:00:00');
    const diffDays = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 10) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { totalKm, totalSessions, currentStreak };
}

export default function SwimmerDashboardScreen({ navigation }: Props) {
  const { profile, user, clubId } = useAuthStore();
  const [upcoming, setUpcoming] = useState<UpcomingWorkout[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState({ total: 0, attended: 0, averageRpe: null as number | null });
  const [achievements, setAchievements] = useState<Achievements>({ totalKm: 0, totalSessions: 0, currentStreak: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track if we've auto-prompted this focus cycle
  const hasAutoPrompted = useRef(false);

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

      // Load history for achievements
      const history = await workoutSessionService.getSwimmerHistory(user.id);
      setAchievements(computeAchievements(history));

      // Load pending feedback sessions
      const pending = await workoutSessionService.getPendingFeedback(user.id);
      setPendingCount(pending.length);

      // Auto-prompt feedback for the oldest pending session
      if (pending.length > 0 && !hasAutoPrompted.current) {
        hasAutoPrompted.current = true;
        // Small delay so the dashboard renders first
        setTimeout(() => {
          navigation.navigate('Feedback', {
            sessionId: pending[0].sessionId,
            workoutTitle: pending[0].workoutTitle,
          });
        }, 600);
      }

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
          workoutType = workout.type || 'other';
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
    hasAutoPrompted.current = false;
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
      return { label: 'Non marque', color: 'rgba(255, 255, 255, 0.45)', textColor: 'rgba(27,67,50,0.50)' };
    }
    return { label: 'A venir', color: '#DBEAFE', textColor: '#1E40AF' };
  };

  return (
    <GradientScreen>
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

        {/* Pending feedback banner */}
        {pendingCount > 0 && (
          <Card style={styles.pendingCard}>
            <Card.Content style={styles.pendingContent}>
              <View style={styles.pendingLeft}>
                <IconButton
                  icon="message-alert"
                  iconColor="#92400E"
                  size={24}
                  style={styles.pendingIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.pendingTitle}>
                    {pendingCount} feedback{pendingCount > 1 ? 's' : ''} en attente
                  </Text>
                  <Text variant="bodySmall" style={styles.pendingSubtitle}>
                    Donne ton ressenti sur tes dernieres seances
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Achievements card */}
        {achievements.totalSessions > 0 && (
          <Card style={styles.achievementsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.achievementsTitle}>
                Mes accomplissements
              </Text>
              <View style={styles.achievementsRow}>
                <View style={styles.achievementItem}>
                  <Text variant="headlineMedium" style={styles.achievementValue}>
                    {achievements.totalKm >= 10
                      ? Math.round(achievements.totalKm)
                      : achievements.totalKm.toFixed(1)}
                  </Text>
                  <Text variant="bodySmall" style={styles.achievementLabel}>
                    km nages
                  </Text>
                </View>
                <View style={styles.achievementDivider} />
                <View style={styles.achievementItem}>
                  <Text variant="headlineMedium" style={styles.achievementValue}>
                    {achievements.currentStreak}
                  </Text>
                  <Text variant="bodySmall" style={styles.achievementLabel}>
                    seances d'affilee
                  </Text>
                </View>
                <View style={styles.achievementDivider} />
                <View style={styles.achievementItem}>
                  <Text variant="headlineMedium" style={styles.achievementValue}>
                    {achievements.totalSessions}
                  </Text>
                  <Text variant="bodySmall" style={styles.achievementLabel}>
                    seances total
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Stats card */}
        <Card style={styles.card} onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}>
          <Card.Content>
            <View style={styles.statsHeader}>
              <Text variant="titleMedium" style={{ color: '#1B4332' }}>Mes statistiques</Text>
              <Chip compact icon="chart-line" style={styles.statsChip}>
                Voir plus
              </Chip>
            </View>
            {stats.total > 0 ? (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {stats.attended}
                  </Text>
                  <Text variant="bodySmall" style={{ color: 'rgba(27,67,50,0.50)' }}>Presences</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {Math.round((stats.attended / stats.total) * 100)}%
                  </Text>
                  <Text variant="bodySmall" style={{ color: 'rgba(27,67,50,0.50)' }}>Assiduite</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="headlineLarge" style={styles.statValue}>
                    {stats.averageRpe ? stats.averageRpe.toFixed(1) : '-'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: 'rgba(27,67,50,0.50)' }}>RPE moy.</Text>
                </View>
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Pas encore de donnees. Vos stats apparaitront apres vos premieres seances.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Upcoming workouts */}
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
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    color: '#1B4332',
  },
  subtitle: {
    color: 'rgba(27,67,50,0.50)',
  },
  avatar: {
    backgroundColor: '#DB2777',
  },
  // Pending feedback banner
  pendingCard: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  pendingContent: {
    paddingVertical: 8,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingIcon: {
    margin: 0,
    marginRight: 4,
  },
  pendingTitle: {
    fontWeight: 'bold',
    color: '#92400E',
  },
  pendingSubtitle: {
    color: '#92400E',
    opacity: 0.8,
  },
  // Achievements
  achievementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  achievementsTitle: {
    fontWeight: 'bold',
    color: '#0E7490',
    marginBottom: 12,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  achievementItem: {
    flex: 1,
    alignItems: 'center',
  },
  achievementValue: {
    fontWeight: 'bold',
    color: '#06B6D4',
  },
  achievementLabel: {
    color: 'rgba(27,67,50,0.50)',
    textAlign: 'center',
    marginTop: 2,
  },
  achievementDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  // Stats card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#1B4332',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    color: '#DB2777',
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
    color: 'rgba(27,67,50,0.50)',
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: 'rgba(27,67,50,0.50)',
    fontWeight: '600',
  },
  badge: {
    height: 26,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1B4332',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  chipText: {
    fontSize: 11,
  },
  feedbackBtn: {
    marginTop: 12,
  },
  historyBtn: {
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
});
