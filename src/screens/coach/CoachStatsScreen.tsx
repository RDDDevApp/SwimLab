import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/authStore';
import { C, FONTS, RADIUS, SHADOW, SPACING } from '../../config/tokens';
import {
  groupService,
  workoutService,
  workoutSessionService,
  workoutAssignmentService,
  trainingSlotService,
} from '../../services';

const screenWidth = Dimensions.get('window').width - 48;

const chartConfig = {
  backgroundGradientFrom: C.surface,
  backgroundGradientTo: C.surface,
  decimalCount: 0,
  color: (opacity = 1) => `rgba(1, 178, 192, ${opacity})`,
  labelColor: () => C.inkMuted,
  barPercentage: 0.6,
  propsForLabels: {
    fontFamily: FONTS.text,
  },
  propsForBackgroundLines: {
    stroke: C.line,
  },
};

const rpeChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(238, 61, 128, ${opacity})`,
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
                    ? C.successSoft
                    : C.dangerSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.trendText,
                  { color: stat.trend.isPositive ? C.success : C.danger },
                ]}
              >
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
              </Text>
              <Text
                style={[
                  styles.trendLabel,
                  { color: stat.trend.isPositive ? C.success : C.danger },
                ]}
              >
                {' '}vs mois dernier
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statIconWrap}>
          <Ionicons name={stat.icon} size={22} color={C.inkMuted} />
        </View>
      </View>
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
      title: 'Nageurs actifs',
      value: `${swimmerCount}`,
      subtitle: 'Total dans le club',
      icon: 'people-outline',
      color: C.primary,
    },
    {
      title: 'Séances réalisées',
      value: `${sessionCount}`,
      subtitle: 'Ce trimestre',
      icon: 'water-outline',
      color: C.primary,
    },
    {
      title: 'Km totaux',
      value: `${totalKm.toLocaleString()}`,
      subtitle: 'Distance parcourue',
      icon: 'trending-up-outline',
      color: C.warning,
    },
    {
      title: 'Entraînements',
      value: `${workoutCount}`,
      subtitle: 'Séances créées',
      icon: 'clipboard-outline',
      color: C.danger,
    },
  ];

  const secondaryStats: StatCardData[] = [
    {
      title: 'Km moyen / nageur',
      value: swimmerCount > 0 ? `${Math.round(totalKm / swimmerCount)} km` : '0 km',
      icon: 'trophy-outline',
      color: C.primary,
    },
    {
      title: 'RPE moyen',
      value: avgRpe !== null ? `${avgRpe}/20` : '-',
      subtitle: 'Ressenti des athlètes',
      icon: 'pulse-outline',
      color: C.danger,
    },
    {
      title: 'Assiduité',
      value: `${attendanceRate}%`,
      subtitle: 'Présence moyenne',
      icon: 'checkmark-circle-outline',
      color: C.warning,
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
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>
            Suivi des performances et statistiques du club
          </Text>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={16} color={C.primary} />
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
                      <Ionicons name={stat.icon} size={20} color={C.inkMuted} />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Volume chart */}
            {weeklyVolume.data.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Volume d'entraînement (km/semaine)</Text>
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
                <Text style={styles.chartTitle}>Nageurs par groupe</Text>
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
                    color: (opacity = 1) => `rgba(4, 79, 179, ${opacity})`,
                  }}
                  style={styles.chart}
                  fromZero
                />
              </View>
            )}

            {/* RPE trend */}
            {rpeByWeek.data.length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>RPE moyen par semaine</Text>
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
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>En résumé</Text>
              <Text style={styles.insightText}>
                {swimmerCount > 0
                  ? `Ton club compte ${swimmerCount} nageurs répartis en ${groupCount} groupes. `
                  : ''}
                {sessionCount > 0
                  ? `${sessionCount} séances réalisées avec une assiduité de ${attendanceRate}%. `
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
            </View>
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
    fontFamily: FONTS.display,
    color: C.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: C.inkMuted,
    marginTop: 4,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginTop: 10,
  },
  datePillText: {
    fontSize: 13,
    fontFamily: FONTS.textMedium,
    color: C.inkMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 12) / 2,
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  statCardInner: {
    position: 'relative',
  },
  statCardTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.textStrong,
    color: C.inkMuted,
    marginBottom: 4,
    paddingRight: 24,
  },
  statCardValue: {
    fontSize: 24,
    fontFamily: FONTS.display,
    color: C.ink,
    letterSpacing: -0.5,
  },
  statCardSubtitle: {
    fontSize: 11,
    color: C.inkMuted,
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
    fontFamily: FONTS.textBold,
  },
  trendLabel: {
    fontSize: 10,
    fontFamily: FONTS.text,
    opacity: 0.7,
  },
  statIconWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  chartCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    ...SHADOW.card,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: FONTS.displaySemi,
    color: C.ink,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  insightCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: C.ink,
    lineHeight: 22,
    marginBottom: 16,
  },
  insightButton: {
    backgroundColor: C.primarySoft,
  },
  insightButtonLabel: {
    color: C.onPrimarySoft,
    fontFamily: FONTS.textStrong,
  },
});
