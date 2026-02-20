import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Chip, RadioButton, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import {
  Workout,
  WorkoutAssignment,
} from '../../types';
import {
  groupService,
  workoutService,
  workoutAssignmentService,
  workoutSessionService,
} from '../../services';
import type { GroupFeedbackStats } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { formatTime } from '../../utils/dateHelpers';
import WorkoutContentView from '../../components/workout/WorkoutContentView';

interface Props {
  navigation: any;
  route: any;
}

const getRpeColor = (rpe: number) => {
  if (rpe <= 12) return { bg: '#D1FAE5', text: '#065F46' };
  if (rpe <= 15) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#FEE2E2', text: '#991B1B' };
};

export default function SessionDetailModal({ navigation, route }: Props) {
  const { slot, date, assignment: initialAssignment, workoutTitle: initialTitle } = route.params;
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [assignment, setAssignment] = useState<WorkoutAssignment | null>(initialAssignment);
  const [groupName, setGroupName] = useState('');
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [publishedWorkouts, setPublishedWorkouts] = useState<Workout[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [feedbackStats, setFeedbackStats] = useState<GroupFeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load group name
      const group = await groupService.getById(slot.group_id);
      setGroupName(group.name);

      if (assignment) {
        // Load full workout details
        try {
          const w = await workoutService.getById(assignment.workout_id);
          setWorkout(w);
        } catch {}

        // Re-fetch assignment to check if attendance_marked changed
        try {
          const fresh = await workoutAssignmentService.getById(assignment.id);
          setAssignment(fresh);

          // Load feedback stats if marked
          if (fresh.attendance_marked) {
            try {
              const stats = await workoutSessionService.getFeedbackStats(fresh.id);
              setFeedbackStats(stats);
            } catch {}
          }
        } catch {}
      } else {
        // Load published workouts for assignment picker
        const allWorkouts = await workoutService.getByCoach(user.id);
        setPublishedWorkouts(allWorkouts.filter((w) => w.is_published));
      }
    } catch (err) {
      console.error('Error loading session detail:', err);
    } finally {
      setLoading(false);
    }
  }, [user, slot, assignment?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleDismiss = () => {
    navigation.goBack();
  };

  const handleAssign = async () => {
    if (!selectedWorkoutId) return;
    setAssigning(true);
    try {
      const newAssignment = await workoutAssignmentService.create({
        workout_id: selectedWorkoutId,
        training_slot_id: slot.id,
        scheduled_date: date,
      });
      setAssignment(newAssignment);
      const w = await workoutService.getById(selectedWorkoutId);
      setWorkout(w);
      setPublishedWorkouts([]);
      showSnackbar('Seance assignee', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur lors de l\'attribution', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleModify = async () => {
    if (!assignment) return;
    try {
      await workoutAssignmentService.delete(assignment.id);
      setAssignment(null);
      setWorkout(null);
      setFeedbackStats(null);
      setShowPicker(true);
      // Load published workouts for picker
      if (user) {
        const allWorkouts = await workoutService.getByCoach(user.id);
        setPublishedWorkouts(allWorkouts.filter((w) => w.is_published));
      }
      showSnackbar('Assignation supprimee', 'info');
    } catch (err: any) {
      showSnackbar(err.message || 'Erreur', 'error');
    }
  };

  const handleAttendance = () => {
    if (!assignment) return;
    navigation.navigate('Attendance', {
      assignmentId: assignment.id,
      groupId: slot.group_id,
      workoutTitle: workout?.title || initialTitle,
    });
  };

  const handleViewStats = () => {
    if (!assignment) return;
    navigation.navigate('WorkoutStats', {
      assignmentId: assignment.id,
      workoutTitle: workout?.title || initialTitle,
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

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
              <Text variant="titleLarge" style={styles.title}>
                {groupName || slot.name}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {formatDate(date)}
              </Text>
              <View style={styles.infoRow}>
                <Chip compact icon="clock-outline" style={styles.infoChip}>
                  {formatTime(slot.start_time)} - {slot.duration_minutes}min
                </Chip>
                {slot.location ? (
                  <Chip compact icon="map-marker" style={styles.infoChip}>
                    {slot.location}
                  </Chip>
                ) : null}
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
          >
            {loading ? (
              <ActivityIndicator size="large" style={{ marginTop: 32 }} />
            ) : !assignment && !showPicker ? (
              /* No assignment - show empty state with assign button */
              <View style={styles.emptySlotView}>
                <View style={styles.emptySlotIcon}>
                  <Text style={styles.emptySlotIconText}>📋</Text>
                </View>
                <Text variant="titleMedium" style={styles.emptySlotTitle}>
                  Aucune seance assignee
                </Text>
                <Text variant="bodyMedium" style={styles.emptySlotSubtitle}>
                  Ce creneau n'a pas encore de seance d'entrainement.
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => setShowPicker(true)}
                  style={styles.assignBtn}
                >
                  Assigner une seance
                </Button>
              </View>
            ) : !assignment && showPicker ? (
              /* Workout picker */
              <View>
                <View style={styles.pickerHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Choisir une seance
                  </Text>
                  <Button
                    compact
                    onPress={() => setShowPicker(false)}
                  >
                    Annuler
                  </Button>
                </View>

                {publishedWorkouts.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      Aucune seance publiee
                    </Text>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => {
                        handleDismiss();
                        navigation.navigate('CreateWorkout');
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Creer une seance
                    </Button>
                  </View>
                ) : (
                  <View>
                    {publishedWorkouts.map((w) => (
                      <Card
                        key={w.id}
                        style={[
                          styles.workoutCard,
                          selectedWorkoutId === w.id && styles.selectedCard,
                        ]}
                        onPress={() => setSelectedWorkoutId(w.id)}
                      >
                        <Card.Content style={styles.cardContent}>
                          <RadioButton
                            value={w.id}
                            status={selectedWorkoutId === w.id ? 'checked' : 'unchecked'}
                            onPress={() => setSelectedWorkoutId(w.id)}
                          />
                          <View style={styles.cardInfo}>
                            <Text variant="titleSmall" style={styles.cardTitle}>
                              {w.title}
                            </Text>
                            <View style={styles.cardMeta}>
                              {w.total_distance ? (
                                <Text variant="bodySmall" style={styles.distance}>
                                  {w.total_distance}m
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    ))}

                    <Button
                      mode="contained"
                      onPress={handleAssign}
                      loading={assigning}
                      disabled={assigning || !selectedWorkoutId}
                      style={styles.assignBtn}
                    >
                      Assigner la seance
                    </Button>
                  </View>
                )}
              </View>
            ) : (
              /* Assignment exists */
              <View>
                {/* Action buttons */}
                <View style={styles.actionRow}>
                  {!assignment.attendance_marked ? (
                    <>
                      <Button
                        mode="outlined"
                        compact
                        icon="swap-horizontal"
                        onPress={handleModify}
                        style={styles.actionBtn}
                      >
                        Assigner
                      </Button>
                      <Button
                        mode="contained"
                        compact
                        icon="clipboard-check-outline"
                        onPress={handleAttendance}
                        style={styles.actionBtn}
                      >
                        Emarger
                      </Button>
                    </>
                  ) : (
                    <>
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedText}>Seance verrouillee</Text>
                      </View>
                      <Button
                        mode="contained"
                        compact
                        icon="chart-bar"
                        onPress={handleViewStats}
                        style={styles.actionBtn}
                      >
                        Voir feedbacks
                      </Button>
                    </>
                  )}
                </View>

                {/* Feedback stats mini summary */}
                {assignment.attendance_marked && feedbackStats && (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text variant="bodySmall" style={styles.statLabel}>Presents</Text>
                      <Text variant="titleMedium" style={styles.statValue}>
                        {feedbackStats.attended_count}/{feedbackStats.total_swimmers}
                      </Text>
                    </View>
                    {feedbackStats.average_rpe != null && (() => {
                      const colors = getRpeColor(feedbackStats.average_rpe!);
                      return (
                        <View style={[styles.statItem, { backgroundColor: colors.bg }]}>
                          <Text variant="bodySmall" style={[styles.statLabel, { color: colors.text }]}>
                            RPE Moy.
                          </Text>
                          <Text variant="titleMedium" style={[styles.statValue, { color: colors.text }]}>
                            {feedbackStats.average_rpe!.toFixed(1)}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* Workout recap */}
                {workout && (
                  <View style={styles.recapSection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Seance assignee
                    </Text>
                    <View style={styles.recapHeader}>
                      <Text variant="titleSmall" style={styles.recapTitle}>
                        {workout.title}
                      </Text>
                      <View style={styles.recapChips}>
                        {workout.total_distance ? (
                          <Chip compact style={styles.distanceChip}>
                            {workout.total_distance}m
                          </Chip>
                        ) : null}
                      </View>
                    </View>
                    <WorkoutContentView workout={workout} />
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
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  // Empty slot view
  emptySlotView: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySlotIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptySlotIconText: {
    fontSize: 28,
  },
  emptySlotTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySlotSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  // Workout picker
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#9CA3AF',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  distanceChip: {
    height: 24,
    backgroundColor: '#CFFAFE',
  },
  distance: {
    color: '#06B6D4',
    fontWeight: '600',
  },
  assignBtn: {
    marginTop: 12,
    borderRadius: 12,
  },
  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
  },
  lockedBadge: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lockedText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },
  // Workout recap
  recapSection: {
    marginTop: 4,
  },
  recapHeader: {
    marginBottom: 12,
  },
  recapTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  recapChips: {
    flexDirection: 'row',
    gap: 6,
  },
});
