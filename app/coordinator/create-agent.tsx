import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable, Linking, TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { locationAPI, coordinatorAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Button, Input, useToast, SearchablePickerField } from '@/src/components/ui';

export default function CoordinatorCreateAgentScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { show: showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [lgas, setLgas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        lga: '',
        referral_code: '',
    });

    const [createdResult, setCreatedResult] = useState<{
        user: any;
        password: string;
        emailSent: boolean;
        shareMessage: string;
    } | null>(null);

    useEffect(() => {
        if (user?.state) {
            locationAPI.getLGAs(Number(user.state)).then(data => {
                setLgas((data || []).map((l: any) => ({ id: l.id, name: l.name })));
            }).catch(() => {});
        }
    }, [user?.state]);

    const handleCreate = async () => {
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            showToast(t("Please enter agent's full name."), { type: 'warn' });
            return;
        }

        const email = formData.email.trim().toLowerCase();
        if (!email || !email.includes('@')) {
            showToast(t('Please enter a valid personal email address for the agent.'), { type: 'warn' });
            return;
        }

        const phone = formData.phone.trim();
        if (!phone) {
            showToast(t('Please enter a valid phone number for the agent.'), { type: 'warn' });
            return;
        }

        if (!formData.lga) {
            showToast(t('Please select the LGA this agent will oversee.'), { type: 'warn' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: email,
                phone_number: phone,
                lga: Number(formData.lga),
                auto_approve: true, // Coordinator creates as directly active
                referral_code: formData.referral_code?.trim() || undefined,
            };

            const response = await coordinatorAPI.createAgent(payload);

            if (response?.user) {
                const assignedLgaName = lgas.find(l => String(l.id) === String(formData.lga))?.name || 'Assigned LGA';
                const coordName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'State Coordinator';
                const defaultShare = (
                    `Hello ${response.user.first_name}, you have been appointed as an official S-MAHI Field Agent for ${assignedLgaName} LGA by State Coordinator ${coordName}.\n\n` +
                    `Download the S-MAHI app and log in with your credentials:\n` +
                    `• Email: ${response.user.email}\n` +
                    `• Temporary Password: ${response.generated_password}\n` +
                    `• Agent ID: ${response.user.serial_number}\n\n` +
                    `Welcome to the S-MAHI team!`
                );

                setCreatedResult({
                    user: response.user,
                    password: response.generated_password,
                    emailSent: Boolean(response.email_sent),
                    shareMessage: response.share_message || defaultShare,
                });

                showToast(t('Agent account created and credentials dispatched!'), { type: 'success' });
            }
        } catch (error: any) {
            const errData = error?.response?.data;
            let msg = t('Failed to create agent account.');
            if (errData?.email) msg = Array.isArray(errData.email) ? errData.email[0] : String(errData.email);
            else if (errData?.phone_number) msg = Array.isArray(errData.phone_number) ? errData.phone_number[0] : String(errData.phone_number);
            else if (errData?.error) msg = String(errData.error);
            showToast(msg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const copyCredentials = async () => {
        if (!createdResult) return;
        await Clipboard.setStringAsync(
            `Download S-MAHI on Google Play:\nhttps://play.google.com/store/apps/details?id=com.smahi.app\n\nLogin Credentials:\nEmail: ${createdResult.user.email}\nTemporary Password: ${createdResult.password}\nAgent ID: ${createdResult.user.serial_number}`
        );
        showToast(t('Credentials copied to clipboard!'), { type: 'success' });
    };

    const shareWhatsApp = () => {
        if (!createdResult?.shareMessage) return;
        const url = `whatsapp://send?text=${encodeURIComponent(createdResult.shareMessage)}`;
        Linking.openURL(url).catch(() => {
            showToast(t('WhatsApp not installed or could not be opened.'), { type: 'error' });
        });
    };

    const shareSMS = () => {
        if (!createdResult?.shareMessage) return;
        const phone = createdResult.user.phone_number || '';
        const url = `sms:${phone}?body=${encodeURIComponent(createdResult.shareMessage)}`;
        Linking.openURL(url).catch(() => {
            showToast(t('Could not launch SMS messenger.'), { type: 'error' });
        });
    };

    const handleReset = () => {
        setCreatedResult(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            lga: '',
            referral_code: '',
        });
    };

    return (
        <View style={styles.container}>
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
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Recruit & Onboard Agent')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {createdResult ? (
                /* SUCCESS CREDENTIALS CARD */
                <ScrollView contentContainerStyle={styles.successScroll}>
                    <View style={styles.successCard}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark-circle" size={48} color="#059669" />
                        </View>
                        <Text style={styles.successTitle}>{t('Agent Account Created!')}</Text>
                        <Text style={styles.successSubtitle}>
                            {t('The account is active and credentials have been dispatched.')}
                        </Text>

                        {/* Email Dispatch Status Banner */}
                        <View style={styles.emailBanner}>
                            <MaterialIcons name="mark-email-read" size={20} color="#1E40AF" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.emailBannerTitle}>
                                    {createdResult.emailSent ? t('Welcome Email Sent via Brevo') : t('Credentials Ready')}
                                </Text>
                                <Text style={styles.emailBannerText}>
                                    {t('Delivered to')} {createdResult.user.email}
                                </Text>
                            </View>
                        </View>

                        {/* Credentials Box */}
                        <View style={styles.credentialsBox}>
                            <View style={styles.credRow}>
                                <Text style={styles.credLabel}>{t('Agent Name')}:</Text>
                                <Text style={styles.credValue}>
                                    {createdResult.user.first_name} {createdResult.user.last_name}
                                </Text>
                            </View>
                            <View style={styles.credDivider} />
                            <View style={styles.credRow}>
                                <Text style={styles.credLabel}>{t('Agent ID')}:</Text>
                                <Text style={[styles.credValue, { fontFamily: font.bold, color: '#1B5FD9' }]}>
                                    {createdResult.user.serial_number}
                                </Text>
                            </View>
                            <View style={styles.credDivider} />
                            <View style={styles.credRow}>
                                <Text style={styles.credLabel}>{t('Login Email')}:</Text>
                                <Text style={styles.credValue}>{createdResult.user.email}</Text>
                            </View>
                            <View style={styles.credDivider} />
                            <View style={styles.credRow}>
                                <Text style={styles.credLabel}>{t('Temporary Password')}:</Text>
                                <View style={styles.passwordPill}>
                                    <Text style={styles.passwordText}>{createdResult.password}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Fast 1-Tap Sharing Triggers */}
                        <Text style={styles.shareHeading}>{t('Direct Sharing Options')}</Text>
                        <View style={styles.shareButtonsRow}>
                            <TouchableOpacity style={styles.shareWhatsAppBtn} onPress={shareWhatsApp}>
                                <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
                                <Text style={styles.shareBtnText}>{t('WhatsApp')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareSMSBtn} onPress={shareSMS}>
                                <MaterialIcons name="sms" size={18} color="#FFF" />
                                <Text style={styles.shareBtnText}>{t('SMS')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareCopyBtn} onPress={copyCredentials}>
                                <MaterialIcons name="content-copy" size={18} color="#1E293B" />
                                <Text style={[styles.shareBtnText, { color: '#1E293B' }]}>{t('Copy')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionButtonsCol}>
                            <Button
                                title={t('View in My Agents')}
                                onPress={() => router.replace('/coordinator/agents')}
                                style={styles.primaryNavBtn}
                            />
                            <Button
                                title={t('Onboard Another Agent')}
                                variant="secondary"
                                onPress={handleReset}
                                style={styles.secondaryNavBtn}
                            />
                        </View>
                    </View>
                </ScrollView>
            ) : (
                /* FORM VIEW */
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                        <View style={styles.noteBanner}>
                            <MaterialIcons name="shield" size={18} color="#D97706" />
                            <Text style={styles.noteText}>
                                {t('Assigning agent territory under')}{' '}
                                <Text style={styles.noteStrong}>{user?.state_details?.name || t('your state')}</Text>.
                            </Text>
                        </View>

                        <Input
                            label={t('First name')}
                            placeholder={t("Enter agent's first name")}
                            value={formData.first_name}
                            onChangeText={v => setFormData({ ...formData, first_name: v })}
                            icon="person-outline"
                            containerStyle={styles.field}
                        />

                        <Input
                            label={t('Last name')}
                            placeholder={t("Enter agent's last name")}
                            value={formData.last_name}
                            onChangeText={v => setFormData({ ...formData, last_name: v })}
                            icon="person-outline"
                            containerStyle={styles.field}
                        />

                        <Input
                            label={t('Agent personal email (Mandatory)')}
                            placeholder="agent@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={formData.email}
                            onChangeText={v => setFormData({ ...formData, email: v })}
                            icon="mail-outline"
                            containerStyle={styles.field}
                        />

                        <Input
                            label={t('Phone number (Mandatory)')}
                            placeholder="08012345678"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={v => setFormData({ ...formData, phone: v })}
                            icon="phone-iphone"
                            containerStyle={styles.field}
                        />

                        <SearchablePickerField
                            label={t('Assigned LGA')}
                            placeholder={t('Select the LGA this agent will oversee')}
                            searchPlaceholder={t('Search LGA…')}
                            value={formData.lga}
                            onValueChange={v => setFormData({ ...formData, lga: v })}
                            items={lgas}
                        />

                        <Input
                            label={t('Coordinator referral code (Optional)')}
                            placeholder="SMAHI-KN-XXXX"
                            value={formData.referral_code}
                            onChangeText={v => setFormData({ ...formData, referral_code: v })}
                            icon="qr-code"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            containerStyle={styles.field}
                        />

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={18} color="#1E40AF" />
                            <Text style={styles.infoText}>
                                {t('An official welcome email with login credentials and a simple default password will be automatically dispatched to the agent upon submission.')}
                            </Text>
                        </View>

                        <Button
                            title={t('Onboard Agent & Send Credentials')}
                            onPress={handleCreate}
                            loading={loading}
                            style={styles.submitButton}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    headerSafe: { backgroundColor: '#0B2E5B' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: '#0B2E5B',
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: '#FFF' },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: { padding: space.xl, paddingBottom: 60 },
    noteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: radius.md,
        padding: space.md,
        marginBottom: space.lg,
    },
    noteText: { flex: 1, fontFamily: font.medium, fontSize: 13, color: '#92400E' },
    noteStrong: { fontFamily: font.extrabold },

    field: { marginBottom: space.lg },

    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: radius.md,
        padding: space.md,
        gap: 10,
        marginVertical: space.lg,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontFamily: font.medium,
        fontSize: 12.5,
        color: '#1E40AF',
        lineHeight: 18,
    },

    submitButton: { marginTop: space.sm, marginBottom: space.xxl },

    /* SUCCESS STYLES */
    successScroll: {
        padding: space.xl,
        paddingBottom: 60,
    },
    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    successIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontFamily: font.extrabold,
        fontSize: 20,
        color: '#0F172A',
        textAlign: 'center',
    },
    successSubtitle: {
        fontFamily: font.medium,
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 18,
    },
    emailBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 14,
        gap: 12,
        width: '100%',
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    emailBannerTitle: {
        fontFamily: font.bold,
        fontSize: 13,
        color: '#1E40AF',
    },
    emailBannerText: {
        fontFamily: font.medium,
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 2,
    },
    credentialsBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
    },
    credRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    credLabel: {
        fontFamily: font.medium,
        fontSize: 13,
        color: '#64748B',
    },
    credValue: {
        fontFamily: font.bold,
        fontSize: 13.5,
        color: '#0F172A',
    },
    credDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    passwordPill: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    passwordText: {
        fontFamily: font.extrabold,
        fontSize: 14,
        color: '#1E40AF',
        letterSpacing: 1,
    },
    shareHeading: {
        fontFamily: font.bold,
        fontSize: 13,
        color: '#475569',
        alignSelf: 'flex-start',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    shareButtonsRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
        marginBottom: 24,
    },
    shareWhatsAppBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    shareSMSBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E40AF',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    shareCopyBtn: {
        flex: 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E2E8F0',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    shareBtnText: {
        fontFamily: font.bold,
        fontSize: 13,
        color: '#FFF',
    },
    actionButtonsCol: {
        width: '100%',
        gap: 10,
    },
    primaryNavBtn: {
        width: '100%',
    },
    secondaryNavBtn: {
        width: '100%',
    },
});
