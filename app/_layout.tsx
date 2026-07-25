// app/_layout.tsx

import "react-native-reanimated";
import React, { useEffect } from "react";
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
import { useColorScheme, Alert, View } from "react-native";
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
import { LocationProvider } from '@/src/contexts/LocationContext';
import '@/src/locales/i18n';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
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

  // Network check
  useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "Some features may not work until you reconnect."
      );
    }
  }, [networkState.isConnected]);

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
            <NotificationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
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
                  <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />

                  {/* ✅ 3. Add Chat & Profile Screens */}
                  <Stack.Screen name="artisan-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="artisan/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="booking/[artisanId]" options={{ headerShown: false }} />
                  <Stack.Screen name="booking/detail/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/index" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />

                  {/* Profile settings screens */}
                  <Stack.Screen name="personal-info" options={{ headerShown: false }} />
                  <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
                  <Stack.Screen name="help-center" options={{ headerShown: false }} />
                  <Stack.Screen name="report-problem" options={{ headerShown: false, presentation: 'modal' }} />
                  <Stack.Screen name="wallet" options={{ headerShown: false }} />

                  {/* Payment */}
                  <Stack.Screen name="payment" options={{ headerShown: false, presentation: 'modal' }} />

                  <Stack.Screen name="+not-found" />
                </Stack>

                <SystemBars style="auto" />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </NotificationProvider>
          </AuthProvider>
        </LocationProvider>
      </WidgetProvider>
    </ThemeProvider>
  );
}