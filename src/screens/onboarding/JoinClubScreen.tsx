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
  const [joinedRole, setJoinedRole] = useState<'coach' | 'swimmer'>('swimmer');

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Le code d'invitation est requis");
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { club, detectedRole } = await clubService.joinByCode(code.trim().toLowerCase(), user.id, 'swimmer');
      setClubId(club.id);
      setJoinedClubName(club.name);
      setJoinedRole(detectedRole);
    } catch (err: any) {
      setError(err.message || 'Code invalide ou erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // clubId est deja mis a jour dans authStore ; on revient a l'ecran precedent
    // (le dashboard se recharge au focus et bascule en mode club)
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
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
                {joinedRole === 'coach'
                  ? 'Vous avez rejoint en tant que coach. Vous pouvez maintenant gerer les groupes et entrainements.'
                  : "Votre coach vous ajoutera a un groupe d'entrainement. Vous verrez ensuite vos seances dans le calendrier."}
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
          onPress={() => {
            if (onSkip) {
              onSkip();
            } else if (navigation?.canGoBack?.()) {
              navigation.goBack();
            }
          }}
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
    color: '#1e293b',
    marginTop: 24,
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  joinBtn: {
    marginTop: 8,
  },
  skipBtn: {
    marginTop: 8,
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.60)',
    marginTop: 16,
  },
  successContent: {
    gap: 8,
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  successText: {
    color: '#64748b',
  },
  continueBtn: {
    marginTop: 16,
  },
});
