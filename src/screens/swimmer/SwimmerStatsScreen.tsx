import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/authStore';
import { workoutSessionService } from '../../services';
import type { SwimmerHistoryEntry } from '../../services';
import EmptyState from '../../components/EmptyState';
import { shadow } from '../../config/tokens';

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

const attendanceChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
};

type Period = '4w' | '8w' | '12w';

function getWeekLabel(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('fr-FR', { month: 'short' });
  return `${day} ${month}`;
}

function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function getMonthKey(date: string): string {
  return date.substring(0, 7);
}

function getMonthLabel(key: string): string {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
  ];
  return months[parseInt(key.split('-')[1], 10) - 1] || key;
}

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

export default function SwimmerStatsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<SwimmerHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('8w');

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workoutSessionService.getSwimmerHistory(user.id);
      setHistory(data);
    } catch (err) {
      console.error('Error loading swimmer history:', err);
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

  const weeksCount = period === '4w' ? 4 : period === '8w' ? 8 : 12;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeksCount * 7);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  const filtered = history.filter((h) => h.scheduledDate >= cutoff);
  const attended = filtered.filter((h) => h.attended);

  // Volume per week
  const volumeByWeek: Record<string, number> = {};
  for (const h of attended) {
    const week = getWeekStart(h.scheduledDate);
    volumeByWeek[week] = (volumeByWeek[week] || 0) + (h.totalDistance || 0);
  }
  const weekKeys = Object.keys(volumeByWeek).sort();
  const volumeLabels = weekKeys.map(getWeekLabel);
  const volumeData = weekKeys.map((k) => volumeByWeek[k]);

  // RPE trend
  const withRpe = attended
    .filter((h) => h.rpeScore !== null)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(-12);
  const rpeLabels = withRpe.map((h) => getWeekLabel(h.scheduledDate));
  const rpeData = withRpe.map((h) => h.rpeScore!);

  // Monthly attendance
  const byMonth: Record<string, { total: number; attended: number }> = {};
  for (const h of filtered) {
    const month = getMonthKey(h.scheduledDate);
    if (!byMonth[month]) byMonth[month] = { total: 0, attended: 0 };
    byMonth[month].total++;
    if (h.attended) byMonth[month].attended++;
  }
  const monthKeys = Object.keys(byMonth).sort();
  const attendanceLabels = monthKeys.map(getMonthLabel);
  const attendanceData = monthKeys.map((k) =>
    byMonth[k].total > 0
      ? Math.round((byMonth[k].attended / byMonth[k].total) * 100)
      : 0,
  );

  // Summary stats
  const totalVolume = attended.reduce((s, h) => s + (h.totalDistance || 0), 0);
  const attendanceRate =
    filtered.length > 0
      ? Math.round((attended.length / filtered.length) * 100)
      : 0;
  const avgRpe =
    withRpe.length > 0
      ? (withRpe.reduce((s, h) => s + h.rpeScore!, 0) / withRpe.length).toFixed(1)
      : '-';

  // Previous period for trends
  const prevCutoff = new Date(cutoffDate);
  prevCutoff.setDate(prevCutoff.getDate() - weeksCount * 7);
  const prevCutoffStr = prevCutoff.toISOString().split('T')[0];
  const prevFiltered = history.filter(
    (h) => h.scheduledDate >= prevCutoffStr && h.scheduledDate < cutoff,
  );
  const prevAttended = prevFiltered.filter((h) => h.attended);
  const prevVolume = prevAttended.reduce((s, h) => s + (h.totalDistance || 0), 0);
  const volumeTrend =
    prevVolume > 0
      ? Math.round(((totalVolume - prevVolume) / prevVolume) * 100)
      : null;

  const now = new Date();
  const currentMonth = now.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const statCards: StatCardData[] = [
    {
      title: 'Volume total',
      value: totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)} km` : '0 m',
      subtitle: 'Distance parcourue',
      icon: 'water-outline',
      color: 'rgba(6, 182, 212, 0.30)',
      trend: volumeTrend !== null ? { value: volumeTrend, isPositive: volumeTrend >= 0 } : undefined,
    },
    {
      title: 'Assiduité',
      value: `${attendanceRate}%`,
      subtitle: `${attended.length} séances`,
      icon: 'checkmark-circle-outline',
      color: 'rgba(16, 185, 129, 0.30)',
    },
    {
      title: 'RPE moyen',
      value: `${avgRpe}`,
      subtitle: `${withRpe.length} feedbacks`,
      icon: 'fitness-outline',
      color: 'rgba(236, 72, 153, 0.30)',
    },
    {
      title: 'Séances',
      value: `${attended.length}`,
      subtitle: 'Sur la période',
      icon: 'calendar-outline',
      color: 'rgba(99, 102, 241, 0.30)',
    },
  ];

  if (!loading && history.length === 0) {
    return (
      <GradientScreen>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Mes statistiques</Text>
          <Text style={styles.headerSubtitle}>Suivi de tes performances</Text>
        </View>
        <EmptyState
          icon="chart-line"
          title="Pas encore de données"
          subtitle="Tes stats apparaîtront après tes premiers entraînements"
        />
      </GradientScreen>
    );
  }

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
          <Text style={styles.headerTitle}>Mes statistiques</Text>
          <Text style={styles.headerSubtitle}>Suivi de tes performances</Text>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={16} color="#0891b2" />
            <Text style={styles.datePillText}>
              {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            </Text>
          </View>
        </View>

        {/* Period selector */}
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          buttons={[
            { value: '4w', label: '4 sem.' },
            { value: '8w', label: '8 sem.' },
            { value: '12w', label: '12 sem.' },
          ]}
          style={styles.segmented}
        />

        {/* Stats Grid (2x2) */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, i) => (
            <StatCardItem key={i} stat={stat} />
          ))}
        </View>

        {/* Volume chart */}
        {volumeData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Volume par semaine (m)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{
                  labels: volumeLabels,
                  datasets: [{ data: volumeData }],
                }}
                width={Math.max(screenWidth, volumeLabels.length * 60)}
                height={220}
                yAxisSuffix=""
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
              />
            </ScrollView>
          </View>
        )}

        {/* RPE chart */}
        {rpeData.length > 1 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Évolution RPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: rpeLabels,
                  datasets: [{ data: rpeData }],
                }}
                width={Math.max(screenWidth, rpeLabels.length * 60)}
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

        {/* Attendance chart */}
        {attendanceData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Assiduité par mois (%)</Text>
            <BarChart
              data={{
                labels: attendanceLabels,
                datasets: [{ data: attendanceData }],
              }}
              width={screenWidth}
              height={220}
              yAxisSuffix="%"
              yAxisLabel=""
              chartConfig={attendanceChartConfig}
              style={styles.chart}
              fromZero
            />
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
          <Text style={styles.insightTitle}>Ton bilan</Text>
          <Text style={styles.insightText}>
            {totalVolume > 0
              ? `Tu as parcouru ${(totalVolume / 1000).toFixed(1)} km sur ${attended.length} séances avec une assiduité de ${attendanceRate}%. `
              : 'Continue tes entraînements pour voir ton bilan ici. '}
            {avgRpe !== '-' ? `Ton effort moyen est de ${avgRpe}/20.` : ''}
          </Text>
        </LinearGradient>
      </ScrollView>
    </GradientScreen>
  );
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
  segmented: {
    marginBottom: 0,
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
  },
});
