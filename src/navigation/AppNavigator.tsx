import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { clubService, notificationService } from '../services';
import { useSnackbarStore } from '../stores/snackbarStore';
import { consumePendingInvite } from '../utils/pendingInvite';
import { clearInviteCodeFromUrl } from '../utils/invite';
import AuthNavigator from './AuthNavigator';
import CoachNavigator from './CoachNavigator';
import SwimmerNavigator from './SwimmerNavigator';
import ClubSetupScreen from '../screens/onboarding/ClubSetupScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, user, profile, isLoading, isInitialized, initialize, setClubId, clubId } = useAuthStore();
  const [checkingClub, setCheckingClub] = useState(false);
  const showSnackbar = useSnackbarStore((s) => s.show);

  useEffect(() => {
    initialize();
    notificationService.setupNotificationHandler();
  }, []);

  // Enregistrement du token push apres connexion (no-op si FEATURES.push off)
  useEffect(() => {
    if (user) {
      notificationService.registerForPushNotifications(user.id).catch(() => {});
    }
  }, [user?.id]);

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
          clearInviteCodeFromUrl();
        } else {
          // Code d'invitation en attente (lien ouvert ou saisi a l'inscription)
          const invite = await consumePendingInvite(user, profile.role === 'coach' ? 'coach' : 'swimmer');
          if (invite?.status === 'joined') {
            setClubId(invite.clubId);
            showSnackbar(`Bienvenue dans ${invite.clubName} !`, 'success');
          } else if (invite?.status === 'failed') {
            showSnackbar(invite.message, 'error');
          }
        }
      } catch {
        // Club check failed
      } finally {
        setCheckingClub(false);
      }
    };
    checkClub();
  }, [user, profile]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading || (session && checkingClub)) {
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
      ) : !hasClub && profile?.role === 'coach' ? (
        // Coach without a club -> onboarding
        <Stack.Screen name="Onboarding" component={ClubSetupScreen} />
      ) : profile?.role === 'coach' ? (
        // Authenticated coach with club
        <Stack.Screen name="CoachApp" component={CoachNavigator} />
      ) : (
        // Authenticated swimmer (join club available from Profile)
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
    backgroundColor: '#82C8D1',
  },
});
