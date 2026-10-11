import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import { useAuthStore } from '../../stores/authStore';
import { useSnackbarStore } from '../../stores/snackbarStore';

/** Affiché quand l'app est ouverte depuis le lien « mot de passe oublié ». */
export default function ResetPasswordScreen() {
  const { updatePassword } = useAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setSaving(true);
    const { error: updateError } = await updatePassword(password);
    setSaving(false);
    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes('different')
          ? "Choisis un mot de passe différent de l'ancien."
          : "Le mot de passe n'a pas pu être changé. Redemande un lien et réessaie.",
      );
      return;
    }
    showSnackbar('Mot de passe modifié. Tu es connecté.', 'success');
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.title}>
            Nouveau mot de passe
          </Text>
          <Text style={styles.text}>Choisis le mot de passe que tu utiliseras pour te connecter.</Text>
          <TextInput
            label="Nouveau mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            right={
              <TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />
            }
            style={styles.input}
          />
          <TextInput
            label="Confirmer le mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            style={styles.input}
          />
          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
            Enregistrer le mot de passe
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
    gap: 14,
  },
  title: {
    color: '#0891B2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
});
