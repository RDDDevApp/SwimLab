import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { groupService, workoutService, clubService } from '../../services';
import { Club } from '../../types';

export default function CoachDashboardScreen() {
  const { profile, user, clubId, signOut } = useAuthStore();
  const [groupCount, setGroupCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [club, setClub] = useState<Club | null>(null);

  const loadStats = useCallback(async () => {
    if (!user || !clubId) return;
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
    }
  }, [user, clubId]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
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
          </Card.Content>
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
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  codeLabel: {
    color: '#6B7280',
  },
  codeChip: {
    backgroundColor: '#CFFAFE',
  },
  clubDesc: {
    color: '#6B7280',
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
    color: '#06B6D4',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
