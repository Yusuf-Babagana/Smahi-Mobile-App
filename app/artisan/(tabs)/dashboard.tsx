import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar, Pressable, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

// API & UTILS
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { useLocation } from '@/src/contexts/LocationContext';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, Button, LanguagePickerChip, StatTile, useToast, useConfirm } from '@/src/components/ui';

export default function ArtisanDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show: showToast } = useToast();
  const confirm = useConfirm();

  // STATE
  const [user, setUser] = useState<any>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const [lateCancelId, setLateCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    try {
      // 1. Get Token (optional step since apiClient handles it, but good for local check)
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return router.replace('/login');

      // 2. Fetch Fresh User Profile using apiClient
      try {
        const userRes = await authAPI.getProfile();
        setUser(userRes);

        // 3. Fetch Artisan Details
        const artisanProfile = await artisanAPI.getArtisanByUserId(userRes.id);
        setArtisan(artisanProfile);
        if (artisanProfile) {
          setIsAvailable(artisanProfile.is_available ?? true);
        }

        // 4. Fetch Bookings
        // ✅ The backend filter 'artisan' expects the USER ID, not the Profile ID
        if (artisanProfile) {
          const artisanBookings = await bookingAPI.getBookingsByArtisan(userRes.id);
          setBookings(artisanBookings || []);
        }

      } catch (err) {
        console.log("Error fetching data", err);
      }

    } catch (error) {
      console.log("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep the artisan's saved GPS point fresh — this is the position clients'
  // "X km away" search measures against. Synced once per dashboard visit.
  const { location, requestLocationPermission } = useLocation();
  useEffect(() => {
    requestLocationPermission();
  }, []);
  const coordsSynced = useRef(false);
  useEffect(() => {
    if (location && !coordsSynced.current) {
      coordsSynced.current = true;
      authAPI.saveCoordinates(location.latitude, location.longitude)
        .then((updated) => setUser((prev: any) => ({ ...prev, ...updated })))
        .catch(() => {});
    }
  }, [location]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleAvailability = async (newValue: boolean) => {
    if (!artisan?.id) return;
    setIsAvailable(newValue);
    setTogglingAvailability(true);
    try {
      await artisanAPI.updateArtisan(artisan.id, { is_available: newValue });
    } catch {
      setIsAvailable(!newValue);
      showToast(t('Failed to update availability.'), { type: 'error' });
    } finally {
      setTogglingAvailability(false);
    }
  };

  // Artisan-side lifecycle: pending→confirmed→in_progress→completed,
  // plus pending/confirmed→cancelled (backend enforces the state machine).
  const updateBookingStatus = async (
    bookingId: number,
    newStatus: 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  ) => {
    try {
      await bookingAPI.updateBooking(bookingId, { status: newStatus });
      await loadData();
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
      await loadData();
    } catch {
      showToast(t('Could not update the booking. Please try again.'), { type: 'error' });
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleDecline = async (bookingId: number) => {
    const ok = await confirm({
      title: t('Decline request'),
      message: t('Are you sure you want to decline this booking request?'),
      confirmLabel: t('Decline'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (ok) {
      updateBookingStatus(bookingId, 'cancelled');
    }
  };

  const handleMarkDone = async (bookingId: number) => {
    const ok = await confirm({
      title: t('Mark job as done'),
      message: t('This completes the booking and adds it to your jobs done. Continue?'),
      confirmLabel: t('Mark done'),
      cancelLabel: t('Not yet'),
    });
    if (ok) {
      updateBookingStatus(bookingId, 'completed');
    }
  };

  const openClientChat = (booking: any) => {
    const clientUser = booking.client_details;
    const recipientId = clientUser?.id ?? booking.client;
    const name = clientUser?.first_name || t('Client');
    if (recipientId) {
      router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId } });
    } else {
      router.push('/chat');
    }
  };

  const getImageUrl = (imgData: any) => {
    if (!imgData) return null;
    let url = typeof imgData === 'string' ? imgData : imgData.url;
    if (!url) return null;
    if (!url.startsWith('http') && url.includes('image/upload')) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
    }
    if (url.startsWith('http:')) {
      return url.replace('http:', 'https:');
    }
    return url;
  };

  // "X km away" between this artisan and a booking's client (both need
  // saved coords; hidden otherwise). Matches the backend's Haversine.
  const kmAway = (clientUser: any): string | null => {
    const lat1 = Number(user?.latitude);
    const lon1 = Number(user?.longitude);
    const lat2 = Number(clientUser?.latitude);
    const lon2 = Number(clientUser?.longitude);
    if ([lat1, lon1, lat2, lon2].some((v) => !v || isNaN(v))) return null;
    const rad = (d: number) => d * (Math.PI / 180);
    const a =
      Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return km < 100 ? km.toFixed(1) : String(Math.round(km));
  };

  const relativeTime = (iso: string) => {
    if (!iso) return '';
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return t('Just now');
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.brand600} />
      </View>
    );
  }

  const getDisplayName = () => {
    if (!user) return 'Artisan';
    if (user.first_name) return user.first_name;
    if (user.name) return user.name;
    return 'Artisan';
  };

  const displayName = getDisplayName();
  const serviceCategory = i18n.language === 'ha' && (artisan?.category_name_ha || user?.category_name_ha)
    ? (artisan?.category_name_ha || user?.category_name_ha)
    : (artisan?.service_category || user?.service_category || 'Service Provider');
  const lgaName = user?.lga_details?.name;

  // ✅ BULLETPROOF RATING: Handle undefined/null/string safely
  const rawRating = artisan?.rating;
  const rating = (rawRating !== undefined && rawRating !== null && !isNaN(Number(rawRating)))
    ? Number(rawRating).toFixed(1)
    : '5.0';

  const profilePicUrl = getImageUrl(user?.profile_picture);

  const newRequests = bookings.filter(b => b.status === 'pending');
  // Accepted or started jobs, soonest scheduled first
  const activeJobs = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'in_progress')
    .sort((a, b) => String(a.scheduled_date || a.date || '').localeCompare(String(b.scheduled_date || b.date || '')));
  // total_bookings = completed jobs (backend counter); fall back to a local count
  const jobsDone = Number(artisan?.total_bookings ?? bookings.filter(b => b.status === 'completed').length);
  const totalReviews = Number(artisan?.total_reviews ?? 0);
  // Jobs completed this month with a recorded cost (price is agreed off-app,
  // so this stays ₦0 until costs are captured).
  const now = new Date();
  const earningsThisMonth = bookings
    .filter(b => {
      if (b.status !== 'completed') return false;
      const d = new Date(b.updated_at || b.created_at || 0);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);
  const earningsLabel = earningsThisMonth >= 1000
    ? `₦${Math.round(earningsThisMonth / 1000)}k`
    : `₦${earningsThisMonth.toLocaleString()}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER (brand900, flat) */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.push('/artisan/profile')} accessibilityRole="button">
              <Avatar name={displayName} uri={profilePicUrl} gender={user?.gender} size={46} />
            </TouchableOpacity>

            <View style={styles.headerText}>
              {/* "greeting" is the same i18n key Home/Welcome already use
                  ("Welcome" / Hausa "Barka da zuwa") — was hardcoded Hausa
                  "Sannu" here before, ignoring the EN/HA toggle entirely.
                  displayName itself was already dynamic (getDisplayName()
                  above), never a fixed example name. */}
              <Text style={styles.nameLabel} numberOfLines={1}>{t('greeting')} {displayName}</Text>
              <Text style={styles.tradeLabel} numberOfLines={1}>
                {serviceCategory}{lgaName ? ` · ${lgaName}` : ''}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Notifications')}>
                <MaterialIcons name="notifications" size={19} color="#FFF" />
              </Pressable>
              {/* Which language incoming chat messages get auto-translated
                  into — separate from the app's own interface language. */}
              <LanguagePickerChip variant="dark" />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 2. AVAILABILITY CARD — overlaps the header */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.dot, { backgroundColor: isAvailable ? color.online : color.ink300 }]} />
              <Text style={styles.statusTitle}>
                {isAvailable ? t("Available for jobs") : t("Currently offline")}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleAvailability(!isAvailable)}
              disabled={togglingAvailability}
              accessibilityRole="switch"
              accessibilityState={{ checked: isAvailable }}
              style={[styles.toggleTrack, { backgroundColor: isAvailable ? color.online : color.border }]}
            >
              <View style={[styles.toggleThumb, { left: isAvailable ? 23 : 3 }]} />
            </Pressable>
          </View>
          <Text style={styles.statusSubtitle}>
            {isAvailable
              ? t("You are visible to clients in search results.")
              : t("Switch on when you are ready to take new jobs.")}
          </Text>
        </View>

        <EmailVerificationBanner />

        {/* 3. STATS GRID */}
        <View style={styles.grid}>
          <StatTile icon="account-balance-wallet" value={earningsLabel} label={t('This month')} tileBg={color.brand100} tileFg={color.brand600} />
          <StatTile icon="work" value={jobsDone} label={t('Jobs done')} tileBg={color.accent100} tileFg={color.accent600} />
          <StatTile icon="star" value={rating} label={`${totalReviews} ${t('reviews')}`} tileBg={color.warn100} tileFg={color.star} />
        </View>

        {/* 4. VERIFICATION ALERT */}
        {artisan?.verification_status && artisan?.verification_status !== 'approved' && (
          <View style={styles.alertBox}>
            <MaterialIcons name="error-outline" size={22} color={color.warn600} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{t('Verification Pending')}</Text>
              <Text style={styles.alertText}>
                {t('Visit an agent in your LGA to verify your account and start receiving more jobs.')}
              </Text>
            </View>
          </View>
        )}

        {/* 5. NEW REQUESTS */}
        {newRequests.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('New requests')}</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{newRequests.length} {t('new')}</Text>
              </View>
            </View>
            <View style={styles.requestsList}>
              {newRequests.map((req, i) => {
                const client = req.client_details || req.client || {};
                const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || t('Client');
                const km = kmAway(client);
                const metaParts = [req.location, km ? `${km} ${t('km away')}` : null].filter(Boolean);
                return (
                  <View key={req.id ?? i} style={[styles.requestCard, i > 0 && { marginTop: space.md }]}>
                    <View style={styles.requestHead}>
                      <Avatar name={clientName} uri={getImageUrl(client.profile_picture)} gender={client.gender} size={44} />
                      <View style={styles.requestHeadText}>
                        <Text style={styles.requestName} numberOfLines={1}>{clientName}</Text>
                        {metaParts.length > 0 ? (
                          <Text style={styles.requestMeta} numberOfLines={1}>{metaParts.join(' · ')}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.requestAgo}>{relativeTime(req.created_at)}</Text>
                    </View>
                    {req.description ? (
                      <View style={styles.requestInset}>
                        <Text style={styles.requestDesc} numberOfLines={3}>{req.description}</Text>
                      </View>
                    ) : null}
                    <View style={styles.requestFooter}>
                      <View style={styles.whenRow}>
                        <MaterialIcons name="event" size={16} color={color.ink400} />
                        <Text style={styles.requestDate} numberOfLines={1}>
                          {req.date}{req.time ? ` · ${req.time}` : ''}
                        </Text>
                      </View>
                      <View style={styles.requestActions}>
                        <Pressable
                          onPress={() => handleDecline(req.id)}
                          style={styles.declinePill}
                          accessibilityRole="button"
                        >
                          <Text style={styles.declineText}>{t('Decline')}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => updateBookingStatus(req.id, 'confirmed')}
                          style={styles.acceptPill}
                          accessibilityRole="button"
                        >
                          <Text style={styles.acceptText}>{t('Accept')}</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* 6. ACTIVE JOBS — accepted or started; drives the job lifecycle */}
        {activeJobs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('Active jobs')}</Text>
            <View style={styles.requestsList}>
              {activeJobs.map((job, i) => {
                const client = job.client_details || {};
                const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || t('Client');
                const inProgress = job.status === 'in_progress';
                return (
                  <View key={job.id ?? i} style={[styles.requestCard, i > 0 && { marginTop: space.md }]}>
                    <View style={styles.requestHead}>
                      <Avatar name={clientName} uri={getImageUrl(client.profile_picture)} gender={client.gender} size={44} />
                      <View style={styles.requestHeadText}>
                        <Text style={styles.requestName} numberOfLines={1}>{clientName}</Text>
                        {job.location ? (
                          <Text style={styles.requestMeta} numberOfLines={1}>{job.location}</Text>
                        ) : null}
                      </View>
                      <Badge
                        label={inProgress ? t('In progress') : t('Accepted')}
                        status="confirmed"
                      />
                    </View>
                    {job.description ? (
                      <View style={styles.requestInset}>
                        <Text style={styles.requestDesc} numberOfLines={2}>{job.description}</Text>
                      </View>
                    ) : null}
                    <View style={styles.requestFooter}>
                      <View style={styles.whenRow}>
                        <MaterialIcons name="event" size={16} color={color.ink400} />
                        <Text style={styles.requestDate} numberOfLines={1}>
                          {job.date}{job.time ? ` · ${job.time}` : ''}
                        </Text>
                      </View>
                      <View style={styles.requestActions}>
                        <Pressable
                          onPress={() => openClientChat(job)}
                          style={styles.chatPill}
                          accessibilityRole="button"
                        >
                          <Text style={styles.chatPillText}>{t('Chat')}</Text>
                        </Pressable>
                        {inProgress ? (
                          <Pressable
                            onPress={() => handleMarkDone(job.id)}
                            style={styles.tonalPill}
                            accessibilityRole="button"
                          >
                            <Text style={styles.tonalPillText}>{t('Mark done')}</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => updateBookingStatus(job.id, 'in_progress')}
                            style={styles.tonalPill}
                            accessibilityRole="button"
                          >
                            <Text style={styles.tonalPillText}>{t('Start job')}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Bottom clearance for the floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: color.brand900,
    paddingBottom: 56,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  headerText: { flex: 1, marginLeft: space.md },
  headerActions: { alignItems: 'center', gap: 6 },
  nameLabel: { fontFamily: font.extrabold, fontSize: 17, letterSpacing: -0.17, color: '#FFF' },
  tradeLabel: { fontFamily: font.bold, fontSize: 12, color: '#B9CBE6', marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Availability card overlaps the header (zIndex above it).
  scrollContent: { paddingHorizontal: space.xl, paddingTop: space.lg },
  statusCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.lg,
    zIndex: 2,
    ...shadow.e2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 9 },
  statusTitle: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
  statusSubtitle: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, lineHeight: 18, marginTop: 3 },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  // Grid
  grid: { flexDirection: 'row', gap: space.md, marginBottom: space.xl },

  // Alert
  alertBox: {
    backgroundColor: color.warn100,
    padding: space.lg,
    borderRadius: radius.lg,
    marginBottom: space.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    borderWidth: 1,
    borderColor: '#F5E4B8',
  },
  alertTitle: { fontFamily: font.extrabold, fontSize: 13.5, color: color.warn600, marginBottom: 2 },
  alertText: { fontFamily: font.bold, fontSize: 12.5, color: color.warn600, lineHeight: 18 },

  // Requests
  sectionTitle: { ...type.heading, marginBottom: space.md },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  countPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: color.brand100,
  },
  countPillText: { fontFamily: font.extrabold, fontSize: 11, color: color.brand600 },
  requestsList: { marginBottom: space.xl },
  requestCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    ...shadow.e2,
  },
  requestHead: { flexDirection: 'row', alignItems: 'center' },
  requestHeadText: { flex: 1, marginLeft: space.md, minWidth: 0 },
  requestName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
  requestMeta: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 2 },
  requestAgo: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginLeft: space.sm },
  requestInset: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginTop: 11,
  },
  requestDesc: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: color.ink600 },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
  },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  requestDate: { fontFamily: font.bold, fontSize: 12.5, color: color.ink900, flexShrink: 1 },
  requestActions: { flexDirection: 'row', gap: space.sm },
  declinePill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: { fontFamily: font.extrabold, fontSize: 12, color: color.ink400 },
  acceptPill: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    backgroundColor: color.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  acceptText: { fontFamily: font.extrabold, fontSize: 12, color: '#FFF' },
  chatPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: '#DCE3EE',
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPillText: { fontFamily: font.extrabold, fontSize: 12, color: color.ink900 },
  tonalPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tonalPillText: { fontFamily: font.extrabold, fontSize: 12, color: color.brand600 },

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
});
