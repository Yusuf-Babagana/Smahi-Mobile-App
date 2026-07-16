import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Linking, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { bookingAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, BookingTimeline } from '@/src/components/ui';

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

function badgeStatus(status: string): 'pending' | 'confirmed' | 'cancelled' | 'verified' {
  if (status === 'completed') return 'verified';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'pending') return 'pending';
  return 'confirmed';
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await bookingAPI.getBookingById(id);
      setBooking(data);
    } catch (err) {
      console.log('BOOKING DETAIL ERROR:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCancel = () => {
    Alert.alert(
      t('Cancel booking'),
      t('Are you sure you want to cancel this booking?'),
      [
        { text: t('No'), style: 'cancel' },
        {
          text: t('Yes, cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingAPI.updateBooking(Number(id), { status: 'cancelled' });
              load();
            } catch {
              Alert.alert(t('Error'), t('Failed to cancel booking.'));
            }
          },
        },
      ],
    );
  };

  const openChat = () => {
    const artisanUser = booking?.artisan_details;
    const recipientId = artisanUser?.id ?? booking?.artisan;
    const name = artisanUser?.first_name || t('Artisan');
    if (recipientId) {
      router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId } });
    }
  };

  const callArtisan = () => {
    const phone = booking?.artisan_details?.phone_number || booking?.artisan?.phone_number;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const viewArtisanProfile = () => {
    const profileId = booking?.artisan_profile_id ?? booking?.artisan?.id ?? booking?.artisan;
    if (profileId) router.push(`/artisan/${profileId}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.brand600} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>{t('Booking not found.')}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>{t('Go Back')}</Text>
        </Pressable>
      </View>
    );
  }

  const artisanObj = booking.artisan_details || booking.artisan || {};
  const artisanUser = artisanObj.user_details || artisanObj.user || artisanObj;
  const name = `${artisanUser.first_name || ''} ${artisanUser.last_name || ''}`.trim() || t('Artisan');
  const job = booking.description || booking.job_title || t('Service booking');
  const ref = booking.reference || booking.ref || `#${booking.id}`;
  const isActive = ['pending', 'confirmed', 'accepted', 'in_progress'].includes(booking.status);
  const isCancelled = booking.status === 'cancelled';
  const dateLabel = booking.date
    ? `${booking.date}${booking.time ? ` · ${booking.time}` : ''}`
    : (booking.created_at || '').slice(0, 10);
  const address = booking.location || booking.address || null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
              <MaterialIcons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{t('Booking details')}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status badge + reference */}
        <View style={styles.statusRow}>
          <Badge label={t(booking.status || 'pending')} status={badgeStatus(booking.status)} />
          <Text style={styles.refText}>{ref}</Text>
        </View>

        {/* Timeline */}
        {isActive && (
          <View style={styles.card}>
            <BookingTimeline
              currentStep={timelineStep(booking.status)}
              steps={[t('Requested'), t('Accepted'), t('In progress'), t('Done')]}
              style={styles.timeline}
            />
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <MaterialIcons name="cancel" size={18} color={color.danger600} />
            <Text style={styles.cancelledText}>{t('This booking has been cancelled.')}</Text>
          </View>
        )}

        {/* Artisan card */}
        <Pressable style={styles.card} onPress={viewArtisanProfile} accessibilityRole="button">
          <View style={styles.artisanRow}>
            <Avatar name={name} uri={artisanUser.profile_picture} size={52} borderRadius={14} />
            <View style={styles.artisanInfo}>
              <Text style={styles.artisanName} numberOfLines={1}>{name}</Text>
              <Text style={styles.artisanTrade} numberOfLines={1}>
                {artisanObj.profession_name || artisanObj.category_name || t('Artisan')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={color.ink300} />
          </View>
        </Pressable>

        {/* Booking details card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('Booking details')}</Text>

          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={18} color={color.ink400} />
            <Text style={styles.detailText}>{dateLabel}</Text>
          </View>

          {address && (
            <View style={styles.detailRow}>
              <MaterialIcons name="place" size={18} color={color.ink400} />
              <Text style={styles.detailText}>{address}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialIcons name="description" size={18} color={color.ink400} />
            <Text style={styles.detailText}>{job}</Text>
          </View>
        </View>

        {/* Cancellation reason if present */}
        {isCancelled && booking.cancellation_reason && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('Cancellation reason')}</Text>
            <Text style={styles.reasonText}>{booking.cancellation_reason}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer actions */}
      {isActive && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Pressable onPress={openChat} style={styles.footerBtnSecondary} accessibilityRole="button">
            <MaterialIcons name="chat-bubble-outline" size={20} color={color.brand600} />
            <Text style={styles.footerBtnSecondaryText}>{t('Chat')}</Text>
          </Pressable>
          <Pressable onPress={callArtisan} style={styles.footerBtnSecondary} accessibilityRole="button">
            <MaterialIcons name="call" size={20} color={color.brand600} />
            <Text style={styles.footerBtnSecondaryText}>{t('Call')}</Text>
          </Pressable>
          <Pressable onPress={handleCancel} style={styles.footerBtnDanger} accessibilityRole="button">
            <Text style={styles.footerBtnDangerText}>{t('Cancel')}</Text>
          </Pressable>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },

  header: {
    backgroundColor: color.brand900,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 17, color: '#FFF' },

  scroll: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: 120 },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  refText: { fontFamily: font.bold, fontSize: 12.5, color: color.ink300 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
    marginBottom: space.md,
  },

  timeline: { alignItems: 'center' },

  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#FDECEC',
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  cancelledText: { fontFamily: font.bold, fontSize: 13, color: color.danger600, flex: 1 },

  artisanRow: { flexDirection: 'row', alignItems: 'center' },
  artisanInfo: { flex: 1, marginHorizontal: space.md },
  artisanName: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
  artisanTrade: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, marginTop: 2 },

  sectionTitle: { ...type.heading, marginBottom: space.md },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: space.md,
  },
  detailText: { fontFamily: font.bold, fontSize: 14, color: color.ink600, flex: 1, lineHeight: 21 },

  reasonText: { ...type.body },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: color.surface,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    flexDirection: 'row',
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  footerBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: color.brand100,
    backgroundColor: color.brand100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerBtnSecondaryText: { fontFamily: font.extrabold, fontSize: 13.5, color: color.brand600 },
  footerBtnDanger: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnDangerText: { fontFamily: font.extrabold, fontSize: 13.5, color: color.danger600 },

  notFoundText: { fontFamily: font.bold, fontSize: 15, color: color.ink400 },
  backLink: { marginTop: space.lg, fontFamily: font.extrabold, color: color.brand600 },
});
