import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, List, Chip, Switch } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { clubService, profileService } from '../../services';
import { Club } from '../../types';

export default function ProfileScreen() {
  const { profile, user, clubId, signOut } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [club, setClub] = useState<Club | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const copyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showSnackbar('Code copie dans le presse-papier', 'success');
    } catch {
      // Fallback: show code in snackbar so user can copy manually
      showSnackbar(`Code : ${code}`, 'success');
    }
  };

  const loadClubInfo = useCallback(async () => {
    if (!clubId) return;
    try {
      const [clubData, members] = await Promise.all([
        clubService.getById(clubId),
        clubService.getMembers(clubId),
      ]);
      setClub(clubData);
      setMemberCount(members.length);
    } catch (err) {
      console.error('Error loading club info:', err);
    }
  }, [clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClubInfo();
    setRefreshing(false);
  }, [loadClubInfo]);

  useFocusEffect(
    useCallback(() => {
      loadClubInfo();
    }, [loadClubInfo]),
  );

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text variant="bodyMedium" style={styles.role}>
            Coach
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            <List.Item
              title="Membre depuis"
              description={new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
          </Card.Content>
        </Card>

        {club && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Mon club</Text>
              <List.Item
                title={club.name}
                description={club.description || undefined}
                left={(props) => <List.Icon {...props} icon="shield-outline" />}
              />
              <View style={styles.codeRow}>
                <Text variant="bodySmall" style={styles.codeLabel}>
                  Code nageur :
                </Text>
                <Chip
                  compact
                  style={styles.codeChip}
                  onPress={() => copyInvitationCode(club.invitation_code)}
                  icon="content-copy"
                >
                  {club.invitation_code}
                </Chip>
              </View>
              <View style={styles.codeRow}>
                <Text variant="bodySmall" style={styles.codeLabel}>
                  Code coach :
                </Text>
                <Chip
                  compact
                  style={styles.codeChipCoach}
                  onPress={() => copyInvitationCode(club.invitation_code_coach)}
                  icon="content-copy"
                >
                  {club.invitation_code_coach}
                </Chip>
              </View>
              <List.Item
                title="Membres"
                description={`${memberCount} membre${memberCount > 1 ? 's' : ''}`}
                left={(props) => <List.Icon {...props} icon="account-group" />}
              />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Notifications</Text>
            <List.Item
              title="Rappels d'entrainement"
              description="1h avant chaque seance"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              right={() => (
                <Switch
                  value={profile?.notification_reminder ?? true}
                  onValueChange={async (val) => {
                    if (!user) return;
                    try {
                      await profileService.update(user.id, { notification_reminder: val });
                      useAuthStore.getState().fetchProfile();
                    } catch {}
                  }}
                />
              )}
            />
            <List.Item
              title="Demandes de feedback"
              description="Apres chaque emargement"
              left={(props) => <List.Icon {...props} icon="comment-outline" />}
              right={() => (
                <Switch
                  value={profile?.notification_feedback ?? true}
                  onValueChange={async (val) => {
                    if (!user) return;
                    try {
                      await profileService.update(user.id, { notification_feedback: val });
                      useAuthStore.getState().fetchProfile();
                    } catch {}
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.logoutButton}
          textColor="#EF4444"
          icon="logout"
        >
          Se deconnecter
        </Button>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    backgroundColor: '#0891B2',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  codeLabel: {
    color: '#64748b',
  },
  codeChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
  },
  codeChipCoach: {
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
