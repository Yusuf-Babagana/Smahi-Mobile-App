import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { adminAPI, locationAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast, useConfirm, CountryPickerField, SearchablePickerField } from '@/src/components/ui';

// Admin-initiated coordinator onboarding. Unlike app/coordinator/
// create-agent.tsx and app/agent/register.tsx, this deliberately isn't
// wired into the offline-sync queue (src/utils/offlineQueue.ts) — those
// exist for field agents working with weak/no connectivity; provisioning
// a coordinator is a low-frequency, office-context administrative action,
// not a field operation, so a plain direct call is the right amount of
// complexity here.
export default function AdminCreateCoordinatorScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        state: '',
    });

    useEffect(() => {
        locationAPI.getCountries().then(data => setCountries(data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (!formData.country) { setStates([]); return; }
        locationAPI.getStates(Number(formData.country)).then(data => {
            setStates(data || []);
            setFormData(f => ({ ...f, state: '' }));
        }).catch(() => {});
    }, [formData.country]);

    const handleCreate = async () => {
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.state) {
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
                state: Number(formData.state),
            };

            const result = await adminAPI.createCoordinator(payload);
            const generatedPassword = result?.generated_password;
            const alreadyRegistered = result?.already_registered;

            const done = await confirm({
                title: alreadyRegistered ? t('Already created') : t('Coordinator created'),
                message: alreadyRegistered
                    ? (result?.message || t('This coordinator was already created.'))
                    : generatedPassword
                        ? t('Share this one-time password with them securely — it will not be shown again:') + `\n\n${generatedPassword}`
                        : t('Coordinator created successfully.'),
                confirmLabel: t('Done'),
                cancelLabel: t('Create another'),
            });
            if (done) {
                router.back();
            } else {
                setFormData({ first_name: '', last_name: '', email: '', phone: '', country: formData.country, state: formData.state });
            }
        } catch (error: any) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : t('Could not create this coordinator.');
            showToast(msg, { type: 'error' });
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
                    <Text style={styles.headerTitle}>{t('Create coordinator')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.noteBanner}>
                        <MaterialIcons name="public" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t('A coordinator oversees an entire state — pick which one below.')}
                        </Text>
                    </View>

                    <Input
                        label={t('First name')}
                        placeholder={t("Enter the coordinator's first name")}
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Last name')}
                        placeholder={t("Enter the coordinator's last name")}
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

                    <CountryPickerField
                        label={t('Country')}
                        placeholder={t('Select Country')}
                        value={formData.country}
                        onValueChange={(v) => setFormData({ ...formData, country: v })}
                        countries={countries}
                    />
                    <SearchablePickerField
                        label={t('State')}
                        placeholder={t('Select the state to oversee')}
                        searchPlaceholder={t('Search state…')}
                        value={formData.state}
                        onValueChange={(v) => setFormData({ ...formData, state: v })}
                        items={states}
                        disabled={!formData.country}
                    />

                    <View style={styles.divider} />

                    <View style={styles.noteBanner}>
                        <MaterialIcons name="lock-outline" size={16} color={color.brand600} />
                        <Text style={styles.noteText}>
                            {t("A one-time password will be generated and shown to you after creation — you'll need to share it with the coordinator yourself.")}
                        </Text>
                    </View>

                    <Button
                        title={t('Create coordinator')}
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

    field: { marginBottom: space.lg },

    divider: { height: 1, backgroundColor: color.border, marginVertical: space.lg },

    submitButton: { marginTop: space.md },
});
