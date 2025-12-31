import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native'; // Import useTheme
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const theme = useTheme(); // Get the current theme

  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Home',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          // FIX: Use the actual theme background color instead of transparent
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}