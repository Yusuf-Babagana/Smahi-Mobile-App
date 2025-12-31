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
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '@/src/api/client';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { IconSymbol } from '@/components/IconSymbol';
import { ModernInput } from '@/src/components/ModernInput'; // Using ModernInput for consistency
import { colors } from '@/styles/commonStyles'; // Use fixed colors for better readability against gradient

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
      const { user } = await authAPI.login(email.toLowerCase().trim(), password);

      const routes = {
        client: '/(tabs)/(home)',
        artisan: '/artisan/dashboard',
        agent: '/agent/dashboard',
        admin: '/admin/dashboard'
      } as const;

      router.replace(routes[user.role as keyof typeof routes] || '/(tabs)/(home)');

    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
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
      {/* 2. REFINED GRADIENT: Subtle fade to allow image to show top, solid white bottom */}
      <LinearGradient
        colors={['rgba(255,255,255,0.60)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
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
                <View style={styles.logoGlassContainer}>
                  <LinearGradient
                    colors={[colors.primary, '#0056b3']}
                    style={styles.logoCircle}
                  >
                    <IconSymbol name="person.2.fill" size={36} color="white" />
                  </LinearGradient>
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
  logoGlassContainer: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  logoCircle: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  title: {
    fontSize: 32, fontWeight: '800',
    color: '#111827', marginBottom: 8,
    textAlign: 'center', letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16, color: '#6B7280',
    textAlign: 'center', maxWidth: '80%', lineHeight: 22,
  },

  // Form
  formContainer: { width: '100%' },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    marginBottom: 24,
  },

  // Forgot Password
  forgotContainer: { alignItems: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { fontWeight: '600', fontSize: 14, color: colors.primary },

  // Button
  loginBtnShadow: {
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    borderRadius: 16,
  },
  loginBtnGradient: {
    height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  // Footer Link
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { fontWeight: '700', fontSize: 15 },

  // Demo Section
  demoSection: { marginTop: 40, alignItems: 'center' },
  demoLabel: {
    fontSize: 12, marginBottom: 16,
    textTransform: 'uppercase', letterSpacing: 1.2,
    color: '#9CA3AF', fontWeight: '600',
  },
  demoRow: { flexDirection: 'row', gap: 12 },
  demoChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  demoChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
});