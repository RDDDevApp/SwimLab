import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Checkbox, Button, Card, Chip, HelperText, Modal, Portal, RadioButton } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { Profile } from '../../types';
import {
  groupService,
  groupCoachService,
  workoutSessionService,
  workoutAssignmentService,
  notificationService,
  profileService,
} from '../../services';
import { presenceService, SessionPresence } from '../../services/presenceService';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
  route: any;
}

const EMPTY_PROFILES: Profile[] = [];
const EMPTY_COACHES: (Profile & { is_creator: boolean })[] = [];
const EMPTY_PRESENCE: Record<string, SessionPresence> = {};

/** Nageurs et coachs du groupe, et présences annoncées pour la séance (migration 014). */
async function fetchAttendanceData(groupId: string, assignmentId: string) {
  const [members, coaches] = await Promise.all([
    groupService.getMembers(groupId),
    groupCoachService.getCoachProfiles(groupId),
  ]);
  let declared: SessionPresence[] = [];
  try {
    declared = await presenceService.getByAssignment(assignmentId);
  } catch {}
  const presenceMap: Record<string, SessionPresence> = {};
  for (const p of declared) presenceMap[p.swimmer_id] = p;
  return { members, coaches, presenceMap };
}

export default function AttendanceScreen({ navigation, route }: Props) {
  const { assignmentId, groupId, workoutTitle } = route.params;
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const queryClient = useQueryClient();

  const [guestSwimmers, setGuestSwimmers] = useState<Profile[]>([]);
  const [attendedIds, setAttendedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Multi-coach: coach selection
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');

  // Guest swimmer modal
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<Profile[]>([]);

  // Liste du groupe, coachs et présences annoncées : chargés une fois à l'ouverture.
  // Pas de rechargement au retour sur l'écran : il effacerait les cases déjà cochées.
  // gcTime 0 : chaque ouverture repart de la base, pour que le pré-remplissage
  // tienne compte des absences signalées depuis la dernière ouverture.
  const { data, isLoading: loading, isError } = useQuery({
    queryKey: queryKeys.attendance(assignmentId),
    queryFn: () => fetchAttendanceData(groupId, assignmentId),
    staleTime: 0,
    gcTime: 0,
  });
  const swimmers = data?.members ?? EMPTY_PROFILES;
  const coaches = data?.coaches ?? EMPTY_COACHES;
  const presenceMap = data?.presenceMap ?? EMPTY_PRESENCE;

  // Pré-remplissage, une seule fois : tout le monde coché sauf les absences signalées
  const prefilled = useRef(false);
  useEffect(() => {
    if (!data || prefilled.current) return;
    prefilled.current = true;
    const absentIds = new Set(
      Object.values(data.presenceMap)
        .filter((p) => p.status === 'absent')
        .map((p) => p.swimmer_id),
    );
    setAttendedIds(new Set(data.members.map((m) => m.id).filter((id) => !absentIds.has(id))));
    // Coach présélectionné : soi-même si on encadre le groupe, sinon le seul coach
    if (user && data.coaches.some((c) => c.id === user.id)) {
      setSelectedCoachId(user.id);
    } else if (data.coaches.length === 1) {
      setSelectedCoachId(data.coaches[0].id);
    }
  }, [data, user]);

  const toggleSwimmer = (swimmerId: string) => {
    setAttendedIds((prev) => {
      const next = new Set(prev);
      if (next.has(swimmerId)) {
        next.delete(swimmerId);
      } else {
        next.add(swimmerId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = [...swimmers, ...guestSwimmers].map((m) => m.id);
    setAttendedIds(new Set(allIds));
  };

  const deselectAll = () => {
    setAttendedIds(new Set());
  };

  const handleAddGuest = async () => {
    if (!clubId) return;
    try {
      const clubMembers = await profileService.getSwimmersByClub(clubId);
      const memberIds = new Set(swimmers.map((s) => s.id));
      const guestIds = new Set(guestSwimmers.map((g) => g.id));
      const available = clubMembers.filter(
        (m) => !memberIds.has(m.id) && !guestIds.has(m.id),
      );
      setAvailableGuests(available);
      setShowGuestModal(true);
    } catch (err) {
      console.error('Error loading available guests:', err);
    }
  };

  const addGuestSwimmer = (guest: Profile) => {
    setGuestSwimmers((prev) => [...prev, guest]);
    setAttendedIds((prev) => new Set([...prev, guest.id]));
    setAvailableGuests((prev) => prev.filter((g) => g.id !== guest.id));
  };

  const removeGuest = (guestId: string) => {
    setGuestSwimmers((prev) => prev.filter((g) => g.id !== guestId));
    setAttendedIds((prev) => {
      const next = new Set(prev);
      next.delete(guestId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const allSwimmerIds = [...swimmers, ...guestSwimmers].map((s) => s.id);
      const attendedArray = Array.from(attendedIds);
      const guestIds = guestSwimmers.map((g) => g.id);

      await workoutSessionService.bulkCreateAttendance(
        assignmentId,
        allSwimmerIds,
        attendedArray,
        guestIds,
      );
      await workoutAssignmentService.markAttendance(
        assignmentId,
        selectedCoachId || undefined,
      );

      // Notification « feedback demandé » aux nageurs présents (sans bloquer l'émargement)
      notificationService.requestFeedback(assignmentId).catch(() => {});

      // Calendrier, tableau de bord et statistiques du coach à jour au retour
      queryClient.invalidateQueries({ queryKey: ['coach'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      showSnackbar('Émargement validé', 'success');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'émargement");
    } finally {
      setSubmitting(false);
    }
  };

  const allSwimmers = [...swimmers, ...guestSwimmers];
  const presentCount = attendedIds.size;
  const totalCount = allSwimmers.length;

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()}>
          Retour
        </Button>
        <Text variant="titleLarge" style={styles.title}>
          Émargement
        </Text>
        {workoutTitle && (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {workoutTitle}
          </Text>
        )}
      </View>

      {/* Coach selector (only if multiple coaches) */}
      {coaches.length > 1 && (
        <View style={styles.coachSection}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Coach qui a donné la séance
          </Text>
          <RadioButton.Group onValueChange={setSelectedCoachId} value={selectedCoachId}>
            {coaches.map((coach) => (
              <View key={coach.id} style={styles.radioRow}>
                <RadioButton value={coach.id} />
                <Text variant="bodyMedium">
                  {coach.first_name} {coach.last_name}
                  {coach.is_creator ? ' (créateur)' : ''}
                </Text>
              </View>
            ))}
          </RadioButton.Group>
        </View>
      )}

      <View style={styles.statsBar}>
        <Chip icon="account-check" style={styles.statChip}>
          {presentCount}/{totalCount} présents
        </Chip>
        <View style={styles.quickActions}>
          <Button compact onPress={selectAll}>
            Tous
          </Button>
          <Button compact onPress={deselectAll}>
            Aucun
          </Button>
        </View>
      </View>

      <FlatList
        data={allSwimmers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isGuest = guestSwimmers.some((g) => g.id === item.id);
          return (
            <Card
              style={[
                styles.swimmerCard,
                attendedIds.has(item.id) && styles.presentCard,
              ]}
              onPress={() => toggleSwimmer(item.id)}
            >
              <Card.Content style={styles.swimmerRow}>
                <Checkbox
                  status={attendedIds.has(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleSwimmer(item.id)}
                />
                <Text variant="bodyLarge" style={styles.swimmerName}>
                  {item.first_name} {item.last_name}
                </Text>
                {presenceMap[item.id]?.status === 'absent' && (
                  <Chip compact style={styles.declaredAbsentChip} textStyle={styles.declaredAbsentText}>
                    {presenceMap[item.id].reason
                      ? `Absent · ${presenceMap[item.id].reason}`
                      : 'Absence signalée'}
                  </Chip>
                )}
                {presenceMap[item.id]?.status === 'present' && (
                  <Chip compact style={styles.declaredPresentChip} textStyle={styles.declaredPresentText}>
                    Confirmé
                  </Chip>
                )}
                {isGuest && (
                  <Chip compact style={styles.guestChip} onClose={() => removeGuest(item.id)}>
                    Invité
                  </Chip>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleAddGuest}
          icon="account-plus"
          style={styles.addGuestBtn}
        >
          Ajouter un nageur invité
        </Button>
        {error || isError ? (
          <HelperText type="error" visible>
            {error || 'Impossible de charger le groupe. Reviens en arrière et réessaie.'}
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting || loading}
          // Pas d'appel tant que le groupe n'est pas chargé : il serait enregistré vide
          disabled={submitting || loading || isError || totalCount === 0}
        >
          Valider l'émargement ({presentCount}/{totalCount})
        </Button>
      </View>

      {/* Guest swimmer modal */}
      <Portal>
        <Modal
          visible={showGuestModal}
          onDismiss={() => setShowGuestModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Ajouter un nageur invité
          </Text>
          {availableGuests.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucun nageur disponible
            </Text>
          ) : (
            <FlatList
              data={availableGuests}
              keyExtractor={(item) => item.id}
              style={styles.guestList}
              renderItem={({ item }) => (
                <Card
                  style={styles.guestCard}
                  onPress={() => addGuestSwimmer(item)}
                >
                  <Card.Content style={styles.swimmerRow}>
                    <Text variant="bodyLarge">
                      {item.first_name} {item.last_name}
                    </Text>
                    <Button compact icon="plus" onPress={() => addGuestSwimmer(item)}>
                      Ajouter
                    </Button>
                  </Card.Content>
                </Card>
              )}
            />
          )}
          <Button mode="outlined" onPress={() => setShowGuestModal(false)} style={styles.closeBtn}>
            Fermer
          </Button>
        </Modal>
      </Portal>
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
  coachSection: {
    padding: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  sectionLabel: {
    color: C.primary,
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  statChip: {
    backgroundColor: C.successSoft,
  },
  quickActions: {
    flexDirection: 'row',
  },
  list: {
    padding: 12,
  },
  swimmerCard: {
    backgroundColor: C.surface,
    marginBottom: 6,
  },
  presentCard: {
    backgroundColor: C.surface,
  },
  swimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swimmerName: {
    marginLeft: 8,
    color: C.ink,
    flex: 1,
  },
  guestChip: {
    backgroundColor: C.warningSoft,
  },
  declaredAbsentChip: {
    backgroundColor: C.dangerSoft,
  },
  declaredAbsentText: {
    color: C.danger,
    fontSize: 11,
  },
  declaredPresentChip: {
    backgroundColor: C.successSoft,
  },
  declaredPresentText: {
    color: C.success,
    fontSize: 11,
  },
  footer: {
    padding: 16,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    gap: 8,
  },
  addGuestBtn: {
    borderColor: C.primary,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: FONTS.display,
    marginBottom: 12,
  },
  emptyText: {
    color: C.inkMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  guestList: {
    maxHeight: 300,
  },
  guestCard: {
    backgroundColor: C.surfaceSunken,
    marginBottom: 6,
  },
  closeBtn: {
    marginTop: 12,
  },
});
