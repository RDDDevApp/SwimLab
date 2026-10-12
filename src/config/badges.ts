import { BadgeTier } from './tokens';

/**
 * Catalogue des badges — le catalogue vit dans le code, seuls les AWARDS
 * (attributions) sont stockes en base (table swimmer_badges, migration 015).
 * Metrique + seuil => attribution lazy et idempotente via checkAndAward().
 */

export type BadgeMetric = 'sessions' | 'volumeKm' | 'feedbacks' | 'streakWeeks';

export interface BadgeDef {
  id: string;
  name: string;
  icon: string; // Ionicons name
  tier: BadgeTier;
  metric: BadgeMetric;
  threshold: number;
  description: string;
}

export const BADGE_CATALOG: BadgeDef[] = [
  // Assiduite (seances assistees)
  { id: 'sessions_10', name: 'Première vague', icon: 'checkmark-done', tier: 'bronze', metric: 'sessions', threshold: 10, description: '10 séances' },
  { id: 'sessions_50', name: 'Régulier', icon: 'checkmark-done', tier: 'silver', metric: 'sessions', threshold: 50, description: '50 séances' },
  { id: 'sessions_100', name: 'Infatigable', icon: 'checkmark-done', tier: 'gold', metric: 'sessions', threshold: 100, description: '100 séances' },
  { id: 'sessions_250', name: 'Légende du bassin', icon: 'checkmark-done', tier: 'diamond', metric: 'sessions', threshold: 250, description: '250 séances' },

  // Volume (km nages)
  { id: 'volume_10', name: 'Premiers kilomètres', icon: 'water', tier: 'bronze', metric: 'volumeKm', threshold: 10, description: '10 km nagés' },
  { id: 'volume_50', name: 'Traversée du lac', icon: 'water', tier: 'silver', metric: 'volumeKm', threshold: 50, description: '50 km nagés' },
  { id: 'volume_100', name: 'La Manche', icon: 'water', tier: 'gold', metric: 'volumeKm', threshold: 100, description: '100 km nagés' },
  { id: 'volume_500', name: 'Océanique', icon: 'water', tier: 'diamond', metric: 'volumeKm', threshold: 500, description: '500 km nagés' },

  // Feedbacks envoyes
  { id: 'feedback_10', name: 'À l\'écoute', icon: 'chatbubble-ellipses', tier: 'bronze', metric: 'feedbacks', threshold: 10, description: '10 feedbacks' },
  { id: 'feedback_25', name: 'Communicant', icon: 'chatbubble-ellipses', tier: 'silver', metric: 'feedbacks', threshold: 25, description: '25 feedbacks' },
  { id: 'feedback_50', name: 'Voix du bassin', icon: 'chatbubble-ellipses', tier: 'gold', metric: 'feedbacks', threshold: 50, description: '50 feedbacks' },

  // Streak (semaines consecutives)
  { id: 'streak_4', name: 'Un mois dans l\'eau', icon: 'flame', tier: 'bronze', metric: 'streakWeeks', threshold: 4, description: '4 semaines de suite' },
  { id: 'streak_12', name: 'Trimestre parfait', icon: 'flame', tier: 'silver', metric: 'streakWeeks', threshold: 12, description: '12 semaines de suite' },
  { id: 'streak_26', name: 'Demi-année de feu', icon: 'flame', tier: 'gold', metric: 'streakWeeks', threshold: 26, description: '26 semaines de suite' },
];
