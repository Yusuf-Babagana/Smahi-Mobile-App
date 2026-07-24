import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  Alert, BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import { authAPI, paymentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, shadow, space } from '@/constants/theme';

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { authorizationUrl, reference } = useLocalSearchParams<{
    authorizationUrl: string;
    reference: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const hasVerified = useRef(false);
  const { setAuthUser } = useAuth();

  // Block hardware back button during payment
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // always block
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  const handleVerify = useCallback(async (ref: string) => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    setVerifying(true);

    try {
      const result = await paymentAPI.verify(ref);
      if (result.status === 'success') {
        // The verify endpoint doesn't return the updated user — fetch it so
        // AuthContext reflects the now-active, fee-paid account instead of
        // leaving the dashboard to discover this on its own.
        try {
          const freshUser = await authAPI.getProfile();
          if (freshUser) await setAuthUser(freshUser);
        } catch { /* dashboard still self-fetches as a fallback */ }

        Alert.alert(
          'Payment Successful',
          'Your account is now active! Welcome to S-MAHII.',
          [{ text: 'Continue', onPress: () => router.replace('/artisan/(tabs)/dashboard') }]
        );
      } else {
        Alert.alert('Payment Failed', 'Payment was not successful. Please try again.', [
          { text: 'Retry', onPress: () => router.replace('/login') },
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Verification failed. Please contact support.';
      Alert.alert('Error', msg, [
        { text: 'Go to Login', onPress: () => router.replace('/login') },
      ]);
    } finally {
      setVerifying(false);
    }
  }, [router]);

  const handleNavigationStateChange = useCallback((navState: any) => {
    const url = navState.url || '';

    // Paystack redirects to a URL containing the reference after success
    if (url.includes('reference=') || url.includes('trxref=')) {
      const refMatch = url.match(/[?&](?:reference|trxref)=([^&]+)/);
      if (refMatch) {
        handleVerify(refMatch[1]);
        return;
      }
    }

    // Also check for Paystack's callback pattern
    if (url.includes('/callback') || url.includes('status=success')) {
      if (reference) {
        handleVerify(reference);
      }
    }
  }, [reference, handleVerify]);

  const handleRetry = () => {
    hasVerified.current = false;
    setError(null);
    webViewRef.current?.reload();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel? You can complete payment later from your profile.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        { text: 'Cancel', onPress: () => router.replace('/login'), style: 'destructive' },
      ]
    );
  };

  if (!authorizationUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorWrap}>
          <MaterialIcons name="error-outline" size={48} color={color.danger600} />
          <Text style={styles.errorTitle}>Payment URL missing</Text>
          <Text style={styles.errorSubtitle}>Please try registering again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/register')}>
            <Text style={styles.retryBtnText}>Back to Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
          <MaterialIcons name="close" size={20} color={color.ink900} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Registration Fee</Text>
          <Text style={styles.headerSubtitle}>₦2,500 — Secure payment via Paystack</Text>
        </View>
      </View>

      {/* Loading overlay */}
      {(loading || verifying) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={color.brand600} />
          <Text style={styles.loadingText}>
            {verifying ? 'Verifying payment...' : 'Loading payment page...'}
          </Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorWrap}>
          <MaterialIcons name="wifi-off" size={48} color={color.ink300} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <MaterialIcons name="refresh" size={18} color="#FFF" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: authorizationUrl }}
        style={[styles.webview, (loading || verifying || error) && { opacity: 0 }]}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => { if (!hasVerified.current) setLoading(true); setError(null); }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('Network error. Please check your internet connection.');
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => <></>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: space.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  headerSubtitle: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 2 },

  webview: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.surface,
    zIndex: 10,
    gap: space.md,
  },
  loadingText: { fontFamily: font.bold, fontSize: 14, color: color.ink400 },

  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xxxl,
    gap: space.md,
  },
  errorTitle: { fontFamily: font.extrabold, fontSize: 18, color: color.ink900, textAlign: 'center' },
  errorSubtitle: { fontFamily: font.medium, fontSize: 14, color: color.ink400, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.brand600,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.full,
    marginTop: space.md,
  },
  retryBtnText: { fontFamily: font.bold, fontSize: 14, color: '#FFF' },
  cancelLink: { marginTop: space.md },
  cancelLinkText: { fontFamily: font.bold, fontSize: 13, color: color.ink400 },
});
