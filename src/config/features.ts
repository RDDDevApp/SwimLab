/**
 * Feature flags SwimLab.
 *
 * push : notifications push via expo-notifications + Expo Push API.
 * L'enregistrement du token se fait au login (AppNavigator) ; l'envoi
 * passe par l'Edge Function supabase/functions/send-push (rappels
 * planifies) et par notificationService (envois directs post-emargement).
 */
export const FEATURES = {
  push: true,
  /** Panneau de connexion rapide aux comptes de demo (supabase/seed/demo_seed.sql). A couper avant le pilote. */
  demo: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
} as const;
