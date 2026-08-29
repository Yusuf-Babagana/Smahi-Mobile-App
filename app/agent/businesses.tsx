import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { agentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard, SegmentedControl, useToast, useConfirm } from '@/src/components/ui';

type StatusFilter = 'all' | 'pending';

// Artisan/Business -> Coordinator Dashboard Connection (item 9): a
// business's registration and verification status are visible here
// automatically, the same way app/agent/artisans.tsx already works for
// artisans — no separate system, no Django Admin needed. Scoped
// server-side to the caller's own LGA (agent) or state (coordinator).
export default function AgentBusinessListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();
    const isCoordinator = user?.role === 'state_coordinator';

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchBusinesses = useCallback(async (pageNumber: number, search?: string, statusFilter?: StatusFilter) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const params: { search?: string; verification_status?: string } = {};
            if (search) params.search = search;
            if (statusFilter === 'pending') params.verification_status = 'pending';

            const data = await agentAPI.getBusinesses(pageNumber, Object.keys(params).length ? params : undefined);
            const newResults = data.results || [];

            setBusinesses(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching businesses:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchBusinesses(1, searchQuery.trim(), filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter, fetchBusinesses]);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (user) fetchBusinesses(1, searchQuery.trim(), filter);
        }, 400);
        return () => clearTimeout(delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchBusinesses(page + 1, searchQuery.trim(), filter);
    };

    const setVerification = async (business: any, newStatus: 'approved' | 'rejected') => {
        const verb = newStatus === 'approved' ? t('Approve') : t('Reject');
        const ok = await confirm({
            title: `${verb} ${business.business_name}?`,
            message: newStatus === 'approved'
                ? t('They will be marked verified and their badge will show to clients.')
                : t('This will mark their verification as rejected.'),
            confirmLabel: verb,
            destructive: newStatus === 'rejected',
        });
        if (!ok) return;

        setUpdatingId(business.id);
        try {
            await agentAPI.setBusinessVerification(business.user, newStatus);
            if (filter === 'pending') {
                setBusinesses(prev => prev.filter(b => b.id !== business.id));
            } else {
                setBusinesses(prev => prev.map(b => (b.id === business.id ? { ...b, verification_status: newStatus } : b)));
            }
            showToast(newStatus === 'approved' ? t('Business approved.') : t('Business rejected.'), {
                type: newStatus === 'approved' ? 'success' : 'info',
            });
        } catch (error) {
            console.log('Error updating business verification:', error);
            showToast(t('Could not update this business. Please try again.'), { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const renderItem = ({ item }: any) => {
        const owner = item.user_details || {};
        const ownerName = `${owner.first_name || ''} ${owner.last_name || ''}`.trim();
        const pending = item.verification_status === 'pending';
        const approved = item.verification_status === 'approved';
        const isUpdating = updatingId === item.id;

        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <Avatar name={item.business_name} size={44} borderRadius={radius.sm} />
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>{item.business_name}</Text>
                        <Text style={styles.category} numberOfLines={1}>{item.category_name || t('Business')}</Text>
                        <View style={styles.locRow}>
                            <MaterialIcons name="place" size={11} color={color.ink300} />
                            <Text style={styles.location} numberOfLines={1}>
                                {owner.lga_details?.name || t('Local')}, {owner.state_details?.name}
                            </Text>
                        </View>
                    </View>
                    <Badge
                        label={approved ? t('Verified') : pending ? t('Pending') : t('Rejected')}
                        status={approved ? 'verified' : pending ? 'pending' : 'cancelled'}
                    />
                </View>
                {!!ownerName && <Text style={styles.ownerText}>{t('Owner')}: {ownerName}</Text>}
                {pending && (
                    <View style={styles.actionRow}>
                        <Pressable
                            style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.7 }]}
                            onPress={() => setVerification(item, 'approved')}
                            disabled={isUpdating}
                            accessibilityRole="button"
                            accessibilityLabel={t('Approve')}
                        >
                            {isUpdating ? <ActivityIndicator size="small" color="#0F766E" /> : <Text style={styles.approveText}>{t('Approve')}</Text>}
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.7 }]}
                            onPress={() => setVerification(item, 'rejected')}
                            disabled={isUpdating}
                            accessibilityRole="button"
                            accessibilityLabel={t('Reject')}
                        >
                            <Text style={styles.rejectText}>{t('Reject')}</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    };

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
                    <Text style={styles.headerTitle}>{t('Businesses')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Businesses in')}{' '}
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
                    placeholder={t('Search by name…')}
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
                    data={businesses}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="storefront"
                            title={t('No businesses found.')}
                            message={t('Businesses that register here will appear automatically.')}
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
    info: { flex: 1, marginHorizontal: space.md },
    name: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    category: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    location: { fontFamily: font.bold, fontSize: 11, color: color.ink300, flexShrink: 1 },
    ownerText: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: space.md },

    actionRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
    approveBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: '#6EE7B7',
        backgroundColor: '#ECFDF5',
    },
    approveText: { fontFamily: font.extrabold, fontSize: 12.5, color: '#0F766E' },
    rejectBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    rejectText: { fontFamily: font.extrabold, fontSize: 12.5, color: '#B91C1C' },
});
