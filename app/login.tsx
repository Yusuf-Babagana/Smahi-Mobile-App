import React, { useState } from 'react';
import {
  Alert,
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
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Button, Input } from '@/src/components/ui';
import { paymentAPI } from '@/src/api/client';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('Missing Fields'), t('Please enter both email and password.'));
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: email.toLowerCase().trim(), password });

      if (user.account_status === 'locked') {
        Alert.alert(
          'Activation Required',
          'Your dashboard is locked. Please enter your Serial Number to activate.',
          [{ text: 'Activate Now', onPress: () => router.replace('/activate') }]
        );
        return;
      }

      if (user.account_status === 'suspended') {
        Alert.alert('Access Denied', 'Your account has been suspended. Please contact Admin.');
        return;
      }

      // ✅ Artisans who haven't paid registration fee are redirected to payment
      if (user.role === 'artisan' && user.registration_fee_paid === false) {
        try {
          const payResult = await paymentAPI.initialize();
          router.replace({
            pathname: '/payment',
            params: {
              authorizationUrl: payResult.authorization_url,
              reference: payResult.reference,
            },
          });
        } catch (payErr: any) {
          // 503 = payments not configured yet on the backend: the fee stays
          // owed, but the artisan must not be locked out of the app.
          if (payErr?.response?.status === 503) {
            Alert.alert(
              'Payment Pending',
              'Payments are not available yet. You can use the app now and complete your registration fee later.',
              [{ text: 'Continue', onPress: () => router.replace(getHomeRouteForRole(user.role)) }]
            );
          } else {
            Alert.alert(
              'Payment Required',
              'You need to pay the registration fee to activate your account. Please try again.',
            );
          }
        }
        return;
      }

      router.replace(getHomeRouteForRole(user.role));
    } catch (error: any) {
      const msg = error.message || 'Invalid credentials';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Soft brand glow behind the hero */}
      <View style={styles.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.duration(300)}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
              accessibilityRole="button"
              accessibilityLabel={t('Back')}
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
            </Pressable>
          </Animated.View>

          {/* Hero */}
          <Animated.View entering={FadeInUp.delay(60).duration(350)} style={styles.hero}>
            <View style={styles.logoTile}>
              <Image
                source={require('@/assets/images/smahi.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.eyebrow}>{t('Barka da dawowa')}</Text>
            <Text style={styles.title}>{t('Welcome back')}</Text>
            <Text style={styles.subtitle}>{t('Sign in to continue where you left off.')}</Text>
          </Animated.View>

          {/* Form card */}
          <Animated.View entering={FadeInDown.delay(140).duration(350)} style={styles.card}>
            <Input
              label={t('Email address')}
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
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
            >
              <Text style={styles.forgotText}>{t('Forgot password?')}</Text>
            </TouchableOpacity>

            <Button title={t('Sign in')} onPress={handleLogin} loading={loading} />
          </Animated.View>

          {/* Trust note */}
          <Animated.View entering={FadeInDown.delay(220).duration(350)} style={styles.trustRow}>
            <MaterialIcons name="verified-user" size={14} color={color.accent600} />
            <Text style={styles.trustText}>{t('Trusted by verified artisans across Nigeria')}</Text>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.delay(280).duration(350)} style={styles.footer}>
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
  container: { flex: 1, backgroundColor: color.canvas },
  glow: {
    position: 'absolute',
    top: -140,
    alignSelf: 'center',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: color.brand100,
    opacity: 0.55,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: { alignItems: 'center', marginTop: space.xl, marginBottom: space.xxl },
  logoTile: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
    ...shadow.e2,
  },
  logo: { width: 58, height: 58 },
  eyebrow: {
    fontFamily: font.extrabold,
    fontSize: 11.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.brand600,
    marginBottom: 6,
  },
  title: { ...type.titleLg, textAlign: 'center' },
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
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.xxl,
    ...shadow.e2,
  },
  field: { marginBottom: space.lg },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: space.xl, marginTop: -4 },
  forgotText: { fontFamily: font.extrabold, fontSize: 13, color: color.brand600 },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: space.xl,
  },
  trustText: { fontFamily: font.bold, fontSize: 12, color: color.ink400 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: space.xxl,
  },
  footerText: { fontFamily: font.medium, fontSize: 14, color: color.ink400 },
  footerLink: { fontFamily: font.extrabold, fontSize: 14, color: color.brand600 },
});
