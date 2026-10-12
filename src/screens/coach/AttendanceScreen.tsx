import React, { useState, useEffect } from 'react';
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

interface Props {
  navigation: any;
  route: any;
}

export default function AttendanceScreen({ navigation, route }: Props) {
  const { assignmentId, groupId, workoutTitle } = route.params;
  const { user, clubId } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);

  const [swimmers, setSwimmers] = useState<Profile[]>([]);
  const [guestSwimmers, setGuestSwimmers] = useState<Profile[]>([]);
  const [attendedIds, setAttendedIds] = useState<Set<string>>(new Set());
  const [presenceMap, setPresenceMap] = useState<Record<string, SessionPresence>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Multi-coach: coach selection
  const [coaches, setCoaches] = useState<(Profile & { is_creator: boolean })[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');

  // Guest swimmer modal
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<Profile[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [members, groupCoaches] = await Promise.all([
        groupService.getMembers(groupId),
        groupCoachService.getCoachProfiles(groupId),
      ]);
      setSwimmers(members);
      setCoaches(groupCoaches);

      // Pre-remplissage depuis les presences declarees (migration 014) :
      // tout le monde coche par defaut, sauf les absences signalees
      let declared: SessionPresence[] = [];
      try {
        declared = await presenceService.getByAssignment(assignmentId);
      } catch {}
      const map: Record<string, SessionPresence> = {};
      for (const p of declared) map[p.swimmer_id] = p;
      setPresenceMap(map);

      const absentIds = new Set(
        declared.filter((p) => p.status === 'absent').map((p) => p.swimmer_id),
      );
      setAttendedIds(new Set(members.map((m) => m.id).filter((id) => !absentIds.has(id))));
      // Pre-select current user as coach if they are a coach of the group
      if (user && groupCoaches.some((c) => c.id === user.id)) {
        setSelectedCoachId(user.id);
      } else if (groupCoaches.length === 1) {
        setSelectedCoachId(groupCoaches[0].id);
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

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

      // Send push notifications to attended swimmers for feedback
      try {
        await notificationService.notifyFeedbackRequired(
          attendedArray,
          workoutTitle || 'la séance',
        );
      } catch {}

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
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
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
  coachSection: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  sectionLabel: {
    color: '#0891b2',
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.60)',
  },
  statChip: {
    backgroundColor: '#D1FAE5',
  },
  quickActions: {
    flexDirection: 'row',
  },
  list: {
    padding: 12,
  },
  swimmerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 6,
  },
  presentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  swimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swimmerName: {
    marginLeft: 8,
    color: '#1e293b',
    flex: 1,
  },
  guestChip: {
    backgroundColor: '#FEF3C7',
  },
  declaredAbsentChip: {
    backgroundColor: '#FEE2E2',
  },
  declaredAbsentText: {
    color: '#991B1B',
    fontSize: 11,
  },
  declaredPresentChip: {
    backgroundColor: '#D1FAE5',
  },
  declaredPresentText: {
    color: '#065F46',
    fontSize: 11,
  },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.60)',
    gap: 8,
  },
  addGuestBtn: {
    borderColor: '#0891b2',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 24,
  },
  guestList: {
    maxHeight: 300,
  },
  guestCard: {
    backgroundColor: '#f1f5f9',
    marginBottom: 6,
  },
  closeBtn: {
    marginTop: 12,
  },
});
