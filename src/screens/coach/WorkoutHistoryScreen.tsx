import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
} from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { queryKeys, useRefreshOnFocus } from '../../hooks';
import {
  workoutAssignmentService,
  workoutService,
  workoutSessionService,
  groupService,
  trainingSlotService,
} from '../../services';
import { useAuthStore } from '../../stores/authStore';
import EmptyState from '../../components/EmptyState';
import { toISODate } from '../../utils/dateHelpers';
import { C, FONTS } from '../../config/tokens';
import { getRPEColor, getRPETextColor } from '../../config/theme';
interface HistoryItem {
  assignmentId: string;
  scheduledDate: string;
  workoutTitle: string;
  workoutType?: string;
  totalDistance: number | null;
  groupName: string;
  attendedCount: number;
  totalSwimmers: number;
  averageRpe: number | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

interface Props {
  navigation: any;
}

/** Séances émargées des 90 derniers jours, sur tous les groupes du coach. */
async function fetchCoachHistory(coachId: string): Promise<HistoryItem[]> {
  const groups = await groupService.getByCoach(coachId);
  if (!groups.length) return [];
  const groupName = new Map(groups.map((g) => [g.id, g.name]));

  // Créneaux de tous les groupes en une requête (anti N+1)
  const allSlots = await trainingSlotService.getByGroups(groups.map((g) => g.id));
  if (!allSlots.length) return [];

  const today = toISODate(new Date());
  const ago90 = new Date();
  ago90.setDate(ago90.getDate() - 90);

  const assignments = await workoutAssignmentService.getByDateRange(
    allSlots.map((s) => s.id),
    toISODate(ago90),
    today,
  );
  const pastAssignments = assignments.filter((a) => a.scheduled_date <= today && a.attendance_marked);
  if (!pastAssignments.length) return [];

  // Séances en une requête ; un échec laisse le titre par défaut
  let workouts = new Map<string, { title: string; type: string | null; total_distance: number | null }>();
  try {
    const list = await workoutService.getByIds([...new Set(pastAssignments.map((a) => a.workout_id))]);
    workouts = new Map(list.map((w) => [w.id, w]));
  } catch {}

  const rpeMap = await workoutSessionService.getAverageRpeByAssignments(
    pastAssignments.map((a) => a.id),
  );

  return pastAssignments
    .map((a) => {
      const slot = allSlots.find((s) => s.id === a.training_slot_id);
      const workout = workouts.get(a.workout_id);
      return {
        assignmentId: a.id,
        scheduledDate: a.scheduled_date,
        workoutTitle: workout?.title || 'Séance',
        workoutType: workout?.type || 'other',
        totalDistance: workout?.total_distance || null,
        groupName: (slot && groupName.get(slot.group_id)) || '',
        attendedCount: 0,
        totalSwimmers: 0,
        averageRpe: rpeMap[a.id] ?? null,
      };
    })
    .sort((x, y) => y.scheduledDate.localeCompare(x.scheduledDate));
}

export default function WorkoutHistoryScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const {
    data: items = [],
    isLoading: loading,
    isFetching,
    refetch: loadData,
  } = useQuery({
    queryKey: queryKeys.coachHistory(user?.id ?? ''),
    queryFn: () => fetchCoachHistory(user!.id),
    enabled: !!user,
  });
  useRefreshOnFocus(loadData);

  function getRpeColor(rpe: number): { bg: string; text: string } {
    return { bg: getRPEColor(rpe), text: getRPETextColor(rpe) };
  }

  return (
    <GradientScreen>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Chip icon="history" style={styles.countChip}>
            {items.length} séances
          </Chip>
        </View>
        <Text variant="titleLarge" style={styles.title}>
          Historique des séances
        </Text>
      </View>

      {items.length === 0 && !loading ? (
        <EmptyState
          icon="history"
          title="Aucun historique"
          subtitle="Les séances passées apparaîtront ici"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.assignmentId}
          contentContainerStyle={styles.list}
          refreshing={isFetching}
          onRefresh={loadData}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() =>
                navigation.navigate('WorkoutStats', {
                  assignmentId: item.assignmentId,
                  workoutTitle: item.workoutTitle,
                })
              }
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="labelMedium" style={styles.date}>
                    {formatDate(item.scheduledDate)}
                  </Text>
                  <Chip compact style={styles.groupChip}>
                    {item.groupName}
                  </Chip>
                </View>
                <Text variant="titleSmall" style={styles.workoutTitle}>
                  {item.workoutTitle}
                </Text>
                <View style={styles.chipRow}>
                  {item.totalDistance ? (
                    <Chip compact icon="ruler" style={styles.chip}>
                      {item.totalDistance}m
                    </Chip>
                  ) : null}
                  {item.averageRpe !== null && (
                    <Chip
                      compact
                      style={[
                        styles.rpeChip,
                        {
                          backgroundColor: getRpeColor(item.averageRpe).bg,
                        },
                      ]}
                      textStyle={{
                        color: getRpeColor(item.averageRpe).text,
                        fontSize: 11,
                      }}
                    >
                      RPE {item.averageRpe.toFixed(1)}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
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
    paddingTop: 8,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countChip: {
    backgroundColor: C.primarySoft,
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  segmented: {
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: C.surface,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: C.inkMuted,
    fontFamily: FONTS.textStrong,
  },
  groupChip: {
    backgroundColor: C.primarySoft,
    height: 26,
  },
  workoutTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 26,
    backgroundColor: C.surface,
  },
  rpeChip: {
    height: 26,
  },
});
