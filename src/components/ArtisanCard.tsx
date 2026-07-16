import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '@/styles/commonStyles';
import { BACKEND_URL } from '@/src/constants/env';

// --- Types ---
interface ArtisanCardProps {
    artisan: any;
    onPress: () => void;
    formattedLocation?: string;
    formattedPhone?: string;
}

// --- Helper: Image URL Optimizer ---
const getOptimizedUrl = (url: string | null | undefined, firstName: string, lastName: string) => {
    if (!url) {
        return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0F172A&color=FFF&size=200`;
    }
    let finalUrl = url;
    if (finalUrl.startsWith('/')) finalUrl = `${BACKEND_URL}${finalUrl}`;
    
    if (finalUrl.includes('res.cloudinary.com')) {
        if (finalUrl.startsWith('http:')) finalUrl = finalUrl.replace('http:', 'https:');
        if (finalUrl.includes('upload/') && !finalUrl.includes('w_')) {
            finalUrl = finalUrl.replace('upload/', 'upload/w_250,h_250,c_fill,q_auto,f_auto/');
        }
    }
    return finalUrl;
};

export const ArtisanCard = ({ artisan, onPress, formattedLocation, formattedPhone }: ArtisanCardProps) => {
    const { t, i18n } = useTranslation();
    const [imageError, setImageError] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    if (!artisan) return null;

    // --- Data Extraction ---
    // ✅ BULLETPROOF: Check user_details (Complex), then user (Nested), then flat data
    const userObj = artisan.user_details || artisan.user || artisan;
    
    // Names
    const firstName = userObj.first_name || artisan.first_name || '';
    const lastName = userObj.last_name || artisan.last_name || '';
    const email = userObj.email || artisan.email || 'Unknown';

    const displayName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : email.split('@')[0];

    const initials = (displayName[0] || '?').toUpperCase();
    const professionName = i18n.language === 'ha' && artisan?.category_name_ha
      ? artisan.category_name_ha
      : (artisan?.profession_name || "Artisan");
    const phone = formattedPhone || artisan.phone || userObj.phone_number || "No Phone";
    const profilePic = getOptimizedUrl(userObj.profile_picture || artisan.profile_picture, firstName, lastName);
    
    const rating = artisan.rating || 4.8; 
    const reviewCount = artisan.review_count || 24; 
    const isVerified = artisan.is_verified || userObj.is_verified || false;

    // --- Location Logic ---
    let location = formattedLocation;
    if (!location) {
        // ✅ NEW: Priority check for user_details location
        const stateName = userObj.state_details?.name || artisan.state_details?.name || artisan.state;
        const lgaName = userObj.lga_details?.name || artisan.lga_details?.name || artisan.lga;
        
        const isStateId = typeof stateName === 'number';
        const isLgaId = typeof lgaName === 'number';

        if (stateName && !isStateId) {
            location = `${lgaName && !isLgaId ? lgaName + ', ' : ''}${stateName}`;
        } else {
            location = "Location Unknown";
        }
    }

    // --- Handlers ---
    const handleCall = () => {
        if (phone && phone !== "No Phone") {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert(t("No Contact"), t("Phone number not available."));
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
                {/* --- CARD HEADER (Glass Effect Profile) --- */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profilePic }}
                            style={styles.avatar}
                            onError={() => setImageError(true)}
                        />
                        <View style={styles.onlineStatus} />
                    </View>

                    <View style={styles.infoColumn}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                            {isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-seal" size={14} color="#3B82F6" />
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.serviceGlassBadge}>
                            <Text style={styles.serviceText}>{t(professionName)}</Text>
                        </View>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.ratingValue}>{rating}</Text>
                            <Text style={styles.reviewCount}>• {reviewCount} {t('reviews')}</Text>
                        </View>
                    </View>
                </View>

                {/* --- LOCATION & DISTANCE --- */}
                <View style={styles.metaRow}>
                    <View style={styles.locationBox}>
                        <Ionicons name="map-outline" size={14} color="#64748B" />
                        <Text style={styles.locationText} numberOfLines={1}>{location === "Location Unknown" ? t("Location Unknown") : location}</Text>
                    </View>
                    
                    {artisan.distance !== undefined && artisan.distance !== null && artisan.distance !== Infinity && (
                        <View style={styles.distanceBadge}>
                            <Ionicons name="navigate-circle" size={14} color={colors.primary} />
                            <Text style={styles.distanceText}>
                                {typeof artisan.distance === 'number' ? artisan.distance.toFixed(1) : artisan.distance} {t('km away')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* --- ACTIONS --- */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.detailsBtn} onPress={onPress}>
                        <Text style={styles.detailsBtnText}>{t('View Profile')}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#475569" />
                    </TouchableOpacity>
                    
                    {phone !== "No Phone" && (
                        <TouchableOpacity style={styles.callCircleBtn} onPress={handleCall}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 16,
        padding: 16,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    infoColumn: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    verifiedBadge: {
        marginLeft: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 2,
        borderRadius: 6,
    },
    serviceGlassBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    serviceText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    reviewCount: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
    },
    locationBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        flexShrink: 1,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...shadows.small,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0F172A',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailsBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    detailsBtnText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 15,
    },
    callCircleBtn: {
        width: 48,
        height: 48,
        backgroundColor: colors.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
});