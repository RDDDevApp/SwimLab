import { StyleSheet } from 'react-native';

export const GLASS = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderWidth: 1,
    borderRadius: 14,
  },
  bar: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.50)',
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderRadius: 10,
  },
});

export const COLORS = {
  textPrimary: '#1e293b',
  textSecondary: '#0891b2',
  textMuted: '#64748b',
  accent: '#0891B2',
  accentPink: '#ec4899',
  accentYellow: '#eab308',
  accentGreen: '#059669',
  accentRed: '#DC2626',
  accentOrange: '#EA580C',
  glowShadow: 'rgba(30,41,59,0.08)',
};
