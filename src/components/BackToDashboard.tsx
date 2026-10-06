import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { color, font, radius, space } from '@/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';

// Non-client roles (artisan, business, agent, coordinator, admin) browse and
// book through the shared marketplace (the client Home tab). This is their
// one-tap way back to their own dashboard. Renders nothing for clients.
export function BackToDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user?.role || user.role === 'client') return null;

  return (
    <TouchableOpacity
      style={styles.bar}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t('Back to my dashboard')}
      onPress={() => router.replace(getHomeRouteForRole(user.role) as any)}
    >
      <MaterialIcons name="arrow-back" size={18} color={color.brand600} />
      <Text style={styles.text}>{t('Back to my dashboard')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.xl,
    marginBottom: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: color.brand100,
    borderRadius: radius.lg,
  },
  text: { fontFamily: font.bold, fontSize: 13.5, color: color.brand600 },
});
