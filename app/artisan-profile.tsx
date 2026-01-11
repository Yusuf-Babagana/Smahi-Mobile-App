import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { artisanAPI } from '@/src/api/client';
import { colors, shadows } from '@/styles/commonStyles'; // Adjusted to match standard path

const CLOUD_NAME = 'dvj6cw5dq';

export default function PublicArtisanProfile() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [artisan, setArtisan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            const data = await artisanAPI.getArtisanByUserId(Number(id));
            setArtisan(data);
        } catch (error) {
            console.log("Error loading artisan", error);
            Alert.alert("Error", "Could not load artisan details.");
        } finally {
            setLoading(false);
        }
    };

    // --- HELPER: Fix Image URL ---
    const getImageUrl = (url: string | any) => {
        if (!url) return null;
        let finalUrl = typeof url === 'string' ? url : url.url;
        if (!finalUrl) return null;

        if (!finalUrl.startsWith('http') && finalUrl.includes('image/upload')) {
            return `https://res.cloudinary.com/${CLOUD_NAME}/${finalUrl}`;
        }
        if (finalUrl.startsWith('http:')) {
            return finalUrl.replace('http:', 'https:');
        }
        return finalUrl;
    };

    // --- ACTION: Start Chat ---
    const handleMessage = () => {
        if (!artisan) return;

        // Navigate to Chat Room
        router.push({
            pathname: '/chat/new', // This maps to app/chat/[id].tsx
            params: {
                recipientId: artisan.id,
                name: `${artisan.first_name} ${artisan.last_name}`
            }
        });
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    if (!artisan) return (
        <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
            <Text style={{ color: '#666', marginTop: 10 }}>Artisan not found</Text>
            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const profilePic = getImageUrl(artisan.profile_picture);
    const portfolio = artisan.portfolio_images || [];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Header Image / Pattern */}
                <View style={styles.headerPattern}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {profilePic ? (
                            <Image source={{ uri: profilePic }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholder]}>
                                <Text style={styles.initial}>{artisan.first_name?.[0] || 'A'}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{artisan.first_name} {artisan.last_name}</Text>
                    <Text style={styles.category}>{artisan.service_category || 'Service Provider'}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={16} color="#EAB308" />
                            <Text style={styles.metaText}>{artisan.rating || '5.0'} (12)</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="location" size={16} color="#666" />
                            <Text style={styles.metaText}>{artisan.lga}, {artisan.state}</Text>
                        </View>
                    </View>
                </View>

                {/* Portfolio Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Portfolio Work</Text>
                    {portfolio.length === 0 ? (
                        <Text style={styles.emptyText}>No portfolio images uploaded yet.</Text>
                    ) : (
                        <View style={styles.grid}>
                            {portfolio.map((img: any, i: number) => (
                                <Image
                                    key={i}
                                    source={{ uri: getImageUrl(img.image) }}
                                    style={styles.portfolioImg}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Bio Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>
                        {artisan.bio || `I am a professional ${artisan.service_category} with years of experience. I guarantee quality service.`}
                    </Text>
                </View>

            </ScrollView>

            {/* Footer Actions (Message & Book) */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <View style={styles.footerRow}>
                    {/* Message Button */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.messageBtn]}
                        onPress={handleMessage}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                        <Text style={styles.messageText}>Message</Text>
                    </TouchableOpacity>

                    {/* Book Button */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.bookBtn]}
                        onPress={() => Alert.alert("Booking", "Booking flow starts here!")}
                    >
                        <Text style={styles.bookText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingBottom: 100 },

    headerPattern: { height: 120, backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },

    profileHeader: { alignItems: 'center', marginTop: -50 },
    avatarContainer: { padding: 4, backgroundColor: '#FFF', borderRadius: 60 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE' },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary },
    initial: { fontSize: 40, fontWeight: '700', color: '#FFF' },

    name: { fontSize: 24, fontWeight: '800', color: '#333', marginTop: 10 },
    category: { fontSize: 16, color: colors.primary, fontWeight: '600', marginTop: 2 },

    metaRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: '#666', fontWeight: '500' },

    section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
    emptyText: { color: '#999', fontStyle: 'italic' },
    bioText: { lineHeight: 24, color: '#444' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    portfolioImg: { width: '31%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#EEE' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FFF' },
    footerRow: { flexDirection: 'row', gap: 12 },

    actionBtn: {
        borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8
    },

    messageBtn: {
        flex: 1, backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD'
    },
    messageText: { color: colors.primary, fontSize: 16, fontWeight: '700' },

    bookBtn: {
        flex: 2, backgroundColor: colors.primary
    },
    bookText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});