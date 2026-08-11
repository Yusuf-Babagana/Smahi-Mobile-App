import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { authAPI } from '@/src/api/client';
import { color, font, radius, space, type } from '@/constants/theme';
import { Button, Input, useToast } from '@/src/components/ui';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();

    // Step 1 = enter email, Step 2 = enter code + new password
    const [step, setStep] = useState<1 | 2>(1);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    // Resend countdown tick
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const cleanEmail = email.toLowerCase().trim();

    const requestCode = async (isResend = false) => {
        if (sending || cooldown > 0) return;
        if (!cleanEmail.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setSending(true);
        setError(null);
        setInfo(null);
        try {
            await authAPI.requestPasswordReset(cleanEmail);
            setCooldown(RESEND_COOLDOWN);
            setStep(2);
            setInfo(isResend
                ? 'A new code has been sent — use the newest email; older codes no longer work.'
                : 'If an account exists for this email, a 6-digit code has been sent. Check your spam folder too.');
        } catch (e: any) {
            const status = e.response?.status;
            const msg = e.response?.data?.error;
            if (status === 429) {
                setCooldown(RESEND_COOLDOWN);
                setStep(2); // a code was already sent recently — let them type it
                setError(msg || 'Please wait a minute before requesting a new code.');
            } else if (status === 404) {
                // Backend endpoints not deployed yet
                setError('Password reset is not available yet. Please contact S-MAHII support.');
            } else {
                setError(msg || 'Could not send the reset code. Please try again later.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleConfirm = async () => {
        if (submitting) return;
        if (code.length !== CODE_LENGTH) {
            setError('Enter the 6-digit code from your email.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setInfo(null);
        try {
            await authAPI.confirmPasswordReset(cleanEmail, code, newPassword);
            showToast('Password reset — please sign in with your new password.', { type: 'success' });
            router.back();
        } catch (e: any) {
            const status = e.response?.status;
            const msg = e.response?.data?.error;
            if (status === 404) {
                setError('Password reset is not available yet. Please contact S-MAHII support.');
            } else {
                // Backend 400 messages are written for end users — show as-is.
                setError(msg || 'Could not reset the password. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => step === 2 ? setStep(1) : router.back()}
                        style={styles.backBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('Back')}
                    >
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Reset password')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.iconCircle}>
                        <MaterialIcons
                            name={step === 1 ? 'vpn-key' : 'lock-open'}
                            size={36}
                            color={color.brand600}
                        />
                    </View>

                    {step === 1 ? (
                        <>
                            <Text style={styles.title}>{t('Forgot your password?')}</Text>
                            <Text style={styles.subtitle}>
                                {t("Enter the email you registered with and we'll send you a 6-digit code to reset your password.")}
                            </Text>

                            <View style={styles.formBlock}>
                                <Input
                                    label={t('Email address')}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChangeText={(v) => { setEmail(v); if (error) setError(null); }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoFocus
                                    icon="mail-outline"
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>{t('Enter code & new password')}</Text>
                            <Text style={styles.subtitle}>
                                {t('We sent a 6-digit code to')}{' '}
                                <Text style={styles.emailText}>{cleanEmail}</Text>.
                                {'\n'}{t("It expires in 10 minutes. Check your spam folder if it's missing.")}
                            </Text>

                            <TextInput
                                style={styles.codeInput}
                                value={code}
                                onChangeText={(v) => {
                                    setCode(v.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH));
                                    if (error) setError(null);
                                }}
                                keyboardType="number-pad"
                                maxLength={CODE_LENGTH}
                                placeholder="••••••"
                                placeholderTextColor={color.ink300}
                                autoFocus
                            />

                            <View style={styles.formBlock}>
                                <Input
                                    label={t('New password')}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChangeText={(v) => { setNewPassword(v); if (error) setError(null); }}
                                    secureTextEntry={!showPassword}
                                    icon="lock-outline"
                                    trailingIcon={showPassword ? 'visibility-off' : 'visibility'}
                                    onTrailingIconPress={() => setShowPassword(s => !s)}
                                    containerStyle={styles.field}
                                />
                                <Input
                                    label={t('Confirm new password')}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChangeText={(v) => { setConfirmPassword(v); if (error) setError(null); }}
                                    secureTextEntry={!showPassword}
                                    icon="lock-outline"
                                    containerStyle={styles.field}
                                />
                            </View>
                        </>
                    )}

                    {error && (
                        <View style={styles.messageRow}>
                            <MaterialIcons name="error-outline" size={16} color={color.danger600} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                    {info && (
                        <View style={styles.messageRow}>
                            <MaterialIcons name="check-circle" size={16} color={color.accent600} />
                            <Text style={styles.infoText}>{info}</Text>
                        </View>
                    )}

                    {/* Primary action */}
                    <Button
                        title={step === 1 ? t('Send reset code') : t('Reset password')}
                        onPress={step === 1 ? () => requestCode(false) : handleConfirm}
                        loading={(sending && step === 1) || submitting}
                        style={styles.primaryBtn}
                    />

                    {/* Resend (step 2 only) */}
                    {step === 2 && (
                        <View style={styles.resendRow}>
                            <Text style={styles.resendLabel}>{t("Didn't get the code?")}</Text>
                            <TouchableOpacity
                                onPress={() => requestCode(true)}
                                disabled={cooldown > 0 || sending}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color={color.brand600} />
                                ) : (
                                    <Text style={[styles.resendBtn, cooldown > 0 && styles.resendBtnDisabled]}>
                                        {cooldown > 0 ? `${t('Resend in')} ${cooldown}s` : t('Resend code')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>{t('Back to sign in')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.canvas },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
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

    content: { padding: space.xxl, alignItems: 'center', flexGrow: 1 },

    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: color.brand100,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: space.lg,
        marginBottom: space.xl,
    },
    title: { ...type.titleLg, marginBottom: space.sm, textAlign: 'center' },
    subtitle: {
        fontFamily: font.medium,
        fontSize: 14,
        color: color.ink400,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: space.xxl,
        paddingHorizontal: space.sm,
    },
    emailText: { fontFamily: font.extrabold, color: color.ink900 },

    formBlock: { width: '100%' },
    field: { marginBottom: space.lg },

    codeInput: {
        width: '80%',
        height: 64,
        borderWidth: 1.5,
        borderColor: color.border,
        borderRadius: radius.lg,
        backgroundColor: color.surface,
        fontFamily: font.extrabold,
        fontSize: 28,
        color: color.ink900,
        textAlign: 'center',
        letterSpacing: 14,
        marginBottom: space.xl,
    },

    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        paddingHorizontal: space.md,
        marginBottom: space.md,
        maxWidth: '90%',
    },
    errorText: { color: color.danger600, fontFamily: font.bold, fontSize: 13, flexShrink: 1 },
    infoText: { color: color.accent600, fontFamily: font.bold, fontSize: 13, flexShrink: 1 },

    primaryBtn: { alignSelf: 'stretch', marginTop: space.sm },

    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: space.xxl,
    },
    resendLabel: { fontFamily: font.medium, color: color.ink400, fontSize: 14 },
    resendBtn: { color: color.brand600, fontFamily: font.extrabold, fontSize: 14 },
    resendBtnDisabled: { color: color.ink300 },

    cancelBtn: { marginTop: space.xxl, padding: space.sm },
    cancelText: {
        fontFamily: font.bold,
        color: color.ink400,
        fontSize: 13.5,
        textDecorationLine: 'underline',
    },
});
