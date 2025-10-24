
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { authAPI } from '@/src/api/client';
import { UserRole } from '@/src/types';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { countries, getStatesByCountry, getLocalGovernmentsByState } from '@/src/constants/countries';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [localGovernment, setLocalGovernment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const states = country ? getStatesByCountry(country) : [];
  const localGovernments = country && state ? getLocalGovernmentsByState(country, state) : [];

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!country || !state) {
      Alert.alert('Error', 'Please select your country and state');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        country,
        state,
        localGovernment: localGovernment || undefined,
      });

      Alert.alert(
        'Success',
        'Account created successfully! Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Join Artisan Connect today
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Phone</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color={theme.dark ? '#98989D' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <IconSymbol
                    name={showConfirmPassword ? 'eye.slash' : 'eye'}
                    size={20}
                    color={theme.dark ? '#98989D' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Role *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Picker
                  selectedValue={role}
                  onValueChange={(value) => setRole(value)}
                  style={[styles.picker, { color: theme.colors.text }]}
                  enabled={!loading}
                >
                  <Picker.Item label="Client" value="client" />
                  <Picker.Item label="Artisan" value="artisan" />
                  <Picker.Item label="Agent" value="agent" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Country *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Picker
                  selectedValue={country}
                  onValueChange={(value) => {
                    setCountry(value);
                    setState('');
                    setLocalGovernment('');
                  }}
                  style={[styles.picker, { color: theme.colors.text }]}
                  enabled={!loading}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countries.map((c) => (
                    <Picker.Item key={c.code} label={c.name} value={c.code} />
                  ))}
                </Picker>
              </View>
            </View>

            {country && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>State *</Text>
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={state}
                    onValueChange={(value) => {
                      setState(value);
                      setLocalGovernment('');
                    }}
                    style={[styles.picker, { color: theme.colors.text }]}
                    enabled={!loading}
                  >
                    <Picker.Item label="Select State" value="" />
                    {states.map((s) => (
                      <Picker.Item key={s.name} label={s.name} value={s.name} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {country && state && localGovernments.length > 0 && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Local Government
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      backgroundColor: theme.dark ? '#1C1C1E' : '#F2F2F7',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={localGovernment}
                    onValueChange={setLocalGovernment}
                    style={[styles.picker, { color: theme.colors.text }]}
                    enabled={!loading}
                  >
                    <Picker.Item label="Select Local Government" value="" />
                    {localGovernments.map((lg) => (
                      <Picker.Item key={lg} label={lg} value={lg} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.registerButton,
                { backgroundColor: theme.colors.primary },
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={[styles.loginLinkText, { color: theme.colors.primary }]}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 15,
    padding: 4,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
