import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

type Variant = 'default' | 'dashboard' | 'calendarWeek' | 'list';

interface Props {
  variant?: Variant;
}

/**
 * Skeletons de chargement contextuels : la forme imite la page finale
 * (dashboard = hero + grille d'actions, calendarWeek = 7 lignes, list = lignes).
 */
export default function LoadingSkeleton({ variant = 'default' }: Props) {
  if (variant === 'dashboard') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.line, { width: '55%' }]} />
            <View style={[styles.line, { width: '80%', opacity: 0.25 }]} />
          </View>
          <View style={styles.circle} />
        </View>
        <View style={styles.hero} />
        <View style={styles.grid}>
          <View style={styles.tile} />
          <View style={styles.tile} />
          <View style={styles.tile} />
          <View style={styles.tile} />
        </View>
      </View>
    );
  }

  if (variant === 'calendarWeek') {
    return (
      <View style={styles.container}>
        <View style={[styles.line, { width: '40%', alignSelf: 'center' }]} />
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.dayRow}>
            <View style={styles.dayLabel} />
            <View style={styles.daySlot} />
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={styles.container}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.listRow}>
            <View style={styles.circle} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={[styles.line, { width: '70%' }]} />
              <View style={[styles.line, { width: '45%', opacity: 0.25 }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.block} />
      <View style={styles.block} />
      <View style={styles.blockSmall} />
      <ActivityIndicator style={styles.spinner} />
    </View>
  );
}

const SKELETON_BG = 'rgba(255, 255, 255, 0.50)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  block: {
    height: 80,
    backgroundColor: SKELETON_BG,
    borderRadius: 12,
    opacity: 0.5,
  },
  blockSmall: {
    height: 48,
    backgroundColor: SKELETON_BG,
    borderRadius: 12,
    opacity: 0.3,
  },
  spinner: {
    marginTop: 16,
  },
  // Dashboard
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  line: {
    height: 16,
    backgroundColor: SKELETON_BG,
    borderRadius: 8,
    opacity: 0.5,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SKELETON_BG,
    opacity: 0.5,
  },
  hero: {
    height: 170,
    backgroundColor: SKELETON_BG,
    borderRadius: 24,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47%',
    height: 90,
    backgroundColor: SKELETON_BG,
    borderRadius: 20,
    opacity: 0.4,
  },
  // Calendar week
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayLabel: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: SKELETON_BG,
    opacity: 0.4,
  },
  daySlot: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: SKELETON_BG,
    opacity: 0.45,
  },
  // List
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
