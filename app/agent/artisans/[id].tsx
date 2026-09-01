import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    ActivityIndicator, Linking, Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { artisanAPI, coordinatorAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Badge, useToast, useConfirm } from '@/src/components/ui';

export default function ArtisanDetailScreen() {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const [artisan, setArtisan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [deactivating, setDeactivating] = useState(false);
    // Whether the logged-in coordinator personally registered this artisan
    // — derived from a real 200/404 against CoordinatorRegisteredUserDetailView
    // rather than re-deriving it client-side, since the public artisan
    // endpoint below (artisanAPI.getArtisanById) deliberately never exposes
    // registered_by (see core.serializers RBAC hardening).
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            // Fetch details using the ID from the URL
            const data = await artisanAPI.getArtisanById(Number(id));
            setArtisan(data);

            if (user?.role === 'state_coordinator' && data?.user) {
                try {
                    await coordinatorAPI.getRegisteredUser(Number(data.user));
                    setCanManage(true);
                } catch {
                    setCanManage(false);
                }
            }
        } catch (error) {
            showToast("Could not load artisan details", { type: 'error' });
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phone = artisan?.user_details?.phone_number;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const handleVerify = async () => {
        const ok = await confirm({
            title: "Confirm Verification",
            message: "By clicking Confirm, you certify that you have physically inspected this artisan's business location and identity.",
            confirmLabel: "Confirm & Verify",
        });
        if (ok) {
            processVerification();
        }
    };

    const processVerification = async () => {
        setVerifying(true);
        try {
            // verify-artisan takes the artisan's USER id, not this screen's
            // route param (which is the ArtisanProfile id).
            await artisanAPI.verifyArtisan(Number(artisan.user));
            showToast("Artisan verified successfully!", { type: 'success' });
            fetchDetails(); // Reload data to show "Verified" status
        } catch (error) {
            showToast("Verification failed. Please try again.", { type: 'error' });
        } finally {
            setVerifying(false);
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
            await coordinatorAPI.deactivateRegisteredUser(Number(artisan.user));
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
                <ActivityIndicator size="large" color={color.brand600} />
            </View>
        );
    }

    if (!artisan) return null;

    // ArtisanProfileSerializer nests all account fields under user_details —
    // it never exposes them flat on the artisan object itself.
    const person = artisan.user_details || {};

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* 1. Header Image / Banner */}
            <View style={styles.imageContainer}>
                {person.profile_picture ? (
                    <Image source={{ uri: person.profile_picture }} style={styles.profileImage} />
                ) : (
                    <LinearGradient
                        colors={[color.brand900, color.brand600]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.placeholderImage}
                    >
                        <Text style={styles.placeholderText}>
                            {person.first_name?.[0]}{person.last_name?.[0]}
                        </Text>
                    </LinearGradient>
                )}

                <SafeAreaView edges={['top']} style={styles.navSafe}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={22} color="#FFF" />
                    </Pressable>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. Basic Info */}
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{person.first_name} {person.last_name}</Text>
                    <Text style={styles.category}>
                        {i18n.language === 'ha' && artisan.category_name_ha
                            ? artisan.category_name_ha
                            : (artisan.profession_name || artisan.category_name || t('General Services'))}
                    </Text>

                    <View style={styles.statusRow}>
                        <Badge
                            label={person.is_verified ? t('Verified') : t('Pending')}
                            status={person.is_verified ? 'verified' : 'pending'}
                            icon={person.is_verified ? 'verified' : 'schedule'}
                        />
                        <Badge label={`ID: ${id}`} bg={color.surfaceChip} fg={color.ink600} />
                    </View>
                </View>

                {/* 3. Contact & Location */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('Contact info')}</Text>

                    <Pressable style={styles.contactRow} onPress={handleCall} accessibilityRole="button" accessibilityLabel={t('Call')}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="call" size={20} color={color.brand600} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactLabel}>{t('Phone number')}</Text>
                            <Text style={styles.contactValue}>{person.phone_number || 'N/A'}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
                    </Pressable>

                    <View style={[styles.contactRow, styles.contactRowLast]}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="place" size={20} color={color.brand600} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactLabel}>{t('Location')}</Text>
                            <Text style={styles.contactValue}>
                                {person.lga_details?.name || t('LGA')}, {person.state_details?.name || t('State')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Coordinator CRUD — only for an artisan this coordinator personally registered. */}
                {canManage && (
                    <View style={styles.manageRow}>
                        <Pressable
                            style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.85 }]}
                            onPress={() => router.push({
                                pathname: '/agent/edit-registered-user',
                                params: { userId: String(artisan.user), role: 'artisan' },
                            })}
                            accessibilityRole="button"
                            accessibilityLabel={t('Edit')}
                        >
                            <MaterialIcons name="edit" size={18} color={color.brand600} />
                            <Text style={styles.editText}>{t('Edit')}</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.deactivateButton, pressed && { opacity: 0.85 }]}
                            onPress={handleDeactivate}
                            disabled={deactivating}
                            accessibilityRole="button"
                            accessibilityLabel={t('Deactivate account')}
                        >
                            {deactivating ? (
                                <ActivityIndicator size="small" color="#B91C1C" />
                            ) : (
                                <>
                                    <MaterialIcons name="block" size={18} color="#B91C1C" />
                                    <Text style={styles.deactivateText}>{t('Deactivate')}</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* 4. Action Button */}
                {!person.is_verified && (
                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [styles.verifyButton, pressed && { opacity: 0.9 }]}
                            onPress={handleVerify}
                            disabled={verifying}
                            accessibilityRole="button"
                            accessibilityLabel={t('Verify artisan')}
                        >
                            {verifying ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <MaterialIcons name="verified-user" size={22} color="#FFF" />
                                    <Text style={styles.verifyText}>{t('Verify artisan')}</Text>
                                </>
                            )}
                        </Pressable>
                        <Text style={styles.disclaimer}>
                            {t('Only verify artisans you have physically met.')}
                        </Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },

    // Image Header
    imageContainer: { height: 240, width: '100%', position: 'relative' },
    profileImage: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontFamily: font.extrabold, fontSize: 72, color: 'rgba(255,255,255,0.3)' },
    navSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
    backButton: {
        marginTop: space.md,
        marginLeft: space.xl,
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: { padding: space.xl, paddingBottom: 50 },

    // Header Info
    headerInfo: { alignItems: 'center', marginBottom: space.xl },
    name: { ...type.titleLg, textAlign: 'center' },
    category: { fontFamily: font.bold, fontSize: 14, color: color.ink400, marginTop: 4 },
    statusRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },

    // Contact card
    card: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        padding: space.lg,
        marginBottom: space.xl,
    },
    sectionTitle: { ...type.heading, marginBottom: space.sm },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    contactRowLast: { borderBottomWidth: 0 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: color.brand100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: space.md,
    },
    contactLabel: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400 },
    contactValue: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900, marginTop: 1 },

    // Coordinator CRUD row
    manageRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.xl },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: space.md,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: color.brand600,
        backgroundColor: color.brand100,
    },
    editText: { fontFamily: font.extrabold, fontSize: 13.5, color: color.brand600 },
    deactivateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: space.md,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    deactivateText: { fontFamily: font.extrabold, fontSize: 13.5, color: '#B91C1C' },

    // Footer / Action
    footer: { marginTop: space.sm },
    verifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: color.accent600,
        height: 54,
        borderRadius: radius.lg,
        ...shadow.e2,
    },
    verifyText: { color: '#FFF', fontFamily: font.extrabold, fontSize: 15.5 },
    disclaimer: {
        fontFamily: font.bold,
        textAlign: 'center',
        color: color.ink300,
        fontSize: 12,
        marginTop: space.md,
    },
});
