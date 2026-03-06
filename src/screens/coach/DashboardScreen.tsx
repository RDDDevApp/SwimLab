import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import HeroCard from '../../components/HeroCard';
import QuickActionCard from '../../components/QuickActionCard';
import GlassCard from '../../components/GlassCard';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { HERO_GRADIENTS } from '../../config/gradients';
import {
  groupService,
  workoutService,
  clubService,
  workoutAssignmentService,
  trainingSlotService,
} from '../../services';
import { Club } from '../../types';
import { toISODate } from '../../utils/dateHelpers';

interface NextSession {
  title: string;
  date: string;
  groupName: string;
}

export default function CoachDashboardScreen({ navigation }: { navigation: any }) {
  const { profile, user, clubId } = useAuthStore();
  const [groupCount, setGroupCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [club, setClub] = useState<Club | null>(null);
  const [nextSession, setNextSession] = useState<NextSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user || !clubId) return;
    setLoading(true);
    try {
      const [groups, workouts, clubData] = await Promise.all([
        groupService.getByCoach(user.id),
        workoutService.getByCoach(user.id),
        clubService.getById(clubId),
      ]);
      setGroupCount(groups.length);
      setWorkoutCount(workouts.length);
      setClub(clubData);

      // Count unique swimmers across all groups
      const swimmerIds = new Set<string>();
      for (const group of groups) {
        try {
          const members = await groupService.getMembers(group.id);
          members.forEach((m) => swimmerIds.add(m.id));
        } catch {}
      }
      setSwimmerCount(swimmerIds.size);

      // Load next session
      try {
        if (groups.length > 0) {
          const allSlots = [];
          for (const group of groups) {
            const slots = await trainingSlotService.getByGroup(group.id);
            for (const slot of slots) {
              allSlots.push({ ...slot, groupName: group.name });
            }
          }

          if (allSlots.length > 0) {
            const today = toISODate(new Date());
            const nextWeek = toISODate(new Date(Date.now() + 7 * 86400000));
            const slotIds = allSlots.map((s) => s.id);
            const assignments = await workoutAssignmentService.getByDateRange(slotIds, today, nextWeek);

            if (assignments.length > 0) {
              const assignment = assignments[0];
              const slot = allSlots.find((s) => s.id === assignment.training_slot_id);
              let title = 'Seance';
              try {
                const workout = await workoutService.getById(assignment.workout_id);
                title = workout.title;
              } catch {}
              setNextSession({
                title,
                date: assignment.scheduled_date,
                groupName: slot?.groupName || '',
              });
            }
          }
        }
      } catch {}
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  return (
    <GradientScreen>
      <AnimatedBackground variant="cyan" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandPill}>
              <Ionicons name="water-outline" size={14} color="#06B6D4" />
              <Text style={styles.brandText}>SwimMaster Pro</Text>
            </View>
            <Text style={styles.greeting}>Bonjour, {profile?.first_name}</Text>
            <Text style={styles.subtitle}>
              {nextSession ? 'Vos nageurs vous attendent' : 'Gerez vos groupes et seances'}
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
            style={styles.avatar}
          />
        </View>

        {/* Hero Card - Next Session */}
        {loading ? (
          <ActivityIndicator style={{ paddingVertical: 40 }} />
        ) : nextSession ? (
          <HeroCard
            gradientColors={HERO_GRADIENTS.coach.colors}
            badge={{ icon: 'ellipse', text: 'Prochaine Seance' }}
            title={nextSession.title}
            subtitle={`${nextSession.date} · ${nextSession.groupName}`}
            primaryAction={{ label: 'Lancer la seance', icon: 'play-outline', onPress: () => {} }}
          />
        ) : (
          <HeroCard
            gradientColors={HERO_GRADIENTS.coach.colors}
            badge={{ icon: 'calendar-outline', text: 'Planning' }}
            title="Aucune seance planifiee"
            subtitle="Planifiez votre prochaine seance d'entrainement."
            primaryAction={{ label: 'Creer une seance', icon: 'add-outline', onPress: () => {} }}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            title="Analyses"
            subtitle="Stats detaillees"
            icon="pulse-outline"
            iconColor="#06B6D4"
            onPress={() => navigation.navigate('CoachStats')}
            delay={500}
          />
          <QuickActionCard
            title="Mes Groupes"
            subtitle={`${groupCount} groupe${groupCount > 1 ? 's' : ''}`}
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
            title="Competitions"
            subtitle="Evenements"
            icon="trophy-outline"
            iconColor="#EAB308"
            onPress={() => {}}
            delay={800}
          />
        </View>

        {/* Activite Recente */}
        <GlassCard elevated>
          <Text style={styles.sectionTitle}>Activite Recente</Text>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityName}>Seance Vitesse validee</Text>
              <Text style={styles.activityDetail}>Groupe Jeunes</Text>
            </View>
            <Text style={styles.activityTime}>Il y a 2h</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.activityNameRow}>
                <Text style={styles.activityName}>Mise a jour des performances</Text>
                <View style={styles.recordBadge}>
                  <Text style={styles.recordBadgeText}>Record</Text>
                </View>
              </View>
              <Text style={styles.activityDetail}>Lucas M.</Text>
            </View>
            <Text style={styles.activityTime}>Il y a 4h</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityName}>Absence signalee</Text>
              <Text style={styles.activityDetail}>Sarah L.</Text>
            </View>
            <Text style={styles.activityTime}>Il y a 5h</Text>
          </View>

          <Pressable style={styles.seeAllButton} onPress={() => {}}>
            <Text style={styles.seeAllText}>Voir tout</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#2563EB" />
          </Pressable>
        </GlassCard>

        {/* Defis du Mois */}
        <LinearGradient
          colors={HERO_GRADIENTS.challenge.colors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.challengeCard}
        >
          <View style={styles.challengeBlob} />
          <Text style={styles.challengeTitle}>Defis du Mois</Text>

          {/* Progress bars */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Objectif Distance</Text>
              <Text style={styles.progressValue}>85%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '85%', backgroundColor: '#fff' }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Presence Groupe Elite</Text>
              <Text style={styles.progressValue}>92%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '92%', backgroundColor: '#34D399' }]} />
            </View>
          </View>

          <Pressable style={styles.challengeButton} onPress={() => {}}>
            <Text style={styles.challengeButtonText}>Voir le classement</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#fff" />
          </Pressable>
        </LinearGradient>

        {/* Club info card (moved to bottom) */}
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
            {club.description ? (
              <Text style={styles.clubDesc}>{club.description}</Text>
            ) : null}
          </GlassCard>
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
    color: '#06B6D4',
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
  // Activity items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  recordBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recordBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  // See all
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
    color: '#2563EB',
  },
  // Challenge card
  challengeCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  challengeBlob: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    marginTop: 4,
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
