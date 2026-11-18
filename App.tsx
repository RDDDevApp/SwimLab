import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { useFonts, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation';
import { lightTheme } from './src/config/theme';
import { queryClient, setupFocusManager } from './src/config/queryClient';
import GlobalSnackbar from './src/components/GlobalSnackbar';
import BackendStatusBanner from './src/components/BackendStatusBanner';
import { C, IS_DARK } from './src/config/tokens';

// Fond de la navigation (visible pendant les transitions) aligné sur la DA
const navigationTheme = {
  ...(IS_DARK ? DarkTheme : DefaultTheme),
  colors: {
    ...(IS_DARK ? DarkTheme : DefaultTheme).colors,
    primary: C.primary,
    background: C.bg,
    card: C.surface,
    text: C.ink,
    border: C.line,
  },
};

export default function App() {
  useEffect(() => setupFocusManager(), []);
  // Polices de la DA : Sora (titres, grands chiffres) et Figtree (texte)
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  // Fond de la DA le temps du chargement ; en cas d'échec, on continue avec les polices système
  if (!fontsLoaded && !fontError) {
    return <View style={[styles.container, { backgroundColor: C.bg }]} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider theme={lightTheme}>
            <NavigationContainer theme={navigationTheme}>
              <BackendStatusBanner />
              <AppNavigator />
              <GlobalSnackbar />
              <StatusBar style={IS_DARK ? 'light' : 'dark'} />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
});
