import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

export default function SwimmerDashboardScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={styles.greeting}>
              Bonjour, {profile?.first_name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Nageur
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`}
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Bienvenue sur SwimLab</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Rejoignez un club avec le code d'invitation fourni par votre coach.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Rejoindre un club</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Prochains entrainements</Text>
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Aucun entrainement a venir
              </Text>
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
  cardText: {
    marginTop: 8,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#EF4444',
  },
});
