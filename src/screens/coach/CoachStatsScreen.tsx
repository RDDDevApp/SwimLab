import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/authStore';
import { shadow } from '../../config/tokens';
import {
  groupService,
  workoutService,
  workoutSessionService,
  workoutAssignmentService,
  trainingSlotService,
} from '../../services';

const screenWidth = Dimensions.get('window').width - 48;

const chartConfig = {
  backgroundGradientFrom: 'rgba(255, 255, 255, 0.40)',
  backgroundGradientTo: 'rgba(255, 255, 255, 0.40)',
  decimalCount: 0,
  color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
  labelColor: () => '#64748b',
  barPercentage: 0.6,
  propsForBackgroundLines: {
    stroke: 'rgba(203, 213, 225, 0.50)',
  },
};

const rpeChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
};

interface StatCardData {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCardItem({ stat }: { stat: StatCardData }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardInner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statCardTitle}>{stat.title}</Text>
          <Text style={styles.statCardValue}>{stat.value}</Text>
          {stat.subtitle && (
            <Text style={styles.statCardSubtitle}>{stat.subtitle}</Text>
          )}
          {stat.trend && (
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: stat.trend.isPositive
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(244, 63, 94, 0.15)',
                },
              ]}
            >
              <Text
                style={[
                  styles.trendText,
                  { color: stat.trend.isPositive ? '#059669' : '#e11d48' },
                ]}
              >
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
              </Text>
              <Text
                style={[
                  styles.trendLabel,
                  { color: stat.trend.isPositive ? '#059669' : '#e11d48' },
                ]}
              >
                {' '}vs mois dernier
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statIconWrap}>
          <Ionicons name={stat.icon} size={22} color="#475569" />
        </View>
      </View>
      <View style={[styles.decorativeBlob, { backgroundColor: stat.color }]} />
    </View>
  );
}

interface Props {
  navigation: any;
}

export default function CoachStatsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats data
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [avgRpe, setAvgRpe] = useState<number | null>(null);
  const [attendanceRate, setAttendanceRate] = useState(0);

  // Chart data
  const [weeklyVolume, setWeeklyVolume] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [groupDistribution, setGroupDistribution] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [rpeByWeek, setRpeByWeek] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [groups, workouts] = await Promise.all([
        groupService.getByCoach(user.id),
        workoutService.getByCoach(user.id),
      ]);

      setGroupCount(groups.length);
      setWorkoutCount(workouts.length);

      // Collect swimmers and group distribution
      const swimmerIds = new Set<string>();
      const groupDist: { name: string; count: number }[] = [];
      for (const group of groups) {
        try {
          const members = await groupService.getMembers(group.id);
          members.forEach((m) => swimmerIds.add(m.id));
          groupDist.push({ name: group.name, count: members.length });
        } catch {}
      }
      setSwimmerCount(swimmerIds.size);
      setGroupDistribution({
        labels: groupDist.map((g) => g.name.length > 8 ? g.name.substring(0, 8) + '.' : g.name),
        data: groupDist.map((g) => g.count),
      });

      // Get slots for assignments
      const allSlotIds: string[] = [];
      for (const group of groups) {
        try {
          const slots = await trainingSlotService.getByGroup(group.id);
          slots.forEach((s) => allSlotIds.push(s.id));
        } catch {}
      }

      // Get assignments for recent period (last 12 weeks)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 84); // 12 weeks
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      let assignments: any[] = [];
      if (allSlotIds.length > 0) {
        try {
          assignments = await workoutAssignmentService.getByDateRange(
            allSlotIds,
            startStr,
            endStr,
          );
        } catch {}
      }

      // Get feedback stats and compute metrics
      let totalSessions = 0;
      let attendedSessions = 0;
      let rpeSum = 0;
      let rpeCount = 0;
      let distanceTotal = 0;

      const weeklyVolumeMap: Record<string, number> = {};
      const weeklyRpeMap: Record<string, { sum: number; count: number }> = {};

      for (const assignment of assignments) {
        try {
          const stats = await workoutSessionService.getFeedbackStats(assignment.id);
          totalSessions += stats.total_swimmers;
          attendedSessions += stats.attended_count;
          if (stats.average_rpe !== null) {
            rpeSum += stats.average_rpe * stats.attended_count;
            rpeCount += stats.attended_count;
          }

          // Weekly volume from workout distance
          const weekStart = getWeekStart(assignment.scheduled_date);
          const weekLabel = getWeekLabel(assignment.scheduled_date);
          const dist = assignment.workout_id
            ? (workouts.find((w) => w.id === assignment.workout_id)?.total_distance || 0) * stats.attended_count
            : 0;
          weeklyVolumeMap[weekStart] = (weeklyVolumeMap[weekStart] || 0) + dist;
          distanceTotal += dist;

          // Weekly RPE
          if (stats.average_rpe !== null) {
            if (!weeklyRpeMap[weekStart]) weeklyRpeMap[weekStart] = { sum: 0, count: 0 };
            weeklyRpeMap[weekStart].sum += stats.average_rpe;
            weeklyRpeMap[weekStart].count += 1;
          }
        } catch {}
      }

      setSessionCount(attendedSessions);
      setTotalKm(Math.round(distanceTotal / 1000));
      setAttendanceRate(totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0);
      setAvgRpe(rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null);

      // Build weekly volume chart data
      const sortedWeeks = Object.keys(weeklyVolumeMap).sort();
      setWeeklyVolume({
        labels: sortedWeeks.map(getWeekLabel),
        data: sortedWeeks.map((k) => Math.round(weeklyVolumeMap[k] / 1000)),
      });

      // Build RPE by week chart data
      const sortedRpeWeeks = Object.keys(weeklyRpeMap).sort();
      setRpeByWeek({
        labels: sortedRpeWeeks.map(getWeekLabel),
        data: sortedRpeWeeks.map((k) =>
          Math.round((weeklyRpeMap[k].sum / weeklyRpeMap[k].count) * 10) / 10,
        ),
      });
    } catch (err) {
      console.error('Error loading coach stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const now = new Date();
  const currentMonth = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const mainStats: StatCardData[] = [
    {
      title: 'Nageurs Actifs',
      value: `${swimmerCount}`,
      subtitle: 'Total dans le club',
      icon: 'people-outline',
      color: 'rgba(6, 182, 212, 0.30)',
    },
    {
      title: 'Seances Realisees',
      value: `${sessionCount}`,
      subtitle: 'Ce trimestre',
      icon: 'water-outline',
      color: 'rgba(99, 102, 241, 0.30)',
    },
    {
      title: 'Km Totaux',
      value: `${totalKm.toLocaleString()}`,
      subtitle: 'Distance parcourue',
      icon: 'trending-up-outline',
      color: 'rgba(234, 179, 8, 0.30)',
    },
    {
      title: 'Entrainements',
      value: `${workoutCount}`,
      subtitle: 'Seances creees',
      icon: 'clipboard-outline',
      color: 'rgba(236, 72, 153, 0.30)',
    },
  ];

  const secondaryStats: StatCardData[] = [
    {
      title: 'Km Moyen / Nageur',
      value: swimmerCount > 0 ? `${Math.round(totalKm / swimmerCount)} km` : '0 km',
      icon: 'trophy-outline',
      color: 'rgba(6, 182, 212, 0.30)',
    },
    {
      title: 'RPE Moyen',
      value: avgRpe !== null ? `${avgRpe}/20` : '-',
      subtitle: 'Ressenti des athletes',
      icon: 'pulse-outline',
      color: 'rgba(236, 72, 153, 0.30)',
    },
    {
      title: 'Assiduite',
      value: `${attendanceRate}%`,
      subtitle: 'Presence moyenne',
      icon: 'checkmark-circle-outline',
      color: 'rgba(234, 179, 8, 0.30)',
    },
  ];

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Tableau de Bord</Text>
          <Text style={styles.headerSubtitle}>
            Suivi des performances et statistiques du club
          </Text>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={16} color="#0891b2" />
            <Text style={styles.datePillText}>
              {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ paddingVertical: 60 }} />
        ) : (
          <>
            {/* Main Stats Grid (2x2) */}
            <View style={styles.statsGrid}>
              {mainStats.map((stat, i) => (
                <StatCardItem key={i} stat={stat} />
              ))}
            </View>

            {/* Secondary Stats Row (3 cards) */}
            <View style={styles.secondaryGrid}>
              {secondaryStats.map((stat, i) => (
                <View key={i} style={styles.secondaryCard}>
                  <View style={styles.statCardInner}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statCardTitle}>{stat.title}</Text>
                      <Text style={[styles.statCardValue, { fontSize: 20 }]}>
                        {stat.value}
                      </Text>
                      {stat.subtitle && (
                        <Text style={styles.statCardSubtitle}>
                          {stat.subtitle}
                        </Text>
                      )}
                    </View>
                    <View style={styles.statIconWrap}>
                      <Ionicons name={stat.icon} size={20} color="#475569" />
                    </View>
                  </View>
                  <View
                    style={[styles.decorativeBlob, { backgroundColor: stat.color }]}
                  />
                </View>
              ))}
            </View>

            {/* Volume chart */}
            {weeklyVolume.data.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Volume d'Entrainement (km/semaine)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: weeklyVolume.labels,
                      datasets: [{ data: weeklyVolume.data.length > 0 ? weeklyVolume.data : [0] }],
                    }}
                    width={Math.max(screenWidth, weeklyVolume.labels.length * 60)}
                    height={220}
                    yAxisSuffix=" km"
                    yAxisLabel=""
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero
                  />
                </ScrollView>
              </View>
            )}

            {/* Group distribution */}
            {groupDistribution.data.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Nageurs par Groupe</Text>
                <BarChart
                  data={{
                    labels: groupDistribution.labels,
                    datasets: [{ data: groupDistribution.data.length > 0 ? groupDistribution.data : [0] }],
                  }}
                  width={screenWidth}
                  height={220}
                  yAxisSuffix=""
                  yAxisLabel=""
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  }}
                  style={styles.chart}
                  fromZero
                />
              </View>
            )}

            {/* RPE trend */}
            {rpeByWeek.data.length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>RPE Moyen par Semaine</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: rpeByWeek.labels,
                      datasets: [{ data: rpeByWeek.data }],
                    }}
                    width={Math.max(screenWidth, rpeByWeek.labels.length * 60)}
                    height={220}
                    yAxisSuffix=""
                    yAxisLabel=""
                    chartConfig={rpeChartConfig}
                    style={styles.chart}
                    bezier
                  />
                </ScrollView>
              </View>
            )}

            {/* Insight Card */}
            <LinearGradient
              colors={['#0891b2', '#1d4ed8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.insightCard}
            >
              <View style={styles.insightBlobDecor} />
              <Text style={styles.insightTitle}>Insight du Coach</Text>
              <Text style={styles.insightText}>
                {swimmerCount > 0
                  ? `Votre club compte ${swimmerCount} nageurs repartis en ${groupCount} groupes. `
                  : ''}
                {sessionCount > 0
                  ? `${sessionCount} seances realisees avec une assiduite de ${attendanceRate}%. `
                  : ''}
                {avgRpe !== null
                  ? `Le RPE moyen est de ${avgRpe}/20.`
                  : ''}
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.insightButton}
                labelStyle={styles.insightButtonLabel}
              >
                Retour au tableau de bord
              </Button>
            </LinearGradient>
          </>
        )}
      </ScrollView>
    </GradientScreen>
  );
}

function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function getWeekLabel(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('fr-FR', { month: 'short' });
  return `${day} ${month}`;
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0891b2',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginTop: 10,
  },
  datePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 12) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    ...shadow(0.05, 12, 4, 3),
  },
  statCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  statCardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.7,
  },
  statIconWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  decorativeBlob: {
    position: 'absolute',
    bottom: -16,
    right: -16,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    ...shadow(0.05, 12, 4, 3),
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    ...shadow(0.05, 12, 4, 3),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  insightCard: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    ...shadow(0.3, 16, 8, 6, '8, 145, 178'),
  },
  insightBlobDecor: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(219, 234, 254, 0.90)',
    lineHeight: 22,
    marginBottom: 16,
  },
  insightButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  insightButtonLabel: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
