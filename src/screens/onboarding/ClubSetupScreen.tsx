import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Card, Chip } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { clubService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  navigation: any;
}

export default function ClubSetupScreen({ navigation }: Props) {
  const { user, setClubId } = useAuthStore();
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
      setClubId(club.id);
      setCreatedClub({ id: club.id, invitation_code: club.invitation_code });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation du club');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // clubId is already set in authStore, AppNavigator will re-render automatically
  };

  if (createdClub) {
    return (
      <GradientScreen>
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
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
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
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.20)',
  },
  createBtn: {
    marginTop: 8,
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 16,
  },
  successContent: {
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 20,
  },
  successText: {
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
  },
  codeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#00C9DB',
  },
  hint: {
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    marginTop: 4,
  },
  continueBtn: {
    marginTop: 16,
  },
});
