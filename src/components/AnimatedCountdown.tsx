import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  /** Date/heure cible de la seance */
  target: Date;
  /** Couleur du texte (defaut blanc, pour usage dans les hero cards) */
  color?: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Maintenant';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `J-${days}`;
  if (hours > 0) return `${hours}h${String(minutes).padStart(2, '0')}`;
  return `${minutes} min`;
}

/** Compte a rebours vers la prochaine seance (J-x puis H:MM puis minutes). */
export default function AnimatedCountdown({ target, color = '#fff' }: Props) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(target.getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={14} color={color} />
      <Text style={[styles.text, { color }]}>{formatRemaining(remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
  },
});
