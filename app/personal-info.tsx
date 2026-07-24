import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, ScrollView, Pressable, TextInput,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { authAPI } from "@/src/api/client";
import { storage } from "@/src/utils/storage";
import { useAuth } from "@/src/contexts/AuthContext";
import { color, font, radius, shadow, space } from "@/constants/theme";

// Editable account fields — matches the backend UserUpdateSerializer
// (auth/profile/ PATCH accepts first_name, last_name, phone_number, address).
export default function PersonalInfoScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // --- Account deletion (Play Store data-safety requirement) ---
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        storage.getCurrentUser().then((user) => {
            if (user) {
                setEmail(user.email || "");
                setFirstName(user.first_name || "");
                setLastName(user.last_name || "");
                setPhone(user.phone_number || "");
                setAddress(user.address || "");
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!firstName.trim()) {
            Alert.alert(t('Error'), t('First name cannot be empty.'));
            return;
        }
        setSaving(true);
        try {
            const payload = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone_number: phone.trim(),
                address: address.trim(),
            };
            await authAPI.updateProfile(payload);
            await storage.updateCurrentUser(payload);
            Alert.alert(t('Success'), t('Your information has been updated.'));
            router.back();
        } catch (error) {
            Alert.alert(t('Error'), t('Failed to update your information. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError(t('Enter your password to confirm.'));
            return;
        }
        setDeleting(true);
        setDeleteError("");
        try {
            await authAPI.deleteAccount(deletePassword);
            Alert.alert(
                t('Account deleted'),
                t('Your account has been deactivated. We\'re sorry to see you go.'),
                [{ text: t('OK'), onPress: async () => { await logout(); router.replace('/welcome'); } }]
            );
        } catch (error: any) {
            setDeleteError(error?.response?.data?.error || t('Failed to delete your account. Please try again.'));
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={color.brand600} />
            </View>
        );
    }

    const Field = ({
        label, value, onChangeText, editable = true, keyboardType,
    }: {
        label: string;
        value: string;
        onChangeText?: (v: string) => void;
        editable?: boolean;
        keyboardType?: 'phone-pad' | 'default';
    }) => (
        <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.input, !editable && styles.inputDisabled]}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                keyboardType={keyboardType || 'default'}
                placeholderTextColor={color.ink300}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.navBar}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                    <MaterialIcons name="arrow-back" size={22} color={color.ink900} />
                </Pressable>
                <Text style={styles.navTitle}>{t('Personal Information')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Field label={t('Email')} value={email} editable={false} />
                        <Field label={t('First Name')} value={firstName} onChangeText={setFirstName} />
                        <Field label={t('Last Name')} value={lastName} onChangeText={setLastName} />
                        <Field label={t('Phone Number')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <Field label={t('Address')} value={address} onChangeText={setAddress} />

                        <Pressable
                            onPress={handleSave}
                            disabled={saving}
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.saveBtn, (pressed || saving) && { opacity: 0.8 }]}
                        >
                            {saving
                                ? <ActivityIndicator color="#FFF" />
                                : <Text style={styles.saveText}>{t('Save Changes')}</Text>}
                        </Pressable>

                        <View style={styles.dangerZone}>
                            <Text style={styles.dangerTitle}>{t('Danger zone')}</Text>

                            {!showDeleteConfirm ? (
                                <Pressable
                                    onPress={() => setShowDeleteConfirm(true)}
                                    accessibilityRole="button"
                                    style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
                                >
                                    <MaterialIcons name="delete-outline" size={18} color={color.danger600} />
                                    <Text style={styles.deleteBtnText}>{t('Delete my account')}</Text>
                                </Pressable>
                            ) : (
                                <View>
                                    <Text style={styles.dangerHint}>
                                        {t('This deactivates your account permanently — you will be logged out and cannot sign in again. Enter your password to confirm.')}
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('Current password')}
                                        value={deletePassword}
                                        onChangeText={(v) => { setDeletePassword(v); setDeleteError(""); }}
                                        secureTextEntry
                                        placeholderTextColor={color.ink300}
                                    />
                                    {!!deleteError && <Text style={styles.dangerError}>{deleteError}</Text>}
                                    <View style={styles.dangerActions}>
                                        <Pressable
                                            onPress={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}
                                            disabled={deleting}
                                            accessibilityRole="button"
                                            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
                                        >
                                            <Text style={styles.cancelBtnText}>{t('Cancel')}</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={handleDeleteAccount}
                                            disabled={deleting}
                                            accessibilityRole="button"
                                            style={({ pressed }) => [styles.confirmDeleteBtn, (pressed || deleting) && { opacity: 0.8 }]}
                                        >
                                            {deleting
                                                ? <ActivityIndicator color="#FFF" />
                                                : <Text style={styles.confirmDeleteBtnText}>{t('Confirm deletion')}</Text>}
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: space.xl, paddingVertical: space.md,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: radius.lg, backgroundColor: color.surface,
        justifyContent: 'center', alignItems: 'center', ...shadow.e1,
    },
    navTitle: { fontFamily: font.extrabold, fontSize: 17, color: color.ink900 },
    content: { padding: space.xl },

    fieldBlock: { marginBottom: space.lg },
    fieldLabel: {
        fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.5,
        textTransform: 'uppercase', color: color.ink400, marginBottom: space.sm, marginLeft: 4,
    },
    input: {
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1.5,
        borderColor: color.border, paddingHorizontal: space.lg, height: 52,
        fontFamily: font.semibold, fontSize: 15, color: color.ink900,
    },
    inputDisabled: { backgroundColor: color.surfaceChip, color: color.ink400 },

    saveBtn: {
        height: 52, borderRadius: radius.lg, backgroundColor: color.brand600,
        justifyContent: 'center', alignItems: 'center', marginTop: space.md, ...shadow.cta,
    },
    saveText: { fontFamily: font.extrabold, fontSize: 15, color: '#FFF' },

    dangerZone: {
        marginTop: space.xxl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.border,
    },
    dangerTitle: {
        fontFamily: font.extrabold, fontSize: 11, letterSpacing: 0.5,
        textTransform: 'uppercase', color: color.ink400, marginBottom: space.md,
    },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 48, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.danger600,
    },
    deleteBtnText: { fontFamily: font.extrabold, fontSize: 14.5, color: color.danger600 },
    dangerHint: { fontFamily: font.medium, fontSize: 13, color: color.ink400, marginBottom: space.md, lineHeight: 18 },
    dangerError: { fontFamily: font.semibold, fontSize: 12.5, color: color.danger600, marginTop: space.sm },
    dangerActions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
    cancelBtn: {
        flex: 1, height: 48, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.border,
        justifyContent: 'center', alignItems: 'center',
    },
    cancelBtnText: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink600 },
    confirmDeleteBtn: {
        flex: 1, height: 48, borderRadius: radius.lg, backgroundColor: color.danger600,
        justifyContent: 'center', alignItems: 'center',
    },
    confirmDeleteBtnText: { fontFamily: font.extrabold, fontSize: 14.5, color: '#FFF' },
});
