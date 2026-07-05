import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import GradientScreen from '../../components/GradientScreen';
import AnimatedBackground from '../../components/AnimatedBackground';
import GlassCard from '../../components/GlassCard';
import ProgressRing from '../../components/ProgressRing';
import XPBar from '../../components/XPBar';
import BadgeChip from '../../components/BadgeChip';
import StreakFlame from '../../components/StreakFlame';
import AnimatedCountdown from '../../components/AnimatedCountdown';
import SegmentedToggle from '../../components/SegmentedToggle';
import PressableScale from '../../components/PressableScale';
import SectionHeader from '../../components/SectionHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { WORKOUT_TYPE_COLORS } from '../../config/tokens';

/**
 * Galerie dev-only du Design System 2.0.
 * Tous les composants du kit dans tous leurs etats — harnais de QA visuelle.
 * Accessible uniquement en __DEV__ via la route "UIKit".
 */
export default function UIKitScreen({ navigation }: { navigation: any }) {
  const [toggleIndex, setToggleIndex] = useState(0);
  const [skeletonVariant, setSkeletonVariant] = useState(0);
  const { scrollY, scrollHandler } = useCollapsibleHeader();

  const in2h = new Date(Date.now() + 2 * 3600000);
  const in3days = new Date(Date.now() + 3 * 86400000);
  const skeletonVariants = ['default', 'dashboard', 'calendarWeek', 'list'] as const;

  return (
    <GradientScreen>
      <AnimatedBackground variant="cyan" />
      <CollapsibleHeader
        scrollY={scrollY}
        greeting="UI Kit — SwimLab"
        subtitle="Design System 2.0 : scrolle pour voir le header se compacter."
        initials="UK"
        right={<StreakFlame count={12} />}
      >
        <XPBar currentXP={340} nextLevelXP={500} level={4} />
      </CollapsibleHeader>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        <SectionHeader title="SegmentedToggle" />
        <SegmentedToggle
          options={['Semaine', 'Mois']}
          selectedIndex={toggleIndex}
          onChange={setToggleIndex}
        />

        <SectionHeader title="GlassCard" />
        <GlassCard>
          <Text style={styles.cardText}>Carte standard (rgba)</Text>
        </GlassCard>
        <GlassCard elevated>
          <Text style={styles.cardText}>Carte elevee — blur reel sur iOS</Text>
        </GlassCard>
        <GlassCard onPress={() => {}}>
          <Text style={styles.cardText}>Carte pressable (scale au press)</Text>
        </GlassCard>

        <SectionHeader title="ProgressRing" />
        <View style={styles.row}>
          <ProgressRing progress={85} caption="Distance" />
          <ProgressRing progress={62} color="#D97706" caption="Assiduite" />
          <ProgressRing progress={100} color="#059669" caption="Complete" size={72} />
        </View>

        <SectionHeader title="XPBar" />
        <GlassCard>
          <XPBar currentXP={340} nextLevelXP={500} level={4} />
        </GlassCard>

        <SectionHeader title="BadgeChip (tiers)" />
        <View style={styles.row}>
          <BadgeChip name="10 seances" tier="bronze" icon="checkmark-done" />
          <BadgeChip name="50 km nages" tier="silver" icon="water" />
          <BadgeChip name="Streak 12 sem." tier="gold" icon="flame" />
          <BadgeChip name="100 seances" tier="diamond" locked />
        </View>

        <SectionHeader title="StreakFlame" />
        <View style={styles.row}>
          <StreakFlame count={12} label="semaines" />
          <StreakFlame count={0} label="inactif" />
          <StreakFlame count={26} size="large" />
        </View>

        <SectionHeader title="AnimatedCountdown" />
        <GlassCard style={{ backgroundColor: 'rgba(8, 145, 178, 0.85)' }}>
          <View style={styles.row}>
            <AnimatedCountdown target={in2h} />
            <AnimatedCountdown target={in3days} />
          </View>
        </GlassCard>

        <SectionHeader title="Couleurs types de seance" />
        <View style={styles.row}>
          {(['endurance', 'sprint', 'technique', 'recovery'] as const).map((type) => {
            const cfg = WORKOUT_TYPE_COLORS[type];
            return (
              <View key={type} style={[styles.typePill, { backgroundColor: cfg.bg }]}>
                <View style={[styles.typeDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            );
          })}
        </View>

        <SectionHeader title="PressableScale" />
        <PressableScale onPress={() => {}}>
          <GlassCard>
            <Text style={styles.cardText}>Presse-moi (scale + haptics)</Text>
          </GlassCard>
        </PressableScale>

        <SectionHeader
          title={`LoadingSkeleton — ${skeletonVariants[skeletonVariant]}`}
          actionLabel="Suivant"
          onAction={() => setSkeletonVariant((skeletonVariant + 1) % skeletonVariants.length)}
        />
        <View style={styles.skeletonBox}>
          <LoadingSkeleton variant={skeletonVariants[skeletonVariant]} />
        </View>

        <Button mode="outlined" onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
          Retour
        </Button>
      </Animated.ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  skeletonBox: {
    height: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
});
