import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList, Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { bookingAPI } from '@/src/api/client';
import { color, font, radius, space, type } from '@/constants/theme';
import { Avatar, Badge, BookingTimeline, EmptyState, SkeletonCard } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';
import { useOfflineQueue, processQueue } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';

type FilterValue = 'active' | 'completed' | 'cancelled';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'accepted', 'in_progress'];

function timelineStep(status: string) {
  switch (status) {
    case 'pending': return 0;
    case 'confirmed':
    case 'accepted': return 1;
    case 'in_progress': return 2;
    case 'completed': return 3;
    default: return 0;
  }
}

function badgeStatus(status: string): BadgeStatus {
  if (status === 'completed') return 'verified';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'pending') return 'pending';
  return 'confirmed';
}

export default function BookingsTab() {
  const router = useRouter();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('active');
  // Booking requests saved locally while offline — see
  // src/utils/offlineQueue.ts and app/booking/[artisanId].tsx.
  const { counts: syncCounts } = useOfflineQueue('service_booking');

  const load = useCallback(async () => {
    try {
      const data = await bookingAPI.getBookings();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setBookings(list);
    } catch (err) {
      console.log('BOOKINGS FETCH ERROR:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load();
    // Doubles as "try syncing any saved-offline booking requests now" —
    // an easy manual nudge rather than waiting for the automatic retry.
    processQueue(syncSubmitters).catch(() => {});
  };

  const stats = useMemo(() => {
    const active = bookings.filter(b => ACTIVE_STATUSES.includes(b.status)).length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const spent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + Number(b.estimated_cost || b.total_cost || b.price || 0), 0);
    return { active, completed, spent };
  }, [bookings]);

  const filtered = useMemo(() => {
    if (filter === 'active') return bookings.filter(b => ACTIVE_STATUSES.includes(b.status));
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const openBookingDetail = (booking: any) => {
    if (booking.id) router.push({ pathname: '/booking/detail/[id]', params: { id: String(booking.id) } });
  };

  const openChat = (booking: any) => {
    const artisanUser = booking.artisan_details;
    const recipientId = artisanUser?.id ?? booking.artisan;
    const name = artisanUser?.first_name || t('Artisan');
    if (recipientId) {
      router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId } });
    } else {
      router.push('/chat');
    }
  };

  const rebook = (booking: any) => {
    const profileId = booking.artisan_profile_id ?? booking.artisan?.id ?? booking.artisan;
    if (profileId) {
      router.push({ pathname: '/booking/[artisanId]', params: { artisanId: String(profileId) } });
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const artisanObj = item.artisan_details || item.artisan || {};
    const artisanUser = artisanObj.user_details || artisanObj.user || artisanObj;
    const name = `${artisanUser.first_name || ''} ${artisanUser.last_name || ''}`.trim() || t('Artisan');
    const job = item.description || item.job_title || t('Service booking');
    const ref = item.reference || item.ref || `#${item.id}`;
    const isActive = ACTIVE_STATUSES.includes(item.status);
    const dateLabel = item.date ? `${item.date}${item.time ? ` · ${item.time}` : ''}` : (item.created_at || '').slice(0, 10);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Avatar name={name} uri={artisanUser.profile_picture} gender={artisanUser.gender} size={44} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            <Text style={styles.cardJob} numberOfLines={1}>{job}</Text>
            <Text style={styles.cardRef}>{ref}</Text>
          </View>
          <Badge label={t(item.status || 'pending')} status={badgeStatus(item.status)} />
        </View>

        {isActive && (
          <View style={styles.timelineWrap}>
            <BookingTimeline
              currentStep={timelineStep(item.status)}
              steps={[t('Requested'), t('Accepted'), t('In progress'), t('Done')]}
            />
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{dateLabel}</Text>
          <View style={styles.footerActions}>
            <Pressable onPress={() => openChat(item)} style={styles.chatPill} accessibilityRole="button">
              <Text style={styles.chatPillText}>{t('Chat')}</Text>
            </Pressable>
            {item.status === 'completed' || item.status === 'cancelled' ? (
              <Pressable onPress={() => rebook(item)} style={styles.ctaPill} accessibilityRole="button">
                <Text style={styles.ctaPillText}>{t('Rebook')}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => openBookingDetail(item)} style={styles.ctaPill} accessibilityRole="button">
                <Text style={styles.ctaPillText}>{isActive ? t('Track') : t('Details')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* brand900 header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('My bookings')}</Text>
            <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Notifications')}>
              <MaterialIcons name="notifications-none" size={20} color="#FFF" />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>{t('Active')}</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>{t('Completed')}</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>₦{stats.spent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('Total spent')}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {(['active', 'completed', 'cancelled'] as FilterValue[]).map((value) => {
          const selected = filter === value;
          return (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.filterChip, selected && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                {t(value.charAt(0).toUpperCase() + value.slice(1))}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {syncCounts.pending_sync > 0 && (
        <View style={styles.syncBanner}>
          <MaterialIcons name="cloud-off" size={16} color={color.warn600} />
          <Text style={styles.syncBannerText}>
            {t('{{count}} booking request(s) saved offline — will send automatically once you\'re back online.', { count: syncCounts.pending_sync })}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={color.brand600} />}
          ListEmptyComponent={
            <EmptyState
              icon="event-busy"
              title={t('No bookings here yet')}
              message={t('When you book an artisan it will show up in this list.')}
              actionLabel={t('Find an artisan')}
              onAction={() => router.push('/(tabs)/(home)')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },

  header: {
    backgroundColor: color.brand900,
    paddingBottom: space.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    marginTop: space.md,
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.19, color: '#FFF' },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.xl,
    marginTop: space.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: space.md,
  },
  statValue: { fontFamily: font.extrabold, fontSize: 16, color: '#FFF' },
  statLabel: { fontFamily: font.bold, fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 2 },

  filterRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.xl,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.warn100,
    borderRadius: radius.md,
    padding: space.md,
    marginHorizontal: space.xl,
    marginBottom: space.sm,
  },
  syncBannerText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.warn600,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: '#DFE6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  filterText: { fontFamily: font.bold, fontSize: 13, color: color.ink600 },
  filterTextActive: { color: '#FFF' },

  skeletonWrap: { paddingHorizontal: space.xl, paddingTop: space.md },
  listContent: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: 110 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
    marginBottom: space.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginHorizontal: space.md },
  cardName: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  cardJob: { fontFamily: font.medium, fontSize: 12.5, color: color.ink600, marginTop: 2 },
  cardRef: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: 2 },
  timelineWrap: {
    marginTop: space.lg,
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: space.md,
  },
  cardDate: { fontFamily: font.bold, fontSize: 12, color: color.ink400, flexShrink: 1 },
  footerActions: { flexDirection: 'row', gap: space.sm },
  chatPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPillText: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink600 },
  ctaPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: color.brand600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPillText: { fontFamily: font.extrabold, fontSize: 12.5, color: '#FFF' },
});
