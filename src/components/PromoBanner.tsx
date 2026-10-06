import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { color, font, radius, shadow, space } from '@/constants/theme';

// Marketplace hero: brand gradient, illustration built from icon bubbles, the
// existing "every artisan is ID-verified" trust message, and a Smart Search CTA.
export function PromoBanner() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[color.brand900, color.brand600]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.circle, styles.circleA]} />
      <View style={[styles.circle, styles.circleB]} />

      <View style={styles.textCol}>
        <View style={styles.pill}>
          <MaterialIcons name="verified-user" size={13} color="#7FE3D6" />
          <Text style={styles.pillText}>{t('ID-verified')}</Text>
        </View>
        <Text style={styles.title}>{t('Hire trusted pros, fast')}</Text>
        <Text style={styles.sub}>
          {t('Every artisan is ID-verified by our field agents before they appear here.')}
        </Text>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          accessibilityRole="button"
          onPress={() => router.push('/smart-search')}
        >
          <MaterialIcons name="auto-awesome" size={16} color={color.brand900} />
          <Text style={styles.ctaText}>{t('Smart Search')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.art}>
        <View style={[styles.bubble, styles.b1]}><MaterialIcons name="plumbing" size={24} color="#FFF" /></View>
        <View style={[styles.bubble, styles.b2]}><MaterialIcons name="electrical-services" size={22} color="#FFF" /></View>
        <View style={[styles.bubble, styles.b3]}><MaterialIcons name="format-paint" size={22} color="#FFF" /></View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginTop: space.sm,
    padding: space.lg,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    ...shadow.cta,
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  circleA: { width: 160, height: 160, top: -60, right: -30 },
  circleB: { width: 90, height: 90, bottom: -30, right: 70 },
  textCol: { flex: 1, paddingRight: space.sm },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontFamily: font.bold, fontSize: 11, color: '#FFF' },
  title: { fontFamily: font.extrabold, fontSize: 20, letterSpacing: -0.2, color: '#FFF', marginTop: space.sm },
  sub: { fontFamily: font.medium, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: '#FFF', borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 9, marginTop: space.md,
  },
  ctaText: { fontFamily: font.extrabold, fontSize: 13, color: color.brand900 },
  art: { width: 84, alignItems: 'center', justifyContent: 'center' },
  bubble: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  b1: { width: 54, height: 54, borderRadius: 18, top: 0, right: 8 },
  b2: { width: 46, height: 46, borderRadius: 16, top: 56, right: 38 },
  b3: { width: 42, height: 42, borderRadius: 14, bottom: 0, right: 4 },
});
