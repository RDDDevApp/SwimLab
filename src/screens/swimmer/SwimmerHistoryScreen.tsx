import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { workoutSessionService } from '../../services';
import type { SwimmerHistoryEntry } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import EmptyState from '../../components/EmptyState';

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
  if (rpe <= 12) return { bg: '#D1FAE5', text: '#065F46' };
  if (rpe <= 15) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#FEE2E2', text: '#991B1B' };
}

interface Props {
  navigation: any;
}

export default function SwimmerHistoryScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<SwimmerHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (!loading && history.length === 0) {
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
          subtitle="Ton historique apparaitra apres tes premiers entrainements"
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
          {history.filter((h) => h.attended).length} seances
        </Chip>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadData}
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
                    Present
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
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 16,
  },
  countChip: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
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
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '600',
  },
  presentBadge: {
    backgroundColor: '#D1FAE5',
    height: 26,
  },
  presentText: {
    color: '#065F46',
    fontSize: 11,
  },
  absentBadge: {
    backgroundColor: '#FEE2E2',
    height: 26,
  },
  absentText: {
    color: '#991B1B',
    fontSize: 11,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  rpeChip: {
    height: 26,
  },
  feedback: {
    color: 'rgba(255,255,255,0.50)',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
