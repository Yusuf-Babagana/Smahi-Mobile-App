import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { categoryAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast, useConfirm } from '@/src/components/ui';
import { enqueue, processQueue, getQueue, saveDraft, loadDraft, clearDraft, dismissItem } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';

// One offline-queue "type" + one draft key for this screen — see
// src/utils/offlineQueue.ts. Registering an artisan in the field must not
// depend on network: a completed form is queued locally the instant
// "Register & verify" is tapped, an immediate sync attempt is made in case
// network is actually fine, and if that fails for network reasons (not a
// real validation error) the form is treated as saved/pending rather than
// lost — the background sync in app/_layout.tsx picks it up the moment
// connectivity returns.
const QUEUE_TYPE = 'agent_register_artisan';
const DRAFT_KEY = 'agent_register_artisan';

export default function AgentRegisterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth(); // Get Agent's details
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        service_category: '',
    });

    // Restore whatever the agent had typed before the app was killed/
    // backgrounded mid-form — losing a half-completed registration to an
    // interruption is exactly the kind of "network/interruption ate my
    // work" problem this feature exists to prevent, even before the point
    // of actually submitting.
    const draftLoaded = useRef(false);
    useEffect(() => {
        loadDraft<typeof formData>(DRAFT_KEY).then((draft) => {
            if (draft) setFormData(draft);
            draftLoaded.current = true;
        });
    }, []);

    useEffect(() => {
        // Skip the very first render (before the draft load above has had a
        // chance to run) so an empty initial state doesn't overwrite a real
        // saved draft the instant this effect fires.
        if (!draftLoaded.current) return;
        saveDraft(DRAFT_KEY, formData);
    }, [formData]);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await categoryAPI.getCategoriesFlat();
            setServices(data.map((cat: any) => ({
                label: cat.name,
                value: cat.id.toString()
            })));
        } catch (e) {
            console.log("Failed to load services");
        }
    };

    const handleRegister = async () => {
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.service_category) {
            showToast("Please fill all required fields.", { type: 'warn' });
            return;
        }

        setLoading(true);
        try {
            // Construct the payload — the backend generates the password
            // server-side, so none is sent here.
            // Note: We use the Agent's location to lock the Artisan to the same area
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || `${formData.phone}@smahi.com`, // Fallback email
                phone_number: formData.phone,
                category_id: formData.service_category ? Number(formData.service_category) : undefined,
                country: user?.country, // 🔒 Locked to Agent
                state: user?.state,     // 🔒 Locked to Agent
                lga: user?.lga          // 🔒 Locked to Agent
            };

            // Queue first, then attempt a sync right away — this is what
            // makes the form safe even if network drops mid-submit: the
            // instant it's queued, this data can no longer be lost to a
            // failed request, only retried automatically later by
            // app/_layout.tsx's OfflineSyncManager if this immediate
            // attempt doesn't succeed.
            const queued = await enqueue(QUEUE_TYPE, payload);
            await processQueue(syncSubmitters);
            const items = await getQueue(QUEUE_TYPE);
            const synced = items.find(i => i.id === queued.id);

            if (synced?.status === 'server_verified') {
                const generatedPassword = synced.serverResult?.generated_password;
                const alreadyRegistered = synced.serverResult?.already_registered;

                // Neither path here is a "cancel" — both are real next steps, so
                // confirm()'s two buttons are repurposed: confirm = Done, cancel = Register Another.
                const done = await confirm({
                    title: alreadyRegistered ? "Already registered" : "Artisan Registered",
                    message: alreadyRegistered
                        ? (synced.serverResult?.message || "This artisan was already registered — no new account was created.")
                        : generatedPassword
                            ? `Share this one-time password with them securely — it will not be shown again:\n\n${generatedPassword}`
                            : "Artisan registered successfully.",
                    confirmLabel: "Done",
                    cancelLabel: "Register Another",
                });
                await clearDraft(DRAFT_KEY);
                if (done) {
                    router.back();
                } else {
                    resetForm();
                }
            } else if (synced?.status === 'failed') {
                // A real rejection from the server (a validation error, not
                // a network problem) — surface it immediately so the agent
                // can fix it, exactly as before this feature existed. Not
                // worth keeping in the Pending Sync list once shown — the
                // next submit attempt queues a fresh item.
                showToast(synced.lastError || "Registration failed.", { type: 'error' });
                await dismissItem(queued.id);
            } else {
                // Still pending_sync — no usable network right now. Nothing
                // is lost: it's safely queued and will sync on its own the
                // moment connectivity returns.
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
        setFormData({ ...formData, first_name: '', last_name: '', email: '', phone: '' });
    };

    return (
        <View style={styles.container}>
            {/* Suppresses expo-router's default native header (raw route
                path) above this screen's own custom header below. */}
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Register new artisan')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.noteBanner}>
                        <MaterialIcons name="place" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t('You are registering this artisan in')}{' '}
                            <Text style={styles.noteStrong}>{user?.lga_details?.name || t('your LGA')}</Text>.
                        </Text>
                    </View>

                    <Input
                        label={t('First name')}
                        placeholder={t("Enter the artisan's first name")}
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Last name')}
                        placeholder={t("Enter the artisan's last name")}
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

                    <View style={styles.field}>
                        <Text style={styles.label}>{t('Service category')}</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.service_category}
                                onValueChange={(itemValue) => setFormData({ ...formData, service_category: itemValue })}
                            >
                                <Picker.Item label={t('Select Service...')} value="" />
                                {services.map((s: any) => (
                                    <Picker.Item key={s.value} label={s.label} value={s.value} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.noteBanner}>
                        <MaterialIcons name="lock-outline" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t("A one-time password will be generated and shown to you after registration — you'll need to share it with the artisan yourself.")}
                        </Text>
                    </View>

                    <Button
                        title={t('Register & verify')}
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
    label: {
        fontFamily: font.bold,
        fontSize: 12.5,
        color: color.ink600,
        marginBottom: 6,
    },
    pickerContainer: {
        borderWidth: 1.5,
        borderColor: color.border,
        borderRadius: 14,
        backgroundColor: color.surface,
        overflow: 'hidden',
    },

    divider: { height: 1, backgroundColor: color.border, marginVertical: space.lg },

    passwordBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: color.border,
        backgroundColor: color.surfaceChip,
        paddingHorizontal: space.lg,
    },
    passwordInput: { flex: 1, fontFamily: font.bold, fontSize: 14.5, color: color.ink400 },
    hint: { fontFamily: font.bold, fontSize: 12, color: color.ink300, marginTop: 6 },

    submitButton: { marginTop: space.md },
});
