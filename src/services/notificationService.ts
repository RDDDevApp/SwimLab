import { Platform } from 'react-native';
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

    const tokenData = await Notifications.getExpoPushTokenAsync();
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

  /** Get push tokens for a list of user IDs */
  async getTokensByUserIds(userIds: string[]): Promise<{ user_id: string; token: string }[]> {
    if (!userIds.length) return [];

    const { data, error } = await supabase
      .from('push_tokens')
      .select('user_id, token')
      .in('user_id', userIds);

    if (error) throw error;
    return data as { user_id: string; token: string }[];
  },

  /** Send push notification via Expo Push API */
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!FEATURES.push) return;
    if (!tokens.length) return;

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (err) {
      console.error('Push notification error:', err);
    }
  },

  /** Notify swimmers to give feedback after attendance */
  async notifyFeedbackRequired(
    swimmerIds: string[],
    workoutTitle: string,
  ): Promise<void> {
    const tokenData = await this.getTokensByUserIds(swimmerIds);
    const tokens = tokenData.map((t) => t.token);

    await this.sendPushNotifications(
      tokens,
      'Feedback demande',
      `Donne ton ressenti pour "${workoutTitle}"`,
      { type: 'feedback_required' },
    );
  },

  /** Notify swimmers of upcoming training */
  async notifyTrainingReminder(
    swimmerIds: string[],
    slotName: string,
    startTime: string,
  ): Promise<void> {
    const tokenData = await this.getTokensByUserIds(swimmerIds);
    const tokens = tokenData.map((t) => t.token);

    await this.sendPushNotifications(
      tokens,
      'Entrainement bientot',
      `${slotName} commence a ${startTime}`,
      { type: 'training_reminder' },
    );
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
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  },
};
