import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, Chip, ActivityIndicator } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { groupService, workoutService, clubService } from '../../services';
import { Club } from '../../types';

export default function CoachDashboardScreen({ navigation }: { navigation: any }) {
  const { profile, user, clubId, signOut } = useAuthStore();
  const [groupCount, setGroupCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user || !clubId) return;
    setLoading(true);
    try {
      const [groups, workouts, clubData] = await Promise.all([
        groupService.getByCoach(user.id),
        workoutService.getByCoach(user.id),
        clubService.getById(clubId),
      ]);
      setGroupCount(groups.length);
      setWorkoutCount(workouts.length);
      setClub(clubData);

      // Count unique swimmers across all groups
      const swimmerIds = new Set<string>();
      for (const group of groups) {
        try {
          const members = await groupService.getMembers(group.id);
          members.forEach((m) => swimmerIds.add(m.id));
        } catch {}
      }
      setSwimmerCount(swimmerIds.size);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, clubId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  return (
    <GradientScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={styles.greeting}>
              Bonjour, {profile?.first_name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Coach
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
          />
        </View>

        {club && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{club.name}</Text>
              <View style={styles.codeRow}>
                <Text variant="bodySmall" style={styles.codeLabel}>
                  Code d'invitation :
                </Text>
                <Chip compact style={styles.codeChip}>
                  {club.invitation_code}
                </Chip>
              </View>
              {club.description ? (
                <Text variant="bodySmall" style={styles.clubDesc}>
                  {club.description}
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Statistiques</Text>
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text variant="headlineLarge" style={styles.statValue}>
                  {groupCount}
                </Text>
                <Text variant="bodySmall">Groupes</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineLarge" style={styles.statValue}>
                  {swimmerCount}
                </Text>
                <Text variant="bodySmall">Nageurs</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineLarge" style={styles.statValue}>
                  {workoutCount}
                </Text>
                <Text variant="bodySmall">Seances</Text>
              </View>
            </View>
            )}
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CoachStats')}
              style={styles.statsButton}
            >
              Voir les statistiques
            </Button>
          </Card.Actions>
        </Card>

        <Button
          mode="outlined"
          onPress={signOut}
          style={styles.logoutButton}
          textColor="#EF4444"
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    color: '#64748b',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  codeLabel: {
    color: '#64748b',
  },
  codeChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
  },
  clubDesc: {
    color: '#64748b',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#0891B2',
    fontWeight: 'bold',
  },
  loader: {
    paddingVertical: 24,
  },
  statsButton: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
