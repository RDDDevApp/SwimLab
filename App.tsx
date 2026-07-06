import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation';
import { lightTheme } from './src/config/theme';
import { queryClient, setupFocusManager } from './src/config/queryClient';
import GlobalSnackbar from './src/components/GlobalSnackbar';
import BackendStatusBanner from './src/components/BackendStatusBanner';

export default function App() {
  useEffect(() => setupFocusManager(), []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider theme={lightTheme}>
            <NavigationContainer>
              <BackendStatusBanner />
              <AppNavigator />
              <GlobalSnackbar />
              <StatusBar style="auto" />
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
  },
});
