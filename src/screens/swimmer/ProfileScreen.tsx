import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, List, TextInput, HelperText, Switch } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { clubService, groupService, profileService } from '../../services';
import { useSnackbarStore } from '../../stores/snackbarStore';
import { Club } from '../../types';

export default function SwimmerProfileScreen() {
  const { profile, user, clubId, setClubId, signOut } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [club, setClub] = useState<Club | null>(null);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Join club state
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const loadInfo = useCallback(async () => {
    if (!user) return;
    try {
      if (clubId) {
        const clubData = await clubService.getById(clubId);
        setClub(clubData);
      }
      const groups = await groupService.getBySwimmer(user.id);
      setGroupNames(groups.map((g) => g.name));
    } catch (err) {
      console.error('Error loading profile info:', err);
    }
  }, [user, clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInfo();
    setRefreshing(false);
  }, [loadInfo]);

  useFocusEffect(
    useCallback(() => {
      loadInfo();
    }, [loadInfo]),
  );

  const handleJoinClub = async () => {
    if (!joinCode.trim()) {
      setJoinError("Le code d'invitation est requis");
      return;
    }
    if (!user) return;

    setJoinLoading(true);
    setJoinError('');

    try {
      const joinedClub = await clubService.joinByCode(joinCode.trim().toLowerCase(), user.id, 'swimmer');
      setClubId(joinedClub.id);
      setClub(joinedClub);
      setJoinCode('');
      showSnackbar(`Vous avez rejoint ${joinedClub.name}`, 'success');
    } catch (err: any) {
      setJoinError(err.message || "Code invalide ou erreur de connexion");
    } finally {
      setJoinLoading(false);
    }
  };

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
            Nageur
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              titleStyle={{ color: '#FFFFFF' }}
              descriptionStyle={{ color: 'rgba(255,255,255,0.50)' }}
            />
            <List.Item
              title="Membre depuis"
              description={new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              titleStyle={{ color: '#FFFFFF' }}
              descriptionStyle={{ color: 'rgba(255,255,255,0.50)' }}
            />
          </Card.Content>
        </Card>

        {club ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>Mon club</Text>
              <List.Item
                title={club.name}
                description={club.description || undefined}
                left={(props) => <List.Icon {...props} icon="shield-outline" />}
                titleStyle={{ color: '#FFFFFF' }}
                descriptionStyle={{ color: 'rgba(255,255,255,0.50)' }}
              />
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.joinCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.joinTitle}>
                Rejoindre un club
              </Text>
              <Text variant="bodyMedium" style={styles.joinSubtitle}>
                Entrez le code d'invitation fourni par votre coach.
              </Text>
              <TextInput
                label="Code d'invitation"
                placeholder="Ex: AB12CD34"
                value={joinCode}
                onChangeText={setJoinCode}
                mode="outlined"
                style={styles.joinInput}
                autoCapitalize="none"
              />
              {joinError ? (
                <HelperText type="error" visible>
                  {joinError}
                </HelperText>
              ) : null}
              <Button
                mode="contained"
                onPress={handleJoinClub}
                loading={joinLoading}
                disabled={joinLoading}
                style={styles.joinBtn}
              >
                Rejoindre le club
              </Button>
            </Card.Content>
          </Card>
        )}

        {groupNames.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>Mes groupes</Text>
              {groupNames.map((name) => (
                <List.Item
                  key={name}
                  title={name}
                  left={(props) => <List.Icon {...props} icon="account-group" />}
                  titleStyle={{ color: '#FFFFFF' }}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>Notifications</Text>
            <List.Item
              title="Rappels d'entrainement"
              description="1h avant chaque seance"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              titleStyle={{ color: '#FFFFFF' }}
              descriptionStyle={{ color: 'rgba(255,255,255,0.50)' }}
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
              titleStyle={{ color: '#FFFFFF' }}
              descriptionStyle={{ color: 'rgba(255,255,255,0.50)' }}
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
    backgroundColor: '#F43F8E',
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  role: {
    color: 'rgba(255,255,255,0.50)',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 16,
  },
  joinCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  joinTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  joinSubtitle: {
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 12,
  },
  joinInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  joinBtn: {
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
