import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { authAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { useToast } from '@/src/components/ui';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferent = newPassword.length > 0 && currentPassword.length > 0 && newPassword !== currentPassword;

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);

    if (!currentPassword) {
      setError(t('Please enter your current or temporary password.'));
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError(t('New password must be at least 6 characters.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('New passwords do not match.'));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('New password must be different from current password.'));
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      showToast(t('Password changed successfully!'), { type: 'success' });
      router.back();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        t('Failed to change password. Please check your current password.');
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t('Back')}
          >
            <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('Change Password')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* INFO NOTICE */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#1B5FD9" />
          <View style={{ flex: 1, marginLeft: space.md }}>
            <Text style={styles.infoBannerTitle}>{t('Account Security')}</Text>
            <Text style={styles.infoBannerText}>
              {t('If you were given a temporary password upon appointment, please update it now to a secure, private password.')}
            </Text>
          </View>
        </View>

        {/* ERROR DISPLAY */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* INPUT FIELDS */}
        <View style={styles.formSection}>
          {/* Current / Temporary Password */}
          <Text style={styles.fieldLabel}>{t('Current / Temporary Password')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setError(null);
              }}
              secureTextEntry={!showCurrentPassword}
              placeholder={t('Enter current or temporary password')}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowCurrentPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showCurrentPassword ? t('Hide password') : t('Show password')}
            >
              <MaterialIcons
                name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={[styles.fieldLabel, { marginTop: space.lg }]}>{t('New Password')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError(null);
              }}
              secureTextEntry={!showNewPassword}
              placeholder={t('Enter new password (min. 6 characters)')}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNewPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showNewPassword ? t('Hide password') : t('Show password')}
            >
              <MaterialIcons
                name={showNewPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm New Password */}
          <Text style={[styles.fieldLabel, { marginTop: space.lg }]}>{t('Confirm New Password')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
              secureTextEntry={!showConfirmPassword}
              placeholder={t('Confirm new password')}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showConfirmPassword ? t('Hide password') : t('Show password')}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* PASSWORD CHECKLIST */}
          <View style={styles.checklistCard}>
            <View style={styles.checkItem}>
              <Ionicons
                name={isMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={isMinLength ? '#10B981' : '#94A3B8'}
              />
              <Text style={[styles.checkText, isMinLength && styles.checkTextActive]}>
                {t('At least 6 characters long')}
              </Text>
            </View>

            <View style={styles.checkItem}>
              <Ionicons
                name={isMatching ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={isMatching ? '#10B981' : '#94A3B8'}
              />
              <Text style={[styles.checkText, isMatching && styles.checkTextActive]}>
                {t('Passwords match')}
              </Text>
            </View>

            {currentPassword.length > 0 && (
              <View style={styles.checkItem}>
                <Ionicons
                  name={isDifferent ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={isDifferent ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.checkText, isDifferent && styles.checkTextActive]}>
                  {t('Different from current password')}
                </Text>
              </View>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('Update Password')}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>{t('Update Password')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafe: {
    backgroundColor: '#0F172A',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: font.bold,
  },
  content: {
    padding: space.lg,
    paddingBottom: 48,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: space.md,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5FD9',
    marginBottom: space.lg,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontFamily: font.bold,
    color: '#1E40AF',
  },
  infoBannerText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontFamily: font.medium,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: font.semibold,
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: space.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: font.regular,
    color: '#0F172A',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  checklistCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.lg,
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: '#94A3B8',
  },
  checkTextActive: {
    color: '#059669',
    fontFamily: font.medium,
  },
  submitButton: {
    marginTop: space.xl,
    backgroundColor: '#1B5FD9',
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: font.bold,
  },
});
