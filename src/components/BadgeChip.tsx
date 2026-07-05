import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { BADGE_TIERS, BadgeTier, TEXT_COLORS } from '../config/tokens';

interface Props {
  name: string;
  tier: BadgeTier;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Badge non encore obtenu : grise avec cadenas */
  locked?: boolean;
}

/** Badge de gamification avec tier (bronze/argent/or/diamant). */
export default function BadgeChip({ name, tier, icon = 'trophy', locked }: Props) {
  const tierConfig = BADGE_TIERS[tier];

  return (
    <View style={[styles.container, locked && styles.locked]}>
      <View style={[styles.iconCircle, { backgroundColor: locked ? 'rgba(148,163,184,0.15)' : tierConfig.bg }]}>
        <Ionicons
          name={locked ? 'lock-closed' : icon}
          size={20}
          color={locked ? '#94a3b8' : tierConfig.color}
        />
      </View>
      <Text style={[styles.name, locked && styles.lockedText]} numberOfLines={2}>
        {name}
      </Text>
      <Text style={[styles.tier, { color: locked ? '#94a3b8' : tierConfig.color }]}>
        {tierConfig.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    width: 84,
  },
  locked: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_COLORS.primary,
    textAlign: 'center',
  },
  lockedText: {
    color: TEXT_COLORS.muted,
  },
  tier: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
