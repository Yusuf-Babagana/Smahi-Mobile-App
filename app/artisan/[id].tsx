import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Linking, Pressable, ScrollView, Share,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { artisanAPI, favoriteAPI } from '@/src/api/client';
import { useLocation } from '@/src/contexts/LocationContext';
import { openDirections } from '@/src/utils/directions';
import { BACKEND_URL } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, Chip, useToast } from '@/src/components/ui';

// --- Helper: Local Distance Calculation (Haversine) ---
const calculateLocalDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
  const lat1n = parseFloat(lat1), lon1n = parseFloat(lon1), lat2n = parseFloat(lat2), lon2n = parseFloat(lon2);
  if (isNaN(lat1n) || isNaN(lon1n) || isNaN(lat2n) || isNaN(lon2n)) return null;
  try {
    const R = 6371; // Earth radius in km
    const dLat = (lat2n - lat1n) * (Math.PI / 180);
    const dLon = (lon2n - lon1n) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1n * (Math.PI / 180)) * Math.cos(lat2n * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist.toFixed(1);
  } catch (e) {
    return null;
  }
};

const resolveMediaUrl = (raw: any): string | null => {
  const url = typeof raw === 'string' ? raw : raw?.image || raw?.url || raw?.photo || null;
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
};

// Rounds up to the nearest "friendly" bucket rather than showing an exact
// average (e.g. "responds within 47 min" reads oddly precise for a stat
// that shifts with every new booking).
function formatResponseTime(minutes: number | null | undefined): string | null {
  if (minutes == null) return null;
  if (minutes <= 15) return 'within 15 min';
  if (minutes <= 30) return 'within 30 min';
  if (minutes <= 60) return 'within an hour';
  if (minutes <= 180) return 'within 3 hours';
  if (minutes <= 720) return 'within 12 hours';
  return 'within a day';
}

export default function ArtisanProfileRoom() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { location } = useLocation();
  const { show: showToast } = useToast();

  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const data = await artisanAPI.getArtisanById(id as string);
        setArtisan(data);
        setFavorited(!!data.is_favorited);
      } catch (error) {
        console.error("Failed to load profile.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const fetchReviews = async () => {
      try {
        const data = await artisanAPI.getArtisanReviews(id as string);
        setReviews(data.results || data || []);
      } catch (error) {
        console.log("Failed to load reviews.", error);
      }
    };
    fetchReviews();
  }, [id]);

  const handleCall = () => {
    const phone = artisan?.user_details?.phone_number || artisan?.user?.phone_number;
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = () => {
    const fName = artisan?.user_details?.first_name || artisan?.user?.first_name || "Artisan";
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: 'new',
        name: fName,
        recipientId: artisan?.user?.id || artisan?.user
      }
    });
  };

  const handleShare = async () => {
    const fName = artisan?.user_details?.first_name || artisan?.user?.first_name || 'an artisan';
    try {
      await Share.share({ message: `Check out ${fName} on S-MAHII marketplace.` });
    } catch {}
  };

  const handleBook = () => {
    router.push({ pathname: '/booking/[artisanId]', params: { artisanId: String(id) } });
  };

  // "Route idan an buƙata" — deep-links to the native maps app rather than
  // drawing an in-app route (see src/utils/directions.ts).
  const handleGetDirections = () => {
    if (artisanLat != null && artisanLon != null && !isNaN(parseFloat(artisanLat)) && !isNaN(parseFloat(artisanLon))) {
      openDirections(parseFloat(artisanLat), parseFloat(artisanLon));
    } else {
      showToast(t("This artisan's location isn't available yet."), { type: 'info' });
    }
  };

  const handleToggleFavorite = async () => {
    if (togglingFavorite) return;
    const previous = favorited;
    setFavorited(!previous);
    setTogglingFavorite(true);
    try {
      const result = await favoriteAPI.toggle(id as string);
      setFavorited(result.favorited);
    } catch (error) {
      console.log('Toggle favorite error:', error);
      setFavorited(previous);
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={color.brand600} />
    </View>
  );

  if (!artisan) return (
    <View style={styles.center}>
      <Text style={styles.notFoundText}>{t('Artisan not found.')}</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>{t('Go Back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const firstName = artisan?.user_details?.first_name || artisan?.user?.first_name || "Unknown";
  const lastName = artisan?.user_details?.last_name || artisan?.user?.last_name || "";
  const displayName = `${firstName} ${lastName}`.trim();
  const phoneNumber = artisan?.user_details?.phone_number || artisan?.user?.phone_number;

  const stateName = artisan?.user_details?.state_details?.name || artisan?.user?.state_details?.name || "Unknown State";
  const lgaName = artisan?.user_details?.lga_details?.name || artisan?.user?.lga_details?.name || "Unknown LGA";
  const countryName = artisan?.user_details?.country_details?.name || artisan?.user?.country_details?.name || "Unknown Country";
  const fullLocation = `${lgaName}, ${stateName}, ${countryName}`;

  const professionName = i18n.language === 'ha' && artisan?.category_name_ha
    ? artisan.category_name_ha
    : (artisan?.profession_name || "Artisan");

  const artisanLat = artisan?.user_details?.latitude ?? artisan?.user?.latitude;
  const artisanLon = artisan?.user_details?.longitude ?? artisan?.user?.longitude;
  const distance = calculateLocalDistance(location?.latitude, location?.longitude, artisanLat, artisanLon);

  const rawPic = artisan?.user_details?.profile_picture || artisan?.user?.profile_picture || artisan.profile_picture;
  const profilePic = rawPic
    ? (rawPic.startsWith('http') ? rawPic : `${BACKEND_URL}${rawPic}`)
    : null;

  const isVerified = artisan.is_verified || artisan?.user_details?.is_verified ||
    artisan.verification_status === 'approved';

  // Skills can arrive as an array or a comma-separated string.
  const skills: string[] = Array.isArray(artisan.skills)
    ? artisan.skills
    : typeof artisan.skills === 'string' && artisan.skills.length > 0
      ? artisan.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  // Work gallery — backend may expose portfolio items under different keys.
  const gallery: string[] = (artisan.portfolio || artisan.portfolio_images || artisan.work_photos || [])
    .map(resolveMediaUrl)
    .filter(Boolean) as string[];

  const priceFrom = artisan.call_out_fee ?? artisan.price_from ?? artisan.hourly_rate ?? null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Cover */}
        <View style={styles.cover}>
          <LinearGradient
            colors={[color.brand900, color.brand600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView edges={['top']} style={styles.nav}>
            <Pressable onPress={() => router.back()} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
              <MaterialIcons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={handleToggleFavorite}
                style={styles.navBtn}
                accessibilityRole="button"
                accessibilityLabel={favorited ? t('Remove from favorites') : t('Save to favorites')}
              >
                <MaterialIcons name={favorited ? 'favorite' : 'favorite-outline'} size={20} color={favorited ? '#FF6B6B' : '#FFF'} />
              </Pressable>
              <Pressable onPress={handleShare} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('Share')}>
                <MaterialIcons name="share" size={20} color="#FFF" />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        {/* Overlapping head card */}
        <View style={styles.headCard}>
          <View style={styles.headTop}>
            <Avatar name={displayName} uri={profilePic} gender={artisan?.user_details?.gender || artisan?.user?.gender} size={72} borderRadius={22} verified={isVerified} online={!!artisan.is_online} />
            <View style={styles.headInfo}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.trade} numberOfLines={1}>{professionName}</Text>
              <View style={styles.headBadges}>
                {isVerified && (
                  <Badge label={t('ID verified')} status="verified" icon="verified" />
                )}
                {artisan.is_online && (
                  <Badge label={t('Online now')} bg={color.accent100} fg="#0F766E" icon="circle" />
                )}
                {distance && (
                  <Badge label={`${distance} ${t('km away')}`} bg={color.brand100} fg={color.brand600} icon="near-me" />
                )}
              </View>
              {formatResponseTime(artisan.avg_response_minutes) && (
                <View style={styles.responseRow}>
                  <MaterialIcons name="bolt" size={13} color={color.ink400} />
                  <Text style={styles.responseText}>
                    {t('Usually responds {{time}}', { time: t(formatResponseTime(artisan.avg_response_minutes)!) })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <View style={styles.statValueRow}>
                <MaterialIcons name="star" size={14} color={color.star} />
                <Text style={styles.statVal}>{artisan.total_reviews ? artisan.rating : t('New')}</Text>
              </View>
              <Text style={styles.statLabel}>
                {(artisan.total_reviews || reviews.length || 0)} {t('reviews')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{artisan.total_bookings || '0'}</Text>
              <Text style={styles.statLabel}>{t('Jobs done')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{artisan.experience_years || '1'}+</Text>
              <Text style={styles.statLabel}>{t('Years exp.')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* About */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('About')}</Text>
            <Text style={styles.bio}>
              {artisan.bio || t('I am a skilled {{trade}} dedicated to providing high-quality service to all my clients.', {
                trade: artisan.category_name || 'artisan',
                defaultValue: `I am a skilled ${artisan.category_name || 'artisan'} dedicated to providing high-quality service to all my clients.`,
              })}
            </Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="place" size={18} color={color.ink400} />
              <Text style={styles.infoText}>{fullLocation}</Text>
            </View>
            {phoneNumber ? (
              <Pressable onPress={handleCall} style={styles.infoRow} accessibilityRole="button" accessibilityLabel={t('Call')}>
                <MaterialIcons name="call" size={18} color={color.ink400} />
                <Text style={[styles.infoText, styles.infoLink]}>{phoneNumber}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('Skills')}</Text>
              <View style={styles.skillsWrap}>
                {skills.map((skill) => (
                  <Chip key={skill} label={skill} subcategory />
                ))}
              </View>
            </View>
          )}

          {/* Work gallery */}
          {gallery.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('Work gallery')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                {gallery.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.galleryImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('Reviews')}</Text>
              {reviews.map((review, i) => {
                const reviewer = review.client_first_name || review.client_name || review.user_name || review.client?.first_name || t('Client');
                return (
                  <View key={review.id ?? i} style={[styles.reviewRow, i > 0 && styles.reviewDivider]}>
                    <Avatar name={String(reviewer)} size={36} />
                    <View style={styles.reviewBody}>
                      <View style={styles.reviewHead}>
                        <Text style={styles.reviewName} numberOfLines={1}>{reviewer}</Text>
                        <View style={styles.reviewStars}>
                          <MaterialIcons name="star" size={13} color={color.star} />
                          <Text style={styles.reviewRating}>{review.rating ?? '5.0'}</Text>
                        </View>
                      </View>
                      {review.comment ? <Text style={styles.reviewText}>{review.comment}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          style={styles.chatBtn}
          onPress={handleGetDirections}
          accessibilityRole="button"
          accessibilityLabel={t('Get directions')}
        >
          <MaterialIcons name="directions" size={22} color={color.brand600} />
        </Pressable>
        <Pressable
          style={styles.chatBtn}
          onPress={handleMessage}
          accessibilityRole="button"
          accessibilityLabel={t('Message')}
        >
          <MaterialIcons name="chat-bubble-outline" size={22} color={color.brand600} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.9 }]}
          onPress={handleBook}
          accessibilityRole="button"
          accessibilityLabel={t('Book now')}
        >
          <Text style={styles.bookBtnText}>
            {t('Book now')}
            {priceFrom != null ? `  ·  ${t('from')} ₦${Number(priceFrom).toLocaleString()}` : ''}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },
  scroll: { paddingBottom: 120 },

  cover: { height: 180 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Head card overlaps the cover — zIndex keeps it above the gradient.
  headCard: {
    marginTop: -56,
    marginHorizontal: space.xl,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    zIndex: 2,
    ...shadow.e2,
  },
  headTop: { flexDirection: 'row', alignItems: 'center' },
  headInfo: { flex: 1, marginLeft: space.md },
  name: { ...type.titleMd },
  trade: { fontFamily: font.bold, fontSize: 13, color: color.ink400, marginTop: 2 },
  headBadges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  responseRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  responseText: { fontFamily: font.bold, fontSize: 12, color: color.ink400 },

  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.lg,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.lg,
    paddingVertical: space.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statVal: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  statLabel: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: color.border },

  body: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
  },
  sectionTitle: { ...type.heading, marginBottom: space.md },
  bio: { ...type.body, marginBottom: space.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space.sm },
  infoText: { fontFamily: font.bold, fontSize: 13.5, color: color.ink600, flexShrink: 1 },
  infoLink: { color: color.brand600 },

  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  galleryScroll: { gap: space.md },
  galleryImage: {
    width: 140,
    height: 110,
    borderRadius: radius.md,
    backgroundColor: color.surfaceChip,
  },

  reviewRow: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  reviewDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  reviewBody: { flex: 1 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900, flexShrink: 1 },
  reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewRating: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink900 },
  reviewText: { ...type.body, fontSize: 13, lineHeight: 20, marginTop: 4 },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: color.surface,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    flexDirection: 'row',
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  chatBtn: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: color.brand100,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    flex: 1,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: color.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  bookBtnText: { fontFamily: font.extrabold, fontSize: 15.5, color: '#FFF' },

  notFoundText: { fontFamily: font.bold, fontSize: 15, color: color.ink400 },
  backLink: { marginTop: space.lg },
  backLinkText: { fontFamily: font.extrabold, color: color.brand600 },
});
