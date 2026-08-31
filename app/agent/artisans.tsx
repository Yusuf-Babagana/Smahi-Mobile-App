import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { agentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space, type } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SegmentedControl, SkeletonCard } from '@/src/components/ui';

type VerificationFilter = 'all' | 'approved' | 'pending';

export default function AgentArtisanList() {
    const router = useRouter();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    // Tapping "Verified"/"Pending" on the dashboard's stat row lands here
    // pre-filtered (?filter=approved / ?filter=pending) instead of an
    // unfiltered list the coordinator/agent then has to search through.
    const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();

    const [artisans, setArtisans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);      // Initial Load
    const [loadingMore, setLoadingMore] = useState(false); // Pagination Load
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);      // Are there more pages?
    const [filter, setFilter] = useState<VerificationFilter>(
        initialFilter === 'approved' || initialFilter === 'pending' ? initialFilter : 'all'
    );
    // Only a state_coordinator sees the whole state — a plain agent is
    // scoped server-side to their own LGA (AgentArtisanListView).
    const isCoordinator = user?.role === 'state_coordinator';

    useEffect(() => {
        if (user) {
            fetchLocalArtisans(1, filter); // Load Page 1 on start / filter change
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, filter]);

    const fetchLocalArtisans = async (pageNumber: number, statusFilter: VerificationFilter) => {
        if (!hasMore && pageNumber > 1) return;

        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            // Scoped server-side to the agent's own state — includes every
            // artisan there regardless of availability/verification status.
            const params = statusFilter === 'all' ? {} : { verification_status: statusFilter };
            const data = await agentAPI.getStateArtisans(params, pageNumber);

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
            fetchLocalArtisans(page + 1, filter);
        }
    };

    const renderItem = ({ item }: any) => {
        const person = item.user_details || {};
        const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const trade = i18n.language === 'ha' && item.category_name_ha
            ? item.category_name_ha
            : (item.profession_name || item.category_name || t('General Artisan'));
        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => router.push({ pathname: '/agent/artisans/[id]', params: { id: item.id } })}
                accessibilityRole="button"
                accessibilityLabel={name}
            >
                <Avatar name={name} uri={person.profile_picture} gender={person.gender} size={48} verified={!!person.is_verified} />

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.service} numberOfLines={1}>{trade}</Text>
                    <View style={styles.locRow}>
                        <MaterialIcons name="place" size={12} color={color.ink300} />
                        <Text style={styles.location} numberOfLines={1}>
                            {person.lga_details?.name || t('Local')}, {person.state_details?.name}
                        </Text>
                    </View>
                </View>

                <Badge
                    label={person.is_verified ? t('Verified') : t('Pending')}
                    status={person.is_verified ? 'verified' : 'pending'}
                />
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

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{isCoordinator ? t('My state artisans') : t('My LGA artisans')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Listing all artisans in')}{' '}
                    <Text style={styles.subHeaderStrong}>
                        {isCoordinator
                            ? (user?.state_details?.name || t('your state'))
                            : (user?.lga_details?.name || t('your LGA'))}
                    </Text>
                </Text>
            </View>

            <SegmentedControl
                segments={[
                    { value: 'all', label: t('All') },
                    { value: 'approved', label: t('Verified') },
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
                    data={artisans}
                    renderItem={renderItem}
                    keyExtractor={(item: any, index) => item.id.toString() + index} // Unique key
                    contentContainerStyle={styles.listContent}

                    // ✅ Infinite Scroll Props
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5} // Trigger when 50% from bottom
                    ListFooterComponent={renderFooter}

                    ListEmptyComponent={
                        <EmptyState
                            icon="person-search"
                            title={filter !== 'all'
                                ? t('No matching artisans found.')
                                : (isCoordinator ? t('No artisans found in this state.') : t('No artisans found in this LGA.'))}
                            message={isCoordinator
                                ? t('Artisans registered in your state will appear here.')
                                : t('Artisans registered in your LGA will appear here.')}
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
    filterControl: { marginHorizontal: space.xl, marginTop: space.md },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

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
    service: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, marginTop: 2 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    location: { fontFamily: font.bold, fontSize: 11.5, color: color.ink300, flexShrink: 1 },
});
