import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { artisanAPI, authAPI } from "@/src/api/client";
import { storage } from "@/src/utils/storage";
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

import { API_URL as BASE_URL, CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';

export default function ArtisanProfileScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [artisan, setArtisan] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [portfolioImages, setPortfolioImages] = useState<any[]>([]);

    const [bio, setBio] = useState("");

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

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const pickProfileImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            Alert.alert("Permission", "Allow access to photos to change profile picture.");
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
            const token = await SecureStore.getItemAsync('accessToken');
            const formData = new FormData();

            // @ts-ignore
            formData.append('profile_picture', {
                uri: asset.uri,
                name: asset.uri.split('/').pop(),
                type: 'image/jpeg',
            });

            const response = await axios.post(`${BASE_URL}/auth/profile/picture/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            Alert.alert("Success", "Profile picture updated!");
            setUser((prev: any) => ({ ...prev, profile_picture: response.data.profile_picture }));

        } catch (error) {
            Alert.alert("Error", "Failed to update profile picture.");
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleSave = async () => {
        try {
            await authAPI.updateProfile({ bio });
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
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
                        <Text style={styles.statValue}>{artisan?.rating ? artisan.rating.toFixed(1) : "5.0"}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>1+</Text>
                        <Text style={styles.statLabel}>Years Exp.</Text>
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

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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

    portfolioScroll: { gap: space.md },
    portfolioItem: { width: 120, height: 120, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surfaceChip, ...shadow.e1 },
    portfolioImage: { width: '100%', height: '100%' },
});
