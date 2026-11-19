import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme } from '../../config/theme';

/** Navigation simulée : on vérifie où l'écran envoie l'utilisateur. */
export function makeNavigation() {
  return { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn(), addListener: jest.fn(() => jest.fn()) };
}

/** Rend un écran avec le thème de l'app et un cache de requêtes neuf, sans nouvel essai. */
export function renderScreen(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
      </QueryClientProvider>,
    ),
  };
}
