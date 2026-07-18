import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { authAPI, bookingAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

type FilterValue = 'new' | 'active' | 'completed' | 'cancelled';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function badgeFor(status: string): { label: string; status: BadgeStatus } {
  switch (status) {
    case 'pending': return { label: 'Pending', status: 'pending' };
    case 'confirmed': return { label: 'Accepted', status: 'confirmed' };
    case 'in_progress': return { label: 'In progress', status: 'confirmed' };
    case 'completed': return { label: 'Completed', status: 'verified' };
    default: return { label: 'Cancelled', status: 'cancelled' };
  }
}

export default function ArtisanJobsTab() {
  const router = useRouter();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('new');

  const load = useCallback(async () => {
    try {
      const user = await authAPI.getProfile();
      const data = await bookingAPI.getBookingsByArtisan(user.id);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('JOBS FETCH ERROR:', err);
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
  };

  const updateStatus = async (
    bookingId: number,
    newStatus: 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  ) => {
    try {
      await bookingAPI.updateBooking(bookingId, { status: newStatus });
      await load();
    } catch (error) {
      console.log('Booking update error:', error);
      Alert.alert(t('Error'), t('Could not update the booking. Please try again.'));
    }
  };

  const confirmDecline = (bookingId: number) => {
    Alert.alert(
      t('Decline request'),
      t('Are you sure you want to decline this booking request?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Decline'), style: 'destructive', onPress: () => updateStatus(bookingId, 'cancelled') },
      ]
    );
  };

  const confirmMarkDone = (bookingId: number) => {
    Alert.alert(
      t('Mark job as done'),
      t('This completes the booking and adds it to your jobs done. Continue?'),
      [
        { text: t('Not yet'), style: 'cancel' },
        { text: t('Mark done'), onPress: () => updateStatus(bookingId, 'completed') },
      ]
    );
  };

  const openClientChat = (booking: any) => {
    const clientUser = booking.client_details;
    const recipientId = clientUser?.id ?? booking.client;
    const name = clientUser?.first_name || t('Client');
    if (recipientId) {
      router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId } });
    }
  };

  const counts = useMemo(() => ({
    new: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
  }), [bookings]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'new': return bookings.filter(b => b.status === 'pending');
      case 'active': return bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
      default: return bookings.filter(b => b.status === filter);
    }
  }, [bookings, filter]);

  const renderJob = ({ item }: { item: any }) => {
    const client = item.client_details || {};
    const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || t('Client');
    const badge = badgeFor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Avatar name={clientName} uri={client.profile_picture} size={44} />
          <View style={styles.cardHeadText}>
            <Text style={styles.cardName} numberOfLines={1}>{clientName}</Text>
            {item.location ? (
              <Text style={styles.cardMeta} numberOfLines={1}>{item.location}</Text>
            ) : null}
          </View>
          <Badge label={t(badge.label)} status={badge.status} />
        </View>

        {item.description ? (
          <View style={styles.inset}>
            <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.whenRow}>
            <MaterialIcons name="event" size={16} color={color.ink400} />
            <Text style={styles.whenText} numberOfLines={1}>
              {item.date}{item.time ? ` · ${item.time}` : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            {item.status === 'pending' && (
              <>
                <Pressable onPress={() => confirmDecline(item.id)} style={styles.outlinePill} accessibilityRole="button">
                  <Text style={styles.outlineText}>{t('Decline')}</Text>
                </Pressable>
                <Pressable onPress={() => updateStatus(item.id, 'confirmed')} style={styles.primaryPill} accessibilityRole="button">
                  <Text style={styles.primaryText}>{t('Accept')}</Text>
                </Pressable>
              </>
            )}
            {(item.status === 'confirmed' || item.status === 'in_progress') && (
              <>
                <Pressable onPress={() => openClientChat(item)} style={styles.outlinePill} accessibilityRole="button">
                  <Text style={styles.outlineText}>{t('Chat')}</Text>
                </Pressable>
                {item.status === 'confirmed' ? (
                  <Pressable onPress={() => updateStatus(item.id, 'in_progress')} style={styles.tonalPill} accessibilityRole="button">
                    <Text style={styles.tonalText}>{t('Start job')}</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => confirmMarkDone(item.id)} style={styles.tonalPill} accessibilityRole="button">
                    <Text style={styles.tonalText}>{t('Mark done')}</Text>
                  </Pressable>
                )}
              </>
            )}
            {(item.status === 'completed' || item.status === 'cancelled') && (
              <Pressable onPress={() => openClientChat(item)} style={styles.outlinePill} accessibilityRole="button">
                <Text style={styles.outlineText}>{t('Chat')}</Text>
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

      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('My jobs')}</Text>
            {counts.new > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{counts.new} {t('new')}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(({ value, label }) => {
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
                {t(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderJob}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={color.brand600} />}
          ListEmptyComponent={
            <EmptyState
              icon="work-outline"
              title={t('No jobs here yet')}
              message={t('Booking requests from clients will show up in this list.')}
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
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  countPillText: { fontFamily: font.extrabold, fontSize: 11.5, color: '#FFF' },

  filterRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.xl,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: '#DFE6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  filterText: { fontFamily: font.bold, fontSize: 12.5, color: color.ink600 },
  filterTextActive: { color: '#FFF' },

  skeletonWrap: { paddingHorizontal: space.xl, paddingTop: space.md },
  listContent: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: 110 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.md,
    ...shadow.e2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardHeadText: { flex: 1, marginLeft: space.md, minWidth: 0, marginRight: space.sm },
  cardName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
  cardMeta: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 2 },
  inset: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginTop: 11,
  },
  desc: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: color.ink600 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
  },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  whenText: { fontFamily: font.bold, fontSize: 12.5, color: color.ink900, flexShrink: 1 },
  actions: { flexDirection: 'row', gap: space.sm },

  outlinePill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: '#DCE3EE',
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: { fontFamily: font.extrabold, fontSize: 12, color: color.ink600 },
  primaryPill: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    backgroundColor: color.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  primaryText: { fontFamily: font.extrabold, fontSize: 12, color: '#FFF' },
  tonalPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tonalText: { fontFamily: font.extrabold, fontSize: 12, color: color.brand600 },
});
