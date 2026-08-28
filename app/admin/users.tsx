import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { adminAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

const ROLE_FILTERS = ['all', 'client', 'artisan', 'business', 'agent', 'state_coordinator', 'admin'] as const;

function statusBadge(status: string): BadgeStatus {
    if (status === 'active') return 'verified';
    if (status === 'suspended') return 'pending';
    return 'cancelled'; // inactive / dismissed
}

// Admin's full User CRUD — the entry point for viewing/editing/
// deactivating any account, built specifically so data issues (like a
// state ending up with more than one active coordinator) can be resolved
// directly from the app. See app/admin/dashboard.tsx's own comment on
// why this is a deliberate exception to its otherwise read-only design.
export default function AdminUserList() {
    const router = useRouter();
    const { t } = useTranslation();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<typeof ROLE_FILTERS[number]>('all');

    const fetchUsers = useCallback(async (pageNumber: number, search: string, role: string) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const params: any = {};
            if (search) params.search = search;
            if (role !== 'all') params.role = role;

            const data = await adminAPI.getUsers(pageNumber, params);
            const newResults = data.results || [];

            setUsers(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching users:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => { fetchUsers(1, searchQuery.trim(), roleFilter); }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery, roleFilter, fetchUsers]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchUsers(page + 1, searchQuery.trim(), roleFilter);
    };

    const renderItem = ({ item }: any) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email;
        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
                onPress={() => router.push({ pathname: '/admin/user-detail', params: { id: String(item.id) } })}
                accessibilityRole="button"
                accessibilityLabel={name}
            >
                <Avatar name={name} gender={item.gender} size={44} />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.roleChip}>
                            <Text style={styles.roleText}>{t(item.role)}</Text>
                        </View>
                        {item.state_details?.name && (
                            <Text style={styles.stateText}>{item.state_details.name}</Text>
                        )}
                    </View>
                </View>
                <Badge label={t(item.account_status)} status={statusBadge(item.account_status)} />
                <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
            </Pressable>
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
                    <Text style={styles.headerTitle}>{t('All users')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color={color.ink400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('Search by name, email, or phone…')}
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {ROLE_FILTERS.map((role) => {
                    const selected = roleFilter === role;
                    return (
                        <Pressable
                            key={role}
                            onPress={() => setRoleFilter(role)}
                            style={[styles.filterChip, selected && styles.filterChipActive]}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                        >
                            <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                                {role === 'all' ? t('All') : t(role)}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="people-outline"
                            title={t('No users found')}
                            message={t('Try a different search or filter.')}
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

    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: space.sm,
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
        paddingHorizontal: space.lg, height: 44, marginHorizontal: space.xl, marginTop: space.md,
    },
    searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: color.ink900, paddingVertical: 0 },

    filterRow: { gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.md },
    filterChip: {
        height: 34, paddingHorizontal: space.md, borderRadius: radius.full,
        backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.border,
        alignItems: 'center', justifyContent: 'center',
    },
    filterChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
    filterText: { fontFamily: font.bold, fontSize: 12.5, color: color.ink600 },
    filterTextActive: { color: '#FFF' },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    info: { flex: 1, marginHorizontal: space.sm },
    name: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    email: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 6 },
    roleChip: {
        backgroundColor: color.brand100, borderRadius: radius.full,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    roleText: { fontFamily: font.extrabold, fontSize: 10, color: color.brand600, textTransform: 'uppercase' },
    stateText: { fontFamily: font.bold, fontSize: 11, color: color.ink400 },
});
