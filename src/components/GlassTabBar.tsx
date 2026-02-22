import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

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

export default function GlassTabBar({ state, navigation, tabs }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const focused = state.index === index;
        const iconName = (focused ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap;
        return (
          <Pressable
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, focused && styles.activeWrap]}>
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? '#0891b2' : 'rgba(100,116,139,0.35)'}
              />
            </View>
            <Text style={[
              styles.label,
              { color: focused ? '#0891b2' : 'rgba(100,116,139,0.35)' },
              focused && { fontWeight: '700' },
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.50)',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrap: {
    backgroundColor: 'rgba(8, 145, 178, 0.10)',
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
