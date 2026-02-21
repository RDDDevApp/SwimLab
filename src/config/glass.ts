import { StyleSheet } from 'react-native';

export const GLASS = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 24,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
  },
  bar: {
    backgroundColor: 'rgba(11, 20, 38, 0.80)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
  },
});

export const COLORS = {
  textPrimary: '#FFFFFF',
  textSecondary: '#67E8F9',
  textMuted: 'rgba(255,255,255,0.50)',
  accent: '#00C9DB',
  accentPink: '#F43F8E',
  accentYellow: '#FFBE1A',
  accentGreen: '#34D399',
  accentRed: '#F87171',
  accentOrange: '#FB923C',
  glowShadow: 'rgba(0,201,219,0.30)',
};
