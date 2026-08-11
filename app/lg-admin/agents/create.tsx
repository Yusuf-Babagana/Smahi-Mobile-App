import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import apiClient from '@/src/api/config';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input, useToast } from '@/src/components/ui';

// Unique per agent so the same credential isn't shared account-to-account.
function generateTempPassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
}

export default function CreateAgentScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth(); // LG Admin's user object
    const { show: showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: generateTempPassword(),
    });

    const handleCreate = async () => {
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
            showToast("Please fill all fields.", { type: 'warn' });
            return;
        }

        setLoading(true);
        try {
            // No dedicated "create agent" endpoint exists — this reuses the
            // same auth/register/ endpoint the public registration screen
            // uses (it accepts an explicit role), via the raw client so the
            // new agent's tokens never get written over the LG Admin's own
            // session in SecureStore.
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.password,
                phone_number: formData.phone,
                role: 'agent', // Force role

                // 🔒 LOCK LOCATION to Admin's Location
                country: user?.country,
                state: user?.state,
                lga: user?.lga
            };

            await apiClient.post('auth/register/', payload);

            showToast("Agent created successfully!", { type: 'success' });
            router.back();
        } catch (error: any) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to create agent.";
            showToast(msg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Close')}>
                        <MaterialIcons name="close" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('New field agent')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={18} color={color.brand600} />
                    <Text style={styles.infoText}>
                        {t('This agent will be assigned to')}{' '}
                        <Text style={styles.infoStrong}>{user?.lga_details?.name}</Text>.
                    </Text>
                </View>

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
                    label={t('Email address')}
                    value={formData.email}
                    onChangeText={v => setFormData({ ...formData, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    containerStyle={styles.field}
                />
                <Input
                    label={t('Phone number')}
                    value={formData.phone}
                    onChangeText={v => setFormData({ ...formData, phone: v })}
                    keyboardType="phone-pad"
                    icon="phone-iphone"
                    containerStyle={styles.field}
                />

                <View style={styles.field}>
                    <Text style={styles.label}>{t('Default password')}</Text>
                    <View style={styles.passwordBox}>
                        <MaterialIcons name="lock-outline" size={18} color={color.ink300} />
                        <TextInput style={styles.passwordInput} value={formData.password} editable={false} />
                    </View>
                    <Text style={styles.hint}>{t('Share this password with the new agent.')}</Text>
                </View>

                <Button
                    title={t('Create agent')}
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.submitButton}
                />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

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
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    form: { padding: space.xl, paddingBottom: 60 },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: color.brand100,
        padding: space.md,
        borderRadius: radius.md,
        marginBottom: space.xl,
    },
    infoText: { flex: 1, fontFamily: font.medium, color: color.brand600, fontSize: 13 },
    infoStrong: { fontFamily: font.extrabold },

    field: { marginBottom: space.lg },
    label: {
        fontFamily: font.bold,
        fontSize: 12.5,
        color: color.ink600,
        marginBottom: 6,
    },
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
