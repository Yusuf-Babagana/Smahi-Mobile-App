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
import type { BadgeStatus } from '@/src/components/ui';

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    payment: 'payments',
    quality: 'thumb-down',
    no_show: 'event-busy',
    harassment: 'report',
    other: 'help-outline',
};

function badgeStatus(status: string): BadgeStatus {
    if (status === 'resolved') return 'verified';
    if (status === 'dismissed') return 'cancelled';
    if (status === 'investigating') return 'confirmed';
    return 'pending';
}

// Reports and escalations connected to the coordinator's own state — see
// CoordinatorReportsView. Read-only: resolution happens in Django Admin,
// matching DisputeReport's existing, deliberately minimal design.
export default function CoordinatorReportsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchReports = useCallback(async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await coordinatorAPI.getReports(pageNumber);
            const newResults = data.results || [];

            setReports(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching reports:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchReports(1);
    }, [user, fetchReports]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchReports(page + 1);
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.categoryTile}>
                    <MaterialIcons name={CATEGORY_ICONS[item.category] || 'help-outline'} size={18} color={color.brand600} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.reporterName} numberOfLines={1}>{item.reporter_name || item.reporter_email}</Text>
                    <Text style={styles.category} numberOfLines={1}>{t(item.category)}</Text>
                </View>
                <Badge label={t(item.status)} status={badgeStatus(item.status)} />
            </View>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
            <Text style={styles.date}>{(item.created_at || '').slice(0, 10)}</Text>
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
                    <Text style={styles.headerTitle}>{t('Reports & escalations')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Reports connected to')}{' '}
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
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="report-off"
                            title={t('No reports right now')}
                            message={t('Disputes and escalations connected to your state will appear here.')}
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
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    categoryTile: {
        width: 36, height: 36, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
    },
    cardInfo: { flex: 1, marginHorizontal: space.md },
    reporterName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
    category: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    description: { fontFamily: font.medium, fontSize: 13, color: color.ink600, marginTop: space.md, lineHeight: 19 },
    date: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: space.sm },
});
