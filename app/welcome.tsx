import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Button } from '@/src/components/ui';

const TRUST_POINTS: { icon: keyof typeof MaterialIcons.glyphMap; title: string; text: string }[] = [
  {
    icon: 'verified-user',
    title: 'Verified artisans',
    text: 'Every professional is identity-checked by our field agents.',
  },
  {
    icon: 'near-me',
    title: 'Close to you',
    text: 'Find skilled hands in your neighbourhood, not across town.',
  },
  {
    icon: 'star',
    title: 'Rated by real clients',
    text: 'Honest reviews from people who booked before you.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.hero}>
          <View style={styles.logoTile}>
            <Image
              source={require('@/assets/images/smahi.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.eyebrow}>{t('greeting')}</Text>
          <Text style={styles.title}>
            {t('Skilled hands,')}
            {'\n'}
            {t('right next door.')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.points}>
          {TRUST_POINTS.map((point) => (
            <View key={point.icon} style={styles.pointRow}>
              <View style={styles.pointIcon}>
                <MaterialIcons name={point.icon} size={20} color={color.accent600} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>{t(point.title)}</Text>
                <Text style={styles.pointBody}>{t(point.text)}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.ctas}>
          <Button title={t('Get started')} onPress={() => router.push('/register')} />
          <Button
            title={t('I already have an account')}
            variant="secondary"
            onPress={() => router.push('/login')}
            style={styles.secondaryCta}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.canvas,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.xxl,
    justifyContent: 'center',
  },
  hero: { marginBottom: space.xxxl },
  logoTile: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xxl,
    ...shadow.e2,
  },
  logo: { width: 64, height: 64 },
  eyebrow: {
    fontFamily: font.extrabold,
    fontSize: 12.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.brand600,
    marginBottom: space.sm,
  },
  title: {
    ...type.display,
    lineHeight: 40,
  },
  points: { gap: space.lg, marginBottom: space.xxxl },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: color.accent100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  pointText: { flex: 1 },
  pointTitle: {
    fontFamily: font.extrabold,
    fontSize: 14.5,
    color: color.ink900,
  },
  pointBody: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 19,
    color: color.ink400,
    marginTop: 2,
  },
  ctas: { gap: space.md },
  secondaryCta: { marginTop: 0 },
});
