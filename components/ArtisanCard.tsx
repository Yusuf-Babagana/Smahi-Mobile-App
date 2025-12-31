import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, shadows } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

interface ArtisanCardProps {
    artisan: {
        id: number;
        user: {
            first_name: string;
            last_name: string;
            email: string;
        };
        service_category: string;
        business_name?: string;
        state?: string;
        lga?: string;
        rating?: number; // Assuming backend sends this, default to 0 if not
    };
    onPress: () => void;
    onBook: () => void;
}

export const ArtisanCard = ({ artisan, onPress, onBook }: ArtisanCardProps) => {
    // Format Name
    const displayName = artisan.business_name || `${artisan.user.first_name} ${artisan.user.last_name}`;
    const location = `${artisan.lga}, ${artisan.state}`;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
            <View style={styles.row}>
                {/* Avatar / Icon */}
                <View style={styles.avatarContainer}>
                    <IconSymbol name="person.fill" size={32} color="#FFF" />
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.service}>{artisan.service_category}</Text>

                    <View style={styles.locationRow}>
                        <IconSymbol name="location.fill" size={14} color={colors.textSecondary} />
                        <Text style={styles.location}>{location}</Text>
                    </View>
                </View>

                {/* Rating (Static for now if backend doesn't send it) */}
                <View style={styles.ratingContainer}>
                    <IconSymbol name="star.fill" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity onPress={onPress}>
                    <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onBook} style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...shadows.small,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
    },
    infoContainer: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
    service: {
        fontSize: 12, fontWeight: '600', color: colors.primary,
        backgroundColor: '#EBF5FF', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6
    },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    location: { fontSize: 13, color: colors.textSecondary, marginLeft: 4 },

    ratingContainer: { alignItems: 'flex-end' },
    ratingText: { fontWeight: '700', marginTop: 4, color: colors.text },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    viewProfileText: { color: colors.textSecondary, fontWeight: '600' },
    bookButton: {
        backgroundColor: colors.text,
        paddingVertical: 8, paddingHorizontal: 20,
        borderRadius: 20
    },
    bookButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});