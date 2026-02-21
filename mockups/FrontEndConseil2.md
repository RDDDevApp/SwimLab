# 🌊 SwimLab — Audit UI/UX — Style "Ocean Immersive"

> **Direction artistique validée** : Gradient ocean plein écran + composants glassmorphism liquid
> **Références** : Spotify dark mode, apps gaming premium, esthétique aquatique immersive

---

## DIRECTION VISUELLE : OCEAN IMMERSIVE

### Concept

Le gradient ocean (`#0B1426` → `#0891B2` → `#00C9DB`) est le **fond permanent de TOUTE l'app**. Les composants flottent par-dessus en style **glassmorphism / liquid** — semi-transparents, blur, arrondis, comme des bulles dans l'eau.

### Principes fondamentaux

1. **Le gradient est TOUJOURS visible** — il remplit 100% de l'écran, pas juste un header
2. **Les cards sont semi-transparentes** — `rgba(255, 255, 255, 0.10-0.15)` avec backdrop blur
3. **Les bordures glow** — `rgba(255, 255, 255, 0.15-0.25)` fine (1px), effet verre givré
4. **Le texte est blanc/cyan** — titres en blanc, sous-titres en cyan clair `#67E8F9`
5. **Les accents glow** — turquoise, pink, yellow avec un halo lumineux autour

---

## PALETTE COULEURS "OCEAN IMMERSIVE"

### Fond gradient (appliqué sur CHAQUE écran)

```typescript
// config/gradients.ts
export const OCEAN_GRADIENT = {
  colors: ['#0B1426', '#0C2D48', '#0A4A6B', '#0891B2'],
  start: { x: 0, y: 0 },
  end: { x: 0.3, y: 1 },
};
```

### Tokens glassmorphism

```typescript
// config/glass.ts
export const GLASS = {
  // Cards standard
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
  },
  // Cards surélevées (modals, cards importantes)
  cardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 24,
  },
  // Inputs
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 14,
  },
  // Tab bar & top bars
  bar: {
    backgroundColor: 'rgba(11, 20, 38, 0.80)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
  },
  // Badges / chips
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
  },
};
```

### Couleurs sur fond sombre

```
RÔLE                 | HEX/RGBA                          | USAGE
─────────────────────|───────────────────────────────────|──────────────────────
Texte principal      | #FFFFFF                           | Titres, valeurs
Texte secondaire     | #67E8F9 (cyan-300)                | Sous-titres, labels
Texte muted          | rgba(255,255,255,0.50)            | Hints, timestamps
Accent Turquoise     | #00C9DB                           | CTA, active states, glow
Accent Pink          | #F43F8E                           | Stats nageur, accents secondaires
Accent Yellow        | #FFBE1A                           | Alertes, gamification, streak
Accent Green         | #34D399                           | Succès, présence, RPE bas
Accent Red           | #F87171                           | Erreurs, absences, RPE élevé
Accent Orange        | #FB923C                           | RPE moyen-haut, warnings
Card background      | rgba(255,255,255,0.10)            | Toutes les cards
Card border          | rgba(255,255,255,0.15)            | Bordures glass
Glow shadow          | rgba(0,201,219,0.30)              | Ombres teintées cyan
```

### Gradients pour accents

```typescript
export const ACCENT_GRADIENTS = {
  // Boutons CTA principaux
  cta: {
    colors: ['#00C9DB', '#0891B2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  // Badges "hot" / RPE élevé
  hot: {
    colors: ['#F43F8E', '#FB923C'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  // Achievements / streak
  achievement: {
    colors: ['#00C9DB', '#F43F8E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  // Stripe endurance
  endurance: {
    colors: ['#0891B2', '#00C9DB'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Stripe sprint
  sprint: {
    colors: ['#EF4444', '#FB923C'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
```

---

## COMPOSANT SOCLE : GradientScreen

Chaque écran doit être wrappé dans ce composant au lieu de `SafeAreaView style={{ backgroundColor: '#F3F4F6' }}`.

```tsx
// components/GradientScreen.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

export default function GradientScreen({ children, edges = ['top'], style }: Props) {
  return (
    <LinearGradient
      colors={['#0B1426', '#0C2D48', '#0A4A6B', '#0891B2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
});
```

**Usage (remplacer dans CHAQUE écran) :**
```tsx
// AVANT :
<SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>

// APRÈS :
<GradientScreen>
```

---

## COMPOSANT : GlassCard

```tsx
// components/GlassCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';

interface Props {
  children: React.ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function GlassCard({ children, elevated, onPress, style }: Props) {
  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    // Glow shadow
    shadowColor: '#00C9DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    shadowOpacity: 0.15,
  },
});
```

---

## COMPOSANTS REDESIGNÉS (STYLE OCEAN IMMERSIVE)

### 1. WorkoutCard — Glassmorphism

```tsx
// components/WorkoutCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from './GlassCard';

const TYPE_CONFIG: Record<string, { icon: string; gradient: string[]; label: string }> = {
  endurance: { icon: 'water', gradient: ['#0891B2', '#00C9DB'], label: 'Endurance' },
  sprint: { icon: 'flash', gradient: ['#EF4444', '#FB923C'], label: 'Sprint' },
  technique: { icon: 'construct', gradient: ['#8B5CF6', '#A78BFA'], label: 'Technique' },
  recovery: { icon: 'leaf', gradient: ['#10B981', '#34D399'], label: 'Récup' },
  other: { icon: 'barbell', gradient: ['#64748B', '#94A3B8'], label: 'Autre' },
};

interface Props {
  title: string;
  type: string;
  distance?: number | null;
  date: string;
  status: { label: string; color: string };
  onPress: () => void;
}

export default function WorkoutCard({ title, type, distance, date, status, onPress }: Props) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;

  return (
    <Pressable onPress={onPress} style={wc.wrapper}>
      {/* Bande latérale gradient */}
      <LinearGradient
        colors={config.gradient as [string, string]}
        style={wc.stripe}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={wc.content}>
        <View style={wc.topRow}>
          <Text style={wc.date}>{date}</Text>
          <View style={[wc.badge, { backgroundColor: status.color + '30' }]}>
            <Text style={[wc.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={wc.title} numberOfLines={1}>{title}</Text>
        <View style={wc.metaRow}>
          <View style={wc.typeTag}>
            <Ionicons name={config.icon as any} size={14} color={config.gradient[1]} />
            <Text style={[wc.typeText, { color: config.gradient[1] }]}>{config.label}</Text>
          </View>
          {distance ? (
            <View style={wc.distanceTag}>
              <Ionicons name="resize" size={13} color="#67E8F9" />
              <Text style={wc.distanceText}>{distance}m</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const wc = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  stripe: { width: 5 },
  content: { flex: 1, padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: '#67E8F9', fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeText: { fontSize: 12, fontWeight: '600' },
  distanceTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distanceText: { fontSize: 12, fontWeight: '600', color: '#67E8F9' },
});
```

### 2. RPESlider — Dark Glassmorphism

```tsx
// components/RPESliderGlass.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { getRPEColor, RPE_LABELS } from '../config/theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function RPESliderGlass({ value, onChange }: Props) {
  const color = getRPEColor(value);
  const label = RPE_LABELS[value] || '';
  const rpeValues = Array.from({ length: 15 }, (_, i) => i + 6);

  const handlePress = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(val);
  };

  return (
    <View style={rs.container}>
      {/* Valeur centrale avec glow */}
      <View style={rs.valueDisplay}>
        <Text style={[rs.valueText, { color, textShadowColor: color, textShadowRadius: 20 }]}>
          {value}
        </Text>
        <Text style={[rs.label, { color }]}>{label}</Text>
      </View>

      {/* Barre de progression */}
      <View style={rs.barTrack}>
        <View
          style={[
            rs.barFill,
            {
              width: `${((value - 6) / 14) * 100}%`,
              backgroundColor: color,
              // Glow effect
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 8,
            },
          ]}
        />
      </View>

      {/* Grille de boutons */}
      <View style={rs.scaleRow}>
        {rpeValues.map((rpeVal) => {
          const isSelected = rpeVal === value;
          const bgColor = getRPEColor(rpeVal);
          return (
            <Pressable
              key={rpeVal}
              onPress={() => handlePress(rpeVal)}
              style={[
                rs.scaleButton,
                {
                  backgroundColor: isSelected ? bgColor : 'rgba(255,255,255,0.08)',
                  borderColor: isSelected ? bgColor : 'rgba(255,255,255,0.10)',
                },
                isSelected && {
                  shadowColor: bgColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 5,
                  transform: [{ scale: 1.15 }],
                },
              ]}
            >
              <Text style={[rs.scaleText, { color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]}>
                {rpeVal}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={rs.legendRow}>
        <Text style={[rs.legend, { color: '#34D399' }]}>😌 Repos</Text>
        <Text style={[rs.legend, { color: '#F87171' }]}>🔥 Maximal</Text>
      </View>
    </View>
  );
}

const rs = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  valueDisplay: { alignItems: 'center', marginBottom: 16 },
  valueText: { fontWeight: '800', fontSize: 52 },
  label: { fontWeight: '700', marginTop: 4, fontSize: 16 },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: { height: '100%', borderRadius: 3 },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  scaleButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleText: { fontWeight: '700', fontSize: 13 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  legend: { fontWeight: '600', fontSize: 13 },
});
```

### 3. AttendanceCheckbox — Glassmorphism

```tsx
// components/SwimmerAttendanceRow.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  name: string;
  initials: string;
  checked: boolean;
  onToggle: () => void;
}

export default function SwimmerAttendanceRow({ name, initials, checked, onToggle }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      style={[
        ar.row,
        checked && ar.rowChecked,
      ]}
    >
      <Avatar.Text
        size={36}
        label={initials}
        style={{ backgroundColor: checked ? '#00C9DB' : 'rgba(255,255,255,0.15)' }}
        labelStyle={{ color: '#FFFFFF', fontWeight: '700' }}
      />
      <Text style={ar.name}>{name}</Text>
      <View style={[ar.checkbox, checked && ar.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
      </View>
    </Pressable>
  );
}

const ar = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  rowChecked: {
    backgroundColor: 'rgba(0,201,219,0.10)',
    borderColor: 'rgba(0,201,219,0.30)',
  },
  name: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
```

### 4. StatsBadge — Glowing

```tsx
// components/StatsBadge.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color: string; // accent color (#00C9DB, #F43F8E, #FFBE1A)
}

export default function StatsBadge({ icon, label, value, color }: Props) {
  return (
    <View style={sb.container}>
      <View style={[sb.iconCircle, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[sb.value, { color, textShadowColor: color, textShadowRadius: 12 }]}>
        {value}
      </Text>
      <Text style={sb.label}>{label}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.60)', fontWeight: '500' },
});
```

### 5. TabBar — Frosted Glass

```tsx
// components/GlassTabBar.tsx
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const TABS = [
  { name: 'Dashboard', icon: 'home', label: 'Accueil' },
  { name: 'Calendar', icon: 'calendar', label: 'Calendrier' },
  { name: 'Workouts', icon: 'fitness', label: 'Séances' },
  { name: 'Groups', icon: 'people', label: 'Groupes' },
  { name: 'Profile', icon: 'person', label: 'Profil' },
];

export default function GlassTabBar({ state, navigation }: any) {
  return (
    <View style={tb.container}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        const iconName = focused ? tab.icon : `${tab.icon}-outline`;
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(tab.name);
            }}
            style={tb.tab}
          >
            <View style={[tb.iconWrap, focused && tb.activeWrap]}>
              <Ionicons
                name={iconName as any}
                size={22}
                color={focused ? '#00C9DB' : 'rgba(255,255,255,0.40)'}
              />
            </View>
            <Text style={[
              tb.label,
              { color: focused ? '#00C9DB' : 'rgba(255,255,255,0.40)' },
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

const tb = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 20, 38, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrap: {
    backgroundColor: 'rgba(0, 201, 219, 0.15)',
    shadowColor: '#00C9DB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  label: { fontSize: 11, fontWeight: '500' },
});

// Usage :
// <Tab.Navigator tabBar={(props) => <GlassTabBar {...props} />}>
```

---

## EXEMPLE COMPLET : Dashboard Coach refactoré

```tsx
// screens/coach/DashboardScreen.tsx — style Ocean Immersive
import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import GradientScreen from '../../components/GradientScreen';
import GlassCard from '../../components/GlassCard';
import StatsBadge from '../../components/StatsBadge';
import WorkoutCard from '../../components/WorkoutCard';

export default function CoachDashboardScreen() {
  // ... (logique inchangée)

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header — texte blanc directement sur le gradient */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Bonjour, Thomas</Text>
            <Text style={s.subtitle}>Coach</Text>
          </View>
          <Avatar.Text
            size={48}
            label="TM"
            style={{ backgroundColor: 'rgba(0,201,219,0.25)' }}
            labelStyle={{ color: '#FFFFFF' }}
          />
        </View>

        {/* Club card — GlassCard */}
        <GlassCard>
          <Text style={s.clubName}>Swim Club Paris</Text>
          <View style={s.codeRow}>
            <Text style={s.codeLabel}>Code d'invitation :</Text>
            <View style={s.codeChip}>
              <Text style={s.codeText}>SWIM23</Text>
            </View>
          </View>
        </GlassCard>

        {/* Stats — 3 badges glowing */}
        <View style={s.statsRow}>
          <StatsBadge icon="people" label="Nageurs" value={12} color="#00C9DB" />
          <StatsBadge icon="fitness" label="Séances" value={28} color="#F43F8E" />
          <StatsBadge icon="analytics" label="RPE moy" value="13.2" color="#FFBE1A" />
        </View>

        {/* Prochains entraînements */}
        <Text style={s.sectionTitle}>Cette semaine</Text>
        <WorkoutCard
          title="Endurance Aérobie"
          type="endurance"
          distance={2400}
          date="Lun 17 Fév"
          status={{ label: 'Émargé', color: '#34D399' }}
          onPress={() => {}}
        />
        <WorkoutCard
          title="Sprint Lactique"
          type="sprint"
          distance={1800}
          date="Mer 19 Fév"
          status={{ label: 'À émarger', color: '#3B82F6' }}
          onPress={() => {}}
        />
      </ScrollView>
    </GradientScreen>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { color: '#67E8F9', fontSize: 15, fontWeight: '500' },
  clubName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  codeLabel: { color: 'rgba(255,255,255,0.60)', fontSize: 13 },
  codeChip: {
    backgroundColor: 'rgba(0,201,219,0.20)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  codeText: { color: '#00C9DB', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
});
```

---

## ROADMAP MISE À JOUR — STYLE OCEAN IMMERSIVE

### PHASE 1 — Fondation Glass (3-4h) ⭐

| # | Tâche | Temps |
|---|-------|-------|
| 1 | `npx expo install expo-linear-gradient expo-haptics` | 5min |
| 2 | Créer `GradientScreen.tsx` + `GlassCard.tsx` | 20min |
| 3 | Créer `config/glass.ts` + `config/gradients.ts` | 10min |
| 4 | Remplacer `SafeAreaView bg=#F3F4F6` → `GradientScreen` sur **tous les écrans** | 1h |
| 5 | Remplacer `<Card bg=#FFFFFF>` → `GlassCard` sur tous les écrans | 1h30 |
| 6 | Passer tous les textes en blanc/cyan (titres `#FFFFFF`, labels `#67E8F9`, muted `rgba(255,255,255,0.5)`) | 45min |
| 7 | Mettre à jour `StatusBar` → `<StatusBar style="light" />` | 1min |

**Impact** : L'app entière passe en mode "Ocean Immersive" dark. Transformation radicale.

### PHASE 2 — Composants Premium (1-2 jours) ⭐⭐

| # | Tâche | Temps |
|---|-------|-------|
| 1 | Installer `react-native-reanimated` + `moti` + config babel | 20min |
| 2 | `WorkoutCard` avec bande latérale gradient | 40min |
| 3 | `StatsBadge` avec icônes et glow | 30min |
| 4 | `RPESliderGlass` avec glow dynamique | 1h |
| 5 | `SwimmerAttendanceRow` glassmorphism | 40min |
| 6 | `GlassTabBar` custom avec glow actif | 1h |
| 7 | `SkeletonShimmer` dark (shimmer blanc translucide) | 45min |
| 8 | `AnimatedButton` (scale + haptic) à intégrer partout | 30min |
| 9 | `AnimatedListItem` stagger sur les listes | 30min |

### PHASE 3 — Polish & Wow (3-5 jours) ⭐⭐⭐

| # | Tâche | Temps |
|---|-------|-------|
| 1 | `@gorhom/bottom-sheet` pour FeedbackScreen + SessionDetail | 2h |
| 2 | Backdrop blur (`expo-blur`) sur les modals | 30min |
| 3 | `WaveLoader` aquatique (loading) | 1h |
| 4 | Compteurs animés sur les dashboards | 1h30 |
| 5 | ProgressBar animées sur WorkoutStats | 1h |
| 6 | Error shake + success animations | 1h |
| 7 | Swipe horizontal sur le calendrier | 2h |
| 8 | Typographie Inter via `expo-font` | 1h |
| 9 | Splash screen animé | 2h |

---

## Dépendances NPM complètes

```bash
# Phase 1
npx expo install expo-linear-gradient expo-haptics

# Phase 2
npx expo install react-native-reanimated
npm install moti

# Phase 3
npm install @gorhom/bottom-sheet
npx expo install expo-blur
```

> Toutes compatibles Expo SDK 54+ et Expo Go.
