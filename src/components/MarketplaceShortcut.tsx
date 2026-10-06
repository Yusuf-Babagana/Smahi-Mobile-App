import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { color, font, radius, shadow, space } from '@/constants/theme';

// Every role (client, artisan, business, agent, coordinator, admin) can shop,
// book and hire. This is the one door from a role dashboard into the shared
// marketplace (the client Home tab), which has no role guard.
export function MarketplaceShortcut({ style }: { style?: object }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('Shop, book or hire')}
      onPress={() => router.push('/(tabs)/(home)' as any)}
    >
      <View style={styles.iconBox}>
        <MaterialIcons name="storefront" size={24} color={color.brand600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('Shop, book or hire')}</Text>
        <Text style={styles.sub}>{t('Find artisans, businesses and services')}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={color.ink300} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.xl,
    marginVertical: space.md,
    padding: space.lg,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    ...shadow.e2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
  sub: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 2 },
});
