import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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
  assignmentId: string;
  groupId: string;
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

      // Nombre de nageurs uniques + creneaux : requetes groupees (anti N+1)
      const groupIds = groups.map((g) => g.id);
      try {
        const memberIds = await groupService.getMemberIdsByGroups(groupIds);
        setSwimmerCount(memberIds.length);
      } catch {}

      // Load next session
      try {
        if (groups.length > 0) {
          const groupNameById = new Map(groups.map((g) => [g.id, g.name]));
          const slots = await trainingSlotService.getByGroups(groupIds);
          const allSlots = slots.map((slot) => ({
            ...slot,
            groupName: groupNameById.get(slot.group_id) || '',
          }));

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
                assignmentId: assignment.id,
                groupId: slot?.group_id || '',
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
              <Ionicons name="water-outline" size={14} color="#0891B2" />
              <Text style={styles.brandText}>SwimLab</Text>
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
            primaryAction={{
              label: 'Lancer la seance',
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
            title="Aucune seance planifiee"
            subtitle="Planifiez votre prochaine seance d'entrainement."
            primaryAction={{
              label: 'Creer une seance',
              icon: 'add-outline',
              onPress: () => navigation.navigate('CreateWorkout'),
            }}
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
            title="Bibliotheque"
            subtitle="Blocs reutilisables"
            icon="library-outline"
            iconColor="#EAB308"
            onPress={() => navigation.navigate('BlockLibrary')}
            delay={800}
          />
        </View>

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
  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
