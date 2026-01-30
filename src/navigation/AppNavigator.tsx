import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import AuthNavigator from './AuthNavigator';
import CoachNavigator from './CoachNavigator';
import SwimmerNavigator from './SwimmerNavigator';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, profile, isLoading, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06B6D4" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // Not authenticated
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : profile?.role === 'coach' ? (
        // Authenticated as Coach
        <Stack.Screen name="CoachApp" component={CoachNavigator} />
      ) : (
        // Authenticated as Swimmer
        <Stack.Screen name="SwimmerApp" component={SwimmerNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});
