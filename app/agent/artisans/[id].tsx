import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, Alert, Linking, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { artisanAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function ArtisanDetailScreen() {
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
                <ActivityIndicator size="large" color={colors.primary} />
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
                    <LinearGradient colors={['#4F46E5', '#818CF8']} style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>
                            {artisan.first_name?.[0]}{artisan.last_name?.[0]}
                        </Text>
                    </LinearGradient>
                )}

                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. Basic Info */}
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{artisan.first_name} {artisan.last_name}</Text>
                    <Text style={styles.category}>{artisan.service_category || 'General Services'}</Text>

                    <View style={styles.statusRow}>
                        {artisan.is_verified ? (
                            <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={[styles.badgeText, { color: '#065F46' }]}>VERIFIED</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="time" size={16} color="#D97706" />
                                <Text style={[styles.badgeText, { color: '#92400E' }]}>PENDING</Text>
                            </View>
                        )}
                        <View style={[styles.badge, { backgroundColor: '#F3F4F6' }]}>
                            <Text style={[styles.badgeText, { color: '#374151' }]}>ID: {id}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 3. Contact & Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Info</Text>

                    <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactLabel}>Phone Number</Text>
                            <Text style={styles.contactValue}>{artisan.phone_number || 'N/A'}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    <View style={styles.contactRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.contactLabel}>Location</Text>
                            <Text style={styles.contactValue}>
                                {artisan.lga_details?.name || 'LGA'}, {artisan.state_details?.name || 'State'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 4. Action Button */}
                {!artisan.is_verified && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={handleVerify}
                            disabled={verifying}
                        >
                            {verifying ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="shield-checkmark" size={24} color="#FFF" />
                                    <Text style={styles.verifyText}>VERIFY ARTISAN</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.disclaimer}>
                            Only verify artisans you have physically met.
                        </Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Image Header
    imageContainer: { height: 250, width: '100%', position: 'relative' },
    profileImage: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 80, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' },
    backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },

    content: { padding: 24, paddingBottom: 50 },

    // Header Info
    headerInfo: { alignItems: 'center', marginBottom: 20 },
    name: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
    category: { fontSize: 16, color: '#6B7280', marginTop: 4 },
    statusRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    badgeText: { fontSize: 12, fontWeight: '700' },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },

    // Sections
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    contactLabel: { fontSize: 12, color: '#6B7280' },
    contactValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },

    // Footer / Action
    footer: { marginTop: 20 },
    verifyButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16,
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
    },
    verifyText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    disclaimer: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 12 }
});