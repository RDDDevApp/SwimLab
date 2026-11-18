import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import GlassCard from '../../components/GlassCard';
import { useAuthStore } from '../../stores/authStore';
import { getInviteCodeFromUrl, normalizeInviteCode } from '../../utils/invite';
import { parseBirthDate, needsParentalConsent } from '../../utils/age';
import { C, FONTS } from '../../config/tokens';

type Step = 0 | 1 | 2 | 3;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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
  // Nageurs : date de naissance, et sous 15 ans l'accord d'un parent (migration 023)
  const [birthDateText, setBirthDateText] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const isSwimmer = role !== 'coach';
  const birthDate = parseBirthDate(birthDateText);
  const isMinor = isSwimmer && !!birthDate && needsParentalConsent(birthDate);

  const validateIdentity = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Indique ton prénom et ton nom.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Saisis une adresse email valide.');
      return;
    }
    if (isSwimmer) {
      if (!birthDate) {
        setError('Indique ta date de naissance au format JJ/MM/AAAA.');
        return;
      }
      if (isMinor) {
        if (!EMAIL_REGEX.test(parentEmail)) {
          setError("Indique l'adresse email d'un de tes parents.");
          return;
        }
        if (parentEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
          setError("L'adresse du parent doit être différente de la tienne.");
          return;
        }
        if (!parentalConsent) {
          setError("Avant 15 ans, un de tes parents doit être d'accord. Coche la case quand c'est le cas.");
          return;
        }
      }
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
    if (!termsAccepted) {
      setError('Lis et accepte les conditions pour créer ton compte.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setError('');

    const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'swimmer',
      inviteCode: clubCode.trim() ? normalizeInviteCode(clubCode) : undefined,
      birthDate: isSwimmer ? birthDate ?? undefined : undefined,
      parentEmail: isMinor ? parentEmail.trim().toLowerCase() : undefined,
      parentalConsent: isMinor ? parentalConsent : undefined,
      termsAccepted,
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
                <Ionicons name="mail-unread-outline" size={36} color={C.primary} />
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
            <Image
              source={require('../../../assets/vague-swimlab.webp')}
              style={styles.illustration}
              accessibilityIgnoresInvertColors
              alt=""
            />
            <Text variant="displaySmall" style={styles.title}>
              SwimLab
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Créer un compte
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
                    <Ionicons name="checkmark" size={14} color={C.onPrimary} />
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
                  <View style={[styles.roleIcon, { backgroundColor: C.primarySoft }]}>
                    <Ionicons name="water" size={28} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Nageur / Nageuse</Text>
                    <Text style={styles.roleDesc}>
                      Je rejoins mon club, je vois mes séances et je donne mes ressentis.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.inkMuted} />
                </GlassCard>
              </Pressable>
              <Pressable onPress={() => selectRole('coach')}>
                <GlassCard elevated style={styles.roleCard}>
                  <View style={[styles.roleIcon, { backgroundColor: C.primarySoft }]}>
                    <Ionicons name="megaphone" size={26} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>Coach</Text>
                    <Text style={styles.roleDesc}>
                      Je crée mon club, je gère mes groupes et je planifie les entraînements.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.inkMuted} />
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
                Qui es-tu ?
              </Text>
              <TextInput
                label="Prénom"
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
              {isSwimmer && (
                <>
                  <TextInput
                    label="Date de naissance"
                    placeholder="JJ/MM/AAAA"
                    value={birthDateText}
                    onChangeText={setBirthDateText}
                    mode="outlined"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    style={styles.input}
                  />
                  <HelperText type="info" visible style={styles.help}>
                    Elle reste privée : toi seul peux la voir.
                  </HelperText>
                </>
              )}
              {isMinor && (
                <View style={styles.parentBox}>
                  <Text style={styles.parentTitle}>Tu as moins de 15 ans</Text>
                  <Text style={styles.parentText}>
                    Un de tes parents doit être d'accord pour que tu utilises SwimLab. Il recevra un email
                    qui lui explique l'app.
                  </Text>
                  <TextInput
                    label="Email d'un de tes parents"
                    value={parentEmail}
                    onChangeText={setParentEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: parentalConsent }}
                    onPress={() => setParentalConsent(!parentalConsent)}
                    style={styles.checkRow}
                  >
                    <Checkbox.Android
                      status={parentalConsent ? 'checked' : 'unchecked'}
                      onPress={() => setParentalConsent(!parentalConsent)}
                      color={C.primary}
                    />
                    <Text style={styles.checkText}>Un de mes parents est d'accord</Text>
                  </Pressable>
                </View>
              )}
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
                Choisis un mot de passe
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
              <View style={styles.checkRow}>
                <Checkbox.Android
                  status={termsAccepted ? 'checked' : 'unchecked'}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  color={C.primary}
                />
                <Text style={styles.checkText}>
                  J'accepte les{' '}
                  <Text
                    style={styles.link}
                    accessibilityRole="link"
                    onPress={() => navigation.navigate('Legal')}
                  >
                    conditions et la gestion de mes données
                  </Text>
                </Text>
              </View>
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
                Créer mon compte
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
  help: {
    marginTop: -8,
  },
  parentBox: {
    backgroundColor: C.warningSoft,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  parentTitle: {
    fontFamily: FONTS.textBold,
    fontSize: 16,
    color: C.warning,
  },
  parentText: {
    fontSize: 14,
    lineHeight: 20,
    color: C.ink,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 4,
  },
  checkText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: C.ink,
  },
  link: {
    color: C.link,
    fontFamily: FONTS.textStrong,
    textDecorationLine: 'underline',
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  stepHint: {
    fontSize: 13,
    color: C.inkMuted,
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
    color: C.ink,
    fontFamily: FONTS.display,
  },
  subtitle: {
    color: C.inkMuted,
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
    backgroundColor: C.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: C.primary,
  },
  stepDotDone: {
    backgroundColor: C.success,
  },
  stepNum: {
    fontSize: 13,
    fontFamily: FONTS.textBold,
    color: C.inkMuted,
  },
  stepNumActive: {
    color: C.onPrimary,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: FONTS.textStrong,
    color: C.inkMuted,
  },
  stepLabelActive: {
    color: C.primary,
  },
  // Form
  form: {
    gap: 16,
  },
  stepTitle: {
    color: C.ink,
    fontFamily: FONTS.display,
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
    fontFamily: FONTS.display,
    color: C.ink,
  },
  roleDesc: {
    fontSize: 12,
    color: C.inkMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  input: {
    backgroundColor: C.surface,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 16,
  },
});
