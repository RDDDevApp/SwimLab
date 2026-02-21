import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Card } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { clubService } from '../../services';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  navigation: any;
  onSkip?: () => void;
}

export default function JoinClubScreen({ navigation, onSkip }: Props) {
  const { user, setClubId } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedClubName, setJoinedClubName] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) {
      setError('Le code d\'invitation est requis');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const club = await clubService.joinByCode(code.trim().toLowerCase(), user.id, 'swimmer');
      setClubId(club.id);
      setJoinedClubName(club.name);
    } catch (err: any) {
      setError(err.message || 'Code invalide ou erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // clubId is already set in authStore, AppNavigator will re-render automatically
  };

  if (joinedClubName) {
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Bienvenue !
          </Text>

          <Card style={styles.successCard}>
            <Card.Content style={styles.successContent}>
              <Text variant="titleMedium" style={styles.successTitle}>
                Vous avez rejoint {joinedClubName}
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                Votre coach vous ajoutera a un groupe d'entrainement. Vous verrez ensuite vos seances dans le calendrier.
              </Text>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueBtn}
          >
            Acceder a mon espace
          </Button>
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Rejoindre un club
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Entrez le code d'invitation fourni par votre coach.
        </Text>

        <TextInput
          label="Code d'invitation"
          placeholder="Ex: AB12CD34"
          value={code}
          onChangeText={setCode}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
        />

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleJoin}
          loading={loading}
          disabled={loading}
          style={styles.joinBtn}
        >
          Rejoindre le club
        </Button>

        <Button
          mode="text"
          onPress={() => onSkip?.()}
          style={styles.skipBtn}
        >
          Passer pour le moment
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
  joinBtn: {
    marginTop: 8,
  },
  skipBtn: {
    marginTop: 8,
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 16,
  },
  successContent: {
    gap: 8,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successText: {
    color: 'rgba(255,255,255,0.50)',
  },
  continueBtn: {
    marginTop: 16,
  },
});
