export const COLORS = {
  // Background palette (light aqua — matches SwimmerHome)
  deepBlue: "#EFF6FF",     // blue-50
  darkBlue: "#DBEAFE",     // blue-100
  mediumBlue: "#BFDBFE",   // blue-200

  // Accent colors — vibrant but dark enough for light bg
  turquoise: "#0891B2",      // cyan-600
  turquoiseGlow: "#06B6D4",  // cyan-500
  yellow: "#D97706",         // amber-600
  pink: "#DB2777",           // pink-600
  coral: "#DC2626",          // red-600
  green: "#059669",          // emerald-600
  purple: "#7C3AED",         // violet-600

  // Text
  white: "#FFFFFF",
  textPrimary: "#0F172A",   // slate-900 – main content on light bg
  textMuted: "#64748B",     // slate-500
  textLight: "#475569",     // slate-600

  // Glass card surfaces
  cardBg: "rgba(255, 255, 255, 0.50)",
  cardBorder: "rgba(255, 255, 255, 0.70)",
};

export const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  endurance: { color: COLORS.turquoise, icon: '🏊' },
  sprint:    { color: COLORS.yellow,    icon: '⚡' },
  technique: { color: COLORS.purple,    icon: '🎯' },
  recovery:  { color: COLORS.green,     icon: '🧘' },
  empty:     { color: COLORS.textMuted, icon: '📦' },
};

export const GROUPS = [
  { id: 'comp',    name: 'Compétition', color: COLORS.turquoise },
  { id: 'loisir',  name: 'Loisir',      color: COLORS.pink      },
  { id: 'avenir',  name: 'Avenir',      color: COLORS.yellow    },
  { id: 'masters', name: 'Masters',     color: COLORS.purple    },
];