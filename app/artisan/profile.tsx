import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { artisanAPI, authAPI } from "@/src/api/client";
import { storage } from "@/src/utils/storage";
import { useAuth } from "@/src/contexts/AuthContext";
import ContactList from "@/src/components/ContactList";
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useToast, useConfirm, LanguagePickerField } from '@/src/components/ui';

import { API_URL as BASE_URL, CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';

export default function ArtisanProfileScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const [loading, setLoading] = useState(true);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [artisan, setArtisan] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [portfolioImages, setPortfolioImages] = useState<any[]>([]);

    const [bio, setBio] = useState("");
    // Default language incoming/outgoing chat messages are automatically
    // translated into (backend: User.preferred_language). Separate from
    // the app's own UI language.
    const [preferredLanguage, setPreferredLanguage] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await storage.getCurrentUser();
            if (!currentUser) return router.replace('/login');
            setUser(currentUser);

            try {
                const profile = await artisanAPI.getArtisanByUserId(currentUser.id);
                setArtisan(profile);
                if (profile) setBio(profile.bio || "I am a skilled artisan dedicated to quality work.");
            } catch (e) {
                console.log("Artisan profile pending");
            }

            const token = await SecureStore.getItemAsync('accessToken');
            const response = await axios.get(`${BASE_URL}/auth/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            setPortfolioImages(response.data.portfolio_images || []);
            setPreferredLanguage(response.data.preferred_language || "");

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const pickProfileImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            showToast("Allow access to photos to change profile picture.", { type: 'warn' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadProfileImage(result.assets[0]);
        }
    };

    const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploadingProfile(true);
        try {
            // profile_picture lives on the same auth/profile/ PATCH endpoint
            // every other account field does — there's no separate upload
            // route (the previous /auth/profile/picture/ URL here 404'd).
            const updated = await authAPI.uploadProfilePicture({
                uri: asset.uri,
                name: asset.uri.split('/').pop(),
                type: 'image/jpeg',
            });

            showToast("Profile picture updated!", { type: 'success' });
            setUser((prev: any) => ({ ...prev, profile_picture: updated.profile_picture }));
            await storage.updateCurrentUser({ profile_picture: updated.profile_picture });

        } catch (error) {
            showToast("Failed to update profile picture.", { type: 'error' });
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleLogout = async () => {
        const ok = await confirm({
            title: t('Logout'),
            message: t('Are you sure?'),
            confirmLabel: t('Logout'),
            destructive: true,
        });
        if (ok) {
            await logout();
        }
    };

    const handleSave = async () => {
        try {
            // bio lives on the artisan profile, not the user account
            const updated = await artisanAPI.updateMyProfile({ bio });
            setArtisan((prev: any) => ({ ...prev, ...updated }));
            setIsEditing(false);
            showToast(t('Profile updated successfully!'), { type: 'success' });
        } catch (error) {
            showToast(t('Failed to update profile.'), { type: 'error' });
        }
    };

    const handleLanguageChange = async (code: string) => {
        const previous = preferredLanguage;
        setPreferredLanguage(code); // optimistic — picker already closed itself
        try {
            await authAPI.updateProfile({ preferred_language: code });
            await storage.updateCurrentUser({ preferred_language: code });
            setUser((prev: any) => ({ ...prev, preferred_language: code }));
            showToast(t('Message language updated.'), { type: 'success' });
        } catch (error) {
            setPreferredLanguage(previous);
            showToast(t('Failed to update message language. Please try again.'), { type: 'error' });
        }
    };

    const getDisplayName = () => {
        if (!user) return 'Artisan';
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
        if (user.first_name) return user.first_name;
        return 'Artisan';
    };

    const getImageUrl = (imgData: any) => {
        if (!imgData) return null;
        let url = typeof imgData === 'string' ? imgData : imgData.url;
        if (!url) return null;

        if (!url.startsWith('http') && url.includes('image/upload')) {
            return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
        }
        if (url.startsWith('http:')) {
            return url.replace('http:', 'https:');
        }
        return url;
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={color.brand600} />
        </View>
    );

    const displayName = getDisplayName();
    const profilePicUrl = getImageUrl(user?.profile_picture);
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Navbar */}
                <Animated.View entering={FadeInUp.duration(600)} style={styles.navBar}>
                    <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={22} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.navTitle}>My Profile</Text>
                    <Pressable
                        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        style={[styles.editBtn, { backgroundColor: isEditing ? color.brand600 : color.surface }]}
                    >
                        {isEditing ? <Text style={styles.saveText}>Save</Text> : <Ionicons name="pencil" size={18} color={color.ink900} />}
                    </Pressable>
                </Animated.View>

                {/* Profile Header */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <Pressable onPress={pickProfileImage} disabled={uploadingProfile} style={styles.avatarContainer}>
                        {uploadingProfile ? (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: color.surfaceChip }]}>
                                <ActivityIndicator color={color.brand600} />
                            </View>
                        ) : profilePicUrl ? (
                            <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}

                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </Pressable>

                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.profession}>{i18n.language === 'ha' && artisan?.category_name_ha ? artisan.category_name_ha : (artisan?.service_category || "Service Provider")}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color={color.ink300} />
                        <Text style={styles.location}>{user?.lga || "LGA"}, {user?.state || "State"}</Text>
                    </View>
                </Animated.View>

                {/* Stats Row */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.statsRow}>
                    <View style={styles.statItem}>
                        {/* rating can arrive as a string (Django DecimalField) — coerce before toFixed */}
                        <Text style={styles.statValue}>
                            {!isNaN(Number(artisan?.rating)) && artisan?.rating != null
                                ? Number(artisan.rating).toFixed(1)
                                : "5.0"}
                        </Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{artisan?.total_reviews ?? 0}</Text>
                        <Text style={styles.statLabel}>{t('Reviews')}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{artisan?.experience_years ? `${artisan.experience_years}+` : '1+'}</Text>
                        <Text style={styles.statLabel}>{t('Years Exp.')}</Text>
                    </View>
                </Animated.View>

                {/* About Me */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    {isEditing ? (
                        <TextInput style={styles.bioInput} multiline value={bio} onChangeText={setBio} />
                    ) : (
                        <Text style={styles.bioText}>{bio}</Text>
                    )}
                </Animated.View>

                {/* Message language */}
                <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
                    <LanguagePickerField value={preferredLanguage} onChange={handleLanguageChange} />
                </Animated.View>

                {/* Portfolio */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Portfolio</Text>
                        <Pressable onPress={() => router.push('/artisan/portfolio')}>
                            <Text style={styles.manageLink}>Manage Photos</Text>
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioScroll}>
                        {portfolioImages.length === 0 ? (
                            <Text style={styles.emptyText}>No photos added yet.</Text>
                        ) : (
                            portfolioImages.map((item, index) => {
                                const url = getImageUrl(item);
                                if (!url) return null;
                                return (
                                    <View key={index} style={styles.portfolioItem}>
                                        <Image source={{ uri: url }} style={styles.portfolioImage} resizeMode="cover" />
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </Animated.View>

                {/* Contact S-MAHII */}
                <Animated.View entering={FadeInDown.delay(450)} style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('Contact Us')}</Text>
                    <View style={styles.contactCard}>
                        <ContactList />
                    </View>
                </Animated.View>

                {/* Logout */}
                <Animated.View entering={FadeInDown.delay(500)}>
                    <Pressable
                        onPress={handleLogout}
                        style={styles.logoutBtn}
                        accessibilityRole="button"
                    >
                        <Ionicons name="log-out-outline" size={19} color={color.danger600} />
                        <Text style={styles.logoutText}>{t('Logout')}</Text>
                    </Pressable>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: '#F3D1D1',
        backgroundColor: '#FFF7F7',
        marginTop: space.md,
    },
    logoutText: { fontFamily: font.extrabold, fontSize: 14, color: color.danger600 },
    content: { padding: space.xl },

    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xxl },
    iconBtn: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: color.surface, justifyContent: 'center', alignItems: 'center', ...shadow.e1 },
    editBtn: { paddingHorizontal: 16, height: 40, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadow.e1 },
    saveText: { color: '#FFF', fontFamily: font.extrabold, fontSize: 13 },
    navTitle: { fontFamily: font.extrabold, fontSize: 18, color: color.ink900 },

    header: { alignItems: 'center', marginBottom: space.xxl },
    avatarContainer: { marginBottom: space.lg, position: 'relative' },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: color.brand600, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: color.surface, ...shadow.e2 },
    avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: color.surface },
    avatarInitials: { fontSize: 40, color: '#FFF', fontFamily: font.extrabold },

    cameraBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: color.ink900, borderRadius: 15, width: 30, height: 30,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: color.surface
    },

    name: { fontFamily: font.extrabold, fontSize: 24, marginBottom: 4, color: color.ink900 },
    profession: { fontFamily: font.semibold, fontSize: 16, color: color.brand600, marginBottom: space.sm },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    location: { color: color.ink400, fontFamily: font.medium, fontSize: 14 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: space.xl, borderRadius: radius.xxl, marginBottom: space.xxl, backgroundColor: color.surface, ...shadow.e1 },
    statItem: { alignItems: 'center' },
    statValue: { fontFamily: font.extrabold, fontSize: 20, marginBottom: 4, color: color.ink900 },
    statLabel: { fontFamily: font.bold, fontSize: 12, color: color.ink400 },
    divider: { width: 1, height: 24, backgroundColor: color.surfaceChip },

    section: { marginBottom: space.xxl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md },
    sectionTitle: { fontFamily: font.extrabold, fontSize: 18, marginBottom: space.sm, color: color.ink900 },
    bioText: { fontFamily: font.medium, fontSize: 15, lineHeight: 23, color: color.ink600 },
    bioInput: { borderRadius: radius.lg, padding: space.lg, fontFamily: font.semibold, fontSize: 15, minHeight: 100, textAlignVertical: 'top', backgroundColor: color.surface, color: color.ink900, borderWidth: 1.5, borderColor: color.border },
    manageLink: { fontFamily: font.semibold, fontSize: 13.5, color: color.brand600 },
    emptyText: { color: color.ink300, fontFamily: font.medium, fontSize: 14, fontStyle: 'italic' },

    contactCard: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        overflow: 'hidden',
    },

    portfolioScroll: { gap: space.md },
    portfolioItem: { width: 120, height: 120, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surfaceChip, ...shadow.e1 },
    portfolioImage: { width: '100%', height: '100%' },
});
