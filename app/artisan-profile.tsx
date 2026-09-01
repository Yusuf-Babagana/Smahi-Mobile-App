import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { artisanAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/src/components/ui';

import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';

export default function PublicArtisanProfile() {
    const { i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { show: showToast } = useToast();

    const [artisan, setArtisan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            // The only caller of this screen (app/chat/[id].tsx's
            // handleProfileClick) passes the OTHER PARTICIPANT's USER id
            // (Message.sender), not an ArtisanProfile id — getArtisanById
            // looks up by ArtisanProfile pk, a different id sequence that
            // only coincidentally matched sometimes, 404ing the rest of the
            // time ("Artisan not found" for a real, existing chat partner).
            // getArtisanByUserId resolves the right profile via the
            // ArtisanViewSet's own ?user= filter instead — already used the
            // same way by the artisan's own dashboard/profile screens.
            const data = await artisanAPI.getArtisanByUserId(Number(id));
            setArtisan(data);
        } catch (error) {
            console.log("Error loading artisan", error);
            showToast("Could not load artisan details.", { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

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

    const handleMessage = () => {
        if (!artisan) return;

        const fName = artisan.user_details?.first_name || artisan.user?.first_name || artisan.first_name || "Unknown";
        const lName = artisan.user_details?.last_name || artisan.user?.last_name || artisan.last_name || "";

        router.push({
            pathname: '/chat/[id]',
            params: {
                id: 'new',
                recipientId: artisan.user || artisan.id,
                name: `${fName} ${lName}`
            }
        });
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={color.brand600} />
        </View>
    );

    if (!artisan) return (
        <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color={color.ink300} />
            <Text style={styles.notFoundText}>Artisan not found</Text>
            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: space.lg }}>
                <Text style={styles.backLink}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const profilePic = getImageUrl(artisan.profile_picture);
    const portfolio = artisan.portfolio_images || [];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.headerPattern}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>

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
                    <Text style={styles.name}>
                        {artisan.user_details?.first_name || artisan.user?.first_name || artisan.first_name || "Unknown"} {artisan.user_details?.last_name || artisan.user?.last_name || artisan.last_name || ""}
                    </Text>
                    <Text style={styles.category}>
                      {i18n.language === 'ha' && artisan.category_name_ha
                        ? artisan.category_name_ha
                        : (artisan.category_name || artisan.service_category || 'Service Provider')}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={16} color={color.star} />
                            <Text style={styles.metaText}>{artisan.rating || '5.0'} (12)</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="call" size={16} color={color.ink400} />
                            <Text style={styles.metaText}>{artisan?.user_details?.phone_number || artisan?.user?.phone_number || "No phone number"}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="location" size={16} color={color.ink400} />
                            <Text style={styles.metaText}>{artisan?.user_details?.state_details?.name || artisan.state || "Unknown"}</Text>
                        </View>
                    </View>
                </View>

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>
                        {artisan.bio || `I am a professional ${artisan.service_category} with years of experience. I guarantee quality service.`}
                    </Text>
                </View>

            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={handleMessage}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={color.brand600} />
                    <Text style={styles.messageText}>Start Conversation</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingBottom: 100 },

    headerPattern: { height: 120, backgroundColor: color.brand600, justifyContent: 'center', paddingHorizontal: space.xl },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },

    profileHeader: { alignItems: 'center', marginTop: -50 },
    avatarContainer: { padding: 4, backgroundColor: color.surface, borderRadius: 60 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: color.surfaceChip },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: color.brand600 },
    initial: { fontFamily: font.extrabold, fontSize: 40, color: '#FFF' },

    name: { fontFamily: font.extrabold, fontSize: 26, color: color.ink900, marginTop: space.sm },
    category: { fontFamily: font.semibold, fontSize: 15, color: '#0F766E', marginTop: 4, backgroundColor: color.accent100, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },

    metaRow: { flexDirection: 'row', gap: space.xl, marginTop: space.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: color.ink600, fontFamily: font.medium, fontSize: 13 },

    section: { padding: space.xl, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    sectionTitle: { fontFamily: font.extrabold, fontSize: 18, marginBottom: space.md, color: color.ink900 },
    emptyText: { color: color.ink300, fontFamily: font.medium, fontStyle: 'italic' },
    bioText: { fontFamily: font.medium, fontSize: 14, lineHeight: 22, color: color.ink600 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    portfolioImg: { width: '31%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: color.surfaceChip },

    notFoundText: { fontFamily: font.bold, fontSize: 15, color: color.ink400, marginTop: space.sm },
    backLink: { fontFamily: font.extrabold, color: color.brand600 },

    footer: { padding: space.xl, borderTopWidth: 1, borderTopColor: color.border, backgroundColor: color.surface },

    messageBtn: {
        flex: 1, backgroundColor: color.brand100, borderWidth: 1, borderColor: color.brand100,
        borderRadius: radius.lg, paddingVertical: space.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8
    },
    messageText: { color: color.brand600, fontFamily: font.extrabold, fontSize: 16 },
});
