import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@/styles/commonStyles';

interface Artisan {
  id: number;
  first_name: string;
  last_name: string;
  business_name?: string;
  service_category: string;
  lga?: string;
  state?: string;
  profile_picture?: string | null;
  rating?: number;
  review_count?: number;
}

interface Props {
  artisan: Artisan;
  onPress: () => void;
}

export const ArtisanCard = ({ artisan, onPress }: Props) => {
  const [imageError, setImageError] = useState(false);

  // 1. Get Display Name
  const displayName = artisan.business_name || `${artisan.first_name} ${artisan.last_name}`;

  // 2. Get Initials for Placeholder
  const getInitials = () => {
    const first = artisan.first_name ? artisan.first_name.charAt(0) : '';
    const last = artisan.last_name ? artisan.last_name.charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  };

  // 3. Smart Cloudinary URL Fixer
  const getOptimizedUrl = (url: string | null | undefined) => {
    if (!url) return null;

    let finalUrl = url;

    // A. Fix Relative Paths from Django (if any slip through)
    if (finalUrl.startsWith('/')) {
      finalUrl = `https://smahi1.pythonanywhere.com${finalUrl}`;
    }

    // B. Fix Cloudinary: Force HTTPS and Optimize Size
    if (finalUrl.includes('res.cloudinary.com')) {
      // 1. Force HTTPS
      if (finalUrl.startsWith('http:')) {
        finalUrl = finalUrl.replace('http:', 'https:');
      }

      // 2. Inject Resizing (Fetch a small 150x150 thumbnail instead of full size)
      // Checks if 'upload/' exists and doesn't already have params
      if (finalUrl.includes('upload/') && !finalUrl.includes('w_')) {
        finalUrl = finalUrl.replace('upload/', 'upload/w_150,h_150,c_fill,q_auto,f_auto/');
      }
    }

    return finalUrl;
  };

  const imageUrl = getOptimizedUrl(artisan.profile_picture);
  const location = [artisan.lga, artisan.state].filter(Boolean).join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>

      {/* --- LEFT: PROFILE IMAGE --- */}
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => {
              console.log(`[Image Failed] ID: ${artisan.id} URL: ${imageUrl}`);
              console.log("Error:", e.nativeEvent.error);
              setImageError(true);
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.initials}>{getInitials()}</Text>
          </View>
        )}

        {/* Verified Badge */}
        {/* Only show if actually verified (assuming artisan obj has verification_status, otherwise decorative) */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={10} color="#FFF" />
        </View>
      </View>

      {/* --- RIGHT: DETAILS --- */}
      <View style={styles.infoContainer}>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.category}>{artisan.service_category || 'Artisan'}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#EAB308" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>

        {/* Location */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <Text style={styles.location} numberOfLines={1}>{location || 'Location hidden'}</Text>
        </View>

        {/* Footer/Action */}
        <View style={styles.footerRow}>
          <Text style={styles.priceTag}>from ₦5k</Text>
          <View style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileText}>View</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    ...shadows.medium,
    shadowOpacity: 0.08, // Slightly softer shadow
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    marginRight: 16,
    position: 'relative',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  initials: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10B981', // Green
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  category: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
    color: '#B45309',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
    letterSpacing: -0.5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontStyle: 'italic'
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2
  },
  viewProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  }
});