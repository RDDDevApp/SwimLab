/**
 * Feature flags SwimLab.
 *
 * push : les notifications push sont desactivees tant que `expo-notifications`
 * n'est pas installe et configure (Sprint notifications). notificationService
 * devient un no-op explicite quand ce flag est a false.
 */
export const FEATURES = {
  push: false,
} as const;
