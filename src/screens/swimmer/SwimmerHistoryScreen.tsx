import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useAuthStore } from '../../stores/authStore';
import { useSwimmerHistory, useRefreshOnFocus } from '../../hooks';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { C, FONTS } from '../../config/tokens';
import { getRPEColor, getRPETextColor } from '../../config/theme';
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getRpeColor(rpe: number): { bg: string; text: string } {
  return { bg: getRPEColor(rpe), text: getRPETextColor(rpe) };
}

interface Props {
  navigation: any;
}

export default function SwimmerHistoryScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { data: history = [], isLoading, isRefetching, refetch } = useSwimmerHistory(user?.id);
  useRefreshOnFocus(refetch);

  if (isLoading) {
    return (
      <GradientScreen>
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Text variant="titleLarge" style={styles.title}>
            Mon historique
          </Text>
        </View>
        <LoadingSkeleton variant="list" />
      </GradientScreen>
    );
  }

  if (history.length === 0) {
    return (
      <GradientScreen>
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => navigation.goBack()}>
            Retour
          </Button>
          <Text variant="titleLarge" style={styles.title}>
            Mon historique
          </Text>
        </View>
        <EmptyState
          icon="history"
          title="Aucun historique"
          subtitle="Ton historique apparaîtra après tes premiers entraînements"
        />
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Mon historique
        </Text>
        <Chip icon="swim" style={styles.countChip}>
          {history.filter((h) => h.attended).length} séances
        </Chip>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              !item.attended && styles.absentCard,
            ]}
            onPress={() =>
              navigation.navigate('WorkoutDetail', {
                workoutId: item.workoutId,
                workoutTitle: item.workoutTitle,
              })
            }
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="labelMedium" style={styles.date}>
                  {formatDate(item.scheduledDate)}
                </Text>
                {item.attended ? (
                  <Chip
                    compact
                    style={styles.presentBadge}
                    textStyle={styles.presentText}
                  >
                    Présent
                  </Chip>
                ) : (
                  <Chip
                    compact
                    style={styles.absentBadge}
                    textStyle={styles.absentText}
                  >
                    Absent
                  </Chip>
                )}
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
                {item.rpeScore !== null && (
                  <Chip
                    compact
                    style={[
                      styles.rpeChip,
                      { backgroundColor: getRpeColor(item.rpeScore).bg },
                    ]}
                    textStyle={{
                      color: getRpeColor(item.rpeScore).text,
                      fontSize: 11,
                    }}
                  >
                    RPE {item.rpeScore}
                  </Chip>
                )}
              </View>

              {item.feedbackText ? (
                <Text
                  variant="bodySmall"
                  style={styles.feedback}
                  numberOfLines={2}
                >
                  "{item.feedbackText}"
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        )}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 8,
    paddingBottom: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    paddingHorizontal: 16,
  },
  countChip: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: C.surface,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: C.surface,
    marginBottom: 10,
  },
  absentCard: {
    opacity: 0.6,
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
  presentBadge: {
    backgroundColor: C.successSoft,
    height: 26,
  },
  presentText: {
    color: C.success,
    fontSize: 11,
  },
  absentBadge: {
    backgroundColor: C.dangerSoft,
    height: 26,
  },
  absentText: {
    color: C.danger,
    fontSize: 11,
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
  feedback: {
    color: C.inkMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
