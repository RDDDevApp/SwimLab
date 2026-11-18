import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';
import { FEATURES } from '../config/features';

// Les push sont derriere FEATURES.push : tant que le flag est false
// (expo-notifications non installe/configure), tout le service est un no-op explicite.
let Notifications: any = null;
if (FEATURES.push) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // expo-notifications not installed yet
  }
}

export const notificationService = {
  /** Register for push notifications and save token */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Notifications) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Android 8+ : sans canal, les notifications n'apparaissent pas
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SwimLab',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Identifiant du projet Expo (EAS) : obligatoire pour obtenir un jeton dans une app installée
    const projectId = getEasProjectId();
    const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = tokenData.data;

    // Save token to database
    await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS as 'ios' | 'android' | 'web',
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,token' },
      );

    return token;
  },

  /** Remove push token on logout */
  async removePushToken(userId: string, token: string): Promise<void> {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);
  },

  /**
   * Demande aux nageurs présents de donner leur ressenti, juste après l'émargement.
   * L'envoi passe par l'Edge Function send-push : l'app ne peut pas lire les jetons
   * des autres utilisateurs (RLS de push_tokens).
   */
  async requestFeedback(assignmentId: string): Promise<void> {
    if (!FEATURES.push) return;
    await supabase.functions.invoke('send-push', {
      body: { type: 'feedback_request', assignment_id: assignmentId },
    });
  },

  /** Schedule a local notification (for reminders) */
  async scheduleLocalNotification(
    title: string,
    body: string,
    triggerDate: Date,
  ): Promise<string | null> {
    if (!Notifications) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { date: triggerDate },
    });

    return id;
  },

  /** Cancel all scheduled notifications */
  async cancelAllScheduledNotifications(): Promise<void> {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /** Setup notification handler (call in App.tsx) */
  setupNotificationHandler(): void {
    if (!Notifications) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  },
};

/** projectId EAS écrit dans app.json (extra.eas.projectId) par « eas init », ou fourni par le build. */
function getEasProjectId(): string | undefined {
  return Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? undefined;
}
