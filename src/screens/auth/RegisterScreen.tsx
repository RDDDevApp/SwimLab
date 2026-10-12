import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import GlassCard from '../../components/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { getInviteCodeFromUrl, normalizeInviteCode } from '../../utils/invite';

type Step = 0 | 1 | 2 | 3;
const STEP_LABELS = ['Rôle', 'Club', 'Identité', 'Sécurité'];

/** Inscription multi-etapes : role -> club -> identite -> mot de passe, avec stepper. */
export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<'coach' | 'swimmer' | null>(null);
  // Un lien d'invitation (…?club=code) pre-remplit le code du club
  const [clubCode, setClubCode] = useState(() => getInviteCodeFromUrl() ?? '');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signUp, isLoading } = useAuthStore();

  const selectRole = (r: 'coach' | 'swimmer') => {
    setRole(r);
    setError('');
    setStep(1);
  };

  const validateIdentity = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez renseigner votre prenom et votre nom');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    setError('');
    setStep(3);
  };

  const validateClub = (withCode: boolean) => {
    if (withCode && !clubCode.trim()) {
      setError('Saisis le code reçu de ton club, ou choisis de continuer sans code.');
      return;
    }
    if (!withCode) setClubCode('');
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError('');

    const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'swimmer',
      inviteCode: clubCode.trim() ? normalizeInviteCode(clubCode) : undefined,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (needsEmailConfirmation) {
      setAwaitingConfirmation(true);
    }
  };

  const goBack = () => {
    setError('');
    if (step === 0) {
      navigation.navigate('Login');
    } else {
      setStep((step - 1) as Step);
    }
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {awaitingConfirmation ? (
            <GlassCard elevated>
              <View style={styles.confirmBody}>
                <Ionicons name="mail-unread-outline" size={36} color="#0891B2" />
                <Text style={styles.roleTitle}>Vérifie ta boîte mail</Text>
                <Text style={styles.roleDesc}>
                  Un lien de confirmation a été envoyé à {email}. Clique dessus, puis connecte-toi.
                  {clubCode.trim() ? ' Tu rejoindras ton club automatiquement à la première connexion.' : ''}
                </Text>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.button}>
                  Aller à la connexion
                </Button>
              </View>
            </GlassCard>
          ) : (
          <>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              SwimLab
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Creer un compte
            </Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepper}>
            {STEP_LABELS.map((label, i) => (
              <View key={label} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    i === step && styles.stepDotActive,
                    i < step && styles.stepDotDone,
                  ]}
                >
                  {i < step ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Etape 0 : choix du role */}
          {step === 0 && (
            <View style={styles.form}>
              <Text variant="titleMedium" style={styles.stepTitle}>
                Je suis...
              </Text>
              <Pressable onPress={() => selectRole('swimmer')}>
                <GlassCard elevated style={styles.roleCard}>
                  <View style={[styles.roleIcon, { backgroundColor: 'rgba(8, 145, 178, 0.12)' }]}>
                    <Ionicons name="water" size={28} color="#0891B2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Nageur / Nageuse</Text>
                    <Text style={styles.roleDesc}>
                      Je rejoins mon club, je vois mes seances et je donne mes ressentis.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </GlassCard>
              </Pressable>
              <Pressable onPress={() => selectRole('coach')}>
                <GlassCard elevated style={styles.roleCard}>
                  <View style={[styles.roleIcon, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                    <Ionicons name="megaphone" size={26} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Coach</Text>
                    <Text style={styles.roleDesc}>
                      Je cree mon club, je gere mes groupes et je planifie les entrainements.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </GlassCard>
              </Pressable>
            </View>
          )}

          {/* Etape 1 : club */}
          {step === 1 && (
            <View style={styles.form}>
              <Text variant="titleMedium" style={styles.stepTitle}>
                {role === 'coach' ? 'Tu rejoins un club existant ?' : 'Ton club'}
              </Text>
              <Text style={styles.stepHint}>
                {role === 'coach'
                  ? "Si le responsable de ton club t'a donné un code coach, saisis-le. Sinon, tu créeras ton club juste après l'inscription."
                  : "Ton coach t'a donné un code ? Saisis-le pour arriver directement dans ton club."}
              </Text>
              <TextInput
                label={role === 'coach' ? 'Code coach du club' : 'Code du club'}
                value={clubCode}
                onChangeText={setClubCode}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
              {error ? (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              ) : null}
              <Button mode="contained" onPress={() => validateClub(true)} style={styles.button}>
                Continuer avec ce code
              </Button>
              <Button mode="outlined" onPress={() => validateClub(false)}>
                {role === 'coach' ? 'Je crée mon club' : "Je n'ai pas de code : nager en solo"}
              </Button>
            </View>
          )}

          {/* Etape 2 : identite */}
          {step === 2 && (
            <View style={styles.form}>
              <Text variant="titleMedium" style={styles.stepTitle}>
                Qui etes-vous ?
              </Text>
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
              {error ? (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              ) : null}
              <Button mode="contained" onPress={validateIdentity} style={styles.button}>
                Continuer
              </Button>
            </View>
          )}

          {/* Etape 3 : mot de passe */}
          {step === 3 && (
            <View style={styles.form}>
              <Text variant="titleMedium" style={styles.stepTitle}>
                Choisissez un mot de passe
              </Text>
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
                <HelperText type="error" visible>
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
                Creer mon compte
              </Button>
            </View>
          )}

          <Button mode="text" onPress={goBack} style={styles.linkButton}>
            {step === 0 ? 'Déjà un compte ? Se connecter' : 'Retour'}
          </Button>
          </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  stepHint: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginTop: -8,
  },
  confirmBody: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
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
    marginBottom: 24,
  },
  title: {
    color: '#0891B2',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748b',
    marginTop: 8,
  },
  // Stepper
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 28,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#0891B2',
  },
  stepDotDone: {
    backgroundColor: '#059669',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  stepNumActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stepLabelActive: {
    color: '#0891B2',
  },
  // Form
  form: {
    gap: 16,
  },
  stepTitle: {
    color: '#1e293b',
    fontWeight: '700',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 17,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 16,
  },
});
