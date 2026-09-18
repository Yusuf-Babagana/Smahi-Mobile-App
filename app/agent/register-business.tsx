import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, locationAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast, useConfirm, SearchablePickerField } from '@/src/components/ui';
import { enqueue, processQueue, getQueue, saveDraft, loadDraft, clearDraft, dismissItem } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';

// Coordinator/Agent-initiated business registration — the exact
// counterpart of app/agent/register.tsx (artisans), including the same
// ₦2,500 Paystack payment step right after registration (collected on
// this same phone, no in-person cash) — businesses never had this fee
// before, but now owe the same one artisans do when registered this way.
const QUEUE_TYPE = 'agent_register_business';
const DRAFT_KEY = 'agent_register_business';

export default function AgentRegisterBusinessScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    // A coordinator oversees their whole state, not one fixed LGA like a
    // plain agent (User.lga is null for a coordinator) — they must choose
    // which LGA the new business belongs to (AgentRegisterBusinessView).
    const isCoordinator = user?.role === 'state_coordinator';

    const [loading, setLoading] = useState(false);
    const [lgas, setLgas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        business_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        // Free-text business type rather than a fetched category picker —
        // sent as custom_category_name, resolved server-side into a real
        // Category the same way the public "Other" registration flow does.
        businessType: '',
        lga: '',
        // Optional — forwarded like the public registration flow so a
        // referrer's code claims this business in their network; the
        // physical registrar is still recorded as whoever pressed register.
        referral_code: '',
    });

    const draftLoaded = useRef(false);
    useEffect(() => {
        loadDraft<typeof formData>(DRAFT_KEY).then((draft) => {
            if (draft) setFormData(draft);
            draftLoaded.current = true;
        });
    }, []);

    useEffect(() => {
        if (!draftLoaded.current) return;
        saveDraft(DRAFT_KEY, formData);
    }, [formData]);

    useEffect(() => {
        // Only a coordinator needs this — a plain agent stays locked to
        // their own LGA and never sees the picker below.
        if (isCoordinator && user?.state) {
            locationAPI.getLGAs(Number(user.state)).then(data => {
                setLgas((data || []).map((l: any) => ({ id: l.id, name: l.name })));
            }).catch(() => {});
        }
    }, [isCoordinator, user?.state]);

    const handleRegister = async () => {
        if (!formData.business_name || !formData.first_name || !formData.last_name || !formData.phone || !formData.businessType) {
            showToast("Please fill all required fields.", { type: 'warn' });
            return;
        }
        if (isCoordinator && !formData.lga) {
            showToast(t('Please select the business\'s LGA.'), { type: 'warn' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                business_name: formData.business_name,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || `${formData.phone}@smahi.com`,
                phone_number: formData.phone,
                custom_category_name: formData.businessType.trim(),
                country: user?.country,
                state: user?.state,
                lga: isCoordinator ? formData.lga : user?.lga,
                referral_code: formData.referral_code?.trim() || undefined,
            };

            const queued = await enqueue(QUEUE_TYPE, payload);
            await processQueue(syncSubmitters);
            const items = await getQueue(QUEUE_TYPE);
            const synced = items.find(i => i.id === queued.id);

            if (synced?.status === 'server_verified') {
                const generatedPassword = synced.serverResult?.generated_password;
                const alreadyRegistered = synced.serverResult?.already_registered;
                const newUserId = synced.serverResult?.user?.id;
                // Every registration gets a credentials welcome email
                // dispatched automatically server-side (the same Brevo flow
                // used for coordinator-created agents), whether the
                // registrar is an Agent or a Coordinator — surfaced here so
                // they know delivery happened instead of being told to
                // share the password by hand.
                const emailSent = Boolean(synced.serverResult?.email_sent);
                const registeredEmail = synced.serverResult?.user?.email
                    || formData.email
                    || `${formData.phone}@smahi.com`;
                await clearDraft(DRAFT_KEY);

                // Collect the ₦2,500 fee right now via Paystack — same
                // phone, handed to the owner to pay by their own card/
                // transfer/USSD — instead of in-person cash. Attempted
                // even on an idempotent "already registered" replay:
                // initializeRegistrationPayment returns already_paid
                // cleanly if it's genuinely settled already.
                if (newUserId) {
                    try {
                        const payResult = await agentAPI.initializeRegistrationPayment(newUserId);
                        router.replace({
                            pathname: '/payment',
                            params: {
                                authorizationUrl: payResult.authorization_url,
                                reference: payResult.reference,
                                agentUserId: String(newUserId),
                                generatedPassword: generatedPassword || '',
                                emailSent: String(emailSent),
                                registeredEmail: registeredEmail,
                            },
                        });
                        return;
                    } catch (payErr: any) {
                        if (payErr?.response?.data?.already_paid) {
                            showToast(t('This business has already paid its registration fee.'), { type: 'info' });
                            router.back();
                            return;
                        }
                        if (payErr?.response?.status === 503) {
                            showToast(t('Payments are not available yet. You can collect the fee later.'), { type: 'info' });
                        } else {
                            showToast(t('Could not start the payment step. Try again from the businesses list.'), { type: 'error' });
                        }
                    }
                }

                // Fallback (no id in the response, or payment couldn't
                // start) — still gets the one-time password.
                const done = await confirm({
                    title: alreadyRegistered ? "Already registered" : "Business Registered",
                    message: alreadyRegistered
                        ? (synced.serverResult?.message || "This business was already registered — no new account was created.")
                        : generatedPassword
                            ? emailSent
                                ? `A welcome email with login credentials has been sent to ${registeredEmail}.\n\nThis one-time password is your backup — it will not be shown again:\n\n${generatedPassword}`
                                : `Share this one-time password with them securely — it will not be shown again:\n\n${generatedPassword}`
                            : "Business registered successfully.",
                    confirmLabel: "Done",
                    cancelLabel: "Register Another",
                });
                if (done) {
                    router.back();
                } else {
                    resetForm();
                }
            } else if (synced?.status === 'failed') {
                showToast(synced.lastError || "Registration failed.", { type: 'error' });
                await dismissItem(queued.id);
            } else {
                showToast(
                    "No network right now — saved. This registration will sync automatically once you're back online.",
                    { type: 'warn', duration: 5000 }
                );
                resetForm();
            }
        } catch (error: any) {
            showToast("Could not save this registration — please try again.", { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ ...formData, business_name: '', first_name: '', last_name: '', email: '', phone: '', businessType: '', lga: '', referral_code: '' });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Register new business')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {!isCoordinator && (
                        <View style={styles.noteBanner}>
                            <MaterialIcons name="place" size={16} color={color.brand600} />
                            <Text style={styles.noteText}>
                                {t('You are registering this business in')}{' '}
                                <Text style={styles.noteStrong}>{user?.lga_details?.name || t('your LGA')}</Text>.
                            </Text>
                        </View>
                    )}

                    <Input
                        label={t('Business name')}
                        placeholder={t("Enter the business's name")}
                        value={formData.business_name}
                        onChangeText={v => setFormData({ ...formData, business_name: v })}
                        icon="storefront"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Owner first name')}
                        placeholder={t("Enter the owner's first name")}
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Owner last name')}
                        placeholder={t("Enter the owner's last name")}
                        value={formData.last_name}
                        onChangeText={v => setFormData({ ...formData, last_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Phone number')}
                        placeholder="080..."
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={v => setFormData({ ...formData, phone: v })}
                        icon="phone-iphone"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Email (optional)')}
                        placeholder={t('Enter their email address')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={v => setFormData({ ...formData, email: v })}
                        icon="mail-outline"
                        containerStyle={styles.field}
                    />

                    {isCoordinator && (
                        <SearchablePickerField
                            label={t('LGA')}
                            placeholder={t('Select the LGA this business belongs to')}
                            searchPlaceholder={t('Search LGA…')}
                            value={formData.lga}
                            onValueChange={(v) => setFormData({ ...formData, lga: v })}
                            items={lgas}
                        />
                    )}

                    <Input
                        label={t('Business type')}
                        placeholder={t("e.g. Grocery Store, Hotel, Pharmacy…")}
                        value={formData.businessType}
                        onChangeText={v => setFormData({ ...formData, businessType: v })}
                        icon="category"
                        containerStyle={styles.field}
                    />

                    <Input
                        label={t('Referral code (optional)')}
                        placeholder={t('e.g. SMAHI-KN-XXXX')}
                        value={formData.referral_code}
                        onChangeText={v => setFormData({ ...formData, referral_code: v })}
                        icon="qr-code"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        containerStyle={styles.field}
                    />

                    <View style={styles.divider} />

                    <View style={styles.noteBanner}>
                        <MaterialIcons name="payments" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t("After registering, you'll pay the ₦2,500 registration fee on this same screen — hand your phone to the owner to pay by card, bank transfer, or USSD via Paystack.")}
                        </Text>
                    </View>

                    <View style={styles.noteBanner}>
                        <MaterialIcons name="lock-outline" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {isCoordinator
                                ? t("A welcome email with login credentials will be dispatched automatically to the business owner's email after registration. A one-time password will also be shown to you as a backup.")
                                : t("A one-time password will be generated and shown to you after registration — you'll need to share it with the business owner yourself.")}
                        </Text>
                    </View>

                    <Button
                        title={t('Register business')}
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    headerSafe: { backgroundColor: color.brand900 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.brand900,
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: '#FFF' },
    backButton: {
        width: 40,
        height: 40,
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
        backgroundColor: color.brand100,
        borderRadius: radius.md,
        padding: space.md,
        marginBottom: space.xl,
    },
    noteText: { flex: 1, fontFamily: font.medium, fontSize: 13, color: color.brand600 },
    noteStrong: { fontFamily: font.extrabold },

    field: { marginBottom: space.lg },

    divider: { height: 1, backgroundColor: color.border, marginVertical: space.lg },

    submitButton: { marginTop: space.md },
});
