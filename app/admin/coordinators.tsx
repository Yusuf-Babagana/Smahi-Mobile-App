import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { adminAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard, useToast, useConfirm } from '@/src/components/ui';

// Admin:Coordinator, one level up the exact same list/search/suspend/
// dismiss pattern as app/coordinator/agents.tsx (Coordinator:Agent) — the
// one deliberate exception to app/admin/dashboard.tsx's otherwise
// read-only design.
export default function AdminCoordinatorList() {
    const router = useRouter();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCoordinators = useCallback(async (pageNumber: number, search?: string) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await adminAPI.getCoordinators(pageNumber, search ? { search } : undefined);
            const newResults = data.results || [];

            setCoordinators(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching coordinators:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchCoordinators(1); }, [fetchCoordinators]);

    // Debounced search — name, phone, or state name (all handled
    // server-side in one `search` param, see AdminCoordinatorListView).
    useEffect(() => {
        const delay = setTimeout(() => { fetchCoordinators(1, searchQuery.trim()); }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery, fetchCoordinators]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchCoordinators(page + 1, searchQuery.trim());
    };

    const toggleStatus = async (coordinator: any) => {
        const nextStatus = coordinator.account_status === 'suspended' ? 'active' : 'suspended';
        const verb = nextStatus === 'suspended' ? t('Suspend') : t('Reactivate');

        const ok = await confirm({
            title: `${verb} ${coordinator.first_name}?`,
            message: nextStatus === 'suspended'
                ? t('They will not be able to log in until reactivated.')
                : t('They will regain access immediately.'),
            confirmLabel: verb,
            destructive: nextStatus === 'suspended',
        });
        if (!ok) return;

        setUpdatingId(coordinator.id);
        try {
            await adminAPI.setCoordinatorStatus(coordinator.id, nextStatus);
            setCoordinators(prev => prev.map(c => (c.id === coordinator.id ? { ...c, account_status: nextStatus } : c)));
        } catch (error) {
            console.log('Error updating coordinator status:', error);
            showToast(t('Could not update this coordinator. Please try again.'), { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const dismissCoordinator = async (coordinator: any) => {
        const ok = await confirm({
            title: t('Dismiss {{name}}?', { name: coordinator.first_name }),
            message: t('This is final and cannot be undone from here — they will permanently lose access.'),
            confirmLabel: t('Dismiss'),
            destructive: true,
        });
        if (!ok) return;

        setUpdatingId(coordinator.id);
        try {
            await adminAPI.setCoordinatorStatus(coordinator.id, 'dismissed');
            setCoordinators(prev => prev.map(c => (c.id === coordinator.id ? { ...c, account_status: 'dismissed' } : c)));
        } catch (error) {
            console.log('Error dismissing coordinator:', error);
            showToast(t('Could not dismiss this coordinator. Please try again.'), { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const renderItem = ({ item }: any) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        const suspended = item.account_status === 'suspended';
        const dismissed = item.account_status === 'dismissed';
        const isUpdating = updatingId === item.id;

        return (
            <View style={styles.card}>
                <Avatar name={name} gender={item.gender} size={44} />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    {item.state_details?.name && (
                        <View style={styles.stateRow}>
                            <MaterialIcons name="map" size={11} color={color.ink400} />
                            <Text style={styles.stateText}>{item.state_details.name}</Text>
                        </View>
                    )}
                    <View style={styles.statsRow}>
                        <View style={styles.statChip}>
                            <MaterialIcons name="badge" size={12} color={color.brand600} />
                            <Text style={styles.statText}>{item.agents_count} {t('agents')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionCol}>
                    <Badge
                        label={dismissed ? t('Dismissed') : suspended ? t('Suspended') : t('Active')}
                        bg={dismissed ? '#F1F5F9' : suspended ? '#FDECEC' : color.accent100}
                        fg={dismissed ? color.ink400 : suspended ? '#B91C1C' : '#0F766E'}
                    />
                    {!dismissed && (
                        <>
                            <Pressable
                                style={({ pressed }) => [styles.toggleBtn, pressed && { opacity: 0.7 }]}
                                onPress={() => toggleStatus(item)}
                                disabled={isUpdating}
                                accessibilityRole="button"
                                accessibilityLabel={suspended ? t('Reactivate') : t('Suspend')}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color={color.ink400} />
                                ) : (
                                    <Text style={styles.toggleText}>{suspended ? t('Reactivate') : t('Suspend')}</Text>
                                )}
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.dismissBtn, pressed && { opacity: 0.7 }]}
                                onPress={() => dismissCoordinator(item)}
                                disabled={isUpdating}
                                accessibilityRole="button"
                                accessibilityLabel={t('Dismiss')}
                            >
                                <Text style={styles.dismissText}>{t('Dismiss')}</Text>
                            </Pressable>
                        </>
                    )}
                </View>
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
                    <Text style={styles.headerTitle}>{t('Coordinators')}</Text>
                    <Pressable
                        onPress={() => router.push('/admin/create-coordinator')}
                        style={styles.backButton}
                        accessibilityRole="button"
                        accessibilityLabel={t('Create coordinator')}
                    >
                        <MaterialIcons name="person-add-alt" size={20} color={color.brand600} />
                    </Pressable>
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="public" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>{t('State coordinators, every state')}</Text>
            </View>

            <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color={color.ink400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('Search by name, phone, or state…')}
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

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={coordinators}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="map"
                            title={t('No coordinators yet')}
                            message={t('Coordinators you create will appear here.')}
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

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: space.sm,
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
        paddingHorizontal: space.lg, height: 44, marginHorizontal: space.xl, marginTop: space.md,
    },
    searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: color.ink900, paddingVertical: 0 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    info: { flex: 1, marginHorizontal: space.md },
    name: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    email: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    stateRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    stateText: { fontFamily: font.bold, fontSize: 11, color: color.ink400 },
    statsRow: { flexDirection: 'row', gap: space.sm, marginTop: 6 },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: color.surfaceSunken,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    statText: { fontFamily: font.bold, fontSize: 10.5, color: color.ink400 },

    actionCol: { alignItems: 'flex-end', gap: space.sm },
    toggleBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: color.border,
        minWidth: 76,
        alignItems: 'center',
    },
    toggleText: { fontFamily: font.extrabold, fontSize: 11, color: color.ink600 },
    dismissBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        minWidth: 76,
        alignItems: 'center',
    },
    dismissText: { fontFamily: font.extrabold, fontSize: 11, color: '#B91C1C' },
});
