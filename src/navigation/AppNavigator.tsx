import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { clubService } from '../services';
import AuthNavigator from './AuthNavigator';
import CoachNavigator from './CoachNavigator';
import SwimmerNavigator from './SwimmerNavigator';
import ClubSetupScreen from '../screens/onboarding/ClubSetupScreen';
import JoinClubScreen from '../screens/onboarding/JoinClubScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, user, profile, isLoading, isInitialized, initialize, setClubId, clubId } = useAuthStore();
  const [checkingClub, setCheckingClub] = useState(false);
  const [skippedOnboarding, setSkippedOnboarding] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  // Check if user has a club when profile loads
  useEffect(() => {
    const checkClub = async () => {
      if (!user || !profile) {
        return;
      }
      setCheckingClub(true);
      try {
        const clubs = await clubService.getByUser(user.id);
        if (clubs.length > 0) {
          setClubId(clubs[0].id);
        }
      } catch {
        // Club check failed, will show onboarding
      } finally {
        setCheckingClub(false);
      }
    };
    checkClub();
  }, [user, profile]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading || (session && !clubId && !skippedOnboarding && checkingClub)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06B6D4" />
      </View>
    );
  }

  const hasClub = !!clubId;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // Not authenticated
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasClub && !skippedOnboarding && profile?.role === 'coach' ? (
        // Coach without a club -> onboarding
        <Stack.Screen name="Onboarding" component={ClubSetupScreen} />
      ) : !hasClub && !skippedOnboarding && profile?.role === 'swimmer' ? (
        // Swimmer without a club -> join
        <Stack.Screen name="Onboarding">
          {(props) => (
            <JoinClubScreen
              {...props}
              onSkip={() => setSkippedOnboarding(true)}
            />
          )}
        </Stack.Screen>
      ) : profile?.role === 'coach' ? (
        // Authenticated coach with club
        <Stack.Screen name="CoachApp" component={CoachNavigator} />
      ) : (
        // Authenticated swimmer with club (or skipped)
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
