
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Artisan } from '../types';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface ArtisanCardProps {
  artisan: Artisan;
  onPress: () => void;
}

export default function ArtisanCard({ artisan, onPress }: ArtisanCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={32} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.category}>{artisan.category}</Text>
          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={16} color={colors.accent} />
            <Text style={styles.rating}>{artisan.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({artisan.reviewCount} reviews)</Text>
          </View>
        </View>
        {artisan.verificationStatus === 'approved' && (
          <View style={styles.verifiedBadge}>
            <IconSymbol name="checkmark.seal.fill" size={24} color={colors.success} />
          </View>
        )}
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {artisan.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <IconSymbol name="dollarsign.circle.fill" size={20} color={colors.primary} />
          <Text style={styles.price}>₦{artisan.hourlyRate}/hr</Text>
        </View>
        <Text style={styles.experience}>{artisan.experience} exp</Text>
      </View>
      
      {artisan.skills && artisan.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {artisan.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  experience: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
});
