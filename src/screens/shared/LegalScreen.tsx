import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GradientScreen from '../../components/GradientScreen';
import { C, FONTS, RADIUS, SHADOW, SPACING, TYPE } from '../../config/tokens';

/** Version affichée en bas de page : à changer à chaque modification du texte. */
export const LEGAL_VERSION = '18 novembre 2026';

/**
 * Adresse de contact pour les questions sur les données. À compléter par Raudi
 * avant l'ouverture à un vrai club (voir la pull request du lot 3).
 */
export const LEGAL_CONTACT_EMAIL = '';

interface Section {
  title: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    title: 'À quoi sert SwimLab',
    paragraphs: [
      "SwimLab relie un club de natation, ses coachs et ses nageurs : le coach prépare les séances et fait l'appel, le nageur voit son programme, dit comment il s'est senti et suit sa progression. Un nageur peut aussi s'entraîner seul, sans club.",
    ],
  },
  {
    title: 'Ce que nous enregistrons',
    paragraphs: [
      'Ton compte : prénom, nom, adresse email, rôle (coach ou nageur) et ton club.',
      "Pour les nageurs : ta date de naissance et, si tu as moins de 15 ans, l'adresse email d'un parent.",
      'Tes entraînements : présences et absences, effort ressenti (RPE), fatigue, sensation technique, commentaires, séances perso, progression (XP, badges).',
      "Si tu actives les notifications : l'identifiant technique de ton téléphone, pour t'envoyer les rappels.",
      "Rien d'autre : pas de localisation, pas de publicité, pas de revente.",
    ],
  },
  {
    title: 'Qui voit quoi',
    paragraphs: [
      'Les coachs de ton club voient ton nom, tes présences, tes ressentis et tes commentaires sur leurs séances : c’est ce qui leur permet d’adapter l’entraînement.',
      "Les autres nageurs ne voient pas tes ressentis ni tes commentaires.",
      "Ta date de naissance et l'email de ton parent ne sont visibles que par toi.",
    ],
  },
  {
    title: 'Où sont tes données',
    paragraphs: [
      "Elles sont stockées chez Supabase, sur des serveurs situés en Allemagne (Union européenne).",
      "Quand tu utilises le coach IA, seuls l'objectif, le niveau, la durée, le bassin et tes envies sont envoyés au service d'IA (Anthropic) pour créer la séance : jamais ton nom ni ton email.",
    ],
  },
  {
    title: 'Combien de temps',
    paragraphs: [
      "Tes données sont gardées tant que ton compte existe. Tu peux supprimer ton compte à tout moment depuis ton profil : ton compte, ton historique et tes ressentis sont alors effacés définitivement.",
    ],
  },
  {
    title: 'Nageurs de moins de 15 ans',
    paragraphs: [
      "En France, avant 15 ans, il faut l'accord d'un parent pour créer un compte en ligne. À l'inscription, le nageur indique l'adresse email d'un parent et confirme qu'il est d'accord. Ce parent reçoit un email qui lui explique SwimLab.",
      "Un parent peut à tout moment demander à voir ou à supprimer les données de son enfant, en utilisant le contact indiqué en bas de cette page.",
    ],
  },
  {
    title: 'Tes droits',
    paragraphs: [
      "Tu peux demander à voir tes données, à les corriger ou à les supprimer, et t'opposer à leur utilisation. Si tu n'obtiens pas de réponse satisfaisante, tu peux saisir la CNIL (cnil.fr).",
    ],
  },
  {
    title: 'Règles du bassin',
    paragraphs: [
      "Reste respectueux dans tes commentaires. Un coach peut retirer un nageur de son groupe ; un compte qui ne respecte pas ces règles peut être supprimé.",
    ],
  },
];

export default function LegalScreen({ navigation }: any) {
  const contact = LEGAL_CONTACT_EMAIL
    ? `Une question sur tes données ? Écris à ${LEGAL_CONTACT_EMAIL}.`
    : 'Une question sur tes données ? Adresse-toi à ton club, qui transmettra.';

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.content}>
        {navigation?.canGoBack?.() ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.back}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={C.link} />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        ) : null}

        <Text style={styles.title} accessibilityRole="header">
          Conditions et données personnelles
        </Text>
        <Text style={styles.intro}>
          Ce que fait SwimLab de tes informations, en clair.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>{contact}</Text>
        </View>

        <Text style={styles.version}>Version du {LEGAL_VERSION}</Text>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
    gap: SPACING.lg,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    minHeight: 48,
  },
  backText: {
    ...TYPE.bodyStrong,
    color: C.link,
  },
  title: {
    ...TYPE.title1,
    color: C.ink,
  },
  intro: {
    ...TYPE.body,
    color: C.inkMuted,
    marginTop: -SPACING.sm,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOW.card,
  },
  sectionTitle: {
    ...TYPE.title3,
    color: C.ink,
  },
  paragraph: {
    ...TYPE.body,
    fontFamily: FONTS.text,
    color: C.ink,
  },
  version: {
    ...TYPE.caption,
    color: C.inkMuted,
    textAlign: 'center',
  },
});
