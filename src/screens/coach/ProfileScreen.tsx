import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { clubService } from '../../services';
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
                  Code d'invitation :
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
              <List.Item
                title="Membres"
                description={`${memberCount} membre${memberCount > 1 ? 's' : ''}`}
                left={(props) => <List.Icon {...props} icon="account-group" />}
              />
            </Card.Content>
          </Card>
        )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    backgroundColor: '#06B6D4',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  role: {
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
  },
  codeChip: {
    backgroundColor: '#CFFAFE',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
