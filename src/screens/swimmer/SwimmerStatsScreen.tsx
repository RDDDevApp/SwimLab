import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import { useRefreshOnFocus, useSwimmerHistory } from '../../hooks';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/authStore';
import EmptyState from '../../components/EmptyState';
import { C, FONTS, RADIUS, SHADOW, SPACING } from '../../config/tokens';

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

const attendanceChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(4, 100, 92, ${opacity})`,
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

export default function SwimmerStatsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('8w');
  const { data: history = [], isLoading: loading, isRefetching: refreshing, refetch } =
    useSwimmerHistory(user?.id);
  useRefreshOnFocus(refetch);
  const onRefresh = () => {
    refetch();
  };

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
      color: C.primary,
      trend: volumeTrend !== null ? { value: volumeTrend, isPositive: volumeTrend >= 0 } : undefined,
    },
    {
      title: 'Assiduité',
      value: `${attendanceRate}%`,
      subtitle: `${attended.length} séances`,
      icon: 'checkmark-circle-outline',
      color: C.success,
    },
    {
      title: 'RPE moyen',
      value: `${avgRpe}`,
      subtitle: `${withRpe.length} feedbacks`,
      icon: 'fitness-outline',
      color: C.danger,
    },
    {
      title: 'Séances',
      value: `${attended.length}`,
      subtitle: 'Sur la période',
      icon: 'calendar-outline',
      color: C.primary,
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
            <Ionicons name="calendar-outline" size={16} color={C.primary} />
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
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Ton bilan</Text>
          <Text style={styles.insightText}>
            {totalVolume > 0
              ? `Tu as parcouru ${(totalVolume / 1000).toFixed(1)} km sur ${attended.length} séances avec une assiduité de ${attendanceRate}%. `
              : 'Continue tes entraînements pour voir ton bilan ici. '}
            {avgRpe !== '-' ? `Ton effort moyen est de ${avgRpe}/20.` : ''}
          </Text>
        </View>
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
  statIconWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  },
});
