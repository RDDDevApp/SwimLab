import { StyleSheet } from 'react-native';

export const GLASS = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    borderWidth: 1,
    borderRadius: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    borderWidth: 1,
    borderRadius: 14,
  },
  bar: {
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  chip: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 10,
  },
});

export const COLORS = {
  textPrimary: '#1B4332',
  textSecondary: '#0E7490',
  textMuted: 'rgba(27,67,50,0.50)',
  accent: '#0891B2',
  accentPink: '#DB2777',
  accentYellow: '#D97706',
  accentGreen: '#059669',
  accentRed: '#DC2626',
  accentOrange: '#EA580C',
  glowShadow: 'rgba(14,116,144,0.15)',
};
