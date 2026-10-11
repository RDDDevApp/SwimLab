import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import DemoAccountSwitcher from '../../components/DemoAccountSwitcher';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signIn, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
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
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setError('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
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
          <Text variant="displaySmall" style={styles.title}>
            SwimLab
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
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

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
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
    color: '#0891B2',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 8,
  },
});
