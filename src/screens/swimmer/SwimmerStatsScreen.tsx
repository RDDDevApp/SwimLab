import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../../stores/authStore';
import { workoutSessionService } from '../../services';
import type { SwimmerHistoryEntry } from '../../services';
import EmptyState from '../../components/EmptyState';

const screenWidth = Dimensions.get('window').width - 48;

const chartConfig = {
  backgroundGradientFrom: 'rgba(255, 255, 255, 0.10)',
  backgroundGradientTo: 'rgba(255, 255, 255, 0.10)',
  decimalCount: 0,
  color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
  labelColor: () => 'rgba(255,255,255,0.50)',
  barPercentage: 0.6,
  propsForBackgroundLines: {
    stroke: 'rgba(255, 255, 255, 0.15)',
  },
};

const rpeChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(244, 63, 142, ${opacity})`,
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
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function getMonthKey(date: string): string {
  return date.substring(0, 7); // "2026-02"
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const months = [
    'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[parseInt(month, 10) - 1] || key;
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

  // Filter by period
  const weeksCount = period === '4w' ? 4 : period === '8w' ? 8 : 12;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeksCount * 7);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  const filtered = history.filter((h) => h.scheduledDate >= cutoff);
  const attended = filtered.filter((h) => h.attended);

  // --- Volume per week ---
  const volumeByWeek: Record<string, number> = {};
  for (const h of attended) {
    const week = getWeekStart(h.scheduledDate);
    volumeByWeek[week] = (volumeByWeek[week] || 0) + (h.totalDistance || 0);
  }
  const weekKeys = Object.keys(volumeByWeek).sort();
  const volumeLabels = weekKeys.map(getWeekLabel);
  const volumeData = weekKeys.map((k) => volumeByWeek[k]);

  // --- RPE trend (last attended sessions with RPE) ---
  const withRpe = attended
    .filter((h) => h.rpeScore !== null)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(-12);
  const rpeLabels = withRpe.map((h) => getWeekLabel(h.scheduledDate));
  const rpeData = withRpe.map((h) => h.rpeScore!);

  // --- Monthly attendance ---
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
  const totalVolume = attended.reduce(
    (s, h) => s + (h.totalDistance || 0),
    0,
  );
  const attendanceRate =
    filtered.length > 0
      ? Math.round((attended.length / filtered.length) * 100)
      : 0;
  const avgRpe =
    withRpe.length > 0
      ? (
          withRpe.reduce((s, h) => s + h.rpeScore!, 0) / withRpe.length
        ).toFixed(1)
      : '-';

  if (!loading && history.length === 0) {
    return (
      <GradientScreen>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Mes statistiques
          </Text>
        </View>
        <EmptyState
          icon="chart-line"
          title="Pas encore de donnees"
          subtitle="Tes stats apparaitront apres tes premiers entrainements"
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
        <Text variant="titleLarge" style={styles.title}>
          Mes statistiques
        </Text>

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

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {totalVolume > 0
                  ? `${(totalVolume / 1000).toFixed(1)}km`
                  : '0m'}
              </Text>
              <Text variant="labelSmall" style={styles.summaryLabel}>
                Volume total
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {attendanceRate}%
              </Text>
              <Text variant="labelSmall" style={styles.summaryLabel}>
                Assiduite
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                {avgRpe}
              </Text>
              <Text variant="labelSmall" style={styles.summaryLabel}>
                RPE moy.
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Volume chart */}
        {volumeData.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.chartTitle}>
                Volume par semaine (m)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: volumeLabels,
                    datasets: [{ data: volumeData }],
                  }}
                  width={Math.max(screenWidth, volumeLabels.length * 60)}
                  height={200}
                  yAxisSuffix=""
                  yAxisLabel=""
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                />
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* RPE chart */}
        {rpeData.length > 1 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.chartTitle}>
                Evolution RPE
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={{
                    labels: rpeLabels,
                    datasets: [{ data: rpeData }],
                  }}
                  width={Math.max(screenWidth, rpeLabels.length * 60)}
                  height={200}
                  yAxisSuffix=""
                  yAxisLabel=""
                  chartConfig={rpeChartConfig}
                  style={styles.chart}
                  bezier
                />
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Attendance chart */}
        {attendanceData.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.chartTitle}>
                Assiduite par mois (%)
              </Text>
              <BarChart
                data={{
                  labels: attendanceLabels,
                  datasets: [{ data: attendanceData }],
                }}
                width={screenWidth}
                height={200}
                yAxisSuffix="%"
                yAxisLabel=""
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                }}
                style={styles.chart}
                fromZero
              />
            </Card.Content>
          </Card>
        )}

        {/* Session count */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.countRow}>
              <Chip icon="swim" style={styles.countChip}>
                {attended.length} seances sur la periode
              </Chip>
              <Chip icon="chart-timeline-variant" style={styles.countChip}>
                {withRpe.length} feedbacks RPE
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  segmented: {
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#F43F8E',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.50)',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  chartTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  countChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
});
