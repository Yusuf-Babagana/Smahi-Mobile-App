import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from "expo-router/react-navigation";
import * as SecureStore from 'expo-secure-store';
import { storage } from '@/src/utils/storage';
import { authAPI, paymentAPI } from '@/src/api/client';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';
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
      // A cached user with no access token is a stale session (e.g. logout
      // didn't fully run, or storage got out of sync) — never trust the
      // cached user object on its own.
      const token = await SecureStore.getItemAsync('accessToken');
      const user = token ? await storage.getCurrentUser() : null;

      if (user) {
        // Optional: Verify token with backend (checks if session is still valid)
        // const freshProfile = await authAPI.getCurrentUser();
        // if (!freshProfile) throw new Error('Session expired');

        // 2. Account gates first (same rules as login), then route by role
        // via the shared map — cold start must land on the same screen login does.
        if (user.account_status === 'locked') {
          router.replace('/activate');
        } else if (user.account_status === 'suspended') {
          router.replace('/login');
        } else if (user.account_status === 'pending_approval') {
          router.replace('/agent-pending-approval');
        } else if ((user.role === 'artisan' || user.role === 'business') && user.registration_fee_paid === false) {
          // Same gate login.tsx applies on a fresh sign-in — needed here too
          // for a restored session (e.g. the user backed out of payment
          // last time and just reopened the app), since their own
          // dashboard/profile endpoints now 403 until the fee is paid.
          try {
            const payResult = await paymentAPI.initialize();
            router.replace({
              pathname: '/payment',
              params: { authorizationUrl: payResult.authorization_url, reference: payResult.reference },
            });
          } catch (payErr: any) {
            if (payErr?.response?.data?.already_paid) {
              // Stale local flag — the fee is actually settled server-side.
              router.replace(getHomeRouteForRole(user.role));
            } else {
              // Payment provider unreachable right now — send them to login
              // rather than the dashboard, whose profile calls would just
              // 403 until the fee clears; login.tsx surfaces a clear retry.
              router.replace('/login');
            }
          }
        } else {
          router.replace(getHomeRouteForRole(user.role));
        }
      } else {
        // 3. No user found, go to Welcome (register / login entry point)
        router.replace('/welcome');
      }
    } catch (error) {
      console.log('Session check failed:', error);
      router.replace('/welcome');
    } finally {
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
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