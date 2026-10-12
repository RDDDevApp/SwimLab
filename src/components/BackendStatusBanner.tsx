import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

type Status = 'unknown' | 'ok' | 'unreachable';

/**
 * Verifie que le backend Supabase repond et affiche une banniere explicite
 * sinon (projet supprime/en pause, .env perime, ou pas de reseau) — plutot
 * que de laisser l'app echouer silencieusement requete apres requete.
 */
export default function BackendStatusBanner() {
  const [status, setStatus] = useState<Status>('unknown');

  const check = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: SUPABASE_ANON_KEY },
        signal: controller.signal,
      });
      clearTimeout(timer);
      // Toute reponse non-5xx prouve que le serveur est joignable ; un projet
      // en pause renvoie des 5xx (502/521) ou une erreur reseau.
      setStatus(res.status < 500 ? 'ok' : 'unreachable');
    } catch {
      setStatus('unreachable');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  // Re-tester periodiquement tant que le backend est injoignable
  useEffect(() => {
    if (status !== 'unreachable') return;
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [status, check]);

  if (status !== 'unreachable') return null;

  return (
    <Pressable style={styles.banner} onPress={check}>
      <Ionicons name="cloud-offline-outline" size={18} color="#fff" />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Serveur injoignable</Text>
        <Text style={styles.subtitle}>
          Le serveur ne répond pas. Vérifie ta connexion, puis appuie ici pour réessayer.
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingTop: 14,
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 15,
  },
});
