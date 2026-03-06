import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface HeroCardProps {
  gradientColors: readonly string[];
  badge: { icon: string; text: string };
  title: string;
  subtitle: string;
  stats?: { label: string; value: string }[];
  primaryAction?: { label: string; icon?: string; onPress: () => void };
  secondaryAction?: { label: string; icon?: string; onPress: () => void };
}

export default function HeroCard({
  gradientColors,
  badge,
  title,
  subtitle,
  stats,
  primaryAction,
  secondaryAction,
}: HeroCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(700).delay(300)}>
      <LinearGradient
        colors={gradientColors as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Decorative blob */}
        <View style={styles.blob} />

        {/* Badge */}
        <View style={styles.badge}>
          <Ionicons name={badge.icon as any} size={12} color="#FDE68A" />
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
              <Pressable style={styles.primaryButton} onPress={primaryAction.onPress}>
                {primaryAction.icon && (
                  <Ionicons name={primaryAction.icon as any} size={18} color={gradientColors[0] as string} />
                )}
                <Text style={[styles.primaryButtonText, { color: gradientColors[0] as string }]}>
                  {primaryAction.label}
                </Text>
              </Pressable>
            )}
            {secondaryAction && (
              <Pressable style={styles.secondaryButton} onPress={secondaryAction.onPress}>
                {secondaryAction.icon && (
                  <Ionicons name={secondaryAction.icon as any} size={16} color="#fff" />
                )}
                <Text style={styles.secondaryButtonText}>{secondaryAction.label}</Text>
              </Pressable>
            )}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  blob: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    minWidth: 100,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
