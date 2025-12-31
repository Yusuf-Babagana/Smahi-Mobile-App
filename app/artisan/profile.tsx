import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { artisanAPI, authAPI } from "@/src/api/client";
import { storage } from "@/src/utils/storage";
import { User, Artisan } from "@/src/types";

export default function ArtisanProfileScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [bio, setBio] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await storage.getCurrentUser();
            if (!currentUser) return router.replace('/login');
            setUser(currentUser);

            const profile = await artisanAPI.getArtisanByUserId(currentUser.id);
            setArtisan(profile);
            if (profile) {
                setBio(profile.bio || "I am a skilled artisan dedicated to quality work.");
                setHourlyRate(profile.hourlyRate?.toString() || "5000");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Here you would call the API to update the profile
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* 1. Navbar */}
                <Animated.View entering={FadeInUp.duration(600)} style={styles.navBar}>
                    <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: theme.colors.card }]}>
                        <IconSymbol name="arrow.left" size={20} color={theme.colors.text} />
                    </Pressable>
                    <Text style={[styles.navTitle, { color: theme.colors.text }]}>My Profile</Text>
                    <Pressable
                        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        style={[styles.editBtn, { backgroundColor: isEditing ? theme.colors.primary : theme.colors.card }]}
                    >
                        {isEditing ? (
                            <Text style={styles.saveText}>Save</Text>
                        ) : (
                            <IconSymbol name="pencil" size={20} color={theme.colors.text} />
                        )}
                    </Pressable>
                </Animated.View>

                {/* 2. Profile Header */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <View style={[styles.avatarContainer, { borderColor: theme.colors.card }]}>
                        {/* Placeholder Avatar */}
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarInitials}>{user?.name?.[0] || 'A'}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />
                        </View>
                    </View>

                    <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name}</Text>
                    <Text style={styles.profession}>{artisan?.category || "General Contractor"}</Text>

                    <View style={styles.locationRow}>
                        <IconSymbol name="location.fill" size={14} color="#999" />
                        <Text style={styles.location}>{user?.localGovernment}, {user?.state}</Text>
                    </View>
                </Animated.View>

                {/* 3. Stats Row */}
                <Animated.View entering={FadeInDown.delay(200)} style={[styles.statsRow, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{artisan?.rating.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{artisan?.reviewCount}</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>3+</Text>
                        <Text style={styles.statLabel}>Years Exp.</Text>
                    </View>
                </Animated.View>

                {/* 4. About Me Section */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About Me</Text>
                    {isEditing ? (
                        <TextInput
                            style={[styles.bioInput, { color: theme.colors.text, backgroundColor: theme.colors.card }]}
                            multiline
                            value={bio}
                            onChangeText={setBio}
                        />
                    ) : (
                        <Text style={[styles.bioText, { color: theme.dark ? '#CCC' : '#666' }]}>
                            {bio}
                        </Text>
                    )}
                </Animated.View>

                {/* 5. Portfolio Section (The "World Class" Touch) */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Portfolio</Text>
                        <Pressable>
                            <Text style={{ color: theme.colors.primary }}>+ Add Photo</Text>
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioScroll}>
                        {[1, 2, 3].map((item) => (
                            <View key={item} style={[styles.portfolioItem, { backgroundColor: theme.colors.card }]}>
                                <IconSymbol name="photo.fill" size={32} color={theme.colors.border} />
                            </View>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* 6. Settings / Logout */}
                <Animated.View entering={FadeInDown.delay(500)} style={styles.footer}>
                    <Pressable style={[styles.actionBtn, { borderColor: theme.colors.border }]}>
                        <IconSymbol name="gear" size={20} color={theme.colors.text} />
                        <Text style={[styles.actionText, { color: theme.colors.text }]}>Settings</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => { authAPI.logout(); router.replace('/login'); }}
                        style={[styles.actionBtn, { borderColor: '#FF3B30' }]}
                    >
                        <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
                        <Text style={[styles.actionText, { color: '#FF3B30' }]}>Log Out</Text>
                    </Pressable>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },

    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    editBtn: {
        paddingHorizontal: 16, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    saveText: { color: 'white', fontWeight: '700' },
    navTitle: { fontSize: 18, fontWeight: '700' },

    header: { alignItems: 'center', marginBottom: 24 },
    avatarContainer: { marginBottom: 16, position: 'relative' },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 4, borderColor: 'white',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    },
    avatarInitials: { fontSize: 40, color: 'white', fontWeight: '700' },
    verifiedBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: 'white', borderRadius: 12, padding: 2,
    },
    name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    profession: { fontSize: 16, color: '#007AFF', fontWeight: '600', marginBottom: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    location: { color: '#999', fontSize: 14 },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#999' },
    divider: { width: 1, height: 24 },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    bioText: { fontSize: 16, lineHeight: 24 },
    bioInput: {
        borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100, textAlignVertical: 'top',
    },

    portfolioScroll: { gap: 12 },
    portfolioItem: {
        width: 120, height: 120, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },

    footer: { gap: 12 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: 16, borderRadius: 16, borderWidth: 1,
    },
    actionText: { fontSize: 16, fontWeight: '600' },
});