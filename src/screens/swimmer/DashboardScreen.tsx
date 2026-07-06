import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import {
  Text,
  Avatar,
  ActivityIndicator,
  IconButton,
  Chip,
  Portal,
  Dialog,
  TextInput,
  Button,
} from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import HeroCard from '../../components/HeroCard';
import QuickActionCard from '../../components/QuickActionCard';
import WeeklyBarChart from '../../components/WeeklyBarChart';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useAuthStore } from '../../stores/authStore';
import { HERO_GRADIENTS } from '../../config/gradients';
import { getRPEColor } from '../../config/theme';
import { useSwimmerDashboard, useRefreshOnFocus } from '../../hooks';
import type { SwimmerUpcomingWorkout } from '../../hooks';
import type { SwimmerHistoryEntry } from '../../services';
import { presenceService, SessionPresence } from '../../services/presenceService';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { Club } from '../../types';
import { formatShortDate } from '../../utils/dateHelpers';

type UpcomingWorkout = SwimmerUpcomingWorkout;

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
  lastFeedbacks,
  nextPresence,
  onDeclarePresent,
  onDeclareAbsent,
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
  lastFeedbacks: SwimmerHistoryEntry[];
  nextPresence: SessionPresence | null;
  onDeclarePresent: () => void;
  onDeclareAbsent: () => void;
}) {
  const nextWorkout = upcoming[0] || null;

  // Etat de la declaration de presence pour la prochaine seance
  const presenceAction = nextWorkout
    ? nextPresence?.status === 'absent'
      ? { label: 'Absence signalee — annuler', icon: 'refresh-outline' as const, onPress: onDeclarePresent }
      : nextPresence?.status === 'present'
        ? { label: 'Prevenir une absence', icon: 'close-circle-outline' as const, onPress: onDeclareAbsent }
        : { label: 'Je serai present(e)', icon: 'checkmark-outline' as const, onPress: onDeclarePresent }
    : null;

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
          secondaryAction={presenceAction ?? undefined}
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

      {/* Mes Derniers Retours — vrais feedbacks envoyes */}
      {lastFeedbacks.length > 0 && (
        <GlassCard elevated>
          <SectionHeader
            title="Mes Derniers Retours"
            onAction={() => navigation.navigate('SwimmerHistory')}
          />
          {lastFeedbacks.map((entry) => (
            <View key={entry.sessionId} style={styles.feedbackRow}>
              <Chip
                compact
                style={[
                  styles.feedbackRpeChip,
                  { backgroundColor: getRPEColor(entry.rpeScore || 13) },
                ]}
                textStyle={styles.feedbackRpeText}
              >
                {entry.rpeScore}
              </Chip>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackWorkout} numberOfLines={1}>
                  {entry.workoutTitle}
                </Text>
                {entry.feedbackText ? (
                  <Text style={styles.feedbackNote} numberOfLines={1}>
                    "{entry.feedbackText}"
                  </Text>
                ) : null}
              </View>
              <Text style={styles.feedbackDate}>
                {entry.scheduledDate
                  ? formatShortDate(new Date(entry.scheduledDate + 'T00:00:00'))
                  : ''}
              </Text>
            </View>
          ))}
        </GlassCard>
      )}

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
  const { data, isLoading, isRefetching, refetch } = useSwimmerDashboard(user?.id, clubId);
  useRefreshOnFocus(refetch);
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbarStore((s) => s.show);

  // Declaration de presence pour la prochaine seance
  const [absenceDialogVisible, setAbsenceDialogVisible] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');

  const declarePresence = async (status: 'present' | 'absent', reason?: string) => {
    const assignmentId = data?.upcoming[0]?.assignment.id;
    if (!user || !assignmentId) return;
    try {
      await presenceService.declare(assignmentId, user.id, status, reason);
      showSnackbar(
        status === 'present' ? 'Presence confirmee !' : 'Absence signalee au coach',
        'success',
      );
      queryClient.invalidateQueries({ queryKey: ['swimmer', 'dashboard'] });
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur lors de la declaration', 'error');
    }
  };

  const handleDeclareAbsent = () => {
    setAbsenceReason('');
    setAbsenceDialogVisible(true);
  };

  const confirmAbsence = async () => {
    setAbsenceDialogVisible(false);
    await declarePresence('absent', absenceReason);
  };

  // Auto-prompt feedback pour la plus ancienne session en attente
  const hasAutoPrompted = useRef(false);
  useEffect(() => {
    const pending = data?.pending;
    if (pending && pending.length > 0 && !hasAutoPrompted.current) {
      hasAutoPrompted.current = true;
      const timer = setTimeout(() => {
        navigation.navigate('Feedback', {
          sessionId: pending[0].sessionId,
          workoutTitle: pending[0].workoutTitle,
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data?.pending, navigation]);

  const achievements = useMemo(
    () => computeAchievements(data?.history ?? []),
    [data?.history],
  );
  const weekChart = useMemo(() => computeWeekChart(data?.history ?? []), [data?.history]);
  const lastFeedbacks = useMemo(
    () =>
      (data?.history ?? [])
        .filter((h) => h.attended && h.rpeScore !== null)
        .slice(0, 3),
    [data?.history],
  );

  const isSolo = !clubId;

  if (isLoading && !data) {
    return (
      <GradientScreen>
        <AnimatedBackground variant={isSolo ? 'teal' : 'cyan'} />
        <LoadingSkeleton variant="dashboard" />
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <AnimatedBackground variant={isSolo ? 'teal' : 'cyan'} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isSolo ? (
          <SoloDashboardContent navigation={navigation} profile={profile} />
        ) : (
          <ClubDashboardContent
            navigation={navigation}
            profile={profile}
            club={data?.club ?? null}
            upcoming={data?.upcoming ?? []}
            loading={isLoading}
            achievements={achievements}
            stats={data?.stats ?? { total: 0, attended: 0, averageRpe: null }}
            pendingCount={data?.pending.length ?? 0}
            weekChart={weekChart}
            lastFeedbacks={lastFeedbacks}
            nextPresence={data?.nextPresence ?? null}
            onDeclarePresent={() => declarePresence('present')}
            onDeclareAbsent={handleDeclareAbsent}
          />
        )}
      </ScrollView>

      {/* Dialog raison d'absence */}
      <Portal>
        <Dialog
          visible={absenceDialogVisible}
          onDismiss={() => setAbsenceDialogVisible(false)}
        >
          <Dialog.Title>Prevenir une absence</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Raison (optionnel)"
              placeholder="Ex: malade, examen, deplacement..."
              value={absenceReason}
              onChangeText={setAbsenceReason}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAbsenceDialogVisible(false)}>Annuler</Button>
            <Button mode="contained" onPress={confirmAbsence}>
              Signaler
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  // Derniers retours
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  feedbackRpeChip: {
    height: 26,
  },
  feedbackRpeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  feedbackWorkout: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  feedbackNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  feedbackDate: {
    fontSize: 11,
    color: '#94a3b8',
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
