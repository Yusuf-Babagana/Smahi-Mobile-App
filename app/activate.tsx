import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { storage } from '@/src/utils/storage';
import { useAuth } from '@/src/contexts/AuthContext';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';
import { API_URL as BASE_URL } from '@/src/constants/env';
import { color, font, space, type } from '@/constants/theme';
import { Button, Input } from '@/src/components/ui';

export default function ActivationScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [serial, setSerial] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivation = async () => {
        if (!serial.trim()) {
            Alert.alert("Error", "Please enter your serial number");
            return;
        }

        setLoading(true);
        try {
            // 1. Get the current user's token
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                Alert.alert("Session Expired", "Please login again.");
                router.replace('/login');
                return;
            }

            // 2. Send Serial Number to Backend
            const response = await axios.post(
                `${BASE_URL}/auth/activate/`,
                { serial_number: serial.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 3. Success! Sync the cached account_status (the boot router checks it)
            // and land on the dashboard for THIS role, not client home.
            const updatedUser = await storage.updateCurrentUser(
                response.data?.user || { account_status: 'active' }
            );
            Alert.alert("🎉 Success", "Account activated successfully!", [
                {
                    text: "Go to Dashboard",
                    onPress: () => router.replace(getHomeRouteForRole(updatedUser?.role))
                }
            ]);

        } catch (error: any) {
            console.log("Activation Error:", error.response?.data);
            const msg = error.response?.data?.error || "Invalid Serial Number. Please contact your administrator.";
            Alert.alert("Activation Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >

                {/* Lock icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name="lock-outline" size={40} color={color.brand600} />
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{t('Account locked')}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{t('Activation required')}</Text>
                <Text style={styles.subtitle}>
                    {t('This dashboard is restricted. Enter the unique serial number issued by your State Coordinator or Administrator.')}
                </Text>

                <Input
                    icon="vpn-key"
                    placeholder={t('Enter Serial Number')}
                    value={serial}
                    onChangeText={setSerial}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    containerStyle={styles.inputContainer}
                />

                <Button
                    title={t('Unlock dashboard')}
                    onPress={handleActivation}
                    loading={loading}
                    style={styles.button}
                />

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} accessibilityRole="button">
                        <MaterialIcons name="logout" size={18} color={color.ink400} />
                        <Text style={styles.logoutText}>{t('Log Out')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => Alert.alert(t("Support"), t("Contact your Admin for your code."))}
                        accessibilityRole="button"
                    >
                        <Text style={styles.helpText}>{t('Need help?')}</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.canvas,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: space.xxl,
    },

    iconContainer: {
        alignItems: 'center',
        marginBottom: space.xxl,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: color.brand100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: space.md,
    },
    statusBadge: {
        backgroundColor: '#FDECEC',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusText: {
        color: '#B91C1C',
        fontFamily: font.extrabold,
        fontSize: 10.5,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    title: {
        ...type.titleLg,
        textAlign: 'center',
        marginBottom: space.sm,
    },
    subtitle: {
        fontFamily: font.medium,
        fontSize: 14,
        color: color.ink400,
        textAlign: 'center',
        marginBottom: space.xxl,
        lineHeight: 21,
    },

    inputContainer: {
        marginBottom: space.xl,
    },
    button: {
        marginBottom: space.xxl,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: space.sm,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logoutText: {
        color: color.ink400,
        fontFamily: font.bold,
        fontSize: 14,
    },
    helpText: {
        color: color.brand600,
        fontFamily: font.extrabold,
        fontSize: 13.5,
    },
});
