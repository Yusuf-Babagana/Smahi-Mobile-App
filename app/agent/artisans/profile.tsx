import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space, type } from '@/constants/theme';
import { Avatar, useToast, useConfirm } from '@/src/components/ui';
// import QRCode from 'react-native-qrcode-svg'; // 💡 INSTALL: npx expo install react-native-qrcode-svg react-native-svg

export default function AgentProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const [showIdCard, setShowIdCard] = useState(false);
    const isCoordinator = user?.role === 'state_coordinator';

    const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || (isCoordinator ? t('Coordinator') : t('Agent'));

    const handleLogout = async () => {
        const ok = await confirm({
            title: t("Log Out"),
            message: t("Are you sure?"),
            confirmLabel: t("Log Out"),
            cancelLabel: t("Cancel"),
            destructive: true,
        });
        if (ok) {
            await logout(); // already navigates to /login itself
        }
    };

    const MenuItem = ({ icon, label, onPress }: {
        icon: keyof typeof MaterialIcons.glyphMap;
        label: string;
        onPress?: () => void;
    }) => (
        <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View style={styles.menuIcon}>
                <MaterialIcons name={icon} size={18} color={color.ink600} />
            </View>
            <Text style={styles.menuText}>{label}</Text>
            <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Suppresses expo-router's default native header (which was
                showing the raw route path, "agent/artisans/profile", above
                this screen's own custom header below) — every sibling
                screen under app/agent/ already does this. */}
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('My profile')}</Text>
                    <Pressable onPress={handleLogout} style={styles.logoutBtn} accessibilityRole="button" accessibilityLabel={t('Log Out')}>
                        <MaterialIcons name="logout" size={18} color={color.danger600} />
                    </Pressable>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Avatar name={displayName} uri={user?.profile_picture} gender={user?.gender} size={96} borderRadius={30} />
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.role}>{isCoordinator ? t('State Coordinator') : t('Verified Field Agent')}</Text>
                    <Text style={styles.location}>{user?.lga_details?.name}, {user?.state_details?.name}</Text>
                </View>

                {/* Digital ID Card Button */}
                <Pressable onPress={() => setShowIdCard(true)} accessibilityRole="button" style={styles.idCardButton}>
                    <LinearGradient
                        colors={[color.brand900, color.brand600]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.idCardGradient}
                    >
                        <View>
                            <Text style={styles.idCardTitle}>{isCoordinator ? t('Digital Coordinator ID') : t('Digital Agent ID')}</Text>
                            <Text style={styles.idCardSub}>{t('Tap to view')}</Text>
                        </View>
                        <MaterialIcons name="badge" size={30} color="#FFF" />
                    </LinearGradient>
                </Pressable>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>{t('Account settings')}</Text>
                <View style={styles.sectionCard}>
                    <MenuItem icon="person-outline" label={t('Personal Information')} onPress={() => showToast("Coming soon: edit profile", { type: 'info' })} />
                    <View style={styles.separator} />
                    <MenuItem icon="lock-outline" label={t('Security & Password')} onPress={() => showToast("Coming soon: change password", { type: 'info' })} />
                    <View style={styles.separator} />
                    <MenuItem icon="notifications-none" label={t('Notifications')} onPress={() => showToast("Coming soon: notifications", { type: 'info' })} />
                </View>

                <Text style={styles.sectionTitle}>{t('Support')}</Text>
                <View style={styles.sectionCard}>
                    <MenuItem icon="help-outline" label={t('Help Center')} onPress={() => router.push('/help-center')} />
                </View>

            </ScrollView>

            {/* Digital ID Modal */}
            <Modal visible={showIdCard} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.idCardContainer}>
                        <LinearGradient
                            colors={[color.brand900, '#123a70']}
                            style={styles.digitalId}
                        >
                            {/* ID Header */}
                            <View style={styles.idHeader}>
                                <View style={styles.logoCircle}><Text style={styles.logoText}>S</Text></View>
                                <Text style={styles.idCompany}>{isCoordinator ? 'S-MAHII COORDINATOR' : 'S-MAHII AGENT'}</Text>
                            </View>

                            {/* ID Photo & Details */}
                            <View style={styles.idBody}>
                                <View style={styles.idPhotoContainer}>
                                    {user?.profile_picture ? (
                                        <Image source={{ uri: user.profile_picture }} style={styles.idPhoto} />
                                    ) : (
                                        <View style={[styles.idPhoto, styles.idPhotoPlaceholder]} />
                                    )}
                                </View>
                                <View style={styles.idDetails}>
                                    <Text style={styles.idLabel}>{t('Name')}</Text>
                                    <Text style={styles.idValue}>{displayName}</Text>

                                    <Text style={styles.idLabel}>{isCoordinator ? t('Coordinator ID') : t('Agent ID')}</Text>
                                    <Text style={styles.idValue}>{user?.serial_number || 'N/A'}</Text>

                                    <Text style={styles.idLabel}>{t('Zone')}</Text>
                                    <Text style={styles.idValue}>{user?.lga_details?.name}</Text>
                                </View>
                            </View>

                            {/* QR Code Placeholder */}
                            <View style={styles.qrContainer}>
                                {/* <QRCode value={String(user?.serial_number || user?.id || 'N/A')} size={80} /> */}
                                <View style={styles.qrPlaceholder}>
                                    <MaterialIcons name="qr-code-2" size={40} color="rgba(255,255,255,0.3)" />
                                </View>
                            </View>

                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>{isCoordinator ? t('Official coordinator') : t('Official agent')}</Text>
                            </View>
                        </LinearGradient>

                        <Pressable onPress={() => setShowIdCard(false)} style={styles.closeIdButton} accessibilityRole="button" accessibilityLabel={t('Close')}>
                            <MaterialIcons name="close" size={22} color={color.ink900} />
                        </Pressable>
                    </View>
                </View>
            </Modal>

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
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: '#FDECEC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: { padding: space.xl, paddingBottom: 60 },

    profileHeader: { alignItems: 'center', marginBottom: space.xxl },
    name: { ...type.titleMd, marginTop: space.lg },
    role: { fontFamily: font.extrabold, fontSize: 13, color: color.accent600, marginTop: 4 },
    location: { fontFamily: font.bold, fontSize: 13, color: color.ink400, marginTop: 2 },

    idCardButton: { marginBottom: space.xxl },
    idCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: space.xl,
        borderRadius: radius.xl,
    },
    idCardTitle: { color: '#FFF', fontFamily: font.extrabold, fontSize: 16.5 },
    idCardSub: { color: 'rgba(255,255,255,0.72)', fontFamily: font.bold, fontSize: 12, marginTop: 2 },

    sectionTitle: {
        fontFamily: font.extrabold,
        fontSize: 11,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: color.ink400,
        marginBottom: space.sm,
        marginLeft: space.md,
    },
    sectionCard: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        overflow: 'hidden',
        marginBottom: space.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: space.lg,
        minHeight: 56,
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: radius.sm + 2,
        backgroundColor: color.surfaceChip,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: space.md,
    },
    menuText: { flex: 1, fontFamily: font.bold, fontSize: 14.5, color: color.ink900 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: color.border, marginLeft: 64 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    idCardContainer: { width: '85%', alignItems: 'center' },
    digitalId: {
        width: '100%',
        height: 450,
        borderRadius: radius.xl,
        padding: space.xxl,
        justifyContent: 'space-between',
    },
    idHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: space.lg,
    },
    logoCircle: {
        width: 30,
        height: 30,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: { color: color.brand900, fontFamily: font.extrabold },
    idCompany: { color: '#FFF', fontFamily: font.extrabold, fontSize: 15, letterSpacing: 2 },

    idBody: { flexDirection: 'row', gap: space.xl, marginTop: space.xl },
    idPhotoContainer: {
        width: 100,
        height: 120,
        borderRadius: radius.md,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    idPhoto: { width: '100%', height: '100%', backgroundColor: '#CCC' },
    idPhotoPlaceholder: { backgroundColor: color.brand100 },
    idDetails: { flex: 1, justifyContent: 'center' },
    idLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: font.extrabold,
        fontSize: 9.5,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: space.sm,
    },
    idValue: { color: '#FFF', fontFamily: font.extrabold, fontSize: 15.5 },

    qrContainer: { alignItems: 'center', marginTop: space.xl },
    qrPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },

    verifiedBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderWidth: 2,
        borderColor: color.accent600,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        transform: [{ rotate: '-10deg' }],
    },
    verifiedText: {
        color: color.accent600,
        fontFamily: font.extrabold,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    closeIdButton: {
        marginTop: space.xl,
        backgroundColor: '#FFF',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
