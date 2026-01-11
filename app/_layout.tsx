// app/_layout.tsx

import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, View } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";

// ✅ 1. Import the Notification Provider
import { NotificationProvider } from '@/src/context/NotificationContext';
import '@/src/i18n';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
        "You can keep using the app! Your changes will be saved locally."
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
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
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
        {/* ✅ 2. Wrap App in NotificationProvider */}
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

            <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
              {/* Auth & Base Screens */}
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Dashboard Screens */}
              <Stack.Screen name="artisan/dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="agent/dashboard" options={{ headerShown: false }} />
              <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />

              {/* ✅ 3. Add Chat & Profile Screens */}
              <Stack.Screen name="artisan-profile" options={{ headerShown: false }} />
              <Stack.Screen name="chat/index" options={{ headerShown: false }} />
              <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />

              <Stack.Screen name="+not-found" />
            </Stack>

            <SystemBars style="auto" />
          </GestureHandlerRootView>
        </NotificationProvider>
      </WidgetProvider>
    </ThemeProvider>
  );
}