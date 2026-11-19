import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Card, Chip } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import DemoAccountSwitcher from '../../components/DemoAccountSwitcher';
import InviteLinkActions from '../../components/InviteLinkActions';
import { clubService } from '../../services';
import { useAuthStore } from '../../stores/authStore';
import { C, FONTS } from '../../config/tokens';

interface Props {
  navigation: any;
}

export default function ClubSetupScreen({ navigation }: Props) {
  const { user, setClubId, signOut } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdClub, setCreatedClub] = useState<{ id: string; invitation_code: string; invitation_code_coach: string } | null>(null);

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
      setCreatedClub({ id: club.id, invitation_code: club.invitation_code, invitation_code_coach: club.invitation_code_coach });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du club');
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
            Club créé !
          </Text>

          <Card style={styles.successCard}>
            <Card.Content style={styles.successContent}>
              <Text variant="titleMedium" style={styles.successTitle}>
                {name}
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                Code nageur (pour tes nageurs) :
              </Text>
              <Chip
                icon="content-copy"
                style={styles.codeChip}
                textStyle={styles.codeText}
              >
                {createdClub.invitation_code}
              </Chip>
              <Text variant="bodyMedium" style={[styles.successText, { marginTop: 8 }]}>
                Code coach (pour les autres coachs) :
              </Text>
              <Chip
                icon="content-copy"
                style={styles.codeChipCoach}
                textStyle={styles.codeText}
              >
                {createdClub.invitation_code_coach}
              </Chip>
              <Text variant="bodySmall" style={styles.hint}>
                Envoie le lien nageur à tes nageurs et le lien coach à tes collègues : ils arriveront directement dans le club en s'inscrivant.
              </Text>
              <InviteLinkActions
                clubName={name}
                swimmerCode={createdClub.invitation_code}
                coachCode={createdClub.invitation_code_coach}
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueBtn}
          >
            Accéder à mon espace coach
          </Button>
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Crée ton club
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Configure ton club pour commencer à gérer tes entraînements.
        </Text>

        <TextInput
          label="Nom du club"
          placeholder="Ex. : Swim Club Paris"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Description (optionnel)"
          placeholder="Décris ton club"
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
          Créer le club
        </Button>

        <Button mode="text" onPress={signOut} style={styles.signOutBtn}>
          Se déconnecter
        </Button>

        <DemoAccountSwitcher />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  signOutBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontFamily: FONTS.display,
    color: C.ink,
    marginTop: 24,
  },
  subtitle: {
    color: C.inkMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
  },
  createBtn: {
    marginTop: 8,
  },
  successCard: {
    backgroundColor: C.surface,
    marginTop: 16,
  },
  successContent: {
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    fontFamily: FONTS.display,
    color: C.ink,
    fontSize: 20,
  },
  successText: {
    color: C.inkMuted,
    textAlign: 'center',
  },
  codeChip: {
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeChipCoach: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeText: {
    fontSize: 20,
    fontFamily: FONTS.display,
    letterSpacing: 2,
    color: C.primary,
  },
  hint: {
    color: C.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  continueBtn: {
    marginTop: 16,
  },
});
