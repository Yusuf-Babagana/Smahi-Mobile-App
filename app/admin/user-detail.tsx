import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { adminAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, Button, Input, SearchablePickerField, useToast, useConfirm } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

const ROLE_OPTIONS = [
    { id: 'client', name: 'Client' },
    { id: 'artisan', name: 'Artisan' },
    { id: 'business', name: 'Business' },
    { id: 'agent', name: 'Agent' },
    { id: 'state_coordinator', name: 'State Coordinator' },
    { id: 'admin', name: 'Admin' },
];
const STATUS_OPTIONS = [
    { id: 'active', name: 'Active' },
    { id: 'suspended', name: 'Suspended' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'dismissed', name: 'Dismissed' },
];

function statusBadge(status: string): BadgeStatus {
    if (status === 'active') return 'verified';
    if (status === 'suspended') return 'pending';
    return 'cancelled';
}

// Full detail + edit for one account — see app/admin/users.tsx's own
// comment on why this exists (Admin's second deliberate exception to an
// otherwise read-only mobile dashboard).
export default function AdminUserDetailScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone_number: '',
        role: '', account_status: '',
    });

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const data = await adminAPI.getUser(Number(id));
            setUser(data);
            setForm({
                first_name: data.first_name || '', last_name: data.last_name || '',
                email: data.email || '', phone_number: data.phone_number || '',
                role: data.role || '', account_status: data.account_status || '',
            });
        } catch (error) {
            console.log('Error loading user:', error);
            showToast(t('Could not load this account.'), { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await adminAPI.updateUser(Number(id), form);
            setUser(updated);
            setEditing(false);
            showToast(t('Account updated.'), { type: 'success' });
        } catch (error: any) {
            const data = error.response?.data;
            const msg = typeof data?.error === 'string' ? data.error
                : data ? JSON.stringify(data)
                : t('Could not update this account.');
            showToast(msg, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        const ok = await confirm({
            title: t('Deactivate this account?'),
            message: t('They will lose access immediately. This can be undone later by reactivating them.'),
            confirmLabel: t('Deactivate'),
            destructive: true,
        });
        if (!ok) return;

        setDeactivating(true);
        try {
            await adminAPI.deactivateUser(Number(id));
            showToast(t('Account deactivated.'), { type: 'success' });
            router.back();
        } catch (error: any) {
            const msg = error.response?.data?.error || t('Could not deactivate this account.');
            showToast(msg, { type: 'error' });
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerFill]}>
                <ActivityIndicator color={color.brand600} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, styles.centerFill]}>
                <Text style={styles.notFoundText}>{t('Account not found.')}</Text>
            </View>
        );
    }

    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.profileRow}>
                    <Avatar name={displayName} gender={user.gender} size={56} />
                    <View style={{ flex: 1, marginLeft: space.md }}>
                        <Text style={styles.name}>{displayName}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <Badge label={t(user.account_status)} status={statusBadge(user.account_status)} />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <Text style={styles.sectionTitle}>{t('Account details')}</Text>
                        {!editing && (
                            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel={t('Edit')}>
                                <MaterialIcons name="edit" size={20} color={color.brand600} />
                            </Pressable>
                        )}
                    </View>

                    {!editing ? (
                        <>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('First name')}</Text>
                                <Text style={styles.fieldValue}>{user.first_name || '—'}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('Last name')}</Text>
                                <Text style={styles.fieldValue}>{user.last_name || '—'}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('Phone number')}</Text>
                                <Text style={styles.fieldValue}>{user.phone_number || '—'}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('Role')}</Text>
                                <Text style={styles.fieldValue}>{t(user.role)}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('State')}</Text>
                                <Text style={styles.fieldValue}>{user.state_details?.name || '—'}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('LGA')}</Text>
                                <Text style={styles.fieldValue}>{user.lga_details?.name || '—'}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>{t('Joined')}</Text>
                                <Text style={styles.fieldValue}>{(user.created_at || '').slice(0, 10)}</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <Input
                                label={t('First name')}
                                value={form.first_name}
                                onChangeText={v => setForm({ ...form, first_name: v })}
                                containerStyle={styles.field}
                            />
                            <Input
                                label={t('Last name')}
                                value={form.last_name}
                                onChangeText={v => setForm({ ...form, last_name: v })}
                                containerStyle={styles.field}
                            />
                            <Input
                                label={t('Email')}
                                value={form.email}
                                onChangeText={v => setForm({ ...form, email: v })}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                containerStyle={styles.field}
                            />
                            <Input
                                label={t('Phone number')}
                                value={form.phone_number}
                                onChangeText={v => setForm({ ...form, phone_number: v })}
                                keyboardType="phone-pad"
                                containerStyle={styles.field}
                            />
                            <SearchablePickerField
                                label={t('Role')}
                                placeholder={t('Select role')}
                                value={form.role}
                                onValueChange={(v) => setForm({ ...form, role: v })}
                                items={ROLE_OPTIONS}
                            />
                            <View style={{ marginTop: space.md }}>
                                <SearchablePickerField
                                    label={t('Status')}
                                    placeholder={t('Select status')}
                                    value={form.account_status}
                                    onValueChange={(v) => setForm({ ...form, account_status: v })}
                                    items={STATUS_OPTIONS}
                                />
                            </View>
                            <Text style={styles.hint}>
                                {t('Changing role/state can be rejected by rules like "one coordinator per state" — you\'ll see a clear error if so.')}
                            </Text>
                            <View style={styles.editActions}>
                                <Button title={t('Cancel')} variant="secondary" onPress={() => { setEditing(false); load(); }} style={{ flex: 1 }} />
                                <Button title={t('Save')} onPress={handleSave} loading={saving} style={{ flex: 1 }} />
                            </View>
                        </>
                    )}
                </View>

                {!editing && (
                    <Button
                        title={t('Deactivate account')}
                        variant="secondary"
                        onPress={handleDeactivate}
                        loading={deactivating}
                        style={styles.deactivateButton}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    centerFill: { alignItems: 'center', justifyContent: 'center' },
    notFoundText: { fontFamily: font.medium, fontSize: 14, color: color.ink400 },

    headerSafe: { backgroundColor: color.surface },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900, flex: 1, textAlign: 'center', marginHorizontal: space.sm },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: { padding: space.xl, paddingBottom: 60 },

    profileRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: color.surface, borderRadius: radius.xl, padding: space.lg,
        borderWidth: 1, borderColor: '#EEF2F8', marginBottom: space.lg,
    },
    name: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
    email: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, marginTop: 2 },

    card: {
        backgroundColor: color.surface,
        borderRadius: radius.xl,
        padding: space.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
    sectionTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },

    fieldRow: { paddingVertical: space.sm },
    fieldLabel: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400 },
    fieldValue: { fontFamily: font.semibold, fontSize: 14.5, color: color.ink900, marginTop: 2 },

    field: { marginBottom: space.md },
    hint: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: space.md, marginBottom: space.md, lineHeight: 17 },
    editActions: { flexDirection: 'row', gap: space.md },

    deactivateButton: { marginTop: space.xl, borderColor: '#FCA5A5' },
});
