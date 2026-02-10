import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clubService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  navigation: any;
}

export default function ClubSetupScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdClub, setCreatedClub] = useState<{ id: string; invitation_code: string } | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Le nom du club est requis');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const club = await clubService.create({
        name: name.trim(),
        description: description.trim() || null,
        owner_id: user.id,
      });
      setCreatedClub({ id: club.id, invitation_code: club.invitation_code });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation du club');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CoachApp' }],
    });
  };

  if (createdClub) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Club cree !
          </Text>

          <Card style={styles.successCard}>
            <Card.Content style={styles.successContent}>
              <Text variant="titleMedium" style={styles.successTitle}>
                {name}
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                Partagez ce code d'invitation a vos nageurs :
              </Text>
              <Chip
                icon="content-copy"
                style={styles.codeChip}
                textStyle={styles.codeText}
              >
                {createdClub.invitation_code}
              </Chip>
              <Text variant="bodySmall" style={styles.hint}>
                Les nageurs entreront ce code lors de leur inscription pour rejoindre votre club.
              </Text>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueBtn}
          >
            Acceder a mon espace coach
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Creez votre club
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Configurez votre club pour commencer a gerer vos entrainements.
        </Text>

        <TextInput
          label="Nom du club"
          placeholder="Ex: Swim Club Paris"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Description (optionnel)"
          placeholder="Decrivez votre club"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.createBtn}
        >
          Creer le club
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
    padding: 24,
    gap: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  createBtn: {
    marginTop: 8,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginTop: 16,
  },
  successContent: {
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#065F46',
    fontSize: 20,
  },
  successText: {
    color: '#374151',
    textAlign: 'center',
  },
  codeChip: {
    backgroundColor: '#CFFAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#115E59',
  },
  hint: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  continueBtn: {
    marginTop: 16,
  },
});
