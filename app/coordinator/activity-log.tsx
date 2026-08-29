import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { coordinatorAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Badge, EmptyState, SkeletonCard } from '@/src/components/ui';
import { ACTIVITY_ACTION_ICONS, activityBadgeStatus, formatActivityWhen } from '@/src/utils/activityLog';

// Coordinator Dashboard's Recent Activities / Activity Log — a state-wide,
// actor-centric audit trail (who did what, to whom, in which LGA, with
// what resulting status). Read-only: entries are written server-side as a
// side effect of the real actions (agent creation/approval, verification),
// never from this screen.
export default function CoordinatorActivityLogScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchLog = useCallback(async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await coordinatorAPI.getActivityLog(pageNumber);
            const newResults = data.results || [];

            setEntries(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching activity log:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchLog(1);
    }, [user, fetchLog]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchLog(page + 1);
    };

    const renderItem = ({ item }: any) => {
        const { date, time } = formatActivityWhen(item.created_at);
        return (
            <View style={styles.card}>
                <View style={styles.iconTile}>
                    <MaterialIcons name={ACTIVITY_ACTION_ICONS[item.action] || 'history'} size={18} color={color.brand600} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.line} numberOfLines={2}>
                        <Text style={styles.actor}>{item.actor_name}</Text>
                        <Text style={styles.arrow}> {'→'} </Text>
                        <Text style={styles.action}>{item.action_display}</Text>
                        {!!item.target_repr && <Text style={styles.target}> ({item.target_repr})</Text>}
                    </Text>
                    <View style={styles.metaRow}>
                        {!!item.lga_details?.name && (
                            <View style={styles.metaChip}>
                                <MaterialIcons name="place" size={11} color={color.ink400} />
                                <Text style={styles.metaText}>{item.lga_details.name}</Text>
                            </View>
                        )}
                        <Text style={styles.dateText}>{date} {'•'} {time}</Text>
                    </View>
                </View>
                {!!item.status && <Badge label={t(item.status)} status={activityBadgeStatus(item.status)} />}
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
                    <Text style={styles.headerTitle}>{t('Activity log')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Recent activity in')}{' '}
                    <Text style={styles.subHeaderStrong}>{user?.state_details?.name || t('your state')}</Text>
                </Text>
            </View>

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="history"
                            title={t('No activity yet')}
                            message={t('Actions taken by agents and coordinators in your state will show up here.')}
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

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    iconTile: {
        width: 36, height: 36, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
    },
    info: { flex: 1, marginHorizontal: space.md },
    line: { fontSize: 13.5, lineHeight: 19 },
    actor: { fontFamily: font.extrabold, color: color.ink900 },
    arrow: { fontFamily: font.bold, color: color.ink300 },
    action: { fontFamily: font.bold, color: color.ink600 },
    target: { fontFamily: font.medium, color: color.ink400, fontSize: 12.5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 6, flexWrap: 'wrap' },
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
    dateText: { fontFamily: font.bold, fontSize: 11, color: color.ink300 },
});
