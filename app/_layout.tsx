// app/_layout.tsx

import "react-native-reanimated";
import React, { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "@/src/components/Keyboard";
import { useColorScheme, View } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/src/contexts/WidgetContext";

// ✅ 1. Import the Notification Provider
import { NotificationProvider } from '@/src/contexts/NotificationContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PushNotificationManager } from '@/src/components/PushNotificationManager';
import { LocationProvider } from '@/src/contexts/LocationContext';
import { ToastProvider, useToast } from '@/src/components/ui/Toast';
import { ConfirmProvider } from '@/src/components/ui/Dialog';
import { startAutoSync, subscribeToQueue, QueueItemStatus } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';
import '@/src/locales/i18n';


SplashScreen.preventAutoHideAsync();

// useToast() only works below <ToastProvider>, which RootLayout itself
// renders — so the offline notice lives in its own child component instead
// of RootLayout's body.
function OfflineNotice() {
  const { show } = useToast();
  const networkState = useNetworkState();

  useEffect(() => {
    if (!networkState.isConnected && networkState.isInternetReachable === false) {
      show("You're offline — some features may not work until you reconnect.", {
        type: 'warn',
        duration: 4000,
      });
    }
  }, [networkState.isConnected, networkState.isInternetReachable, show]);

  return null;
}

// Registers every offline-queue "type" this app knows how to sync, and
// re-attempts them the moment the device regains network (see
// src/utils/offlineQueue.ts). Lives app-wide (not just on the agent
// registration screen) so a queued item still syncs even if the agent has
// already navigated away or the app was reopened after being killed.
function OfflineSyncManager() {
  const { show } = useToast();
  const prevStatuses = useRef<Record<string, QueueItemStatus>>({});

  useEffect(() => {
    return startAutoSync(syncSubmitters);
  }, []);

  // Best-effort toast the moment a queued item's fate is decided — purely
  // a nice-to-have while the app happens to be open; the Pending Sync
  // status view (agent/dashboard) is the source of truth either way.
  useEffect(() => {
    return subscribeToQueue((items) => {
      for (const item of items) {
        const prev = prevStatuses.current[item.id];
        if (prev && prev !== item.status) {
          if (item.status === 'server_verified') {
            if (item.type === 'service_booking') {
              show('Synced: a queued booking request ✅', { type: 'success' });
            } else {
              const name = [item.payload?.first_name, item.payload?.last_name].filter(Boolean).join(' ');
              show(`Synced: ${name || 'a queued registration'} ✅`, { type: 'success' });
            }
          } else if (item.status === 'failed') {
            const what = item.type === 'service_booking' ? 'booking request' : 'registration';
            show(`A queued ${what} could not be synced — check Pending Sync.`, { type: 'error' });
          }
        }
        prevStatuses.current[item.id] = item.status;
      }
    });
  }, [show]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Your Custom Themes
  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "#1B5FD9",
      background: "#F6F8FB",
      card: "#FFFFFF",
      text: "#0B1F3F",
      border: "#E2E8F0",
      notification: "#DC2626",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  const theme = colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <WidgetProvider>
        <LocationProvider>
          {/* ✅ Wrap App in AuthProvider & NotificationProvider */}
          <AuthProvider>
            <PushNotificationManager />
            <NotificationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                <ToastProvider>
                <ConfirmProvider>
                <OfflineNotice />
                <OfflineSyncManager />
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

                <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
                  {/* Auth & Base Screens */}
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register" options={{ headerShown: false }} />
                  <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="verify-email" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                  {/* Dashboard Screens */}
                  <Stack.Screen name="artisan/(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="artisan/profile" options={{ headerShown: false }} />
                  <Stack.Screen name="agent/dashboard" options={{ headerShown: false }} />
                  <Stack.Screen name="business/dashboard" options={{ headerShown: false }} />
                  <Stack.Screen name="coordinator/agents" options={{ headerShown: false }} />
                  <Stack.Screen name="coordinator/create-agent" options={{ headerShown: false }} />
                  <Stack.Screen name="coordinator/reports" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />

                  {/* ✅ 3. Add Chat & Profile Screens */}
                  <Stack.Screen name="artisan-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="artisan/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="booking/[artisanId]" options={{ headerShown: false }} />
                  <Stack.Screen name="booking/detail/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/index" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/ai" options={{ headerShown: false }} />

                  {/* Profile settings screens */}
                  <Stack.Screen name="personal-info" options={{ headerShown: false }} />
                  <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
                  <Stack.Screen name="favorites" options={{ headerShown: false }} />
                  <Stack.Screen name="help-center" options={{ headerShown: false }} />
                  <Stack.Screen name="report-problem" options={{ headerShown: false, presentation: 'modal' }} />

                  {/* Payment */}
                  <Stack.Screen name="payment" options={{ headerShown: false, presentation: 'modal' }} />

                  <Stack.Screen name="+not-found" />
                </Stack>

                <SystemBars style="auto" />
                </ConfirmProvider>
                </ToastProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </NotificationProvider>
          </AuthProvider>
        </LocationProvider>
      </WidgetProvider>
    </ThemeProvider>
  );
}