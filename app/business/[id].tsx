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

import { businessAPI, portfolioAPI } from '@/src/api/client';
import { BACKEND_URL } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar } from '@/src/components/ui';

const resolveMediaUrl = (raw: any): string | null => {
  const url = typeof raw === 'string' ? raw : raw?.image || raw?.url || null;
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
};

// A client viewing a business's public profile — the counterpart to
// app/artisan/[id].tsx, reached from app/businesses.tsx (the directory
// list). No "Book now" here: BusinessProfile's own docstring is explicit
// that the booking/discovery pipeline is a separate, later decision for
// businesses — Call/Message are the only actions that make sense today.
export default function BusinessProfileRoom() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    businessAPI.getBusinessById(id as string)
      .then(setBusiness)
      .catch((error) => console.log('Failed to load business.', error))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!business?.user) return;
    const userId = business.user_details?.id || business.user;
    portfolioAPI.getForUser(userId)
      .then(setPortfolioItems)
      .catch(() => {});
  }, [business]);

  const handleCall = () => {
    const phone = business?.user_details?.phone_number;
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = () => {
    const name = business?.business_name || t('Business');
    const recipientId = business?.user_details?.id || business?.user;
    router.push({
      pathname: '/chat/[id]',
      params: { id: 'new', name, recipientId },
    });
  };

  const handleShare = async () => {
    const name = business?.business_name || t('a business');
    try {
      await Share.share({ message: t('Check out {{name}} on S-MAHII marketplace.', { name }) });
    } catch {}
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={color.brand600} />
    </View>
  );

  if (!business) return (
    <View style={styles.center}>
      <Text style={styles.notFoundText}>{t('Business not found.')}</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>{t('Go Back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const name = business.business_name || t('Business');
  const phoneNumber = business.user_details?.phone_number;
  const stateName = business.user_details?.state_details?.name || t('Unknown State');
  const lgaName = business.user_details?.lga_details?.name || t('Unknown LGA');
  const fullLocation = `${lgaName}, ${stateName}`;
  const isVerified = business.verification_status === 'approved';
  const profilePic = resolveMediaUrl(business.user_details?.profile_picture);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.cover}>
          <LinearGradient
            colors={[color.brand900, color.brand600]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.nav}>
            <Pressable onPress={() => router.back()} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('Back')}>
              <MaterialIcons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.navBtn} accessibilityRole="button" accessibilityLabel={t('Share')}>
              <MaterialIcons name="share" size={20} color="#FFF" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.headCard}>
          <View style={styles.headTop}>
            <Avatar name={name} uri={profilePic} gender={business.user_details?.gender} size={72} borderRadius={22} verified={isVerified} />
            <View style={styles.headInfo}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              <View style={styles.tradeRow}>
                <MaterialIcons name={(business.category_material_icon as any) || 'storefront'} size={13} color={color.brand600} />
                <Text style={styles.trade} numberOfLines={1}>{business.category_name || t('Business')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('About')}</Text>
            <Text style={styles.bio}>
              {business.description || t('No description added yet.')}
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

          {portfolioItems.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('Photos')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                {portfolioItems.map((item) => {
                  const uri = resolveMediaUrl(item.image);
                  if (!uri) return null;
                  return (
                    <View key={item.id} style={styles.galleryItem}>
                      <Image source={{ uri }} style={styles.galleryImage} />
                      {(item.caption || item.price_label) ? (
                        <View style={styles.galleryCaptionWrap}>
                          {item.caption ? (
                            <Text style={styles.galleryCaption} numberOfLines={1}>{item.caption}</Text>
                          ) : null}
                          {item.kind === 'for_sale' && item.price_label ? (
                            <Text style={styles.galleryPrice} numberOfLines={1}>{item.price_label}</Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          style={styles.chatBtn}
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel={t('Call')}
        >
          <MaterialIcons name="call" size={22} color={color.brand600} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.messageBtn, pressed && { opacity: 0.9 }]}
          onPress={handleMessage}
          accessibilityRole="button"
          accessibilityLabel={t('Message')}
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#FFF" />
          <Text style={styles.messageBtnText}>{t('Message')}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },
  scroll: { paddingBottom: 120 },

  cover: { height: 160 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center', alignItems: 'center',
  },

  headCard: {
    marginTop: -48,
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
  tradeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trade: { fontFamily: font.bold, fontSize: 13, color: color.ink400 },

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

  galleryScroll: { gap: space.md },
  galleryItem: { width: 140 },
  galleryImage: {
    width: 140,
    height: 110,
    borderRadius: radius.md,
    backgroundColor: color.surfaceChip,
  },
  galleryCaptionWrap: { marginTop: 4 },
  galleryCaption: { fontFamily: font.bold, fontSize: 12, color: color.ink900 },
  galleryPrice: { fontFamily: font.bold, fontSize: 11.5, color: color.brand600, marginTop: 1 },

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
    width: 54, height: 54, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: color.brand100, backgroundColor: color.brand100,
    alignItems: 'center', justifyContent: 'center',
  },
  messageBtn: {
    flex: 1, height: 54, borderRadius: radius.lg,
    backgroundColor: color.brand600,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...shadow.cta,
  },
  messageBtnText: { fontFamily: font.extrabold, fontSize: 15.5, color: '#FFF' },

  notFoundText: { fontFamily: font.bold, fontSize: 15, color: color.ink400 },
  backLink: { marginTop: space.lg },
  backLinkText: { fontFamily: font.extrabold, color: color.brand600 },
});
