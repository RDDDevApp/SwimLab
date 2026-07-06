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
} as const;
