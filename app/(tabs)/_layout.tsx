import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { colors, shadows } from '@/styles/commonStyles'; // Adjusted to match standard path

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hides bar when typing (Clean!)
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF', // Cool Gray
        tabBarShowLabel: true, // We keep labels but make them tiny

        // --- 1. PREMIUM FLOATING BAR STYLE ---
        tabBarStyle: {
          position: 'absolute', // Floats over content
          bottom: Platform.OS === 'ios' ? 20 : 15, // Lifted up
          left: 20,
          right: 20, // Margins on side make it look like a pill
          elevation: 5, // Android Shadow
          backgroundColor: '#FFFFFF',
          borderRadius: 25, // Rounded corners
          height: 60, // Very compact height
          borderTopWidth: 0, // Remove default line
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 0, // Removes extra bottom padding
          paddingTop: 0,
        },

        // --- 2. COMPACT TEXT ---
        tabBarLabelStyle: {
          fontSize: 9, // Very small, professional text
          fontWeight: '600',
          marginBottom: 8, // Spacing from bottom
        },

        // --- 3. ICON ALIGNMENT ---
        tabBarIconStyle: {
          marginTop: 8, // Push icon down slightly
        },
      }}
    >
      {/* HOME TAB */}
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* CHAT TAB (Hidden from bar, accessed via Header) */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />

      {/* PROFILE TAB */}
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// Optional: Subtle background for active state if you want it
const styles = StyleSheet.create({
  activeIconContainer: {
    // If you want a glowing effect, uncomment below:
    // backgroundColor: '#F3F4F6',
    // borderRadius: 12,
    // padding: 4,
  }
});