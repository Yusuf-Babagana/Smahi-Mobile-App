import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { authAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';

// A nudge, not a gate: email_verified === false blocks nothing.
// Session-scoped dismissal — reappears on the next app launch.
let dismissedThisSession = false;

export const EmailVerificationBanner = () => {
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const check = async () => {
                if (dismissedThisSession) {
                    setVisible(false);
                    return;
                }

                const cached = await storage.getCurrentUser();
                if (!cached) {
                    setVisible(false);
                    return;
                }

                if (cached.email_verified === true) {
                    setVisible(false);
                    return;
                }
                if (cached.email_verified === false) {
                    if (active) setVisible(true);
                    return;
                }

                // Field missing (user logged in before this feature shipped) —
                // confirm against the backend once and sync the caches.
                try {
                    const profile = await authAPI.getProfile();
                    if (!active) return;
                    if (typeof profile?.email_verified === 'boolean') {
                        await storage.updateCurrentUser({ email_verified: profile.email_verified });
                        setVisible(profile.email_verified === false);
                    }
                } catch (e) {
                    // Can't determine — stay quiet rather than nag wrongly.
                    if (active) setVisible(false);
                }
            };

            check();
            return () => { active = false; };
        }, [])
    );

    if (!visible) return null;

    const handleDismiss = () => {
        dismissedThisSession = true;
        setVisible(false);
    };

    return (
        <View style={styles.banner}>
            <View style={styles.iconCircle}>
                <Ionicons name="mail-unread-outline" size={20} color="#B45309" />
            </View>
            <View style={styles.textCol}>
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                    Confirm your email address to secure your account.
                </Text>
            </View>
            <TouchableOpacity style={styles.verifyBtn} onPress={() => router.push('/verify-email')}>
                <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                <Ionicons name="close" size={16} color="#B45309" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        gap: 10,
    },
    iconCircle: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center', alignItems: 'center',
    },
    textCol: { flex: 1 },
    title: { fontSize: 14, fontWeight: '800', color: '#92400E' },
    subtitle: { fontSize: 12, color: '#B45309', marginTop: 1 },
    verifyBtn: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 12,
    },
    verifyText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    closeBtn: { padding: 4 },
});
