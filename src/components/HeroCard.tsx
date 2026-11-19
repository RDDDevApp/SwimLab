import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { C, FONTS, RADIUS, SHADOW, SPACING, TABULAR, TOUCH_MIN, TYPE } from '../config/tokens';
import Waves from './Waves';

interface HeroCardProps {
  /** Ancien dégradé : ignoré, la carte vedette est toujours `abysse`. */
  gradientColors?: readonly string[];
  badge: { icon: string; text: string };
  title: string;
  subtitle: string;
  stats?: { label: string; value: string }[];
  primaryAction?: { label: string; icon?: string; onPress: () => void };
  secondaryAction?: { label: string; icon?: string; onPress: () => void };
}

export default function HeroCard({
  badge,
  title,
  subtitle,
  stats,
  primaryAction,
  secondaryAction,
}: HeroCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.container}>
      <View style={styles.content}>

        {/* Badge */}
        <View style={styles.badge}>
          <Ionicons name={badge.icon as any} size={14} color={C.onVif} />
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <View style={styles.actionsRow}>
            {primaryAction && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                onPress={primaryAction.onPress}
              >
                {primaryAction.icon && (
                  <Ionicons name={primaryAction.icon as any} size={18} color={C.onVif} />
                )}
                <Text style={styles.primaryButtonText}>
                  {primaryAction.label}
                </Text>
              </Pressable>
            )}
            {secondaryAction && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                onPress={secondaryAction.onPress}
              >
                {secondaryAction.icon && (
                  <Ionicons name={secondaryAction.icon as any} size={16} color={C.onAbysse} />
                )}
                <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      {/* Vagues en bas : jamais sous le texte */}
      <Waves height={56} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.abysse,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.float,
  },
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    backgroundColor: C.soleil,
    marginBottom: SPACING.md,
  },
  badgeText: {
    ...TYPE.label,
    color: C.onVif,
  },
  title: {
    ...TYPE.title1,
    color: C.onAbysse,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPE.caption,
    color: C.onAbysse,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statBox: {
    minWidth: 80,
  },
  statLabel: {
    ...TYPE.label,
    color: C.onAbysse,
    marginBottom: 2,
  },
  statValue: {
    ...TYPE.title2,
    fontFamily: FONTS.display,
    color: C.onAbysse,
    ...TABULAR,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH_MIN,
    backgroundColor: C.soleil,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl,
  },
  primaryButtonText: {
    ...TYPE.bodyStrong,
    color: C.onVif,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH_MIN,
    backgroundColor: C.ocean,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl,
  },
  secondaryButtonText: {
    ...TYPE.bodyStrong,
    color: C.onAbysse,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
