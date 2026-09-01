import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, Pressable, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { coordinatorAPI, locationAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast, useConfirm, SearchablePickerField } from '@/src/components/ui';

// Coordinator CRUD (item: "give coordinator capability of CRUD on any user
// he register") over an artisan/business THEY personally registered — see
// CoordinatorRegisteredUserDetailView. Shared between both roles the same
// way register.tsx/register-business.tsx mirror each other; only the
// role-specific fields differ.
export default function EditRegisteredUserScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const { userId, role } = useLocalSearchParams<{ userId: string; role: string }>();
    const isBusiness = role === 'business';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    const [lgas, setLgas] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', phone_number: '', address: '',
        lga: '', skill: '', business_name: '',
    });

    useEffect(() => {
        if (user?.state) {
            locationAPI.getLGAs(Number(user.state)).then(data => {
                setLgas((data || []).map((l: any) => ({ id: l.id, name: l.name })));
            }).catch(() => {});
        }
    }, [user?.state]);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const data = await coordinatorAPI.getRegisteredUser(Number(userId));
                const person = data.user || {};
                const profile = data.profile || {};
                setFormData({
                    first_name: person.first_name || '',
                    last_name: person.last_name || '',
                    phone_number: person.phone_number || '',
                    address: person.address || '',
                    lga: person.lga ? String(person.lga) : (person.lga_details?.id ? String(person.lga_details.id) : ''),
                    skill: profile.category_name || profile.profession_name || '',
                    business_name: profile.business_name || '',
                });
            } catch (error) {
                showToast(t('Could not load this account.'), { type: 'error' });
                router.back();
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleSave = async () => {
        if (!formData.first_name || !formData.last_name) {
            showToast(t('Please fill all required fields.'), { type: 'warn' });
            return;
        }
        if (isBusiness && !formData.business_name) {
            showToast(t('Business name is required.'), { type: 'warn' });
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                address: formData.address,
            };
            if (formData.lga) payload.lga = Number(formData.lga);
            if (isBusiness) {
                payload.business_name = formData.business_name;
                if (formData.skill.trim()) payload.business_type = formData.skill.trim();
            } else if (formData.skill.trim()) {
                payload.skill = formData.skill.trim();
            }

            await coordinatorAPI.updateRegisteredUser(Number(userId), payload);
            showToast(t('Updated successfully.'), { type: 'success' });
            router.back();
        } catch (error: any) {
            const message = error?.response?.data?.error || t('Could not save these changes — please try again.');
            showToast(message, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        const ok = await confirm({
            title: t('Deactivate this account?'),
            message: t('They will no longer be able to log in. This can be undone later from Django Admin if needed.'),
            confirmLabel: t('Deactivate'),
            destructive: true,
        });
        if (!ok) return;

        setDeactivating(true);
        try {
            await coordinatorAPI.deactivateRegisteredUser(Number(userId));
            showToast(t('Account deactivated.'), { type: 'info' });
            router.back();
        } catch (error) {
            showToast(t('Could not deactivate this account — please try again.'), { type: 'error' });
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={color.brand600} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>
                        {isBusiness ? t('Edit business') : t('Edit artisan')}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {isBusiness && (
                        <Input
                            label={t('Business name')}
                            value={formData.business_name}
                            onChangeText={v => setFormData({ ...formData, business_name: v })}
                            icon="storefront"
                            containerStyle={styles.field}
                        />
                    )}
                    <Input
                        label={t('First name')}
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Last name')}
                        value={formData.last_name}
                        onChangeText={v => setFormData({ ...formData, last_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Phone number')}
                        keyboardType="phone-pad"
                        value={formData.phone_number}
                        onChangeText={v => setFormData({ ...formData, phone_number: v })}
                        icon="phone-iphone"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Address')}
                        value={formData.address}
                        onChangeText={v => setFormData({ ...formData, address: v })}
                        icon="place"
                        containerStyle={styles.field}
                    />

                    <SearchablePickerField
                        label={t('LGA')}
                        placeholder={t('Select LGA')}
                        searchPlaceholder={t('Search LGA…')}
                        value={formData.lga}
                        onValueChange={(v) => setFormData({ ...formData, lga: v })}
                        items={lgas}
                    />

                    <Input
                        label={isBusiness ? t('Business type') : t('Skill / Profession')}
                        placeholder={isBusiness ? t('e.g. Hotel, Grocery Store…') : t('e.g. Plumbing, Welding…')}
                        value={formData.skill}
                        onChangeText={v => setFormData({ ...formData, skill: v })}
                        icon="build"
                        containerStyle={styles.field}
                    />

                    <Button title={t('Save changes')} onPress={handleSave} loading={saving} style={styles.submitButton} />

                    <Pressable
                        style={({ pressed }) => [styles.deactivateButton, pressed && { opacity: 0.8 }]}
                        onPress={handleDeactivate}
                        disabled={deactivating}
                        accessibilityRole="button"
                        accessibilityLabel={t('Deactivate account')}
                    >
                        {deactivating ? (
                            <ActivityIndicator color="#B91C1C" />
                        ) : (
                            <>
                                <MaterialIcons name="block" size={18} color="#B91C1C" />
                                <Text style={styles.deactivateText}>{t('Deactivate account')}</Text>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },

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
    field: { marginBottom: space.lg },

    submitButton: { marginTop: space.md },
    deactivateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: space.xl,
        paddingVertical: space.md,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    deactivateText: { fontFamily: font.extrabold, fontSize: 14, color: '#B91C1C' },
});
