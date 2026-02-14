import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { clubService, groupService } from '../../services';
import { Club } from '../../types';

export default function SwimmerProfileScreen() {
  const { profile, user, clubId, signOut } = useAuthStore();
  const [club, setClub] = useState<Club | null>(null);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
            Nageur
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
            </Card.Content>
          </Card>
        )}

        {groupNames.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Mes groupes</Text>
              {groupNames.map((name) => (
                <List.Item
                  key={name}
                  title={name}
                  left={(props) => <List.Icon {...props} icon="account-group" />}
                />
              ))}
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
    backgroundColor: '#EC4899',
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
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
