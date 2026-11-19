import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Chip, RadioButton, IconButton } from 'react-native-paper';
import { queryKeys, useCoachWorkouts, useRefreshOnFocus } from '../../hooks';
import { WorkoutAssignment } from '../../types';
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

import { Ionicons } from '@expo/vector-icons';
import { C, FONTS } from '../../config/tokens';
import { getRPEColor, getRPETextColor } from '../../config/theme';
interface Props {
  navigation: any;
  route: any;
}

const getRpeColor = (rpe: number) => ({
  bg: getRPEColor(rpe),
  text: getRPETextColor(rpe),
});

/** Séance, état de l'émargement et bilan des ressentis d'une séance attribuée. */
async function fetchAssignmentDetail(assignmentId: string, workoutId: string) {
  const [workout, assignment] = await Promise.all([
    workoutService.getById(workoutId).catch(() => null),
    workoutAssignmentService.getById(assignmentId).catch(() => null),
  ]);
  let feedbackStats: GroupFeedbackStats | null = null;
  if (assignment?.attendance_marked) {
    feedbackStats = await workoutSessionService.getFeedbackStats(assignmentId).catch(() => null);
  }
  return { workout, assignment, feedbackStats };
}

export default function SessionDetailModal({ navigation, route }: Props) {
  const { slot, date, assignment: initialAssignment, workoutTitle: initialTitle } = route.params;
  const { user } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const queryClient = useQueryClient();

  // Séance attribuée au créneau ce jour-là : celle reçue en ouvrant, ou celle qu'on vient d'attribuer
  const [current, setCurrent] = useState<WorkoutAssignment | null>(initialAssignment);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const groupQuery = useQuery({
    queryKey: queryKeys.group(slot.group_id),
    queryFn: () => groupService.getById(slot.group_id),
  });
  const groupName = groupQuery.data?.name ?? '';

  // Détail de la séance attribuée : séance, émargement à jour et bilan des ressentis
  const detailQuery = useQuery({
    queryKey: queryKeys.sessionDetail(current?.id ?? ''),
    queryFn: () => fetchAssignmentDetail(current!.id, current!.workout_id),
    enabled: !!current,
  });
  // refetch() ignore « enabled » : ne rien relancer quand le créneau est vide
  useRefreshOnFocus(() => {
    if (current) detailQuery.refetch();
  });

  // Séances publiées, pour en attribuer une quand le créneau est vide
  const workoutsQuery = useCoachWorkouts(current ? undefined : user?.id);
  const publishedWorkouts = (workoutsQuery.data ?? []).filter((w) => w.is_published);

  const assignment = current ? (detailQuery.data?.assignment ?? current) : null;
  const workout = current ? (detailQuery.data?.workout ?? null) : null;
  const feedbackStats = current ? (detailQuery.data?.feedbackStats ?? null) : null;
  const loading = current ? detailQuery.isLoading : workoutsQuery.isLoading;

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
      setCurrent(newAssignment);
      // Calendrier, tableau de bord et statistiques du coach à jour au retour
      queryClient.invalidateQueries({ queryKey: ['coach'] });
      showSnackbar('Séance assignée', 'success');
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
      setCurrent(null);
      setShowPicker(true);
      queryClient.invalidateQueries({ queryKey: ['coach'] });
      showSnackbar('Assignation supprimée', 'info');
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
                  <Ionicons name="clipboard-outline" size={28} color={C.onPrimarySoft} />
                </View>
                <Text variant="titleMedium" style={styles.emptySlotTitle}>
                  Aucune séance assignée
                </Text>
                <Text variant="bodyMedium" style={styles.emptySlotSubtitle}>
                  Ce créneau n'a pas encore de séance d'entraînement.
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => setShowPicker(true)}
                  style={styles.assignBtn}
                >
                  Assigner une séance
                </Button>
              </View>
            ) : !assignment && showPicker ? (
              /* Workout picker */
              <View>
                <View style={styles.pickerHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Choisir une séance
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
                      Aucune séance publiée
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
                      Créer une séance
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
                      Assigner la séance
                    </Button>
                  </View>
                )}
              </View>
            ) : (
              /* Assignment exists */
              <View>
                {/* Action buttons */}
                <View style={styles.actionRow}>
                  {!assignment!.attendance_marked ? (
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
                        Émarger
                      </Button>
                    </>
                  ) : (
                    <>
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedText}>Séance verrouillée</Text>
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
                {assignment!.attendance_marked && feedbackStats && (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text variant="bodySmall" style={styles.statLabel}>Présents</Text>
                      <Text variant="titleMedium" style={styles.statValue}>
                        {feedbackStats.attended_count}/{feedbackStats.total_swimmers}
                      </Text>
                    </View>
                    {feedbackStats.average_rpe != null && (() => {
                      const colors = getRpeColor(feedbackStats.average_rpe!);
                      return (
                        <View style={[styles.statItem, { backgroundColor: colors.bg }]}>
                          <Text variant="bodySmall" style={[styles.statLabel, { color: colors.text }]}>
                            RPE moy.
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
                      Séance assignée
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
    backgroundColor: C.scrim,
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: C.surface,
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
    borderBottomColor: 'transparent',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
  },
  subtitle: {
    color: C.inkMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  infoChip: {
    backgroundColor: C.surface,
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
    fontFamily: FONTS.display,
    color: C.ink,
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
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptySlotTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 4,
  },
  emptySlotSubtitle: {
    color: C.inkMuted,
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
    color: C.inkMuted,
  },
  workoutCard: {
    backgroundColor: C.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: C.primary,
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
    fontFamily: FONTS.display,
    color: C.ink,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    height: 24,
    backgroundColor: C.surface,
  },
  distanceChip: {
    height: 24,
    backgroundColor: C.primarySoft,
  },
  distance: {
    color: C.primary,
    fontFamily: FONTS.textStrong,
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
    backgroundColor: C.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lockedText: {
    color: C.inkMuted,
    fontFamily: FONTS.textStrong,
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
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: C.inkMuted,
    fontFamily: FONTS.textMedium,
  },
  statValue: {
    fontFamily: FONTS.textBold,
    color: C.ink,
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
    fontFamily: FONTS.display,
    color: C.ink,
    marginBottom: 6,
  },
  recapChips: {
    flexDirection: 'row',
    gap: 6,
  },
});
