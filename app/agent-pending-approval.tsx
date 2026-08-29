import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { authAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { getHomeRouteForRole } from '@/src/constants/roleRoutes';
import { color, font, space, type } from '@/constants/theme';
import { Button, useToast } from '@/src/components/ui';

// Landing screen for an agent whose account_status is still
// 'pending_approval' (see login.tsx) — mirrors activate.tsx's structure
// for a locked account, but there is nothing to *enter* here: the
// coordinator who created this agent has to review and approve them from
// their own dashboard (app/coordinator/agents.tsx). This screen only
// lets the agent check whether that has happened yet, and log out.
export default function AgentPendingApprovalScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, updateUser, logout } = useAuth();
    const [checking, setChecking] = useState(false);
    const { show: showToast } = useToast();

    const rejected = user?.account_status === 'rejected';

    const checkStatus = useCallback(async () => {
        setChecking(true);
        try {
            const freshUser = await authAPI.getProfile();
            updateUser(freshUser);

            if (freshUser.account_status === 'active') {
                showToast(t('Your account has been approved!'), { type: 'success' });
                router.replace(getHomeRouteForRole(freshUser.role));
            } else if (freshUser.account_status === 'rejected') {
                showToast(t('Your registration was rejected. Please contact your State Coordinator.'), { type: 'error' });
            } else {
                showToast(t('Still awaiting your Coordinator\'s review.'), { type: 'info' });
            }
        } catch (error) {
            console.log('Pending-approval status check failed:', error);
            showToast(t('Could not check your status. Please try again.'), { type: 'error' });
        } finally {
            setChecking(false);
        }
    }, [router, showToast, t, updateUser]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.content}>

                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, rejected && styles.iconCircleRejected]}>
                        <MaterialIcons
                            name={rejected ? 'cancel' : 'hourglass-top'}
                            size={40}
                            color={rejected ? '#B91C1C' : color.brand600}
                        />
                    </View>
                    <View style={[styles.statusBadge, rejected && styles.statusBadgeRejected]}>
                        <Text style={[styles.statusText, rejected && styles.statusTextRejected]}>
                            {rejected ? t('Registration rejected') : t('Pending approval')}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>
                    {rejected ? t('Not approved') : t('Awaiting Coordinator approval')}
                </Text>
                <Text style={styles.subtitle}>
                    {rejected
                        ? t('Your State Coordinator did not approve this registration. Please contact them directly for more information.')
                        : t('Your registration was received. Your State Coordinator needs to review and approve your account before you can start working as an agent.')}
                </Text>

                {!!user?.serial_number && (
                    <View style={styles.serialBox}>
                        <Text style={styles.serialLabel}>{t('Your Agent ID')}</Text>
                        <Text style={styles.serialValue}>{user.serial_number}</Text>
                    </View>
                )}

                {!rejected && (
                    <Button
                        title={t('Check status')}
                        onPress={checkStatus}
                        loading={checking}
                        style={styles.button}
                    />
                )}

                <View style={styles.footer}>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn} accessibilityRole="button">
                        <MaterialIcons name="logout" size={18} color={color.ink400} />
                        <Text style={styles.logoutText}>{t('Log Out')}</Text>
                    </TouchableOpacity>
                </View>

            </View>
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
    iconCircleRejected: {
        backgroundColor: '#FDECEC',
    },
    statusBadge: {
        backgroundColor: color.brand100,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusBadgeRejected: {
        backgroundColor: '#FDECEC',
    },
    statusText: {
        color: color.brand600,
        fontFamily: font.extrabold,
        fontSize: 10.5,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    statusTextRejected: {
        color: '#B91C1C',
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
        marginBottom: space.xl,
        lineHeight: 21,
    },

    serialBox: {
        alignSelf: 'center',
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.border,
        borderRadius: 12,
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        marginBottom: space.xxl,
        alignItems: 'center',
    },
    serialLabel: {
        fontFamily: font.bold,
        fontSize: 11,
        color: color.ink400,
        marginBottom: 2,
    },
    serialValue: {
        fontFamily: font.extrabold,
        fontSize: 16,
        color: color.ink900,
        letterSpacing: 0.5,
    },

    button: {
        marginBottom: space.xxl,
    },

    footer: {
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
});
