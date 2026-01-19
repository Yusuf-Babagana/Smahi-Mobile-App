import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { artisanAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function AgentArtisanList() {
    const router = useRouter();
    const { user } = useAuth();

    const [artisans, setArtisans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);      // Initial Load
    const [loadingMore, setLoadingMore] = useState(false); // Pagination Load
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);      // Are there more pages?

    useEffect(() => {
        if (user) {
            fetchLocalArtisans(1); // Load Page 1 on start
        }
    }, [user]);

    const fetchLocalArtisans = async (pageNumber: number) => {
        if (!hasMore && pageNumber > 1) return;

        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const lgaFilter = user?.lga;
            const stateFilter = user?.state;

            // Call API with Page Number
            const data = await artisanAPI.getArtisans({
                lga: lgaFilter,
                state: stateFilter
            }, pageNumber);

            const newResults = data.results || [];

            if (pageNumber === 1) {
                setArtisans(newResults); // Replace list
            } else {
                setArtisans(prev => [...prev, ...newResults]); // Append to list
            }

            // Check if there is a "next" page URL from Django
            setHasMore(!!data.next);
            setPage(pageNumber);

        } catch (error) {
            console.log('Error fetching local artisans:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchLocalArtisans(page + 1);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/agent/artisans/[id]', params: { id: item.id } })}
        >
            <View style={styles.row}>
                {/* Avatar */}
                {item.profile_picture ? (
                    <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.placeholder]}>
                        <Text style={styles.placeholderText}>{item.first_name?.[0]}</Text>
                    </View>
                )}

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.service}>{item.service_category || 'General Artisan'}</Text>
                    <View style={styles.locRow}>
                        <Ionicons name="location-sharp" size={12} color="#9CA3AF" />
                        <Text style={styles.location}>{item.lga_details?.name || 'Local'}, {item.state_details?.name}</Text>
                    </View>
                </View>

                {/* Status */}
                <View style={styles.statusCol}>
                    {item.is_verified ? (
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    ) : (
                        <Ionicons name="time" size={24} color="#F59E0B" />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My LGA Artisans</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.subHeader}>
                <Text style={styles.subHeaderText}>
                    Listing artisans in <Text style={{ fontWeight: 'bold' }}>{user?.lga_details?.name || 'your area'}</Text>
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={artisans}
                    renderItem={renderItem}
                    keyExtractor={(item: any, index) => item.id.toString() + index} // Unique key
                    contentContainerStyle={styles.listContent}

                    // ✅ Infinite Scroll Props
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5} // Trigger when 50% from bottom
                    ListFooterComponent={renderFooter}

                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No artisans found in this LGA.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backButton: { padding: 8 },
    subHeader: { padding: 16, backgroundColor: '#EFF6FF' },
    subHeaderText: { color: '#1E40AF', fontSize: 14 },
    listContent: { padding: 20, paddingBottom: 50 },

    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    placeholder: { backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    service: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    location: { fontSize: 12, color: '#9CA3AF' },
    statusCol: { alignItems: 'flex-end', justifyContent: 'center' },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#6B7280' }
});