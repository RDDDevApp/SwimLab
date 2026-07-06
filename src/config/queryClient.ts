import { AppState, AppStateStatus, Platform } from 'react-native';
import { QueryClient, focusManager } from '@tanstack/react-query';

/**
 * Client TanStack Query — cache de requetes de l'app.
 * staleTime 30s : un retour rapide sur un ecran rend depuis le cache
 * sans refetch; au-dela, refetch en arriere-plan (stale-while-revalidate).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

/** Refetch automatique quand l'app revient au premier plan (mobile). */
export function setupFocusManager(): () => void {
  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active');
    }
  };
  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => subscription.remove();
}
