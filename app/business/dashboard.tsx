import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { businessAPI, portfolioAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { NotificationBell } from '@/src/components/NotificationBell';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, Button, Input, StatTile, useToast, useConfirm } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

function verificationBadgeStatus(status: string): BadgeStatus {
  if (status === 'rejected') return 'cancelled';
  return 'pending';
}

function getPortfolioImageUrl(image: any): string | null {
  if (!image) return null;
  let url = typeof image === 'string' ? image : image.url;
  if (!url) return null;
  if (!url.startsWith('http') && url.includes('image/upload')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
  }
  if (url.startsWith('http:')) return url.replace('http:', 'https:');
  return url;
}

// A small filled checkmark disc next to the business name — the
// recognizable "this account is verified" signal Google/Meta business
// profiles use in place of a separate status pill once approved. Uses
// this app's own established verification color (accent teal,
// constants/theme.ts) rather than borrowing a literal brand blue, so it
// stays consistent with every other "verified" surface in the app
// (StatTile/Badge already use the same token).
function VerifiedTick() {
  return (
    <View style={styles.verifiedTick}>
      <MaterialIcons name="check" size={10} color="#FFF" />
    </View>
  );
}

function memberSince(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// A registered business's own dashboard — deliberately separate from the
// client Home screen (ROLE_HOME_ROUTES.business), which is built around
// browsing/searching ARTISAN categories and would otherwise be the first
// thing a business owner saw after logging in, with nothing on it
// relevant to them.
//
// Deliberately minimal in SCOPE (see BusinessProfile's own docstring,
// backend side): just the profile a business actually has today — no
// bookings/reviews/jobs, since businesses aren't bookable yet. Not
// minimal in POLISH — laid out like a real business-profile product
// (Google Business Profile / Meta Page): a cover header with an
// overlapping identity card, an inline verified mark instead of a status
// pill once approved, icon-led info rows, and a stats strip, rather than
// a flat label/value form.
export default function BusinessDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const { show: showToast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await businessAPI.getMyProfile();
      setProfile(data);
      setBusinessName(data.business_name || '');
      setDescription(data.description || '');
    } catch (error) {
      console.log('Business profile fetch error:', error);
      showToast(t('Could not load your business profile.'), { type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    try {
      const items = await portfolioAPI.getMine();
      setPortfolioItems(items || []);
    } catch (error) {
      console.log('Portfolio fetch error:', error);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      showToast(t("Business name can't be empty."), { type: 'warn' });
      return;
    }
    setSaving(true);
    try {
      const updated = await businessAPI.updateMyProfile({
        business_name: businessName.trim(),
        description: description.trim(),
      });
      setProfile(updated);
      setEditing(false);
      showToast(t('Profile updated.'), { type: 'success' });
    } catch (error: any) {
      const msg = error.response?.data?.error || t('Could not save your changes. Please try again.');
      showToast(msg, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('Log Out'),
      message: t('Are you sure you want to exit?'),
      confirmLabel: t('Log Out'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (ok) {
      await logout();
      router.replace('/login');
    }
  };

  const displayName = profile?.business_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || t('My Business');
  const verificationStatus = profile?.verification_status || 'pending';
  const isApproved = verificationStatus === 'approved';
  const isRejected = verificationStatus === 'rejected';
  const categoryIcon = (profile?.category_material_icon as any) || 'storefront';

  if (loading) {
    return (
      <View style={[styles.container, styles.centerFill]}>
        <ActivityIndicator color={color.brand600} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[color.brand900, color.brand600]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <Text style={styles.brandName}>S-MAHII {t('Business')}</Text>
            <View style={styles.headerActions}>
              {/* Every Dashboard Must Be Connected (item 10) — this
                  dashboard previously had zero navigation of its own. */}
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push('/chat/ai')}
                accessibilityRole="button"
                accessibilityLabel="AI assistant"
              >
                <MaterialIcons name="auto-awesome" size={17} color="#FACC15" />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push('/help-center')}
                accessibilityRole="button"
                accessibilityLabel={t('Help')}
              >
                <MaterialIcons name="help-outline" size={18} color="#FFF" />
              </Pressable>
              <NotificationBell iconColor="#FFF" size={18} style={styles.iconBtn} />
              <Pressable style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel={t('Log Out')}>
                <MaterialIcons name="logout" size={16} color="#FECACA" />
                <Text style={styles.logoutText}>{t('Exit')}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card — overlaps the header, same "floating card"
            pattern the artisan dashboard's availability card already
            establishes elsewhere in this app. */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.avatarWrap}>
              <Avatar name={displayName} gender={user?.gender} size={64} borderRadius={20} />
              <View style={styles.avatarCategoryBadge}>
                <MaterialIcons name={categoryIcon} size={12} color="#FFF" />
              </View>
            </View>

            <View style={styles.identityInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                {isApproved ? <VerifiedTick /> : null}
              </View>
              <Text style={styles.categoryText} numberOfLines={1}>
                {profile?.category_name || t('Business')}
              </Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={12} color={color.ink300} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {user?.lga_details?.name || t('Local Govt')}, {user?.state_details?.name || t('State')}
                </Text>
              </View>
            </View>

            {!editing && (
              <Pressable
                onPress={() => setEditing(true)}
                style={styles.editIconBtn}
                accessibilityRole="button"
                accessibilityLabel={t('Edit profile')}
              >
                <MaterialIcons name="edit" size={16} color={color.brand600} />
              </Pressable>
            )}
          </View>

          {!isApproved && (
            <Badge
              label={t(isRejected ? 'rejected' : 'pending')}
              status={verificationBadgeStatus(verificationStatus)}
              style={styles.statusBadge}
            />
          )}
        </View>

        <EmailVerificationBanner />

        {/* Verification guidance — pending vs rejected read differently,
            same distinction the artisan dashboard already makes; this
            screen previously showed neither, just a bare status word. */}
        {isRejected ? (
          <View style={[styles.alertBox, styles.alertBoxDanger]}>
            <MaterialIcons name="error-outline" size={22} color={color.danger600} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: color.danger600 }]}>{t('Verification not approved')}</Text>
              <Text style={[styles.alertText, { color: color.danger600 }]}>
                {t('Update your details below, then ask an agent or coordinator in your LGA to review your business again.')}
              </Text>
            </View>
          </View>
        ) : !isApproved ? (
          <View style={styles.alertBox}>
            <MaterialIcons name="schedule" size={22} color={color.warn600} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{t('Verification pending')}</Text>
              <Text style={styles.alertText}>
                {t('A coordinator or agent in your state reviews new registrations — this usually takes 1–2 business days.')}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Stats strip */}
        <View style={styles.statsGrid}>
          <StatTile
            icon="photo-library"
            value={portfolioItems.length}
            label={t('Photos')}
            tileBg={color.brand100}
            tileFg={color.brand600}
          />
          <StatTile
            icon={isApproved ? 'verified' : 'schedule'}
            value={t(isApproved ? 'verified' : isRejected ? 'rejected' : 'pending')}
            label={t('Status')}
            tileBg={isApproved ? color.accent100 : isRejected ? '#FDECEC' : color.warn100}
            tileFg={isApproved ? color.accent600 : isRejected ? color.danger600 : color.warn600}
          />
          <StatTile
            icon="event"
            value={memberSince(profile?.created_at)}
            label={t('Member since')}
          />
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('About')}</Text>

          {!editing ? (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIconTile}>
                  <MaterialIcons name={categoryIcon} size={16} color={color.brand600} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('Business type')}</Text>
                  <Text style={styles.infoValue}>{profile?.category_name || '—'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconTile}>
                  <MaterialIcons name="place" size={16} color={color.brand600} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{t('Location')}</Text>
                  <Text style={styles.infoValue}>
                    {user?.lga_details?.name || t('Local Govt')}, {user?.state_details?.name || t('State')}
                  </Text>
                </View>
              </View>

              {profile?.registration_number ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconTile}>
                    <MaterialIcons name="badge" size={16} color={color.brand600} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>{t('Registration number')}</Text>
                    <Text style={styles.infoValue}>{profile.registration_number}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.divider} />

              <Text style={styles.aboutLabel}>{t('Description')}</Text>
              <Text style={styles.aboutText}>{profile?.description || t('Not added yet')}</Text>
            </>
          ) : (
            <>
              <Input
                label={t('Business name')}
                value={businessName}
                onChangeText={setBusinessName}
                icon="storefront"
                containerStyle={styles.field}
              />
              <Input
                label={t('Description')}
                value={description}
                onChangeText={setDescription}
                icon="edit"
                multiline
                containerStyle={styles.field}
              />
              <Text style={styles.hint}>
                {t('To change your business type, contact support — it affects how clients find you.')}
              </Text>
              <View style={styles.editActions}>
                <Button title={t('Cancel')} variant="secondary" onPress={() => setEditing(false)} disabled={saving} style={{ flex: 1 }} />
                <Button title={t('Save')} onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.card, styles.showcaseCard, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/business/showcase')}
          accessibilityRole="button"
          accessibilityLabel={t('Photo showcase')}
        >
          <View style={styles.cardTop}>
            <Text style={styles.sectionTitle}>{t('Photo showcase')}</Text>
            <View style={styles.manageRow}>
              <Text style={styles.manageText}>{t('Manage')}</Text>
              <MaterialIcons name="chevron-right" size={18} color={color.brand600} />
            </View>
          </View>
          <Text style={styles.showcaseHint}>
            {portfolioItems.length === 0
              ? t('Show clients your work and what you sell.')
              : t('{{count}} photo(s) added.', { count: portfolioItems.length })}
          </Text>
          <View style={styles.thumbRow}>
            {portfolioItems.slice(0, 4).map((item) => {
              const url = getPortfolioImageUrl(item.image);
              return (
                <View key={item.id} style={styles.thumb}>
                  {url ? (
                    <Image source={{ uri: url }} style={styles.thumbImage} resizeMode="cover" />
                  ) : (
                    <MaterialIcons name="image" size={20} color={color.brand600} />
                  )}
                </View>
              );
            })}
            <View style={styles.thumbAdd}>
              <MaterialIcons name="add" size={18} color={color.ink300} />
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  centerFill: { alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingBottom: 56,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    ...shadow.e2,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.xl, paddingTop: space.md,
  },
  brandName: { fontFamily: font.extrabold, fontSize: 14, color: '#FFF', letterSpacing: 0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  iconBtn: {
    width: 34, height: 34, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: { fontFamily: font.bold, fontSize: 12, color: '#FECACA' },

  content: { flex: 1, paddingHorizontal: space.xl },

  identityCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    marginTop: -40,
    marginBottom: space.lg,
    ...shadow.e2,
  },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  avatarWrap: { position: 'relative' },
  avatarCategoryBadge: {
    position: 'absolute', bottom: -3, right: -3,
    width: 22, height: 22, borderRadius: 8,
    backgroundColor: color.brand600,
    borderWidth: 2, borderColor: color.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  identityInfo: { flex: 1, minWidth: 0, paddingTop: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontFamily: font.extrabold, fontSize: 17, color: color.ink900, flexShrink: 1 },
  verifiedTick: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: color.accent600,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryText: { fontFamily: font.bold, fontSize: 13, color: color.ink600, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  locationText: { fontFamily: font.medium, fontSize: 12, color: color.ink400, flexShrink: 1 },
  editIconBtn: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: color.brand100,
    alignItems: 'center', justifyContent: 'center',
  },
  statusBadge: { alignSelf: 'flex-start', marginTop: space.md },

  alertBox: {
    backgroundColor: color.warn100,
    padding: space.lg,
    borderRadius: radius.lg,
    marginBottom: space.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    borderWidth: 1,
    borderColor: '#F5E4B8',
  },
  alertBoxDanger: { backgroundColor: '#FDECEC', borderColor: '#F6C9C9' },
  alertTitle: { fontFamily: font.extrabold, fontSize: 13.5, color: color.warn600, marginBottom: 2 },
  alertText: { fontFamily: font.bold, fontSize: 12.5, color: color.warn600, lineHeight: 18 },

  statsGrid: { flexDirection: 'row', gap: space.md, marginBottom: space.lg },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginBottom: space.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  sectionTitle: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900, marginBottom: space.md },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  infoIconTile: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: color.brand100,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontFamily: font.bold, fontSize: 11, color: color.ink400 },
  infoValue: { fontFamily: font.semibold, fontSize: 14, color: color.ink900, marginTop: 1 },

  divider: { height: 1, backgroundColor: color.border, marginVertical: space.md },
  aboutLabel: { fontFamily: font.bold, fontSize: 11, color: color.ink400, marginBottom: 4 },
  aboutText: { fontFamily: font.medium, fontSize: 13.5, color: color.ink600, lineHeight: 20 },

  field: { marginBottom: space.md },
  hint: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginBottom: space.md, lineHeight: 17 },
  editActions: { flexDirection: 'row', gap: space.md },

  showcaseCard: { marginBottom: 0 },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  manageText: { fontFamily: font.extrabold, fontSize: 12, color: color.brand600 },
  showcaseHint: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginBottom: space.md },
  thumbRow: { flexDirection: 'row', gap: space.sm },
  thumb: {
    width: 56, height: 56, borderRadius: radius.md,
    backgroundColor: color.brand100, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbAdd: {
    width: 56, height: 56, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: color.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
});
