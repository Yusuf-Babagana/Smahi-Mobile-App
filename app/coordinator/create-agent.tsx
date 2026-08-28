import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { locationAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast, useConfirm, SearchablePickerField } from '@/src/components/ui';
import { enqueue, processQueue, getQueue, saveDraft, loadDraft, clearDraft, dismissItem } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';

// Coordinator Dashboard (Full State Management) — per the explicit
// decision that Coordinators, not Admin and not a self-application flow,
// are responsible for creating new Agents in their own state. Same
// offline-first pattern as app/agent/register.tsx: a completed form must
// not be lost to a network drop, so it's queued locally first and synced
// automatically — see src/utils/offlineQueue.ts.
const QUEUE_TYPE = 'coordinator_create_agent';
const DRAFT_KEY = 'coordinator_create_agent';

export default function CoordinatorCreateAgentScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const [lgas, setLgas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        lga: '',
    });

    useEffect(() => {
        if (user?.state) {
            locationAPI.getLGAs(Number(user.state)).then(data => {
                setLgas((data || []).map((l: any) => ({ id: l.id, name: l.name })));
            }).catch(() => {});
        }
    }, [user?.state]);

    // Restore an in-progress form after an app kill/interruption — same
    // reasoning as app/agent/register.tsx.
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

    const handleCreate = async () => {
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.lga) {
            showToast(t('Please fill all required fields.'), { type: 'warn' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || `${formData.phone}@smahi.com`,
                phone_number: formData.phone,
                lga: Number(formData.lga),
            };

            const queued = await enqueue(QUEUE_TYPE, payload);
            await processQueue(syncSubmitters);
            const items = await getQueue(QUEUE_TYPE);
            const synced = items.find(i => i.id === queued.id);

            if (synced?.status === 'server_verified') {
                const generatedPassword = synced.serverResult?.generated_password;
                const alreadyRegistered = synced.serverResult?.already_registered;

                const done = await confirm({
                    title: alreadyRegistered ? t('Already created') : t('Agent created'),
                    message: alreadyRegistered
                        ? (synced.serverResult?.message || t('This agent was already created.'))
                        : generatedPassword
                            ? t('Share this one-time password with them securely — it will not be shown again:') + `\n\n${generatedPassword}`
                            : t('Agent created successfully.'),
                    confirmLabel: t('Done'),
                    cancelLabel: t('Create another'),
                });
                await clearDraft(DRAFT_KEY);
                if (done) {
                    router.back();
                } else {
                    setFormData({ first_name: '', last_name: '', email: '', phone: '', lga: '' });
                }
            } else if (synced?.status === 'failed') {
                let serverMessage: string | undefined;
                try {
                    const parsed = JSON.parse(synced.lastError || '');
                    serverMessage = typeof parsed === 'object'
                        ? (Object.values(parsed).flat().find((v) => typeof v === 'string') as string | undefined)
                        : undefined;
                } catch {
                    // not JSON — fall through to the generic message below
                }
                showToast(serverMessage || t('Could not create this agent.'), { type: 'error' });
                await dismissItem(queued.id);
            } else {
                showToast(
                    t("No network right now — saved. This agent will be created automatically once you're back online."),
                    { type: 'warn', duration: 5000 }
                );
                setFormData({ first_name: '', last_name: '', email: '', phone: '', lga: '' });
            }
        } catch (error: any) {
            showToast(t('Could not save this — please try again.'), { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Create agent')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.noteBanner}>
                        <MaterialIcons name="place" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t('You are creating this agent in')}{' '}
                            <Text style={styles.noteStrong}>{user?.state_details?.name || t('your state')}</Text>.
                        </Text>
                    </View>

                    <Input
                        label={t('First name')}
                        placeholder={t("Enter the agent's first name")}
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Last name')}
                        placeholder={t("Enter the agent's last name")}
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

                    <SearchablePickerField
                        label={t('LGA')}
                        placeholder={t('Select the LGA this agent will cover')}
                        searchPlaceholder={t('Search LGA…')}
                        value={formData.lga}
                        onValueChange={(v) => setFormData({ ...formData, lga: v })}
                        items={lgas}
                    />

                    <View style={styles.divider} />

                    <View style={styles.noteBanner}>
                        <MaterialIcons name="lock-outline" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t("A one-time password will be generated and shown to you after creation — you'll need to share it with the agent yourself.")}
                        </Text>
                    </View>

                    <Button
                        title={t('Create agent')}
                        onPress={handleCreate}
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
