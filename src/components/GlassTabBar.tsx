import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONTS, RADIUS, SHADOW, SPACING, TOUCH_MIN } from '../config/tokens';

interface TabConfig {
  name: string;
  icon: string;
  label: string;
}

interface Props {
  state: any;
  navigation: any;
  tabs: TabConfig[];
}

/**
 * Barre d'onglets de la DA : un galet `abysse` qui flotte en bas de l'écran.
 * Onglets en `on-abysse` ; l'onglet courant est un galet `soleil`, texte `on-vif`.
 */
export default function GlassTabBar({ state, navigation, tabs }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
      <View style={styles.bar}>
        {tabs.map((tab, index) => {
          const focused = state.index === index;
          const iconName = (focused ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap;
          const color = focused ? C.onVif : C.onAbysse;
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => navigation.navigate(tab.name)}
              style={({ pressed }) => [
                styles.tab,
                focused && styles.tabActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={iconName} size={20} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: C.bg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: C.abysse,
    borderRadius: RADIUS.pill,
    padding: 6,
    ...SHADOW.float,
  },
  tab: {
    flex: 1,
    minHeight: TOUCH_MIN + 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: RADIUS.pill,
  },
  tabActive: {
    backgroundColor: C.soleil,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: FONTS.textStrong,
    fontSize: 11,
    lineHeight: 14,
  },
});
