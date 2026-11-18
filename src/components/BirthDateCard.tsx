import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, TextInput, Button, HelperText, Checkbox } from 'react-native-paper';
import { consentService } from '../services/consentService';
import { parseBirthDate, needsParentalConsent } from '../utils/age';
import { useSnackbarStore } from '../stores/snackbarStore';
import { C, FONTS, RADIUS, SHADOW, SPACING, TYPE } from '../config/tokens';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Pour les nageurs inscrits avant la migration 023 : demande la date de naissance
 * (et, sous 15 ans, l'accord d'un parent). N'affiche rien une fois renseignée.
 * Rappel sans blocage : l'app reste utilisable.
 */
export default function BirthDateCard({ userId, email }: { userId: string; email?: string | null }) {
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [state, setState] = useState<'loading' | 'missing' | 'done'>('loading');
  const [birthDateText, setBirthDateText] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsent, setParentalConsent] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    consentService
      .getMine(userId)
      .then((c) => alive && setState(c?.birth_date ? 'done' : 'missing'))
      .catch(() => alive && setState('done')); // table absente ou réseau : on ne gêne pas
    return () => {
      alive = false;
    };
  }, [userId]);

  if (state !== 'missing') return null;

  const birthDate = parseBirthDate(birthDateText);
  const isMinor = !!birthDate && needsParentalConsent(birthDate);

  const save = async () => {
    if (!birthDate) {
      setError('Indique ta date de naissance au format JJ/MM/AAAA.');
      return;
    }
    if (isMinor) {
      if (!EMAIL_REGEX.test(parentEmail) || parentEmail.trim().toLowerCase() === (email ?? '').toLowerCase()) {
        setError("Indique l'adresse email d'un de tes parents.");
        return;
      }
      if (!parentalConsent) {
        setError("Avant 15 ans, un de tes parents doit être d'accord. Coche la case quand c'est le cas.");
        return;
      }
    }
    setError('');
    setSaving(true);
    try {
      await consentService.saveMine(userId, {
        birthDate,
        parentEmail: isMinor ? parentEmail : null,
        parentalConsent: isMinor && parentalConsent,
      });
      showSnackbar('Date de naissance enregistrée', 'success');
      setState('done');
    } catch {
      setError("L'enregistrement n'a pas marché. Réessaie dans un instant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ta date de naissance</Text>
      <Text style={styles.text}>
        Elle nous permet de savoir si l'accord d'un parent est nécessaire (moins de 15 ans). Elle reste
        privée : toi seul peux la voir.
      </Text>
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
      {isMinor && (
        <>
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
        </>
      )}
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
      <Button mode="contained" onPress={save} loading={saving} disabled={saving}>
        Enregistrer
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOW.card,
  },
  title: {
    ...TYPE.title3,
    color: C.ink,
  },
  text: {
    ...TYPE.caption,
    color: C.inkMuted,
  },
  input: {
    backgroundColor: C.surface,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 4,
  },
  checkText: {
    flex: 1,
    fontFamily: FONTS.text,
    fontSize: 15,
    color: C.ink,
  },
});
