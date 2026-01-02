import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, shadows } from '@/styles/commonStyles';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://smahi1.pythonanywhere.com/api';

export default function ArtisanProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [artisan, setArtisan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const response = await axios.get(`${BASE_URL}/users/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArtisan(response.data);
        } catch (error) {
            console.log("Fetch Error:", error);
            Alert.alert("Error", "Could not load profile.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (artisan?.phone_number) {
            Linking.openURL(`tel:${artisan.phone_number}`);
        } else {
            Alert.alert("No Phone", "This artisan has not provided a phone number.");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!artisan) return null;

    // --- DATA FORMATTING ---
    const displayName = artisan.first_name ? `${artisan.first_name} ${artisan.last_name}` : artisan.email.split('@')[0];
    const service = artisan.service_category || "Professional Artisan";

    // Extract Location Names Safely
    const countryName = artisan.country_details?.name || "Not Specified";
    const stateName = artisan.state_details?.name || "Not Specified";
    const lgaName = artisan.lga_details?.name || "Not Specified";

    // Header Location string (Short version)
    const headerLocation = artisan.state_details?.name ? `${lgaName}, ${stateName}` : "Location Unknown";
    const joinedDate = new Date(artisan.date_joined).toDateString();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="arrow.left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Artisan Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Card */}
                <View style={styles.card}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.role}>{service}</Text>

                    <View style={styles.locationTag}>
                        <IconSymbol name="mappin.and.ellipse" size={14} color="#555" />
                        <Text style={styles.locationText}>{headerLocation}</Text>
                    </View>
                </View>

                {/* Location Details Section (NEW) */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Location</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="globe" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>Country</Text>
                            <Text style={styles.value}>{countryName}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="map" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>State</Text>
                            <Text style={styles.value}>{stateName}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="building.2.fill" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>Local Govt (LGA)</Text>
                            <Text style={styles.value}>{lgaName}</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Contact Information</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="envelope.fill" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>Email Address</Text>
                            <Text style={styles.value}>{artisan.email}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="phone.fill" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>Phone Number</Text>
                            <Text style={styles.value}>{artisan.phone_number || "Not provided"}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><IconSymbol name="calendar" size={20} color={colors.primary} /></View>
                        <View>
                            <Text style={styles.label}>Member Since</Text>
                            <Text style={styles.value}>{joinedDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.bookBtn} onPress={handleCall} activeOpacity={0.8}>
                    <IconSymbol name="phone" size={20} color="white" style={{ marginRight: 10 }} />
                    <Text style={styles.bookText}>Call Artisan</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, ...shadows.small },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, ...shadows.medium },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 4, borderColor: '#F0F9FF' },
    avatarText: { fontSize: 30, fontWeight: '800', color: '#FFF' },
    name: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 4 },
    role: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: 12, backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    locationTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { color: '#666', fontSize: 14, textAlign: 'center' },

    section: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, ...shadows.small },
    sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#333' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    label: { fontSize: 12, color: '#888', marginBottom: 2 },
    value: { fontSize: 15, fontWeight: '600', color: '#111' },

    bookBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
    bookText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});