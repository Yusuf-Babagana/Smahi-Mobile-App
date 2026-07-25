import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppState, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { color } from '@/constants/theme';
import { presenceAPI } from '@/src/api/client';

// Artisan bottom navigation (prototype: Dashboard / Jobs / Chat / Portfolio).
// Same floating pill style as the client (tabs) group for consistency.
export default function ArtisanTabLayout() {
  const { t } = useTranslation();

  // Drives the "online now" badge clients see on this artisan's card/profile.
  // Lives here (not a single screen) so it covers all artisan tabs, and only
  // actually pings while the app is foregrounded — matches the polling-guard
  // pattern already used in NotificationContext.
  useEffect(() => {
    const sendHeartbeat = () => {
      if (AppState.currentState === 'active') {
        presenceAPI.heartbeat().catch(() => {});
      }
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: color.brand600,
        tabBarInactiveTintColor: color.ink300,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 15,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#FFFFFF',
          borderRadius: 25,
          height: 60,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('Dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('Jobs'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('Chat'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: t('Portfolio'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
