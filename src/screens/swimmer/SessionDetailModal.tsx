import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Chip, IconButton } from 'react-native-paper';
import { Workout, WORKOUT_TYPES } from '../../types';
import { workoutService, workoutSessionService } from '../../services';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { formatTime } from '../../utils/dateHelpers';
import WorkoutContentView from '../../components/workout/WorkoutContentView';
import RPESlider from '../../components/RPESlider';

interface Props {
  navigation: any;
  route: any;
}

const getStatusDot = (session: any, assignment: any) => {
  const isPast = new Date(assignment.scheduled_date + 'T23:59:59') < new Date();

  if (session?.completed_at) {
    return { color: '#10B981', label: 'Feedback donne' };
  }
  if (session?.attended && !session?.completed_at) {
    return { color: '#F59E0B', label: 'Feedback a donner' };
  }
  if (session && !session.attended) {
    return { color: '#9CA3AF', label: 'Absent' };
  }
  if (isPast && !assignment.attendance_marked) {
    return { color: '#9CA3AF', label: 'Non marque' };
  }
  return { color: '#3B82F6', label: 'A venir' };
};

export default function SessionDetailModal({ navigation, route }: Props) {
  const {
    assignment,
    workoutTitle,
    workoutType,
    totalDistance,
    slotName,
    slot,
    session: initialSession,
  } = route.params;

  const showSnackbar = useSnackbarStore((s) => s.show);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(initialSession);
  const [rpe, setRpe] = useState(13);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await workoutService.getById(assignment.workout_id);
      setWorkout(data);
    } catch (err) {
      console.error('Error loading workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    navigation.goBack();
  };

  const handleSubmitFeedback = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await workoutSessionService.submitFeedback(session.id, {
        rpe_score: rpe,
        feedback_text: comment.trim() || undefined,
      });
      setFeedbackSubmitted(true);
      setSession({ ...session, rpe_score: rpe, feedback_text: comment.trim(), completed_at: new Date().toISOString() });
      showSnackbar('Merci pour ton feedback !', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const canGiveFeedback = session?.attended && !session?.completed_at && !feedbackSubmitted;
  const hasFeedback = session?.completed_at || feedbackSubmitted;
  const isAbsent = session && !session.attended;
  const dot = getStatusDot(session, assignment);

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleDismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <View style={[styles.statusDot, { backgroundColor: dot.color }]} />
                <Text variant="titleLarge" style={styles.title}>
                  {slotName}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {formatDate(assignment.scheduled_date)}
              </Text>
              <View style={styles.infoRow}>
                <Chip compact icon="clock-outline" style={styles.infoChip}>
                  {formatTime(slot.start_time)} - {slot.duration_minutes}min
                </Chip>
                <Chip compact style={styles.infoChip}>
                  {dot.label}
                </Chip>
              </View>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={handleDismiss}
              style={styles.closeBtn}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <ActivityIndicator size="large" style={{ marginTop: 32 }} />
            ) : (
              <View>
                {/* Workout info header */}
                <View style={styles.workoutHeader}>
                  <Text variant="titleMedium" style={styles.workoutTitle}>
                    {workoutTitle}
                  </Text>
                  <View style={styles.chipRow}>
                    <Chip compact style={styles.typeChip}>
                      {WORKOUT_TYPES[workoutType as keyof typeof WORKOUT_TYPES] || workoutType}
                    </Chip>
                    {totalDistance ? (
                      <Chip compact style={styles.distanceChip}>
                        {totalDistance}m
                      </Chip>
                    ) : null}
                  </View>
                </View>

                {/* Workout content */}
                {workout && <WorkoutContentView workout={workout} />}

                {/* Feedback section */}
                {canGiveFeedback && (
                  <View style={styles.feedbackSection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Mon ressenti
                    </Text>

                    <Text variant="titleSmall" style={styles.fieldLabel}>
                      Effort percu (RPE)
                    </Text>
                    <RPESlider value={rpe} onChange={setRpe} />

                    <Text variant="titleSmall" style={[styles.fieldLabel, { marginTop: 16 }]}>
                      Commentaire (optionnel)
                    </Text>
                    <TextInput
                      placeholder="Comment s'est passee la seance ?"
                      value={comment}
                      onChangeText={setComment}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                    />

                    <Button
                      mode="contained"
                      onPress={handleSubmitFeedback}
                      loading={submitting}
                      disabled={submitting}
                      style={styles.submitBtn}
                    >
                      Envoyer mon feedback
                    </Button>
                  </View>
                )}

                {hasFeedback && (
                  <View style={styles.feedbackSection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Mon ressenti
                    </Text>
                    <View style={styles.feedbackReadonly}>
                      <View style={styles.rpeDisplay}>
                        <Text variant="bodySmall" style={styles.rpeLabel}>RPE</Text>
                        <Text variant="headlineMedium" style={styles.rpeValue}>
                          {session.rpe_score}
                        </Text>
                      </View>
                      {session.feedback_text ? (
                        <View style={styles.commentDisplay}>
                          <Text variant="bodySmall" style={styles.commentLabel}>Commentaire</Text>
                          <Text variant="bodyMedium" style={styles.commentText}>
                            {session.feedback_text}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}

                {isAbsent && (
                  <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                      Absent(e) pour cette seance
                    </Text>
                  </View>
                )}

                {!session && !isAbsent && (
                  <View style={[styles.noticeBox, styles.noticeBlue]}>
                    <Text style={[styles.noticeText, styles.noticeBlueText]}>
                      Seance a venir
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  infoChip: {
    backgroundColor: '#F3F4F6',
  },
  closeBtn: {
    margin: -4,
  },
  content: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  distanceChip: {
    height: 24,
    backgroundColor: '#CFFAFE',
  },
  // Feedback section
  feedbackSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
  // Feedback readonly
  feedbackReadonly: {
    gap: 12,
  },
  rpeDisplay: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  rpeLabel: {
    color: '#065F46',
    fontWeight: '500',
  },
  rpeValue: {
    fontWeight: 'bold',
    color: '#065F46',
  },
  commentDisplay: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  commentLabel: {
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  commentText: {
    color: '#1F2937',
  },
  // Notices
  noticeBox: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noticeText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  noticeBlue: {
    backgroundColor: '#DBEAFE',
  },
  noticeBlueText: {
    color: '#1E40AF',
  },
});
