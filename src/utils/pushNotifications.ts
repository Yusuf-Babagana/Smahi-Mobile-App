import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { deviceAPI } from '@/src/api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let cachedToken: string | null = null;

async function getExpoPushToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    cachedToken = data;
    return data;
  } catch (error) {
    console.log('Failed to get Expo push token:', error);
    return null;
  }
}

// Called once the user is authenticated (fresh login, registration, or a
// restored session on cold start) — requests permission if not already
// granted, then registers this device's token with the backend.
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const token = await getExpoPushToken();
    if (!token) return;

    await deviceAPI.register(token, Platform.OS);
  } catch (error) {
    console.log('Push registration failed:', error);
  }
}

// Called on logout so a signed-out device stops receiving pushes meant for
// the account that just logged out.
export async function unregisterCurrentDevice(): Promise<void> {
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    await deviceAPI.unregister(token);
  } catch (error) {
    console.log('Push unregister failed:', error);
  }
}
