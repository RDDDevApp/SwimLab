import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, Avatar, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import HeroCard from '../../components/HeroCard';
import QuickActionCard from '../../components/QuickActionCard';
import GlassCard from '../../components/GlassCard';
import SectionHeader from '../../components/SectionHeader';
import ProgressRing from '../../components/ProgressRing';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { useAuthStore } from '../../stores/authStore';
import { useCoachDashboard, useRefreshOnFocus, useRpeAlerts } from '../../hooks';
import { HERO_GRADIENTS } from '../../config/gradients';
import { getRPEColor } from '../../config/theme';
import { formatShortDate } from '../../utils/dateHelpers';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `Il y a ${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function CoachDashboardScreen({ navigation }: { navigation: any }) {
  const { profile, user, clubId } = useAuthStore();
  const { data, isError, isRefetching, refetch } = useCoachDashboard(user?.id, clubId);
  const { data: rpeAlerts = [] } = useRpeAlerts(user?.id);
  useRefreshOnFocus(refetch);

  if (isError && !data) {
    return (
      <GradientScreen>
        <AnimatedBackground variant="cyan" />
        <View style={styles.errorWrap}>
          <GlassCard elevated>
            <View style={styles.errorBody}>
              <Ionicons name="cloud-offline-outline" size={28} color="#B91C1C" />
              <Text style={styles.errorTitle}>Le tableau de bord n'a pas pu se charger</Text>
              <Text style={styles.errorText}>
                Vérifie ta connexion puis réessaie. Si le problème continue, préviens l'équipe SwimLab.
              </Text>
              <Button mode="contained" onPress={() => refetch()} loading={isRefetching}>
                Réessayer
              </Button>
            </View>
          </GlassCard>
        </View>
      </GradientScreen>
    );
  }

  if (!data) {
    return (
      <GradientScreen>
        <AnimatedBackground variant="cyan" />
        <LoadingSkeleton variant="dashboard" />
      </GradientScreen>
    );
  }

  const { nextSession, recentActivity, monthly, pendingFeedbackCount, club } = data;

  return (
    <GradientScreen>
      <AnimatedBackground variant="cyan" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandPill}>
              <Ionicons name="water-outline" size={14} color="#0891B2" />
              <Text style={styles.brandText}>SwimLab</Text>
            </View>
            <Text style={styles.greeting}>Bonjour, {profile?.first_name}</Text>
            <Text style={styles.subtitle}>
              {nextSession ? 'Tes nageurs t\'attendent' : 'Gère tes groupes et tes séances'}
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
            style={styles.avatar}
          />
        </View>

        {/* Hero Card - Next Session */}
        {nextSession ? (
          <HeroCard
            gradientColors={HERO_GRADIENTS.coach.colors}
            badge={{ icon: 'ellipse', text: 'Prochaine séance' }}
            title={nextSession.title}
            subtitle={`${formatShortDate(new Date(nextSession.date + 'T00:00:00'))} · ${nextSession.groupName}`}
            primaryAction={{
              label: 'Lancer la séance',
              icon: 'play-outline',
              onPress: () =>
                navigation.navigate('Attendance', {
                  assignmentId: nextSession.assignmentId,
                  groupId: nextSession.groupId,
                  workoutTitle: nextSession.title,
                }),
            }}
          />
        ) : (
          <HeroCard
            gradientColors={HERO_GRADIENTS.coach.colors}
            badge={{ icon: 'calendar-outline', text: 'Planning' }}
            title="Aucune séance planifiée"
            subtitle="Planifie ta prochaine séance d'entraînement."
            primaryAction={{
              label: 'Créer une séance',
              icon: 'add-outline',
              onPress: () => navigation.navigate('CreateWorkout'),
            }}
          />
        )}

        {/* Alertes surcharge RPE */}
        {rpeAlerts.length > 0 && (
          <GlassCard style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning-outline" size={18} color="#B45309" />
              <Text style={styles.alertTitle}>Charge inhabituelle détectée</Text>
            </View>
            {rpeAlerts.slice(0, 3).map((alert) => (
              <View key={alert.swimmerId} style={styles.alertRow}>
                <Text style={styles.alertName}>{alert.swimmerName}</Text>
                <Chip compact style={styles.alertChip} textStyle={styles.alertChipText}>
                  RPE {alert.avg7d} (+{alert.delta} vs habitude)
                </Chip>
              </View>
            ))}
            <Text style={styles.alertHint}>
              RPE moyen sur 7 jours nettement au-dessus de sa moyenne sur 28 jours : pense à alléger ou à vérifier la récupération.
            </Text>
          </GlassCard>
        )}

        {/* Feedbacks en attente */}
        {pendingFeedbackCount > 0 && (
          <Pressable
            style={styles.pendingBanner}
            onPress={() => navigation.navigate('CoachTabs', { screen: 'Calendar' })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#92400E" />
            <Text style={styles.pendingText}>
              {pendingFeedbackCount} feedback{pendingFeedbackCount > 1 ? 's' : ''} en attente
              ce mois-ci
            </Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#92400E" />
          </Pressable>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            title="Analyses"
            subtitle="Stats détaillées"
            icon="pulse-outline"
            iconColor="#0891B2"
            onPress={() => navigation.navigate('CoachStats')}
            delay={500}
          />
          <QuickActionCard
            title="Mes groupes"
            subtitle={`${data.groupCount} groupe${data.groupCount > 1 ? 's' : ''}`}
            icon="people-outline"
            iconColor="#6366F1"
            onPress={() => navigation.navigate('CoachTabs', { screen: 'Groups' })}
            delay={600}
          />
          <QuickActionCard
            title="Planning"
            subtitle="Mon calendrier"
            icon="calendar-outline"
            iconColor="#EC4899"
            onPress={() => navigation.navigate('CoachTabs', { screen: 'Calendar' })}
            delay={700}
          />
          <QuickActionCard
            title="Bibliothèque"
            subtitle="Blocs réutilisables"
            icon="library-outline"
            iconColor="#EAB308"
            onPress={() => navigation.navigate('BlockLibrary')}
            delay={800}
          />
        </View>

        {/* Activite Recente — vrais derniers feedbacks */}
        {recentActivity.length > 0 && (
          <GlassCard elevated>
            <SectionHeader
              title="Activité récente"
              onAction={() => navigation.navigate('WorkoutHistory')}
            />
            {recentActivity.slice(0, 5).map((entry) => (
              <View key={entry.sessionId} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: 'rgba(8, 145, 178, 0.12)' },
                  ]}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#0891B2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName} numberOfLines={1}>
                    {entry.swimmerName} · {entry.workoutTitle}
                  </Text>
                  {entry.feedbackText ? (
                    <Text style={styles.activityDetail} numberOfLines={1}>
                      "{entry.feedbackText}"
                    </Text>
                  ) : (
                    <Text style={styles.activityDetail}>Feedback envoyé</Text>
                  )}
                </View>
                {entry.rpeScore !== null && (
                  <Chip
                    compact
                    style={[
                      styles.rpeChip,
                      { backgroundColor: getRPEColor(entry.rpeScore) },
                    ]}
                    textStyle={styles.rpeChipText}
                  >
                    {entry.rpeScore}
                  </Chip>
                )}
                <Text style={styles.activityTime}>{timeAgo(entry.completedAt)}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Defis du Mois — calcules en direct sur les vraies donnees */}
        {(monthly.attendancePct !== null || monthly.distancePct !== null) && (
          <GlassCard elevated>
            <SectionHeader title="Défis du mois" />
            <View style={styles.ringsRow}>
              {monthly.attendancePct !== null && (
                <ProgressRing
                  progress={monthly.attendancePct}
                  color="#059669"
                  caption="Assiduité"
                />
              )}
              {monthly.distancePct !== null && (
                <ProgressRing
                  progress={monthly.distancePct}
                  color="#0891B2"
                  caption={`${monthly.distanceSwumKm.toFixed(1)} / ${monthly.distancePlannedKm.toFixed(1)} km`}
                />
              )}
            </View>
          </GlassCard>
        )}

        {/* Club info card */}
        {club && (
          <GlassCard>
            <Text style={styles.clubTitle}>{club.name}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Code nageur :</Text>
              <Chip compact style={styles.codeChip}>
                {club.invitation_code}
              </Chip>
            </View>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Code coach :</Text>
              <Chip compact style={styles.codeChipCoach}>
                {club.invitation_code_coach}
              </Chip>
            </View>
            {club.description ? <Text style={styles.clubDesc}>{club.description}</Text> : null}
          </GlassCard>
        )}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorBody: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
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
    color: '#0891B2',
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
    backgroundColor: '#6366F1',
  },
  // Alerte RPE
  alertCard: {
    backgroundColor: 'rgba(254, 243, 199, 0.75)',
    borderColor: 'rgba(217, 119, 6, 0.30)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  alertChip: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    height: 26,
  },
  alertChipText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  alertHint: {
    fontSize: 11,
    color: '#92400E',
    opacity: 0.8,
    marginTop: 4,
    lineHeight: 15,
  },
  // Pending feedback banner
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pendingText: {
    flex: 1,
    color: '#92400E',
    fontWeight: '700',
    fontSize: 13,
  },
  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Activity items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  rpeChip: {
    height: 24,
  },
  rpeChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  // Challenge rings
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
  },
  // Club card
  clubTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  codeLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  codeChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
  },
  codeChipCoach: {
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  clubDesc: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
});
