import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Button } from '@/src/components/ui';

const { width } = Dimensions.get('window');

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

      {/* Layered Ambient Brand Glows (strict color preservation: brand100 & accent100) */}
      <View style={styles.ambientContainer} pointerEvents="none">
        <LinearGradient
          colors={[color.brand100, 'rgba(253, 253, 252, 0)']}
          style={styles.topGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[color.accent100, 'rgba(253, 253, 252, 0)']}
          style={styles.bottomGlow}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </View>

      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.duration(450)} style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logoTile}>
              <Image
                source={require('@/assets/images/smahi.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.badgePill}>
            <MaterialIcons name="verified" size={14} color={color.brand600} />
            <Text style={styles.badgeText}>{t('greeting')}</Text>
          </View>

          <Text style={styles.title}>
            {t('Skilled hands,')}
            {'\n'}
            <Text style={styles.titleAccent}>{t('right next door.')}</Text>
          </Text>
        </Animated.View>

        {/* Polished Glassmorphic Trust Cards */}
        <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.points}>
          {TRUST_POINTS.map((point, index) => (
            <Animated.View
              key={point.icon}
              entering={FadeInDown.delay(160 + index * 70).duration(400)}
              style={styles.card}
            >
              <View style={styles.pointIconBox}>
                <MaterialIcons name={point.icon} size={22} color={color.accent600} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>{t(point.title)}</Text>
                <Text style={styles.pointBody}>{t(point.text)}</Text>
              </View>
              <MaterialIcons name="check-circle" size={18} color={color.accent600} style={styles.checkIcon} />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Action CTAs */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={styles.ctas}>
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
  ambientContainer: {
    ...(StyleSheet.absoluteFill as object),
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: width * 1.3,
    height: 380,
    borderRadius: 200,
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.xxl,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: space.xxl,
  },
  logoRing: {
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: 30,
    backgroundColor: 'rgba(27, 95, 217, 0.08)',
    marginBottom: space.xl,
  },
  logoTile: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EEF2F8',
    ...shadow.e2,
  },
  logo: {
    width: 56,
    height: 56,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: color.brand100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: space.md,
  },
  badgeText: {
    fontFamily: font.extrabold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: color.brand600,
  },
  title: {
    ...type.display,
    fontSize: 32,
    lineHeight: 40,
  },
  titleAccent: {
    color: color.brand600,
  },
  points: {
    gap: space.md,
    marginBottom: space.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    ...shadow.e1,
  },
  pointIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.accent100,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  pointText: {
    flex: 1,
    marginRight: space.xs,
  },
  pointTitle: {
    fontFamily: font.extrabold,
    fontSize: 14.5,
    color: color.ink900,
  },
  pointBody: {
    fontFamily: font.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.ink400,
    marginTop: 2,
  },
  checkIcon: {
    opacity: 0.85,
  },
  ctas: {
    gap: space.md,
  },
  secondaryCta: {
    marginTop: 0,
  },
});
