import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'coach' | 'swimmer'>('swimmer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signUp, isLoading } = useAuthStore();

  const handleRegister = async () => {
    setError('');

    // Validation
    if (!email || !password || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    const { error } = await signUp(email, password, {
      firstName,
      lastName,
      role,
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              SwimLab
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Creer un compte
            </Text>
          </View>

          <View style={styles.form}>
            <Text variant="labelLarge" style={styles.roleLabel}>
              Je suis :
            </Text>
            <SegmentedButtons
              value={role}
              onValueChange={(value) => setRole(value as 'coach' | 'swimmer')}
              buttons={[
                { value: 'swimmer', label: 'Nageur', icon: 'swim' },
                { value: 'coach', label: 'Coach', icon: 'whistle' },
              ]}
              style={styles.segmented}
            />

            <TextInput
              label="Prenom"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
            />

            <TextInput
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
            />

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

            <TextInput
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              S'inscrire
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Deja un compte ? Se connecter
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#06B6D4',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  roleLabel: {
    color: '#374151',
    marginBottom: -8,
  },
  segmented: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 8,
  },
});
