import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  RefreshControl, Alert, ActivityIndicator, StatusBar, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

// API & UTILS
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, StatTile } from '@/src/components/ui';

export default function ArtisanDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // STATE
  const [user, setUser] = useState<any>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

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
      Alert.alert(t('Error'), t('Failed to update availability.'));
    } finally {
      setTogglingAvailability(false);
    }
  };

  const respondToRequest = async (bookingId: number, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await bookingAPI.updateBooking(bookingId, { status: newStatus });
      await loadData();
    } catch (error) {
      console.log('Booking update error:', error);
      Alert.alert(t('Error'), t('Could not update the booking. Please try again.'));
    }
  };

  const handleDecline = (bookingId: number) => {
    Alert.alert(
      t('Decline request'),
      t('Are you sure you want to decline this booking request?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Decline'),
          style: 'destructive',
          onPress: () => respondToRequest(bookingId, 'cancelled'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(t("Logout"), t("Are you sure?"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Logout"),
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        }
      }
    ]);
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

  const jobCount = bookings.length;
  const earnings = "₦0.00";
  const profilePicUrl = getImageUrl(user?.profile_picture);

  const newRequests = bookings.filter(b => b.status === 'pending');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER (brand900, flat) */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.push('/artisan/profile')} accessibilityRole="button">
              <Avatar name={displayName} uri={profilePicUrl} size={52} borderRadius={18} />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.nameLabel} numberOfLines={1}>Sannu, {displayName}</Text>
              <Text style={styles.tradeLabel} numberOfLines={1}>
                {serviceCategory}{lgaName ? ` · ${lgaName}` : ''}
              </Text>
            </View>

            <Pressable onPress={handleLogout} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={t('Logout')}>
              <MaterialIcons name="logout" size={18} color="#FFF" />
            </Pressable>
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
                {isAvailable ? t("Available for Jobs") : t("Currently Offline")}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: color.border, true: color.online }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={color.border}
              disabled={togglingAvailability}
            />
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
          <StatTile icon="account-balance-wallet" value={earnings} label={t('Earnings')} tileBg={color.brand100} tileFg={color.brand600} />
          <StatTile icon="work-outline" value={jobCount} label={t('Jobs')} tileBg={color.accent100} tileFg={color.accent600} />
          <StatTile icon="star" value={rating} label={t('Rating')} tileBg={color.warn100} tileFg={color.warn600} />
        </View>

        {/* 4. VERIFICATION ALERT */}
        {artisan?.verificationStatus && artisan?.verificationStatus !== 'approved' && (
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
            <Text style={styles.sectionTitle}>{t('New requests')}</Text>
            <View style={styles.requestsList}>
              {newRequests.map((req, i) => {
                const client = req.client_details || req.client || {};
                const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || t('Client');
                return (
                  <View key={req.id ?? i} style={[styles.requestCard, i > 0 && { marginTop: space.md }]}>
                    <View style={styles.requestHead}>
                      <Avatar name={clientName} uri={getImageUrl(client.profile_picture)} size={40} />
                      <View style={styles.requestHeadText}>
                        <Text style={styles.requestName} numberOfLines={1}>{clientName}</Text>
                        <Text style={styles.requestMeta}>
                          {req.location ? `${req.location} · ` : ''}{relativeTime(req.created_at)}
                        </Text>
                      </View>
                    </View>
                    {req.description ? (
                      <View style={styles.requestInset}>
                        <Text style={styles.requestDesc} numberOfLines={3}>{req.description}</Text>
                      </View>
                    ) : null}
                    <View style={styles.requestFooter}>
                      <Text style={styles.requestDate}>
                        {req.date}{req.time ? ` · ${req.time}` : ''}
                      </Text>
                      <View style={styles.requestActions}>
                        <Pressable
                          onPress={() => handleDecline(req.id)}
                          style={styles.declinePill}
                          accessibilityRole="button"
                        >
                          <Text style={styles.declineText}>{t('Decline')}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => respondToRequest(req.id, 'confirmed')}
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

        {/* 6. QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>{t('Quick Actions')}</Text>

        <View style={styles.actionList}>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/chat')}
          >
            <View style={[styles.actionIcon, { backgroundColor: color.accent100 }]}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={color.accent600} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>{t('Messages')}</Text>
              <Text style={styles.actionSubtitle}>{t('Chat with your clients')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/artisan/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: color.brand100 }]}>
              <MaterialIcons name="person-outline" size={20} color={color.brand600} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>{t('Edit Profile')}</Text>
              <Text style={styles.actionSubtitle}>{t('Update your information')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/artisan/portfolio')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F0EAFD' }]}>
              <MaterialIcons name="collections" size={20} color="#6D4AC9" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>{t('My Portfolio')}</Text>
              <Text style={styles.actionSubtitle}>{t('Showcase your work')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => Alert.alert(t("Coming Soon"))}
          >
            <View style={[styles.actionIcon, { backgroundColor: color.warn100 }]}>
              <MaterialIcons name="settings" size={20} color={color.warn600} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>{t('Settings')}</Text>
              <Text style={styles.actionSubtitle}>{t('App preferences')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  nameLabel: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.19, color: '#FFF' },
  tradeLabel: { fontFamily: font.bold, fontSize: 12.5, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // Availability card overlaps the header (zIndex above it).
  scrollContent: { paddingHorizontal: space.xl, marginTop: -40 },
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
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusTitle: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
  statusSubtitle: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, lineHeight: 18 },

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
  requestsList: { marginBottom: space.xl },
  requestCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
  },
  requestHead: { flexDirection: 'row', alignItems: 'center' },
  requestHeadText: { flex: 1, marginLeft: space.md },
  requestName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
  requestMeta: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
  requestInset: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md,
  },
  requestDesc: { fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: color.ink600 },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
  },
  requestDate: { fontFamily: font.bold, fontSize: 12, color: color.ink400, flexShrink: 1 },
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
  declineText: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink600 },
  acceptPill: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    backgroundColor: color.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  acceptText: { fontFamily: font.extrabold, fontSize: 12.5, color: '#FFF' },

  // Actions
  actionList: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
  },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 70 },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.lg,
  },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900, marginBottom: 2 },
  actionSubtitle: { fontFamily: font.bold, fontSize: 12, color: color.ink300 },
});
