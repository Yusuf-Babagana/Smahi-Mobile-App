import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { agentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Badge, EmptyState, SkeletonCard, SegmentedControl } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

type StatusFilter = 'all' | 'pending';

function bookingBadgeStatus(bookingStatus: string): BadgeStatus {
    if (bookingStatus === 'completed') return 'verified';
    if (bookingStatus === 'cancelled') return 'cancelled';
    if (bookingStatus === 'confirmed' || bookingStatus === 'in_progress') return 'confirmed';
    return 'pending';
}

// Client/User -> Agent Dashboard Connection (item 8): when a client books
// an artisan, the request shows up here automatically for whoever is
// responsible for that territory — an agent never has to leave the
// dashboard or go searching somewhere else for it. Read-only: this is
// visibility/oversight, not a place to manage the booking itself (that
// stays between the client and the artisan).
export default function AgentServiceRequestsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const isCoordinator = user?.role === 'state_coordinator';

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    const fetchRequests = useCallback(async (pageNumber: number, search?: string, statusFilter?: StatusFilter) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const params: { search?: string; status?: string } = {};
            if (search) params.search = search;
            if (statusFilter === 'pending') params.status = 'pending';

            const data = await agentAPI.getServiceRequests(pageNumber, Object.keys(params).length ? params : undefined);
            const newResults = data.results || [];

            setRequests(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching service requests:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchRequests(1, searchQuery.trim(), filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter, fetchRequests]);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (user) fetchRequests(1, searchQuery.trim(), filter);
        }, 400);
        return () => clearTimeout(delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchRequests(page + 1, searchQuery.trim(), filter);
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.iconTile}>
                    <MaterialIcons name="build" size={16} color={color.brand600} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.clientLine} numberOfLines={1}>
                        <Text style={styles.clientName}>{item.client_name}</Text>
                        <Text style={styles.arrow}> {'→'} </Text>
                        <Text style={styles.artisanName}>{item.artisan_name}</Text>
                    </Text>
                    <Text style={styles.category} numberOfLines={1}>{item.category || t('Artisan')}</Text>
                </View>
                <Badge label={t(item.status)} status={bookingBadgeStatus(item.status)} />
            </View>
            {!!item.service_description && (
                <Text style={styles.description} numberOfLines={2}>{item.service_description}</Text>
            )}
            <View style={styles.metaRow}>
                {!!item.lga_details?.name && (
                    <View style={styles.metaChip}>
                        <MaterialIcons name="place" size={11} color={color.ink400} />
                        <Text style={styles.metaText}>{item.lga_details.name}</Text>
                    </View>
                )}
                {!!item.client_phone && (
                    <View style={styles.metaChip}>
                        <MaterialIcons name="call" size={11} color={color.ink400} />
                        <Text style={styles.metaText}>{item.client_phone}</Text>
                    </View>
                )}
                <Text style={styles.dateText}>{(item.created_at || '').slice(0, 10)}</Text>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: space.xl }}>
                <ActivityIndicator size="small" color={color.brand600} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Service requests')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Requests in')}{' '}
                    <Text style={styles.subHeaderStrong}>
                        {isCoordinator
                            ? (user?.state_details?.name || t('your state'))
                            : (user?.lga_details?.name || t('your LGA'))}
                    </Text>
                </Text>
            </View>

            <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color={color.ink400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('Search by client or artisan…')}
                    placeholderTextColor={color.ink300}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={t('Clear search')} hitSlop={8}>
                        <MaterialIcons name="close" size={18} color={color.ink400} />
                    </Pressable>
                )}
            </View>

            <SegmentedControl
                segments={[
                    { value: 'all', label: t('All') },
                    { value: 'pending', label: t('Pending') },
                ]}
                value={filter}
                onChange={setFilter}
                style={styles.filterControl}
            />

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="event-busy"
                            title={t('No service requests yet.')}
                            message={t('When a client books an artisan here, it will show up automatically.')}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    headerSafe: { backgroundColor: color.surface },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.brand100,
    },
    subHeaderText: { fontFamily: font.medium, color: color.brand600, fontSize: 13 },
    subHeaderStrong: { fontFamily: font.extrabold },

    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: space.sm,
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
        paddingHorizontal: space.lg, height: 44, marginHorizontal: space.xl, marginTop: space.md,
    },
    searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: color.ink900, paddingVertical: 0 },
    filterControl: { marginHorizontal: space.xl, marginTop: space.md },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

    card: {
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    iconTile: {
        width: 36, height: 36, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
    },
    cardInfo: { flex: 1, marginHorizontal: space.md },
    clientLine: { fontSize: 13.5 },
    clientName: { fontFamily: font.extrabold, color: color.ink900 },
    arrow: { fontFamily: font.bold, color: color.ink300 },
    artisanName: { fontFamily: font.bold, color: color.ink600 },
    category: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400, marginTop: 2 },
    description: { fontFamily: font.medium, fontSize: 13, color: color.ink600, marginTop: space.md, lineHeight: 19 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: color.surfaceSunken,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    metaText: { fontFamily: font.bold, fontSize: 10.5, color: color.ink400 },
    dateText: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginLeft: 'auto' },
});
