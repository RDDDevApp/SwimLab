import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Dimensions } from 'react-native';
import { Text, Avatar, ActivityIndicator, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import HeroCard from '../../components/HeroCard';
import QuickActionCard from '../../components/QuickActionCard';
import WeeklyBarChart from '../../components/WeeklyBarChart';
import GlassCard from '../../components/GlassCard';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { HERO_GRADIENTS } from '../../config/gradients';
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

/* ─── Solo Dashboard Content ─── */
function SoloDashboardContent({ navigation, profile }: { navigation: any; profile: any }) {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.brandPill}>
            <Ionicons name="water-outline" size={14} color="#0D9488" />
            <Text style={[styles.brandText, { color: '#0D9488' }]}>SwimMaster</Text>
          </View>
          <Text style={styles.greeting}>Bonjour, {profile?.first_name}</Text>
          <Text style={styles.subtitle}>
            Pret a nager ? Ton objectif hebdomadaire est atteint a 65%.
          </Text>
        </View>
        <Avatar.Text
          size={48}
          label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
          style={styles.avatar}
        />
      </View>

      {/* Hero Card - AI Recommendation */}
      <HeroCard
        gradientColors={HERO_GRADIENTS.solo.colors}
        badge={{ icon: 'sparkles-outline', text: 'Suggestion IA' }}
        title="Seance Pyramide - 2000m"
        subtitle="Base sur ta derniere seance de vitesse, voici un programme adapte."
        stats={[
          { label: 'Duree estimee', value: '55 min' },
          { label: 'Calories', value: '~650 kcal' },
        ]}
        primaryAction={{ label: 'Demarrer la seance', icon: 'play-outline', onPress: () => {} }}
        secondaryAction={{ label: 'Personnaliser', icon: 'settings-outline', onPress: () => {} }}
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Nouvelle Seance"
          subtitle="Creer un workout"
          icon="timer-outline"
          iconColor="#0D9488"
          onPress={() => {}}
          delay={500}
        />
        <QuickActionCard
          title="Programmes"
          subtitle="Plans d'entrainement"
          icon="map-outline"
          iconColor="#6366F1"
          onPress={() => {}}
          delay={600}
        />
        <QuickActionCard
          title="Statistiques"
          subtitle="Mes performances"
          icon="pulse-outline"
          iconColor="#06B6D4"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}
          delay={700}
        />
        <QuickActionCard
          title="Defis"
          subtitle="Challenges actifs"
          icon="flame-outline"
          iconColor="#F97316"
          onPress={() => {}}
          delay={800}
        />
      </View>

      {/* Weekly Bar Chart */}
      <WeeklyBarChart
        data={[0, 45, 0, 60, 0, 80, 0]}
        activeColor="#0D9488"
        title="Ma Semaine"
        label="Total : 8.2 km (Objectif: 12 km)"
      />

      {/* Records Card */}
      <GlassCard elevated>
        <Text style={styles.sectionTitle}>Mes Records</Text>

        <View style={styles.recordItem}>
          <View style={[styles.recordIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recordEvent}>100m Libre</Text>
            <Text style={styles.recordDate}>28 Oct 2025</Text>
          </View>
          <Text style={styles.recordTime}>58.4s</Text>
        </View>

        <View style={styles.recordItem}>
          <View style={[styles.recordIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="medal-outline" size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recordEvent}>400m Libre</Text>
            <Text style={styles.recordDate}>15 Sep 2025</Text>
          </View>
          <Text style={styles.recordTime}>4:42.0</Text>
        </View>

        {/* AI Tip */}
        <View style={styles.aiTip}>
          <Ionicons name="sparkles-outline" size={16} color="#6366F1" />
          <Text style={styles.aiTipText}>
            Ton 100m progresse de 2.3% ce mois-ci. Continue comme ca !
          </Text>
        </View>

        <Pressable style={styles.seeAllButton} onPress={() => {}}>
          <Text style={styles.seeAllText}>Voir tous mes temps</Text>
          <Ionicons name="chevron-forward-outline" size={16} color="#0D9488" />
        </Pressable>
      </GlassCard>
    </>
  );
}

/* ─── Club Swimmer Dashboard Content ─── */
function ClubDashboardContent({
  navigation,
  profile,
  club,
  upcoming,
  loading,
  achievements,
  stats,
  pendingCount,
}: {
  navigation: any;
  profile: any;
  club: Club | null;
  upcoming: UpcomingWorkout[];
  loading: boolean;
  achievements: Achievements;
  stats: { total: number; attended: number; averageRpe: number | null };
  pendingCount: number;
}) {
  const nextWorkout = upcoming[0] || null;

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.brandPill}>
            <Ionicons name="water-outline" size={14} color="#06B6D4" />
            <Text style={[styles.brandText, { color: '#06B6D4' }]}>SwimMaster Athlete</Text>
          </View>
          <Text style={styles.greeting}>Salut, {profile?.first_name} !</Text>
          <Text style={styles.subtitle}>
            {nextWorkout ? 'Pret a battre ton record ?' : `Nageur${club ? ` - ${club.name}` : ''}`}
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
        <GlassCard style={styles.pendingCard}>
          <View style={styles.pendingRow}>
            <IconButton
              icon="message-alert"
              iconColor="#92400E"
              size={24}
              style={{ margin: 0, marginRight: 4 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>
                {pendingCount} feedback{pendingCount > 1 ? 's' : ''} en attente
              </Text>
              <Text style={styles.pendingSubtitle}>
                Donne ton ressenti sur tes dernieres seances
              </Text>
            </View>
          </View>
        </GlassCard>
      )}

      {/* Hero Card - Next Workout */}
      {loading ? (
        <ActivityIndicator style={{ paddingVertical: 40 }} />
      ) : nextWorkout ? (
        <HeroCard
          gradientColors={HERO_GRADIENTS.swimmer.colors}
          badge={{
            icon: 'time-outline',
            text: formatShortDate(new Date(nextWorkout.assignment.scheduled_date + 'T00:00:00')),
          }}
          title={nextWorkout.workoutTitle}
          subtitle={nextWorkout.slotName || 'Prochain entrainement'}
          stats={[
            ...(nextWorkout.totalDistance
              ? [{ label: 'Volume', value: `${nextWorkout.totalDistance}m` }]
              : []),
            { label: 'Type', value: nextWorkout.workoutType || 'General' },
          ]}
          primaryAction={{
            label: 'Voir le programme',
            icon: 'reader-outline',
            onPress: () =>
              navigation.navigate('WorkoutDetail', {
                workoutId: nextWorkout.assignment.workout_id,
                workoutTitle: nextWorkout.workoutTitle,
              }),
          }}
          secondaryAction={{ label: 'Je serai present(e)', icon: 'checkmark-outline', onPress: () => {} }}
        />
      ) : (
        <HeroCard
          gradientColors={HERO_GRADIENTS.swimmer.colors}
          badge={{ icon: 'calendar-outline', text: 'Planning' }}
          title="Pas d'entrainement prevu"
          subtitle="Aucune seance programmee pour les prochains jours."
          primaryAction={{
            label: 'Voir le planning',
            icon: 'calendar-outline',
            onPress: () => navigation.navigate('SwimmerTabs', { screen: 'Calendar' }),
          }}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Mes Performances"
          subtitle="Stats detaillees"
          icon="trending-up-outline"
          iconColor="#10B981"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}
          delay={500}
        />
        <QuickActionCard
          title="Objectifs"
          subtitle="Mes cibles"
          icon="flag-outline"
          iconColor="#F43F5E"
          onPress={() => {}}
          delay={600}
        />
        <QuickActionCard
          title="Planning"
          subtitle="Mon calendrier"
          icon="calendar-outline"
          iconColor="#3B82F6"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Calendar' })}
          delay={700}
        />
        <QuickActionCard
          title="Mes Records"
          subtitle="Meilleurs temps"
          icon="medal-outline"
          iconColor="#F59E0B"
          onPress={() => {}}
          delay={800}
        />
      </View>

      {/* Weekly Bar Chart */}
      <WeeklyBarChart
        data={[40, 70, 0, 85, 60, 90, 30]}
        activeColor="#06B6D4"
        title="Ma Semaine"
        label={`Volume total : ${achievements.totalKm >= 10 ? Math.round(achievements.totalKm) : achievements.totalKm.toFixed(1)} km`}
      />

      {/* Derniers Retours */}
      <GlassCard elevated>
        <Text style={styles.sectionTitle}>Derniers Retours</Text>

        <View style={styles.feedbackItem}>
          <View style={[styles.feedbackAvatar, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <Text style={{ fontWeight: '700', color: '#06B6D4', fontSize: 14 }}>CM</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedbackName}>Coach Martin</Text>
            <Text style={styles.feedbackComment}>Excellente seance, bonne technique !</Text>
          </View>
        </View>

        <View style={styles.feedbackItem}>
          <View style={[styles.feedbackAvatar, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedbackName}>Nouveau Record !</Text>
            <Text style={styles.feedbackComment}>100m Libre - 58.4s (+2.1%)</Text>
          </View>
        </View>

        <Pressable style={styles.seeAllButton} onPress={() => {}}>
          <Text style={[styles.seeAllText, { color: '#4F46E5' }]}>Voir tout l'historique</Text>
          <Ionicons name="chevron-forward-outline" size={16} color="#4F46E5" />
        </Pressable>
      </GlassCard>

      {/* History button */}
      {stats.total > 0 && (
        <Pressable
          style={styles.historyButton}
          onPress={() => navigation.navigate('SwimmerHistory')}
        >
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text style={styles.historyButtonText}>Voir mon historique complet</Text>
          <Ionicons name="chevron-forward-outline" size={16} color="#94a3b8" />
        </Pressable>
      )}
    </>
  );
}

/* ─── Main Component ─── */
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

      // Load upcoming workouts (only for club swimmers)
      if (clubId) {
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
      }
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

  const isSolo = !clubId;

  return (
    <GradientScreen>
      <AnimatedBackground variant={isSolo ? 'teal' : 'cyan'} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isSolo ? (
          <SoloDashboardContent navigation={navigation} profile={profile} />
        ) : (
          <ClubDashboardContent
            navigation={navigation}
            profile={profile}
            club={club}
            upcoming={upcoming}
            loading={loading}
            achievements={achievements}
            stats={stats}
            pendingCount={pendingCount}
          />
        )}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  avatar: {
    backgroundColor: '#ec4899',
  },
  // Pending feedback
  pendingCard: {
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingTitle: {
    fontWeight: '700',
    color: '#92400E',
    fontSize: 14,
  },
  pendingSubtitle: {
    color: '#92400E',
    opacity: 0.8,
    fontSize: 12,
  },
  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  // Feedback items
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  feedbackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  feedbackComment: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  // Records
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  recordDate: {
    fontSize: 12,
    color: '#64748b',
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  // AI tip
  aiTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  aiTipText: {
    flex: 1,
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  // See all button
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  // History
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.50)',
  },
  historyButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});
