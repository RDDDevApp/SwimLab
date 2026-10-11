import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import GlassCard from '../../components/GlassCard';
import { useAuthStore } from '../../stores/authStore';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { requestPasswordReset } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Saisis une adresse email valide.');
      return;
    }
    setError('');
    setSending(true);
    const { error: resetError } = await requestPasswordReset(email.trim());
    setSending(false);
    if (resetError) {
      const msg = resetError.message.toLowerCase();
      setError(
        msg.includes('rate') || msg.includes('seconds')
          ? 'Trop de demandes. Patiente quelques minutes avant de réessayer.'
          : "L'email n'a pas pu être envoyé. Réessaie dans un instant.",
      );
      return;
    }
    // Même réponse que l'adresse existe ou non, pour ne pas révéler les comptes
    setSent(true);
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.title}>
            Mot de passe oublié
          </Text>

          {sent ? (
            <GlassCard elevated>
              <View style={styles.sentBody}>
                <Ionicons name="mail-unread-outline" size={36} color="#0891B2" />
                <Text style={styles.sentTitle}>Vérifie ta boîte mail</Text>
                <Text style={styles.text}>
                  Si un compte existe pour {email.trim()}, tu vas recevoir un lien pour choisir un
                  nouveau mot de passe. Pense à regarder dans les indésirables.
                </Text>
              </View>
            </GlassCard>
          ) : (
            <View style={styles.form}>
              <Text style={styles.text}>
                Saisis l'adresse de ton compte : on t'envoie un lien pour choisir un nouveau mot de passe.
              </Text>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />
              {error ? (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              ) : null}
              <Button mode="contained" onPress={handleSend} loading={sending} disabled={sending}>
                Envoyer le lien
              </Button>
            </View>
          )}

          <Button mode="text" onPress={() => navigation.navigate('Login')}>
            Retour à la connexion
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  title: {
    color: '#0891B2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  text: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  sentBody: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
});
