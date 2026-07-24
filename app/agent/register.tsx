import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Alert, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, categoryAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Button, Input } from '@/src/components/ui';

export default function AgentRegisterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth(); // Get Agent's details

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
            Alert.alert("Missing Fields", "Please fill all required fields.");
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

            const result = await agentAPI.registerArtisan(payload);
            const generatedPassword = result?.generated_password;

            Alert.alert(
                "Artisan Registered",
                generatedPassword
                    ? `Share this one-time password with them securely — it will not be shown again:\n\n${generatedPassword}`
                    : "Artisan registered successfully.",
                [
                    { text: "Register Another", onPress: () => resetForm() },
                    { text: "Done", onPress: () => router.back() }
                ]
            );
        } catch (error: any) {
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Registration failed.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ ...formData, first_name: '', last_name: '', email: '', phone: '' });
    };

    return (
        <View style={styles.container}>
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
                        placeholder="e.g. Ibrahim"
                        value={formData.first_name}
                        onChangeText={v => setFormData({ ...formData, first_name: v })}
                        icon="person-outline"
                        containerStyle={styles.field}
                    />
                    <Input
                        label={t('Last name')}
                        placeholder="e.g. Musa"
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
                        placeholder="artisan@gmail.com"
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
