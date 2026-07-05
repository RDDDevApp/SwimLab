import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { TEXT_COLORS } from '../config/tokens';

const COLLAPSE_RANGE = 80;

/**
 * Hook compagnon : fournit scrollY + le handler a brancher sur
 * Animated.ScrollView (onScroll={scrollHandler}, scrollEventThrottle={16}).
 */
export function useCollapsibleHeader() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, scrollHandler };
}

interface Props {
  scrollY: SharedValue<number>;
  greeting: string;
  subtitle?: string;
  initials: string;
  /** Slot optionnel sous le greeting (XP bar, streak...) */
  children?: React.ReactNode;
  /** Slot a droite de la ligne compacte (cloche, streak compact...) */
  right?: React.ReactNode;
  avatarColor?: string;
}

/**
 * "Living header" (Figma V1) : etendu en haut de page, se compacte au scroll.
 * Le greeting retrecit et l'avatar glisse sur une ligne compacte sticky.
 */
export default function CollapsibleHeader({
  scrollY,
  greeting,
  subtitle,
  initials,
  children,
  right,
  avatarColor = '#0891B2',
}: Props) {
  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE * 0.7], [1, 0], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [subtitle ? 96 : 72, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, COLLAPSE_RANGE], [0, -12], Extrapolation.CLAMP),
      },
    ],
  }));

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={styles.container}>
      {/* Ligne compacte (visible apres scroll) */}
      <Animated.View style={[styles.compactRow, compactStyle]} pointerEvents="box-none">
        <Avatar.Text size={32} label={initials} style={{ backgroundColor: avatarColor }} />
        <Text style={styles.compactGreeting} numberOfLines={1}>
          {greeting}
        </Text>
        {right}
      </Animated.View>

      {/* Header etendu (visible en haut de page) */}
      <Animated.View style={[styles.expanded, expandedStyle]}>
        <View style={styles.expandedRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              {greeting}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Avatar.Text size={48} label={initials} style={{ backgroundColor: avatarColor }} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  compactGreeting: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLORS.primary,
  },
  expanded: {
    overflow: 'hidden',
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: TEXT_COLORS.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
