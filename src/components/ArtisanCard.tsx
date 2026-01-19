import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@/styles/commonStyles';

// --- Types ---
interface ArtisanCardProps {
    artisan: any;
    onPress: () => void;
    formattedLocation?: string;
    formattedPhone?: string;
}

// --- Helper: Image URL Optimizer ---
const getOptimizedUrl = (url: string | null | undefined) => {
    if (!url) return null;
    let finalUrl = url;
    if (finalUrl.startsWith('/')) finalUrl = `https://smahi1.pythonanywhere.com${finalUrl}`;
    if (finalUrl.includes('res.cloudinary.com')) {
        if (finalUrl.startsWith('http:')) finalUrl = finalUrl.replace('http:', 'https:');
        if (finalUrl.includes('upload/') && !finalUrl.includes('w_')) {
            finalUrl = finalUrl.replace('upload/', 'upload/w_250,h_250,c_fill,q_auto,f_auto/');
        }
    }
    return finalUrl;
};

export const ArtisanCard = ({ artisan, onPress, formattedLocation, formattedPhone }: ArtisanCardProps) => {
    const [imageError, setImageError] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    if (!artisan) return null;

    // --- Data Extraction ---
    const data = artisan.user || artisan;
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const email = data.email || 'Unknown';

    const displayName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : email.split('@')[0];

    const initials = (displayName[0] || '?').toUpperCase();
    const service = data.service_category || "Professional Artisan";
    const phone = formattedPhone || data.phone || data.phone_number || "No Phone";
    const profilePic = getOptimizedUrl(data.profile_picture);
    const rating = data.rating || 4.8; // Fallback or mock
    const reviewCount = data.review_count || 24; // Fallback or mock
    const isVerified = data.is_verified || false;

    // --- Location Logic ---
    let location = formattedLocation;
    if (!location) {
        const stateName = data.state_details?.name || data.state;
        const lgaName = data.lga_details?.name || data.lga;
        const isStateId = typeof stateName === 'number';
        const isLgaId = typeof lgaName === 'number';

        if (stateName && !isStateId) {
            location = `${lgaName && !isLgaId ? lgaName + ', ' : ''}${stateName}`;
        } else {
            location = "Location Hidden";
        }
    }

    // --- Handlers ---
    const handleCall = () => {
        if (phone && phone !== "No Phone") {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert("No Contact", "Phone number not available.");
        }
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.container}
            >
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {profilePic && !imageError ? (
                            <Image
                                source={{ uri: profilePic }}
                                style={styles.avatar}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        )}
                        <View style={styles.onlineStatus} />
                    </View>

                    <View style={styles.infoColumn}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            {isVerified && (
                                <Ionicons name="checkmark-circle" size={16} color={colors.success || '#10B981'} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{service}</Text>
                        </View>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.ratingVaule}>{rating}</Text>
                            <Text style={styles.reviewCount}>({reviewCount})</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* --- DETAILS --- */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location-sharp" size={14} color={colors.error || '#DC3545'} />
                        </View>
                        <Text style={styles.detailText} numberOfLines={1}>{location}</Text>
                    </View>

                    {phone !== "No Phone" && (
                        <TouchableOpacity onPress={handleCall} style={styles.detailItem}>
                            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="call" size={14} color={colors.primary} />
                            </View>
                            <Text style={[styles.detailText, { color: colors.primary, fontWeight: '600' }]}>
                                {phone}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- FOOTER ACTIONS --- */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.profileBtn} onPress={onPress}>
                        <Text style={styles.profileBtnText}>View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
                        <Text style={styles.bookBtnText}>Book Now</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                </View>

            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 20,
        padding: 16,
        ...shadows.medium, // Utilizing the pre-defined shadow
        borderWidth: 1,
        borderColor: '#F3F4F6', // Subtle border
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 24, // Squircle shape for modern look
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.success || '#28A745',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    infoColumn: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        fontFamily: 'System', // Use system font
        letterSpacing: 0.3,
    },
    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    badgeText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingVaule: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 13,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#FAFAFA',
        padding: 8,
        borderRadius: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FEF2F2', // Light red for location
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    detailText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
        flexShrink: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    profileBtn: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    profileBtnText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    bookBtn: {
        flex: 1,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#111827', // Dark aesthetics
        gap: 8,
        ...shadows.small,
    },
    bookBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});