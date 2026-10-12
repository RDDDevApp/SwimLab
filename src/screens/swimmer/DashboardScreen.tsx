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
import XPBar from '../../components/XPBar';
import StreakFlame from '../../components/StreakFlame';
import RPESlider from '../../components/RPESlider';
import {
  useSwimmerDashboard,
  useRefreshOnFocus,
  useGamification,
  useSoloDashboard,
  usePlanSoloSession,
  useCompleteSoloSession,
  useDeleteSoloSession,
} from '../../hooks';
import type { SwimmerUpcomingWorkout } from '../../hooks';
import type { GamificationStats } from '../../services/gamificationService';
import type { SwimmerHistoryEntry } from '../../services';
import { presenceService, SessionPresence } from '../../services/presenceService';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { Club } from '../../types';
import { formatShortDate, toISODate } from '../../utils/dateHelpers';

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
function SoloDashboardContent({
  navigation,
  profile,
  user,
  gamification,
}: {
  navigation: any;
  profile: any;
  user: any;
  gamification: GamificationStats;
}) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const { data } = useSoloDashboard(user?.id);
  const planMutation = usePlanSoloSession(user?.id);
  const completeMutation = useCompleteSoloSession();
  const deleteMutation = useDeleteSoloSession();

  // Dialog planification (chips de dates rapides)
  const [planTarget, setPlanTarget] = useState<string | null>(null); // workoutId
  // Dialog completion (RPE + commentaire)
  const [completeTarget, setCompleteTarget] = useState<string | null>(null); // sessionId
  const [rpe, setRpe] = useState(13);
  const [comment, setComment] = useState('');

  const workouts = data?.workouts ?? [];
  const upcoming = data?.upcoming ?? [];
  const nextSession = upcoming[0] || null;

  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return {
      iso: toISODate(d),
      label: i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : formatShortDate(d),
    };
  });

  const handlePlan = async (date: string) => {
    if (!planTarget) return;
    try {
      await planMutation.mutateAsync({ workoutId: planTarget, date });
      showSnackbar('Seance planifiee !', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur', 'error');
    } finally {
      setPlanTarget(null);
    }
  };

  const handleComplete = async () => {
    if (!completeTarget) return;
    try {
      await completeMutation.mutateAsync({
        sessionId: completeTarget,
        rpe,
        comment: comment.trim() || undefined,
      });
      showSnackbar('Bien joue ! Seance validee +70 XP', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur', 'error');
    } finally {
      setCompleteTarget(null);
      setRpe(13);
      setComment('');
    }
  };

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
          <Text style={styles.subtitle}>
            {nextSession
              ? 'Ta prochaine seance t\'attend.'
              : 'Cree ta seance et va nager !'}
          </Text>
        </View>
        <Avatar.Text
          size={48}
          label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
          style={styles.avatar}
        />
      </View>

      {/* Progression solo */}
      {gamification.totalSessions > 0 && (
        <GlassCard>
          <View style={styles.gamifRow}>
            <View style={{ flex: 1 }}>
              <XPBar
                currentXP={gamification.levelInfo.currentXP}
                nextLevelXP={gamification.levelInfo.nextLevelXP}
                level={gamification.levelInfo.level}
              />
            </View>
            <StreakFlame count={gamification.streakWeeks} label="sem." />
          </View>
        </GlassCard>
      )}

      {/* Hero : prochaine seance planifiee ou CTA creation */}
      {nextSession ? (
        <HeroCard
          gradientColors={HERO_GRADIENTS.solo.colors}
          badge={{
            icon: 'time-outline',
            text: formatShortDate(new Date(nextSession.scheduled_date + 'T00:00:00')),
          }}
          title={nextSession.workoutTitle}
          subtitle="Seance personnelle planifiee"
          stats={
            nextSession.totalDistance
              ? [{ label: 'Volume', value: `${nextSession.totalDistance}m` }]
              : undefined
          }
          primaryAction={{
            label: "C'est fait !",
            icon: 'checkmark-outline',
            onPress: () => setCompleteTarget(nextSession.id),
          }}
          secondaryAction={{
            label: 'Voir le programme',
            icon: 'reader-outline',
            onPress: () =>
              navigation.navigate('WorkoutDetail', {
                workoutId: nextSession.workout_id,
                workoutTitle: nextSession.workoutTitle,
              }),
          }}
        />
      ) : (
        <HeroCard
          gradientColors={HERO_GRADIENTS.solo.colors}
          badge={{ icon: 'rocket-outline', text: 'Mode Solo' }}
          title="Cree ta premiere seance"
          subtitle="Construis-la toi-meme ou laisse le coach IA la generer pour toi."
          primaryAction={{
            label: 'Coach IA',
            icon: 'sparkles-outline',
            onPress: () => navigation.navigate('GenerateWorkout'),
          }}
          secondaryAction={{
            label: 'Creer moi-meme',
            icon: 'construct-outline',
            onPress: () => navigation.navigate('CreateWorkout'),
          }}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Nouvelle Seance"
          subtitle="Editeur manuel"
          icon="construct-outline"
          iconColor="#0D9488"
          onPress={() => navigation.navigate('CreateWorkout')}
          delay={500}
        />
        <QuickActionCard
          title="Coach IA"
          subtitle="Generer une seance"
          icon="sparkles-outline"
          iconColor="#7C3AED"
          onPress={() => navigation.navigate('GenerateWorkout')}
          delay={600}
        />
        <QuickActionCard
          title="Statistiques"
          subtitle="Mes performances"
          icon="pulse-outline"
          iconColor="#0891B2"
          onPress={() => navigation.navigate('SwimmerTabs', { screen: 'Stats' })}
          delay={700}
        />
        <QuickActionCard
          title="Historique"
          subtitle="Seances passees"
          icon="time-outline"
          iconColor="#F59E0B"
          onPress={() => navigation.navigate('SwimmerHistory')}
          delay={800}
        />
      </View>

      {/* Seances planifiees */}
      {upcoming.length > 0 && (
        <GlassCard elevated>
          <SectionHeader title="Seances planifiees" />
          {upcoming.map((session) => (
            <View key={session.id} style={styles.soloSessionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.soloSessionTitle} numberOfLines={1}>
                  {session.workoutTitle}
                </Text>
                <Text style={styles.soloSessionDate}>
                  {formatShortDate(new Date(session.scheduled_date + 'T00:00:00'))}
                  {session.totalDistance ? ` · ${session.totalDistance}m` : ''}
                </Text>
              </View>
              <Button
                compact
                mode="contained-tonal"
                onPress={() => setCompleteTarget(session.id)}
              >
                Fait !
              </Button>
              <IconButton
                icon="delete-outline"
                size={18}
                onPress={() => deleteMutation.mutate(session.id)}
                style={{ margin: 0 }}
              />
            </View>
          ))}
        </GlassCard>
      )}

      {/* Mes seances (bibliotheque perso) */}
      <GlassCard elevated>
        <SectionHeader title="Mes seances" />
        {workouts.length === 0 ? (
          <Text style={styles.soloEmptyText}>
            Aucune seance pour l'instant — cree-en une ou genere-la avec le coach IA.
          </Text>
        ) : (
          workouts.map((w) => (
            <View key={w.id} style={styles.soloSessionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.soloSessionTitle} numberOfLines={1}>
                  {w.title}
                </Text>
                {w.total_distance ? (
                  <Text style={styles.soloSessionDate}>{w.total_distance}m</Text>
                ) : null}
              </View>
              <Button compact mode="outlined" onPress={() => setPlanTarget(w.id)}>
                Planifier
              </Button>
              <IconButton
                icon="pencil-outline"
                size={18}
                onPress={() => navigation.navigate('CreateWorkout', { workout: w })}
                style={{ margin: 0 }}
              />
            </View>
          ))
        )}
      </GlassCard>

      {/* Rejoindre un club (discret, en bas) */}
      <Pressable style={styles.historyButton} onPress={() => navigation.navigate('JoinClub')}>
        <Ionicons name="people-outline" size={18} color="#64748b" />
        <Text style={styles.historyButtonText}>J'ai un code club — rejoindre mon club</Text>
        <Ionicons name="chevron-forward-outline" size={16} color="#94a3b8" />
      </Pressable>

      {/* Dialog planification */}
      <Portal>
        <Dialog visible={planTarget !== null} onDismiss={() => setPlanTarget(null)}>
          <Dialog.Title>Planifier la seance</Dialog.Title>
          <Dialog.Content>
            <View style={styles.dateChipsRow}>
              {quickDates.map((d) => (
                <Button
                  key={d.iso}
                  compact
                  mode="outlined"
                  style={styles.dateChip}
                  onPress={() => handlePlan(d.iso)}
                >
                  {d.label}
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlanTarget(null)}>Annuler</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog completion (auto-emargement + feedback) */}
        <Dialog visible={completeTarget !== null} onDismiss={() => setCompleteTarget(null)}>
          <Dialog.Title>Seance terminee !</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.soloSessionDate}>Effort percu (RPE)</Text>
            <RPESlider value={rpe} onChange={setRpe} />
            <TextInput
              label="Commentaire (optionnel)"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              style={{ marginTop: 12 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCompleteTarget(null)}>Annuler</Button>
            <Button mode="contained" onPress={handleComplete} loading={completeMutation.isPending}>
              Valider
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  gamification,
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
  gamification: GamificationStats;
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

      {/* Progression : niveau, XP, streak */}
      {gamification.totalSessions > 0 && (
        <GlassCard>
          <View style={styles.gamifRow}>
            <View style={{ flex: 1 }}>
              <XPBar
                currentXP={gamification.levelInfo.currentXP}
                nextLevelXP={gamification.levelInfo.nextLevelXP}
                level={gamification.levelInfo.level}
              />
            </View>
            <StreakFlame count={gamification.streakWeeks} label="sem." />
          </View>
        </GlassCard>
      )}

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
          subtitle={
            nextWorkout.revealed
              ? nextWorkout.slotName || 'Prochain entraînement'
              : 'Programme dévoilé à la fin de la séance'
          }
          stats={
            nextWorkout.revealed
              ? [
                  ...(nextWorkout.totalDistance
                    ? [{ label: 'Volume', value: `${nextWorkout.totalDistance}m` }]
                    : []),
                  { label: 'Type', value: nextWorkout.workoutType || 'General' },
                ]
              : [{ label: 'Dévoilé à', value: nextWorkout.revealTime }]
          }
          primaryAction={
            nextWorkout.revealed || !presenceAction
              ? {
                  label: 'Voir le programme',
                  icon: 'reader-outline',
                  onPress: () =>
                    navigation.navigate('WorkoutDetail', {
                      workoutId: nextWorkout.assignment.workout_id,
                      workoutTitle: nextWorkout.workoutTitle,
                    }),
                }
              : presenceAction
          }
          secondaryAction={nextWorkout.revealed ? (presenceAction ?? undefined) : undefined}
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
  // Les seances solo comptent aussi dans l'XP (fusionnees dans l'historique)
  const gamification = useGamification(user?.id);

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
          <SoloDashboardContent
            navigation={navigation}
            profile={profile}
            user={user}
            gamification={gamification}
          />
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
            gamification={gamification}
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
  // Gamification
  gamifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  // Solo
  soloSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  soloSessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  soloSessionDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  soloEmptyText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  dateChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    marginBottom: 4,
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
