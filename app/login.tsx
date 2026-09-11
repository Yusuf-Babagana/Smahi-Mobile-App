import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Button, Input, useToast } from '@/src/components/ui';
import { paymentAPI } from '@/src/api/client';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { show: showToast } = useToast();

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast(t('Please enter both email and password.'), { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: email.toLowerCase().trim(), password });

      if (user.account_status === 'locked') {
        showToast('Activation Required: Your dashboard is locked. Please enter your Serial Number to activate.', { type: 'warn' });
        router.replace('/activate');
        return;
      }

      if (user.account_status === 'suspended') {
        showToast('Your account has been suspended. Please contact Admin.', { type: 'error' });
        return;
      }

      // ✅ Agents created by a Coordinator start out pending approval — they
      // can log in (is_active stays true so this branch is even reachable)
      // but must not reach the real Agent Dashboard until approved.
      if (user.account_status === 'pending_approval') {
        router.replace('/agent-pending-approval');
        return;
      }

      // ✅ Artisans and businesses who haven't paid registration fee are redirected to payment
      if ((user.role === 'artisan' || user.role === 'business') && user.registration_fee_paid === false) {
        try {
          const payResult = await paymentAPI.initialize();
          router.replace({
            pathname: '/payment',
            params: {
              authorizationUrl: payResult.authorization_url,
              reference: payResult.reference,
            },
          });
          return;
        } catch (payErr: any) {
          // Fee already settled server-side (stale local flag): continue in.
          if (payErr?.response?.data?.already_paid) {
            router.replace(getHomeRouteForRole(user.role));
            return;
          }
          const errorMsg = payErr?.response?.data?.error || 'You must pay the ₦2,500 registration fee to activate your account. Please try again.';
          showToast(errorMsg, { type: 'error' });
          return;
        }
      }

      router.replace(getHomeRouteForRole(user.role));
    } catch (error: any) {
      // The backend sends a specific reason ({"error": "Invalid credentials."} /
      // "User account is disabled.") — error.message is just axios's generic
      // "Request failed with status code 401", which told the user nothing.
      const msg = error.response?.data?.error || error.message || 'Invalid credentials';
      showToast(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar Navigation */}
          <Animated.View entering={FadeInUp.duration(350)}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
              accessibilityRole="button"
              accessibilityLabel={t('Back')}
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
            </Pressable>
          </Animated.View>

          {/* Hero Header */}
          <Animated.View entering={FadeInUp.delay(60).duration(400)} style={styles.hero}>
            <View style={styles.logoRing}>
              <View style={styles.logoTile}>
                <Image
                  source={require('@/assets/images/smahi.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>{t('Welcome back')}</Text>
            <Text style={styles.subtitle}>{t('Sign in to continue where you left off.')}</Text>
          </Animated.View>

          {/* Elevated Glassmorphic Form Card */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.card}>
            <View style={styles.accentBar} />
            <Input
              label={t('Email or phone number')}
              placeholder={t('Enter your email or phone number')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon="person-outline"
              containerStyle={styles.field}
            />
            <Input
              label={t('Password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon="lock-outline"
              trailingIcon={showPassword ? 'visibility-off' : 'visibility'}
              onTrailingIconPress={() => setShowPassword((s) => !s)}
              containerStyle={styles.field}
            />

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotBtn}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>{t('Forgot password?')}</Text>
            </TouchableOpacity>

            <Button title={t('Sign in')} onPress={handleLogin} loading={loading} />
          </Animated.View>

          {/* Verified Trust Badge */}
          <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.trustBadgeWrapper}>
            <View style={styles.trustBadge}>
              <MaterialIcons name="verified-user" size={15} color={color.accent600} />
              <Text style={styles.trustText}>{t('Trusted by verified artisans across Nigeria')}</Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.footer}>
            <Text style={styles.footerText}>{t("Don't have an account?")}</Text>
            <TouchableOpacity onPress={() => router.push('/register')} accessibilityRole="button">
              <Text style={styles.footerLink}>{t('Create account')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    top: -120,
    alignSelf: 'center',
    width: width * 1.3,
    height: 380,
    borderRadius: 200,
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.5,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#EDF2F8',
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.e1,
  },

  hero: {
    alignItems: 'center',
    marginTop: space.lg,
    marginBottom: space.xxl,
  },
  logoRing: {
    padding: 3,
    borderRadius: 30,
    backgroundColor: 'rgba(27, 95, 217, 0.08)',
    marginBottom: space.lg,
  },
  logoTile: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EEF2F8',
    ...shadow.e2,
  },
  logo: {
    width: 52,
    height: 52,
  },
  title: {
    ...type.titleLg,
    fontSize: 27,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 21,
    color: color.ink400,
    textAlign: 'center',
    marginTop: 6,
  },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xxl,
    borderWidth: 1.5,
    borderColor: '#EEF2F8',
    padding: space.xxl,
    overflow: 'hidden',
    ...shadow.e2,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: space.xxl,
    right: space.xxl,
    height: 3,
    backgroundColor: color.brand100,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  field: {
    marginBottom: space.lg,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: space.xl,
    marginTop: -2,
  },
  forgotText: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: color.brand600,
  },

  trustBadgeWrapper: {
    alignItems: 'center',
    marginTop: space.xl,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.accent100,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.18)',
  },
  trustText: {
    fontFamily: font.bold,
    fontSize: 11.5,
    color: color.accent600,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: space.xxl,
  },
  footerText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: color.ink400,
  },
  footerLink: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: color.brand600,
  },
});
