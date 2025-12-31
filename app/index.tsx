import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { storage } from '@/src/utils/storage';
import { authAPI } from '@/src/api/client';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const router = useRouter();
  const theme = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // 1. Check if we have a user saved in SecureStore
      const user = await storage.getCurrentUser();

      if (user) {
        // Optional: Verify token with backend (checks if session is still valid)
        // const freshProfile = await authAPI.getCurrentUser();
        // if (!freshProfile) throw new Error('Session expired');

        // 2. Navigate based on role (Client vs Artisan)
        if (user.role === 'artisan') {
          router.replace('/artisan/dashboard');
        } else if (user.role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (user.role === 'agent') {
          router.replace('/agent/dashboard');
        } else {
          // Default to Client Home
          router.replace('/(tabs)/(home)/');
        }
      } else {
        // 3. No user found, go to Login
        router.replace('/login');
      }
    } catch (error) {
      console.log('Session check failed:', error);
      router.replace('/login');
    } finally {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image
        source={require('@/assets/images/icon.png')} // Make sure you have an icon or remove this line
        style={{ width: 100, height: 100, marginBottom: 20, borderRadius: 20 }}
      />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});