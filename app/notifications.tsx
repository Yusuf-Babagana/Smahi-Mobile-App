import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { notificationAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { EmptyState, SkeletonCard } from '@/src/components/ui';

const EVENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    booking_created: 'event-note',
    booking_confirmed: 'event-available',
    booking_started: 'directions-run',
    booking_completed: 'task-alt',
    booking_cancelled: 'event-busy',
    service_fee_requested: 'payments',
    service_fee_paid: 'payments',
    review_submitted: 'star',
    verification_approved: 'verified',
    verification_rejected: 'gpp-bad',
    wallet_credited: 'account-balance-wallet',
    withdrawal_approved: 'check-circle',
    withdrawal_rejected: 'cancel',
    dispute_created: 'report',
    dispute_resolved: 'task-alt',
    agent_pending_approval: 'person-add-alt',
};

function timeAgo(iso: string, t: (k: string, o?: any) => string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMinutes = Math.floor((Date.now() - then) / 60000);
    if (diffMinutes < 1) return t('Just now');
    if (diffMinutes < 60) return t('{{count}}m ago', { count: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('{{count}}h ago', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return t('{{count}}d ago', { count: diffDays });
    return new Date(iso).toLocaleDateString();
}

// Every Dashboard Must Be Connected (item 10) — every role's dashboard
// bell icon opens this same screen. A Notification row has always
// existed the moment something happened to you (booking, verification,
// dispute, agent approval...) — this is what makes that history
// actually visible in-app instead of only ever appearing once as a push
// notification and then being gone for good.
export default function NotificationsScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await notificationAPI.getNotifications(pageNumber);
            const newResults = data.results || [];

            setNotifications(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchNotifications(page + 1);
    };

    const handlePress = async (item: any) => {
        if (!item.is_read) {
            setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n)));
            try {
                await notificationAPI.markRead(item.id);
            } catch (error) {
                console.log('Error marking notification read:', error);
            }
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.log('Error marking all notifications read:', error);
        } finally {
            setMarkingAll(false);
        }
    };

    const hasUnread = notifications.some(n => !n.is_read);

    const renderItem = ({ item }: any) => (
        <Pressable
            style={({ pressed }) => [styles.card, !item.is_read && styles.cardUnread, pressed && { opacity: 0.8 }]}
            onPress={() => handlePress(item)}
            accessibilityRole="button"
        >
            {!item.is_read && <View style={styles.unreadDot} />}
            <View style={styles.iconTile}>
                <MaterialIcons name={EVENT_ICONS[item.event_type] || 'notifications'} size={18} color={color.brand600} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={2}>{item.title}</Text>
                {!!item.body && <Text style={styles.body} numberOfLines={2}>{item.body}</Text>}
                <Text style={styles.time}>{timeAgo(item.created_at, t)}</Text>
            </View>
        </Pressable>
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
                    <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Notifications')}</Text>
                    <Pressable
                        onPress={() => router.push('/notification-settings')}
                        style={styles.iconBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('Notification settings')}
                    >
                        <MaterialIcons name="settings" size={19} color={color.ink900} />
                    </Pressable>
                </View>
                {hasUnread && (
                    <Pressable onPress={handleMarkAllRead} disabled={markingAll} style={styles.markAllBtn} accessibilityRole="button">
                        {markingAll
                            ? <ActivityIndicator size="small" color={color.brand600} />
                            : <Text style={styles.markAllText}>{t('Mark all as read')}</Text>}
                    </Pressable>
                )}
            </SafeAreaView>

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="notifications-none"
                            title={t('No notifications yet.')}
                            message={t('Updates about your account and activity will appear here.')}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },

    headerSafe: { backgroundColor: color.surface, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
    },
    headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markAllBtn: { alignSelf: 'flex-end', paddingHorizontal: space.xl, paddingBottom: space.md },
    markAllText: { fontFamily: font.extrabold, fontSize: 12.5, color: color.brand600 },

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
    cardUnread: {
        borderColor: color.brand600 + '40',
        backgroundColor: color.brand100,
        ...shadow.e1,
    },
    unreadDot: {
        width: 7, height: 7, borderRadius: 4, backgroundColor: color.brand600,
        position: 'absolute', top: space.lg, right: space.lg,
    },
    iconTile: {
        width: 36, height: 36, borderRadius: radius.md,
        backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center',
        marginRight: space.md,
    },
    info: { flex: 1 },
    title: { fontFamily: font.bold, fontSize: 13.5, color: color.ink900 },
    titleUnread: { fontFamily: font.extrabold },
    body: { fontFamily: font.medium, fontSize: 12.5, color: color.ink600, marginTop: 2, lineHeight: 18 },
    time: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: space.sm },
});
