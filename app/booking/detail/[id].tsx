import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { bookingAPI, reviewAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, BookingTimeline, Button } from '@/src/components/ui';

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
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const submitReview = async () => {
    if (reviewRating < 1) {
      Alert.alert(t('Choose a rating'), t('Tap a star to rate this job before submitting.'));
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewAPI.submitReview(Number(id), reviewRating, reviewComment.trim());
      setReviewModalVisible(false);
      setReviewRating(0);
      setReviewComment('');
      await load();
      Alert.alert(t('Thank you!'), t('Your review has been submitted.'));
    } catch (err: any) {
      // ReviewViewSet raises a bare-string ValidationError, which DRF
      // serializes as a plain JSON array (["message"]), not {detail: ...}.
      const data = err?.response?.data;
      const message = (Array.isArray(data) && data[0])
        || data?.non_field_errors?.[0]
        || data?.detail
        || t('Failed to submit your review. Please try again.');
      Alert.alert(t('Error'), message);
    } finally {
      setSubmittingReview(false);
    }
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

        {/* Rate this job — only the client, only once, only after completion */}
        {booking.status === 'completed' && user?.role === 'client' && (
          <View style={styles.card}>
            {booking.has_review ? (
              <View style={styles.reviewDoneRow}>
                <MaterialIcons name="check-circle" size={20} color={color.accent600} />
                <Text style={styles.reviewDoneText}>{t("You've already reviewed this job.")}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>{t('How did it go?')}</Text>
                <Text style={styles.reasonText}>{t('Let other clients know what to expect from this artisan.')}</Text>
                <Button
                  title={t('Rate this job')}
                  variant="secondary"
                  icon="star-outline"
                  onPress={() => setReviewModalVisible(true)}
                  style={{ marginTop: space.md }}
                />
              </>
            )}
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

      {/* Rate this job modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{t('Rate this job')}</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setReviewRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={t('{{star}} stars', { star })}
                  hitSlop={6}
                >
                  <MaterialIcons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= reviewRating ? '#F5A623' : color.ink300}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder={t('Optional: share a few words about the job (e.g. quality, punctuality)')}
              placeholderTextColor={color.ink300}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Button
                title={t('Cancel')}
                variant="secondary"
                onPress={() => setReviewModalVisible(false)}
                disabled={submittingReview}
                style={{ flex: 1 }}
              />
              <Button
                title={t('Submit')}
                onPress={submitReview}
                loading={submittingReview}
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

  reviewDoneRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  reviewDoneText: { fontFamily: font.bold, fontSize: 13.5, color: color.ink600, flex: 1 },

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
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.md,
    marginVertical: space.lg,
  },
  reviewInput: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.md,
    minHeight: 90,
    fontFamily: font.medium,
    fontSize: 14,
    color: color.ink900,
    marginBottom: space.lg,
  },
  modalActions: { flexDirection: 'row', gap: space.sm },
});
