import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '@/src/api/client';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { ModernInput } from '@/src/components/ModernInput';
import { colors } from '@/styles/commonStyles';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. API Call
      const { user } = await authAPI.login(email.toLowerCase().trim(), password);

      // 2. SECURITY CHECK: Locked Account?
      if (user.account_status === 'locked') {
        Alert.alert(
          'Activation Required',
          'Your dashboard is locked. Please enter your Serial Number to activate.',
          [{ text: 'Activate Now', onPress: () => router.replace('/auth/activate') }]
        );
        return;
      }

      // 3. SECURITY CHECK: Suspended?
      if (user.account_status === 'suspended') {
        Alert.alert('Access Denied', 'Your account has been suspended. Please contact Admin.');
        return;
      }

      // 4. Normal Routing
      const routes = {
        client: '/(tabs)/(home)',
        artisan: '/artisan/dashboard',
        agent: '/agent/dashboard',
        lga_admin: '/agent/dashboard',        // Temporarily route admins to agent dashboard
        state_coordinator: '/agent/dashboard',// until dedicated screens are built
        admin: '/admin/dashboard'
      } as const;

      // Note: Cast user.role to ensure TS is happy with the string
      const targetRoute = routes[user.role as keyof typeof routes] || '/(tabs)/(home)';
      router.replace(targetRoute);

    } catch (error: any) {
      const msg = error.message || 'Invalid credentials';
      if (msg.includes('suspended')) {
        Alert.alert('Access Denied', 'Your account is suspended.');
      } else {
        Alert.alert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    setEmail(`${role}@example.com`);
    setPassword('password123');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop' }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
        locations={[0, 0.6, 1]}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" translucent={true} backgroundColor="transparent" />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* Header Section */}
              <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()} style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('@/assets/images/smahi.png')} // Adjusted path to standard alias
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to manage your artisan needs
                </Text>
              </Animated.View>

              {/* Form Section */}
              <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.formContainer}>

                {/* Glass Card Effect */}
                <View style={styles.glassCard}>
                  <ModernInput
                    label="Email Address"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="envelope.fill"
                  />

                  <ModernInput
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                    icon="lock.fill"
                  />

                  <View style={styles.forgotContainer}>
                    <Pressable onPress={() => Alert.alert("Reset", "Password reset flow")}>
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </Pressable>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.loginBtnShadow}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, '#0056b3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginBtnGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.loginBtnText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
                    Don't have an account?{' '}
                  </Text>
                  <Pressable onPress={() => router.push('/register')}>
                    <Text style={[styles.linkText, { color: colors.primary }]}>
                      Create Account
                    </Text>
                  </Pressable>
                </View>

              </Animated.View>

              {/* Quick Demo Login */}
              <Animated.View entering={FadeInDown.delay(600)} style={styles.demoSection}>
                <Text style={styles.demoLabel}>Quick Demo Login</Text>
                <View style={styles.demoRow}>
                  {['Client', 'Artisan', 'Agent'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      activeOpacity={0.7}
                      onPress={() => fillDemo(role.toLowerCase())}
                      style={styles.demoChip}
                    >
                      <Text style={styles.demoChipText}>{role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    paddingBottom: 50,
  },

  // Header
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 100, height: 100,
    marginBottom: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  logoImage: {
    width: '100%', height: '100%',
  },
  title: {
    fontSize: 28, fontWeight: '800',
    color: '#111827', marginBottom: 8,
    textAlign: 'center', letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16, color: '#6B7280',
    textAlign: 'center', maxWidth: '85%', lineHeight: 22,
  },

  // Form
  formContainer: { width: '100%' },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFF',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    marginBottom: 24,
  },

  // Forgot Password
  forgotContainer: { alignItems: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { fontWeight: '600', fontSize: 13, color: colors.primary },

  // Button
  loginBtnShadow: {
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
    borderRadius: 16,
  },
  loginBtnGradient: {
    height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Footer Link
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { fontWeight: '700', fontSize: 15 },

  // Demo Section
  demoSection: { marginTop: 40, alignItems: 'center' },
  demoLabel: {
    fontSize: 11, marginBottom: 16,
    textTransform: 'uppercase', letterSpacing: 1.2,
    color: '#9CA3AF', fontWeight: '600',
  },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  demoChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
});