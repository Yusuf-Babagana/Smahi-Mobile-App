import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    ActivityIndicator, Alert, Linking, Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { artisanAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Badge } from '@/src/components/ui';

export default function ArtisanDetailScreen() {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [artisan, setArtisan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            // Fetch details using the ID from the URL
            const data = await artisanAPI.getArtisanById(Number(id));
            setArtisan(data);
        } catch (error) {
            Alert.alert("Error", "Could not load artisan details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (artisan?.phone_number) {
            Linking.openURL(`tel:${artisan.phone_number}`);
        }
    };

    const handleVerify = () => {
        Alert.alert(
            "Confirm Verification",
            "By clicking Confirm, you certify that you have physically inspected this artisan's business location and identity.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm & Verify",
                    onPress: processVerification
                }
            ]
        );
    };

    const processVerification = async () => {
        setVerifying(true);
        try {
            await artisanAPI.verifyArtisan(Number(id));
            Alert.alert("Success", "Artisan verified successfully!");
            fetchDetails(); // Reload data to show "Verified" status
        } catch (error) {
            Alert.alert("Error", "Verification failed. Please try again.");
        } finally {
            setVerifying(false);
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

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* 1. Header Image / Banner */}
            <View style={styles.imageContainer}>
                {artisan.profile_picture ? (
                    <Image source={{ uri: artisan.profile_picture }} style={styles.profileImage} />
                ) : (
                    <LinearGradient
                        colors={[color.brand900, color.brand600]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.placeholderImage}
                    >
                        <Text style={styles.placeholderText}>
                            {artisan.first_name?.[0]}{artisan.last_name?.[0]}
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
                    <Text style={styles.name}>{artisan.first_name} {artisan.last_name}</Text>
                    <Text style={styles.category}>
                        {i18n.language === 'ha' && artisan.category_name_ha
                            ? artisan.category_name_ha
                            : (artisan.service_category || t('General Services'))}
                    </Text>

                    <View style={styles.statusRow}>
                        <Badge
                            label={artisan.is_verified ? t('Verified') : t('Pending')}
                            status={artisan.is_verified ? 'verified' : 'pending'}
                            icon={artisan.is_verified ? 'verified' : 'schedule'}
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
                            <Text style={styles.contactValue}>{artisan.phone_number || 'N/A'}</Text>
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
                                {artisan.lga_details?.name || t('LGA')}, {artisan.state_details?.name || t('State')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 4. Action Button */}
                {!artisan.is_verified && (
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
