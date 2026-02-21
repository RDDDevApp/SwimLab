import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Button, ProgressBar } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { WorkoutSession } from '../../types';
import { workoutSessionService } from '../../services';
import { getRPEColor, RPE_LABELS } from '../../config/theme';

interface Props {
  navigation: any;
  route: any;
}

interface SessionWithName extends WorkoutSession {
  swimmer_name?: string;
}

export default function WorkoutStatsScreen({ navigation, route }: Props) {
  const { assignmentId, workoutTitle } = route.params;

  const [sessions, setSessions] = useState<SessionWithName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await workoutSessionService.getByAssignment(assignmentId);
      setSessions(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const attendedSessions = sessions.filter((s) => s.attended);
  const absentSessions = sessions.filter((s) => !s.attended);
  const withFeedback = attendedSessions.filter((s) => s.rpe_score !== null);
  const pendingFeedback = attendedSessions.filter((s) => s.rpe_score === null);
  const rpeScores = withFeedback.map((s) => s.rpe_score as number);
  const avgRpe = rpeScores.length
    ? rpeScores.reduce((a, b) => a + b, 0) / rpeScores.length
    : null;
  const minRpe = rpeScores.length ? Math.min(...rpeScores) : null;
  const maxRpe = rpeScores.length ? Math.max(...rpeScores) : null;
  const commentsCount = withFeedback.filter((s) => s.feedback_text).length;
  const attendanceRate = sessions.length
    ? (attendedSessions.length / sessions.length) * 100
    : 0;

  // Sort: high RPE first (fatigue alerts on top)
  const sortedWithFeedback = [...withFeedback].sort(
    (a, b) => (b.rpe_score || 0) - (a.rpe_score || 0),
  );

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Feedbacks
        </Text>
        {workoutTitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {workoutTitle}
          </Text>
        )}
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Global Stats Card */}
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Statistiques globales
                </Text>

                <View style={styles.statRow}>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Presence
                  </Text>
                  <Text variant="titleSmall" style={styles.statValue}>
                    {attendedSessions.length}/{sessions.length} ({Math.round(attendanceRate)}%)
                  </Text>
                </View>
                <ProgressBar
                  progress={attendanceRate / 100}
                  color="#10B981"
                  style={styles.progressBar}
                />

                {avgRpe !== null && (
                  <>
                    <View style={styles.statRow}>
                      <Text variant="bodyMedium" style={styles.statLabel}>
                        RPE moyen
                      </Text>
                      <Chip
                        compact
                        style={[styles.rpeChip, { backgroundColor: getRPEColor(Math.round(avgRpe)) }]}
                        textStyle={styles.rpeChipText}
                      >
                        {avgRpe.toFixed(1)}/20
                      </Chip>
                    </View>
                    <ProgressBar
                      progress={(avgRpe - 6) / 14}
                      color={getRPEColor(Math.round(avgRpe))}
                      style={styles.progressBar}
                    />

                    <View style={styles.minMaxRow}>
                      <Text variant="bodySmall" style={styles.minMax}>
                        Min: {minRpe}/20
                      </Text>
                      <Text variant="bodySmall" style={styles.minMax}>
                        Max: {maxRpe}/20
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.statRow}>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Commentaires
                  </Text>
                  <Text variant="titleSmall" style={styles.statValue}>
                    {commentsCount}/{withFeedback.length}
                  </Text>
                </View>

                {withFeedback.length === 0 && attendedSessions.length > 0 && (
                  <Text variant="bodySmall" style={styles.waitingText}>
                    En attente des feedbacks...
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* Individual Feedbacks */}
            <Text variant="titleMedium" style={styles.listTitle}>
              Feedbacks individuels
            </Text>

            {sortedWithFeedback.map((session) => (
              <Card key={session.id} style={styles.feedbackCard}>
                <Card.Content>
                  <View style={styles.feedbackHeader}>
                    <Text variant="titleSmall" style={styles.swimmerName}>
                      Nageur
                    </Text>
                    <View style={styles.feedbackBadges}>
                      {(session.rpe_score || 0) > 17 && (
                        <Chip
                          compact
                          style={styles.alertChip}
                          textStyle={styles.alertText}
                        >
                          RPE eleve
                        </Chip>
                      )}
                      <Chip
                        compact
                        style={[
                          styles.rpeChip,
                          { backgroundColor: getRPEColor(session.rpe_score || 13) },
                        ]}
                        textStyle={styles.rpeChipText}
                      >
                        {session.rpe_score}/20
                      </Chip>
                    </View>
                  </View>
                  <Text variant="bodySmall" style={styles.rpeLabel}>
                    {RPE_LABELS[session.rpe_score || 13]}
                  </Text>
                  {session.feedback_text && (
                    <Text variant="bodyMedium" style={styles.commentText}>
                      "{session.feedback_text}"
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}

            {/* Pending feedback */}
            {pendingFeedback.map((session) => (
              <Card key={session.id} style={styles.pendingCard}>
                <Card.Content style={styles.pendingRow}>
                  <Text variant="bodyMedium" style={styles.pendingName}>
                    Nageur
                  </Text>
                  <Chip compact style={styles.pendingChip}>
                    En attente
                  </Chip>
                </Card.Content>
              </Card>
            ))}

            {/* Absent */}
            {absentSessions.map((session) => (
              <Card key={session.id} style={styles.absentCard}>
                <Card.Content style={styles.pendingRow}>
                  <Text variant="bodyMedium" style={styles.absentName}>
                    Nageur
                  </Text>
                  <Chip compact style={styles.absentChip}>
                    Absent
                  </Chip>
                </Card.Content>
              </Card>
            ))}
          </>
        }
        contentContainerStyle={styles.content}
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: '#64748b',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statLabel: {
    color: '#64748b',
  },
  statValue: {
    color: '#1e293b',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMax: {
    color: '#64748b',
  },
  rpeChip: {
    height: 26,
  },
  rpeChipText: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  waitingText: {
    color: '#F59E0B',
    fontStyle: 'italic',
    marginTop: 8,
  },
  listTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swimmerName: {
    color: '#1e293b',
    fontWeight: '600',
  },
  feedbackBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  alertChip: {
    backgroundColor: '#FEF3C7',
    height: 26,
  },
  alertText: {
    color: '#92400E',
    fontSize: 11,
  },
  rpeLabel: {
    color: '#64748b',
    marginTop: 2,
  },
  commentText: {
    color: '#0891b2',
    marginTop: 8,
    fontStyle: 'italic',
  },
  pendingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 6,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingName: {
    color: '#64748b',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
    height: 26,
  },
  absentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 6,
  },
  absentName: {
    color: '#64748b',
  },
  absentChip: {
    backgroundColor: '#FEE2E2',
    height: 26,
  },
});
