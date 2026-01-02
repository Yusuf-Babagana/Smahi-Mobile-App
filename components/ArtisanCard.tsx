import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ Standard Expo Icons
import { colors, shadows } from '@/styles/commonStyles';

interface ArtisanCardProps {
    artisan: any;
    onPress: () => void;
    onBook: () => void;
}

export const ArtisanCard = ({ artisan, onPress, onBook }: ArtisanCardProps) => {
    if (!artisan) return null;

    // 1. SAFE DATA EXTRACTION
    const data = artisan.user || artisan;

    // 2. Get Details
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const email = data.email || 'Unknown';

    // 3. Construct Display Name
    const displayName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : email.split('@')[0];

    // 4. Get Service & Phone
    const service = data.service_category || "Professional Artisan";
    const phone = data.phone_number || "No Phone";

    // 5. Get Location
    const stateName = data.state_details?.name;
    const lgaName = data.lga_details?.name;
    const location = stateName ? `${lgaName || ''}, ${stateName}` : "Location Unknown";

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
            <View style={styles.row}>
                {/* Avatar Placeholder */}
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {(displayName[0] || '?').toUpperCase()}
                    </Text>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.role}>{service}</Text>

                    {/* Location Row */}
                    <View style={styles.detailRow}>
                        <Ionicons name="location-sharp" size={12} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{location}</Text>
                    </View>

                    {/* Email Row */}
                    <View style={styles.detailRow}>
                        <Ionicons name="mail" size={12} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{email}</Text>
                    </View>

                    {/* Phone Row */}
                    {phone !== "No Phone" && (
                        <View style={styles.detailRow}>
                            <Ionicons name="call" size={12} color={colors.textSecondary} />
                            <Text style={styles.detailText}>{phone}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.divider} />

            {/* Buttons */}
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
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#F0F0F0', ...shadows.small,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    infoContainer: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
    role: {
        fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: 6,
        backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 8,
        paddingVertical: 2, borderRadius: 4
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    detailText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    viewProfileText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
    bookButton: { backgroundColor: colors.text, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    bookButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});