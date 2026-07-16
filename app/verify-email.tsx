import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { authAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space, type } from '@/constants/theme';
import { Button } from '@/src/components/ui';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds — matches the backend's 429 window

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { updateUser } = useAuth();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    useEffect(() => {
        storage.getCurrentUser().then(u => u?.email && setEmail(u.email));
    }, []);

    // Resend countdown tick
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    // Marks the user verified everywhere the app caches them, then leaves.
    const finishVerified = async (freshUser?: any) => {
        const partial = freshUser || { email_verified: true };
        await storage.updateCurrentUser(partial);
        updateUser(partial);
        Alert.alert('✅ Email Verified', 'Your email address has been confirmed.', [
            { text: 'Done', onPress: () => router.back() }
        ]);
    };

    const handleConfirm = async () => {
        if (code.length !== CODE_LENGTH || confirming) return;
        setConfirming(true);
        setError(null);
        setInfo(null);
        try {
            const data = await authAPI.confirmEmailVerification(code);
            await finishVerified(data.user);
        } catch (e: any) {
            const msg = e.response?.data?.error;
            if (msg === 'Email is already verified.') {
                await finishVerified();
            } else {
                // Backend 400 messages are written for end users — show as-is.
                setError(msg || 'Could not verify the code. Please try again.');
            }
        } finally {
            setConfirming(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || sending) return;
        setSending(true);
        setError(null);
        setInfo(null);
        try {
            await authAPI.requestEmailVerification();
            setCode('');
            setCooldown(RESEND_COOLDOWN);
            setInfo('A new code has been sent — use the newest email; older codes no longer work.');
        } catch (e: any) {
            const status = e.response?.status;
            const msg = e.response?.data?.error;
            if (status === 400 && msg === 'Email is already verified.') {
                await finishVerified();
            } else if (status === 429) {
                setCooldown(RESEND_COOLDOWN);
                setError(msg || 'Please wait a minute before requesting a new code.');
            } else {
                setError(msg || 'Could not send the verification email. Please try again later.');
            }
        } finally {
            setSending(false);
        }
    };

    const canConfirm = code.length === CODE_LENGTH && !confirming;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Verify email')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.iconCircle}>
                        <MaterialIcons name="mark-email-read" size={36} color={color.brand600} />
                    </View>

                    <Text style={styles.title}>{t('Enter your code')}</Text>
                    <Text style={styles.subtitle}>
                        {t('We sent a 6-digit code to')}{' '}
                        <Text style={styles.emailText}>{email || t('your email')}</Text>.
                        {'\n'}{t("It expires in 10 minutes. Can't find it? Check your spam folder.")}
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

                    <Button
                        title={t('Verify email')}
                        onPress={handleConfirm}
                        disabled={!canConfirm}
                        loading={confirming}
                        style={styles.confirmBtn}
                    />

                    {/* Resend */}
                    <View style={styles.resendRow}>
                        <Text style={styles.resendLabel}>{t("Didn't get the code?")}</Text>
                        <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || sending}>
                            {sending ? (
                                <ActivityIndicator size="small" color={color.brand600} />
                            ) : (
                                <Text style={[styles.resendBtn, cooldown > 0 && styles.resendBtnDisabled]}>
                                    {cooldown > 0 ? `${t('Resend in')} ${cooldown}s` : t('Resend code')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.back()} style={styles.laterBtn}>
                        <Text style={styles.laterText}>{t("I'll do this later")}</Text>
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
    title: { ...type.titleLg, marginBottom: space.sm },
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
        marginBottom: space.lg,
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

    confirmBtn: { alignSelf: 'stretch', marginTop: space.sm },

    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: space.xxl,
    },
    resendLabel: { fontFamily: font.medium, color: color.ink400, fontSize: 14 },
    resendBtn: { color: color.brand600, fontFamily: font.extrabold, fontSize: 14 },
    resendBtnDisabled: { color: color.ink300 },

    laterBtn: { marginTop: space.xxl, padding: space.sm },
    laterText: {
        fontFamily: font.bold,
        color: color.ink400,
        fontSize: 13.5,
        textDecorationLine: 'underline',
    },
});
