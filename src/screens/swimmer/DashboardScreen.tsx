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

interface WeekChart {
  data: number[];
  totalKm: number;
}

/** Distances nagees par jour (lun-dim) de la semaine courante, en % du max pour le chart */
function computeWeekChart(history: SwimmerHistoryEntry[]): WeekChart {
  const now = new Date();
  const monday = new Date(now);
  const dayIdx = (now.getDay() + 6) % 7; // lundi = 0
  monday.setDate(now.getDate() - dayIdx);
  monday.setHours(0, 0, 0, 0);

  const distances = [0, 0, 0, 0, 0, 0, 0];
  for (const entry of history) {
    if (!entry.attended || !entry.totalDistance) continue;
    const d = new Date(entry.scheduledDate + 'T00:00:00');
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      distances[diff] += entry.totalDistance;
    }
  }

  const max = Math.max(...distances);
  const totalKm = distances.reduce((a, b) => a + b, 0) / 1000;
  return {
    data: max > 0 ? distances.map((d) => Math.round((d / max) * 100)) : distances,
    totalKm,
  };
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
            <Text style={[styles.brandText, { color: '#0D9488' }]}>SwimLab</Text>
          </View>
          <Text style={styles.greeting}>Bonjour, {profile?.first_name}</Text>
          <Text style={styles.subtitle}>Rejoins un club pour acceder aux entrainements.</Text>
        </View>
        <Avatar.Text
          size={48}
          label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
          style={styles.avatar}
        />
      </View>

      {/* Join club card */}
      <HeroCard
        gradientColors={HERO_GRADIENTS.solo.colors}
        badge={{ icon: 'people-outline', text: 'Mon Club' }}
        title="Rejoins ton club"
        subtitle="Entre le code d'invitation fourni par ton coach pour acceder a ton planning et tes seances."
        primaryAction={{
          label: 'Entrer un code',
          icon: 'key-outline',
          onPress: () => navigation.navigate('JoinClub'),
        }}
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Statistiques"
          subtitle="Mes performances"
          icon="pulse-outline"
          iconColor="#0891B2"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}
          delay={500}
        />
        <QuickActionCard
          title="Mon Profil"
          subtitle="Infos et reglages"
          icon="person-outline"
          iconColor="#6366F1"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Profile' })}
          delay={600}
        />
      </View>

      {/* Solo mode teaser */}
      <GlassCard>
        <View style={styles.soloTeaserRow}>
          <Ionicons name="rocket-outline" size={20} color="#0D9488" />
          <Text style={styles.soloTeaserTitle}>Mode solo — bientot disponible</Text>
        </View>
        <Text style={styles.soloTeaserText}>
          Creation de seances personnelles, suggestions adaptees et suivi independant arrivent
          prochainement. En attendant, rejoins un club avec un code d'invitation.
        </Text>
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
  weekChart,
}: {
  navigation: any;
  profile: any;
  club: Club | null;
  upcoming: UpcomingWorkout[];
  loading: boolean;
  achievements: Achievements;
  stats: { total: number; attended: number; averageRpe: number | null };
  pendingCount: number;
  weekChart: WeekChart;
}) {
  const nextWorkout = upcoming[0] || null;

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.brandPill}>
            <Ionicons name="water-outline" size={14} color="#0891B2" />
            <Text style={[styles.brandText, { color: '#0891B2' }]}>SwimLab</Text>
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
          title="Planning"
          subtitle="Mon calendrier"
          icon="calendar-outline"
          iconColor="#3B82F6"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Calendar' })}
          delay={600}
        />
        <QuickActionCard
          title="Historique"
          subtitle="Seances passees"
          icon="time-outline"
          iconColor="#F59E0B"
          onPress={() => navigation.navigate('SwimmerHistory')}
          delay={700}
        />
        <QuickActionCard
          title="Mon Profil"
          subtitle="Club et reglages"
          icon="person-outline"
          iconColor="#F43F5E"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Profile' })}
          delay={800}
        />
      </View>

      {/* Weekly Bar Chart - vraies distances de la semaine */}
      <WeeklyBarChart
        data={weekChart.data}
        activeColor="#0891B2"
        title="Ma Semaine"
        label={`Volume cette semaine : ${weekChart.totalKm >= 10 ? Math.round(weekChart.totalKm) : weekChart.totalKm.toFixed(1)} km`}
      />

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
  const [weekChart, setWeekChart] = useState<WeekChart>({ data: [0, 0, 0, 0, 0, 0, 0], totalKm: 0 });
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

      // Load history for achievements + weekly chart
      const history = await workoutSessionService.getSwimmerHistory(user.id);
      setAchievements(computeAchievements(history));
      setWeekChart(computeWeekChart(history));

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
            weekChart={weekChart}
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
  // Solo teaser
  soloTeaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  soloTeaserTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  soloTeaserText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
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
