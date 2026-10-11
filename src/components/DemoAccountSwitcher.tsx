import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { useAuthStore } from '../stores/authStore';
import { FEATURES } from '../config/features';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../config/demo';
import { TEXT_COLORS } from '../config/tokens';

/**
 * Connexion en un clic aux comptes de demo. Sur l'ecran de connexion, connecte ;
 * une fois connecte (ecran Profil), deconnecte puis reconnecte sous l'autre compte.
 */
export default function DemoAccountSwitcher() {
  const { user, signIn, signOut } = useAuthStore();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!FEATURES.demo) return null;

  const currentEmail = user?.email ?? null;

  const switchTo = async (email: string) => {
    if (email === currentEmail || pendingEmail) return;
    setError('');
    setPendingEmail(email);
    if (currentEmail) {
      await signOut();
    }
    const { error: signInError } = await signIn(email, DEMO_PASSWORD);
    if (signInError) {
      setError(
        "Connexion impossible. Les comptes démo n'existent peut-être pas encore : lance supabase/seed/demo_seed.sql dans Supabase.",
      );
    }
    setPendingEmail(null);
  };

  return (
    <GlassCard elevated>
      <View style={styles.header}>
        <Ionicons name="flask-outline" size={18} color="#0891B2" />
        <Text style={styles.title}>{currentEmail ? 'Changer de compte démo' : 'Comptes démo'}</Text>
      </View>
      <Text style={styles.hint}>
        Club fictif « CN Les Dauphins ». Mot de passe commun : {DEMO_PASSWORD}
      </Text>

      <View style={styles.list}>
        {DEMO_ACCOUNTS.map((account) => {
          const isCurrent = account.email === currentEmail;
          const isPending = account.email === pendingEmail;
          return (
            <Pressable
              key={account.email}
              onPress={() => switchTo(account.email)}
              disabled={isCurrent || !!pendingEmail}
              accessibilityRole="button"
              accessibilityLabel={`Se connecter en tant que ${account.name}, ${account.profile}`}
              style={({ pressed }) => [
                styles.row,
                isCurrent && styles.rowCurrent,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.icon, { backgroundColor: `${account.color}1F` }]}>
                <Ionicons name={account.icon} size={18} color={account.color} />
              </View>
              <View style={styles.text}>
                <Text style={styles.name} numberOfLines={1}>
                  {account.profile} · {account.name}
                </Text>
                <Text style={styles.detail} numberOfLines={2}>
                  {account.detail}
                </Text>
              </View>
              {isPending ? (
                <ActivityIndicator size={16} />
              ) : isCurrent ? (
                <Text style={styles.current}>Connecté</Text>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={TEXT_COLORS.muted} />
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_COLORS.primary,
  },
  hint: {
    fontSize: 12,
    color: TEXT_COLORS.secondary,
    marginTop: 4,
    marginBottom: 10,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rowCurrent: {
    backgroundColor: 'rgba(8, 145, 178, 0.08)',
  },
  rowPressed: {
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_COLORS.primary,
  },
  detail: {
    fontSize: 12,
    color: TEXT_COLORS.secondary,
    marginTop: 1,
  },
  current: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0891B2',
  },
  error: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 10,
  },
});
