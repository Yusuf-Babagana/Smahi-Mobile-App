import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import { authAPI, bookingAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, Button, EmptyState, SkeletonCard, useToast, useConfirm } from '@/src/components/ui';
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
  const { show: showToast } = useToast();
  const confirm = useConfirm();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('new');

  const [lateCancelId, setLateCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // "Mark done" now collects the price actually agreed with the client
  // off-app — without this, total_cost never gets set at all, so "Total
  // spent" (client) and this artisan's own earnings stat stay ₦0 forever
  // regardless of how many real jobs are completed.
  const [markDoneId, setMarkDoneId] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [submittingMarkDone, setSubmittingMarkDone] = useState(false);

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

  // Kept in sync with `bookings` so the interval below always sees the
  // current list without needing to be recreated every time it changes.
  const bookingsRef = useRef<any[]>([]);
  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);

  useFocusEffect(
    useCallback(() => {
      // Foreground-only live location push (Map + Location Markers
      // feature): while this screen is open and a job is 'in_progress',
      // periodically send this artisan's current position so the client's
      // booking detail screen can show them moving toward the job. Stops
      // the moment this screen loses focus or nothing is in_progress —
      // matches the foreground-only scope decided for this feature (no
      // background tracking, no extra Play Store review needed).
      const interval = setInterval(async () => {
        const inProgress = bookingsRef.current.filter((b) => b.status === 'in_progress');
        if (inProgress.length === 0) return;
        try {
          const { status: permStatus } = await Location.getForegroundPermissionsAsync();
          if (permStatus !== 'granted') return;
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          await Promise.all(inProgress.map((b) =>
            bookingAPI
              .updateLiveLocation(b.id, position.coords.latitude, position.coords.longitude)
              .catch(() => {})
          ));
        } catch {
          // Best-effort — a missed tick just means the client's map doesn't
          // refresh this cycle; never surface this as an error to the artisan.
        }
      // Widened from 15s to 20s (Aug 2026) — see the matching note in
      // app/chat/[id].tsx (PythonAnywhere free-tier CPU-seconds quota).
      }, 20000);
      return () => clearInterval(interval);
    }, [])
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
    } catch (error: any) {
      // Declining/cancelling close to scheduled_date requires a reason
      // (PlatformSettings.cancellation_window_hours) — the backend reports
      // this as a validation error on cancellation_reason.
      if (newStatus === 'cancelled' && error?.response?.data?.cancellation_reason) {
        setLateCancelId(bookingId);
      } else {
        console.log('Booking update error:', error);
        showToast(t('Could not update the booking. Please try again.'), { type: 'error' });
      }
    }
  };

  const submitLateCancel = async () => {
    if (!cancelReason.trim() || lateCancelId == null) {
      showToast(t('Please tell us why you need to decline.'), { type: 'warn' });
      return;
    }
    setSubmittingCancel(true);
    try {
      await bookingAPI.updateBooking(lateCancelId, { status: 'cancelled', cancellation_reason: cancelReason.trim() });
      setLateCancelId(null);
      setCancelReason('');
      await load();
    } catch {
      showToast(t('Could not update the booking. Please try again.'), { type: 'error' });
    } finally {
      setSubmittingCancel(false);
    }
  };

  const confirmDecline = async (bookingId: number) => {
    const ok = await confirm({
      title: t('Decline request'),
      message: t('Are you sure you want to decline this booking request?'),
      confirmLabel: t('Decline'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (ok) {
      updateStatus(bookingId, 'cancelled');
    }
  };

  const confirmMarkDone = (bookingId: number) => {
    setFinalPrice('');
    setMarkDoneId(bookingId);
  };

  const submitMarkDone = async () => {
    const amount = finalPrice.trim();
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      showToast(t('Enter the amount agreed with the client.'), { type: 'warn' });
      return;
    }
    if (markDoneId == null) return;
    setSubmittingMarkDone(true);
    try {
      await bookingAPI.updateBooking(markDoneId, { status: 'completed', total_cost: amount });
      setMarkDoneId(null);
      setFinalPrice('');
      await load();
      showToast(t('Job marked as done.'), { type: 'success' });
    } catch {
      showToast(t('Could not mark this job as done. Please try again.'), { type: 'error' });
    } finally {
      setSubmittingMarkDone(false);
    }
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
          <Avatar name={clientName} uri={client.profile_picture} gender={client.gender} size={44} />
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

      {/* Late cancellation/decline — a reason is required this close to scheduled_date */}
      <Modal
        visible={lateCancelId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLateCancelId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('Why are you declining?')}</Text>
            <Text style={styles.modalSubtitle}>
              {t("This is close to the scheduled time, so we'll need a reason.")}
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder={t('e.g. Emergency came up, double-booked...')}
              placeholderTextColor={color.ink300}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Button
                title={t('Back')}
                variant="secondary"
                onPress={() => setLateCancelId(null)}
                disabled={submittingCancel}
                style={{ flex: 1 }}
              />
              <Button
                title={t('Confirm decline')}
                onPress={submitLateCancel}
                loading={submittingCancel}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={markDoneId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMarkDoneId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('Mark job as done')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('Enter the amount you agreed with the client for this job.')}
            </Text>

            <View style={styles.priceInputRow}>
              <Text style={styles.priceCurrency}>₦</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                placeholderTextColor={color.ink300}
                value={finalPrice}
                onChangeText={setFinalPrice}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title={t('Cancel')}
                variant="secondary"
                onPress={() => setMarkDoneId(null)}
                disabled={submittingMarkDone}
                style={{ flex: 1 }}
              />
              <Button
                title={t('Mark done')}
                onPress={submitMarkDone}
                loading={submittingMarkDone}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: space.xl,
    paddingBottom: space.xxl,
  },
  modalTitle: { ...type.heading, marginBottom: space.sm },
  modalSubtitle: { ...type.body, marginBottom: space.md },
  reasonInput: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    padding: space.md,
    fontFamily: font.medium,
    fontSize: 14,
    color: color.ink900,
    minHeight: 90,
  },
  modalActions: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    gap: 6,
  },
  priceCurrency: { fontFamily: font.extrabold, fontSize: 18, color: color.ink600 },
  priceInput: {
    flex: 1,
    paddingVertical: space.md,
    fontFamily: font.extrabold,
    fontSize: 18,
    color: color.ink900,
  },
});
