import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Button, ProgressBar } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useAssignmentSessions, useRefreshOnFocus } from '../../hooks';
import { getRPEColor, RPE_LABELS } from '../../config/theme';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
  route: any;
}

export default function WorkoutStatsScreen({ navigation, route }: Props) {
  const { assignmentId, workoutTitle } = route.params;

  const { data: sessions = [], refetch } = useAssignmentSessions(assignmentId);
  useRefreshOnFocus(refetch);

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
                    Présence
                  </Text>
                  <Text variant="titleSmall" style={styles.statValue}>
                    {attendedSessions.length}/{sessions.length} ({Math.round(attendanceRate)}%)
                  </Text>
                </View>
                <ProgressBar
                  progress={attendanceRate / 100}
                  color={C.success}
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
                      {session.swimmer_name || 'Nageur'}
                    </Text>
                    <View style={styles.feedbackBadges}>
                      {(session.rpe_score || 0) > 17 && (
                        <Chip
                          compact
                          style={styles.alertChip}
                          textStyle={styles.alertText}
                        >
                          RPE élevé
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
                    {session.swimmer_name || 'Nageur'}
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
                    {session.swimmer_name || 'Nageur'}
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
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: C.inkMuted,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: C.surface,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statLabel: {
    color: C.inkMuted,
  },
  statValue: {
    color: C.ink,
    fontFamily: FONTS.textStrong,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    backgroundColor: C.surface,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMax: {
    color: C.inkMuted,
  },
  rpeChip: {
    height: 26,
  },
  rpeChipText: {
    color: C.ink,
    fontFamily: FONTS.textBold,
    fontSize: 12,
  },
  waitingText: {
    color: C.warning,
    fontStyle: 'italic',
    marginTop: 8,
  },
  listTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 8,
  },
  feedbackCard: {
    backgroundColor: C.surface,
    marginBottom: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swimmerName: {
    color: C.ink,
    fontFamily: FONTS.textStrong,
  },
  feedbackBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  alertChip: {
    backgroundColor: C.warningSoft,
    height: 26,
  },
  alertText: {
    color: C.warning,
    fontSize: 11,
  },
  rpeLabel: {
    color: C.inkMuted,
    marginTop: 2,
  },
  commentText: {
    color: C.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  pendingCard: {
    backgroundColor: C.surface,
    marginBottom: 6,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingName: {
    color: C.inkMuted,
  },
  pendingChip: {
    backgroundColor: C.warningSoft,
    height: 26,
  },
  absentCard: {
    backgroundColor: C.surface,
    marginBottom: 6,
  },
  absentName: {
    color: C.inkMuted,
  },
  absentChip: {
    backgroundColor: C.dangerSoft,
    height: 26,
  },
});
