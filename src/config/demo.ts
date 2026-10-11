import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Comptes de demo crees par supabase/seed/demo_seed.sql.
 * Affiches seulement quand FEATURES.demo est actif (EXPO_PUBLIC_DEMO_MODE=true).
 */
export const DEMO_PASSWORD = 'SwimLabDemo2026';

export interface DemoAccount {
  email: string;
  name: string;
  profile: string;
  detail: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'demo.coach@example.com',
    name: 'Thomas Martin',
    profile: 'Coach principal',
    detail: 'Compétition et Loisir, alerte de surcharge sur Sophie',
    icon: 'megaphone-outline',
    color: '#6366F1',
  },
  {
    email: 'demo.coach2@example.com',
    name: 'Julie Bernard',
    profile: 'Coach adjointe',
    detail: 'Partage la Compétition avec Thomas, gère les Juniors',
    icon: 'people-outline',
    color: '#8B5CF6',
  },
  {
    email: 'demo.nageuse@example.com',
    name: 'Sophie Laurent',
    profile: 'Nageuse de compétition',
    detail: 'Historique complet, XP et badges, feedback modifiable',
    icon: 'trophy-outline',
    color: '#0891B2',
  },
  {
    email: 'demo.nageur@example.com',
    name: 'Lucas Petit',
    profile: 'Nageur loisir',
    detail: 'Un feedback en attente, absence déjà signalée',
    icon: 'water-outline',
    color: '#0EA5E9',
  },
  {
    email: 'demo.junior@example.com',
    name: 'Emma Durand',
    profile: 'Nageuse junior',
    detail: 'Groupe Juniors, très assidue',
    icon: 'happy-outline',
    color: '#EC4899',
  },
  {
    email: 'demo.solo@example.com',
    name: 'Marc Dubois',
    profile: 'Nageur solo',
    detail: 'Sans club : séances perso et planning',
    icon: 'person-outline',
    color: '#0D9488',
  },
  {
    email: 'demo.nouveau@example.com',
    name: 'Chloé Garcia',
    profile: 'Nouvelle nageuse',
    detail: 'Aucune donnée : rejoindre un club avec le code « dauphins »',
    icon: 'sparkles-outline',
    color: '#F59E0B',
  },
  {
    email: 'demo.nouveaucoach@example.com',
    name: 'Antoine Lambert',
    profile: 'Nouveau coach',
    detail: 'Aucune donnée : tester la création de club',
    icon: 'add-circle-outline',
    color: '#64748B',
  },
];
