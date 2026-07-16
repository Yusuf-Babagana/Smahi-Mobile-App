import React from 'react';
import { Pressable, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { BACKEND_URL } from '@/src/constants/env';
import { Avatar } from './Avatar';

interface ArtisanCardProps {
  artisan: any;
  /** Whole card press → artisan profile. */
  onPress: () => void;
  /** Book pill press (separate target from the card). Hidden when omitted. */
  onBook?: () => void;
  formattedLocation?: string;
  style?: StyleProp<ViewStyle>;
}

function optimizedPhoto(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  let finalUrl = url;
  if (finalUrl.startsWith('/')) finalUrl = `${BACKEND_URL}${finalUrl}`;
  if (finalUrl.includes('res.cloudinary.com')) {
    if (finalUrl.startsWith('http:')) finalUrl = finalUrl.replace('http:', 'https:');
    if (finalUrl.includes('upload/') && !finalUrl.includes('w_')) {
      finalUrl = finalUrl.replace('upload/', 'upload/w_250,h_250,c_fill,q_auto,f_auto/');
    }
  }
  return finalUrl;
}

export const ArtisanCard = React.memo(function ArtisanCard({
  artisan,
  onPress,
  onBook,
  formattedLocation,
  style,
}: ArtisanCardProps) {
  const { t, i18n } = useTranslation();

  if (!artisan) return null;

  // Data can arrive as user_details (complex), user (nested), or flat.
  const userObj = artisan.user_details || artisan.user || artisan;
  const firstName = userObj.first_name || artisan.first_name || '';
  const lastName = userObj.last_name || artisan.last_name || '';
  const email = userObj.email || artisan.email || 'Unknown';
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email.split('@')[0];

  const professionName =
    i18n.language === 'ha' && artisan?.category_name_ha
      ? artisan.category_name_ha
      : artisan?.profession_name || 'Artisan';

  const photo = optimizedPhoto(userObj.profile_picture || artisan.profile_picture);
  const rating = artisan.rating || 4.8;
  const reviewCount = artisan.review_count || 24;
  const isVerified = artisan.is_verified || userObj.is_verified || false;

  let location = formattedLocation;
  if (!location) {
    const stateName = userObj.state_details?.name || artisan.state_details?.name || artisan.state;
    const lgaName = userObj.lga_details?.name || artisan.lga_details?.name || artisan.lga;
    const isStateId = typeof stateName === 'number';
    const isLgaId = typeof lgaName === 'number';
    location =
      stateName && !isStateId
        ? `${lgaName && !isLgaId ? lgaName + ', ' : ''}${stateName}`
        : t('Location Unknown');
  }

  const priceFrom = artisan.call_out_fee ?? artisan.price_from ?? artisan.hourly_rate ?? null;
  const hasDistance =
    artisan.distance !== undefined && artisan.distance !== null && artisan.distance !== Infinity;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, ${professionName}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
    >
      <View style={styles.topRow}>
        <Avatar name={displayName} uri={photo} size={56} borderRadius={radius.xl} verified={isVerified} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.profession} numberOfLines={1}>
            {t(professionName)}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color={color.star} />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.reviews}>
              ({reviewCount} {t('reviews')})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <MaterialIcons name="place" size={14} color={color.ink400} />
        <Text style={styles.metaText} numberOfLines={1}>
          {location}
        </Text>
        {hasDistance && (
          <>
            <Text style={styles.metaDot}>·</Text>
            <MaterialIcons name="near-me" size={13} color={color.brand600} />
            <Text style={styles.distance}>
              {typeof artisan.distance === 'number' ? artisan.distance.toFixed(1) : artisan.distance}{' '}
              {t('km away')}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>
          {priceFrom != null ? (
            <>
              <Text style={styles.priceFromLabel}>{t('from')} </Text>₦{Number(priceFrom).toLocaleString()}
            </>
          ) : (
            <Text style={styles.priceFromLabel}>{t('View Profile')}</Text>
          )}
        </Text>
        {onBook && (
          <Pressable
            onPress={onBook}
            accessibilityRole="button"
            accessibilityLabel={`${t('Book')} ${displayName}`}
            style={({ pressed }) => [styles.bookPill, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.bookPillText}>{t('Book')}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    ...shadow.e2,
  },
  cardPressed: { transform: [{ scale: 0.985 }] },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: space.md },
  name: {
    fontFamily: font.extrabold,
    fontSize: 14.5,
    color: color.ink900,
  },
  profession: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink400,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink900 },
  reviews: { fontFamily: font.bold, fontSize: 12, color: color.ink300 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: space.md,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.ink600,
    flexShrink: 1,
  },
  metaDot: { color: color.ink300, marginHorizontal: 2 },
  distance: { fontFamily: font.extrabold, fontSize: 12, color: color.brand600 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
  },
  price: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  priceFromLabel: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400 },
  bookPill: {
    backgroundColor: color.brand100,
    borderRadius: radius.full,
    paddingHorizontal: 18,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookPillText: { fontFamily: font.extrabold, fontSize: 13, color: color.brand600 },
});

export default ArtisanCard;
