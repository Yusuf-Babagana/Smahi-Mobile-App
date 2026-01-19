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
import { useAuth } from '@/src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Components
import { ModernInput } from '@/src/components/ModernInput';
import { colors } from '@/styles/commonStyles';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
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

      const routes = {
        client: '/(tabs)/(home)',
        artisan: '/artisan/dashboard',
        agent: '/agent/dashboard',
        lga_admin: '/agent/dashboard',
        state_coordinator: '/agent/dashboard',
        admin: '/admin/dashboard'
      } as const;

      const targetRoute = routes[user.role as keyof typeof routes] || '/(tabs)/(home)';
      router.replace(targetRoute);

    } catch (error: any) {
      const msg = error.message || 'Invalid credentials';
      Alert.alert('Login Failed', msg);
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
        style={styles.overlay}
      >
        <StatusBar style="dark" translucent={true} backgroundColor="transparent" />

        <SafeAreaView style={{ flex: 1 }}>
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
              <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                <View style={[styles.logoBlur, { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: '#FFF' }]}>
                  <Image
                    source={require('@/assets/images/smahi.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.title, { color: '#111827', textShadowColor: undefined }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: '#6B7280' }]}>Sign in to continue your journey</Text>
              </Animated.View>

              {/* Glass Form */}
              <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.glassCard, { backgroundColor: 'rgba(255,255,255,0.8)', borderColor: '#FFF' }]}>
                <View style={styles.cardContent}>

                  <View style={styles.inputContainer}>
                    <ModernInput
                      label="Email Address"
                      placeholder="name@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="envelope.fill"
                      style={{ backgroundColor: '#FFF' }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <ModernInput
                      label="Password"
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      isPassword
                      icon="lock.fill"
                      style={{ backgroundColor: '#FFF' }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => Alert.alert("Reset", "Password reset flow")}
                    style={styles.forgotBtn}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.loginBtn}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[colors.primary, '#0056b3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View style={styles.btnContent}>
                          <Text style={styles.loginBtnText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={[styles.dividerText, { color: '#9CA3AF' }]}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social / Demo Login */}
                  <View style={styles.socialRow}>
                    {['Client', 'Artisan', 'Agent'].map((role, index) => (
                      <TouchableOpacity
                        key={role}
                        activeOpacity={0.7}
                        onPress={() => fillDemo(role.toLowerCase())}
                        style={styles.socialBtn}
                      >
                        <Text style={styles.socialBtnText}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                </View>
              </Animated.View>

              {/* Footer */}
              <Animated.View entering={FadeInDown.delay(600)} style={styles.footer}>
                <Text style={[styles.footerText, { color: '#6B7280' }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={[styles.signupText, { color: colors.primary }]}>Create Account</Text>
                </TouchableOpacity>
              </Animated.View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, // Changed from absoluteFillObject to flex 1 to wrap content
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBlur: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.6)', // More blur
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, // stronger shadow
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },

  // Glass Card - More Premium
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 36, // softer radius
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08, // softer spread
    shadowRadius: 30,
    elevation: 8,
  },
  cardContent: {
    padding: 28, // more spacing
  },
  inputContainer: {
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: 8,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Login Button - Premium Gradient
  loginBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    transform: [{ scale: 1 }], // placeholder specifically for animation hook if needed
  },
  btnGradient: {
    height: 60, // taller
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Social Buttons
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 6,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  signupText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});