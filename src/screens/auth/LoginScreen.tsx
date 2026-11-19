import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import DemoAccountSwitcher from '../../components/DemoAccountSwitcher';
import { useAuthStore } from '../../stores/authStore';
import { C, FONTS } from '../../config/tokens';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signIn, isLoading, authLinkError, clearAuthLinkError } = useAuthStore();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Remplis tous les champs.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Saisis une adresse email valide.');
      return;
    }

    const result = await signIn(email, password);
    if (result.error) {
      // Map Supabase error messages to French
      const msg = result.error.message?.toLowerCase() || '';
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid') ||
        msg.includes('unauthorized') ||
        msg.includes('wrong password') ||
        msg.includes('user not found')
      ) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('email not confirmed')) {
        setError('Confirme ton adresse email avant de te connecter (clique sur le lien reçu par mail).');
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setError('Trop de tentatives. Réessaie dans quelques minutes.');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    }
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {/* « La vague » : l'image de la marque, toujours en grand et sans texte dessus */}
          <Image
            source={require('../../../assets/vague-swimlab.webp')}
            style={styles.illustration}
            accessibilityIgnoresInvertColors
            alt=""
          />
          <Text variant="displaySmall" style={styles.title}>
            SwimLab
          </Text>
          <Text variant="bodyLarge" style={styles.tagline}>
            Chaque longueur compte.
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Connexion
          </Text>
        </View>

        <View style={styles.form}>
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

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {error || authLinkError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error || authLinkError}</Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Se connecter
          </Button>

          <Button
            mode="text"
            compact
            onPress={() => {
              clearAuthLinkError();
              navigation.navigate('ForgotPassword');
            }}
          >
            Mot de passe oublié ?
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            Pas encore de compte ? S'inscrire
          </Button>
        </View>

        <DemoAccountSwitcher />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: C.ink,
    fontFamily: FONTS.display,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 28,
    marginBottom: 24,
  },
  tagline: {
    color: C.inkMuted,
    marginTop: 4,
  },
  subtitle: {
    color: C.ink,
    marginTop: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: C.surface,
  },
  errorBanner: {
    backgroundColor: C.dangerSoft,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: C.danger,
    fontSize: 14,
    fontFamily: FONTS.textMedium,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 8,
  },
});
