import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { businessAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { NotificationBell } from '@/src/components/NotificationBell';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, Badge, Button, Input, useConfirm } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

function verificationBadgeStatus(status: string): BadgeStatus {
  if (status === 'approved') return 'verified';
  if (status === 'rejected') return 'cancelled';
  return 'pending';
}

// A registered business's own dashboard — deliberately separate from the
// client Home screen (ROLE_HOME_ROUTES.business), which is built around
// browsing/searching ARTISAN categories and would otherwise be the first
// thing a business owner saw after logging in, with nothing on it
// relevant to them.
//
// Deliberately minimal (see BusinessProfile's own docstring, backend
// side): just the profile a business actually has today — no bookings/
// reviews/jobs, since businesses aren't bookable yet. Editing here is the
// same self-service pattern as the artisan dashboard's profile section.
export default function BusinessDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const confirm = useConfirm();

  const [profile, setProfile] = useState<any>(null);
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSave = async () => {
    if (!businessName.trim()) return;
    setSaving(true);
    try {
      const updated = await businessAPI.updateMyProfile({
        business_name: businessName.trim(),
        description: description.trim(),
      });
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      console.log('Business profile update error:', error);
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

      <View style={styles.header}>
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

          <View style={styles.profileSection}>
            <Avatar name={displayName} gender={user?.gender} size={60} borderRadius={20} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.categoryText} numberOfLines={1}>
                {profile?.category_name || t('Business')}
              </Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.72)" />
                <Text style={styles.locationText}>
                  {user?.lga_details?.name || t('Local Govt')}, {user?.state_details?.name || t('State')}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: space.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >
        <EmailVerificationBanner />

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.sectionTitle}>{t('Business profile')}</Text>
            <Badge
              label={t(profile?.verification_status || 'pending')}
              status={verificationBadgeStatus(profile?.verification_status)}
            />
          </View>

          {!editing ? (
            <>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t('Business name')}</Text>
                <Text style={styles.fieldValue}>{profile?.business_name || '—'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t('Business type')}</Text>
                <Text style={styles.fieldValue}>{profile?.category_name || '—'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t('Description')}</Text>
                <Text style={styles.fieldValue}>{profile?.description || t('Not added yet')}</Text>
              </View>
              <Button
                title={t('Edit profile')}
                variant="secondary"
                onPress={() => setEditing(true)}
                style={{ marginTop: space.md }}
              />
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
                <Button title={t('Cancel')} variant="secondary" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                <Button title={t('Save')} onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  centerFill: { alignItems: 'center', justifyContent: 'center' },

  header: { backgroundColor: color.brand900 },
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

  profileSection: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl,
  },
  profileInfo: { flex: 1 },
  userName: { fontFamily: font.extrabold, fontSize: 18, color: '#FFF' },
  categoryText: { fontFamily: font.bold, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontFamily: font.medium, fontSize: 12, color: 'rgba(255,255,255,0.72)' },

  content: { flex: 1, paddingHorizontal: space.xl },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  sectionTitle: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },

  fieldRow: { paddingVertical: space.sm },
  fieldLabel: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400 },
  fieldValue: { fontFamily: font.semibold, fontSize: 14.5, color: color.ink900, marginTop: 2 },

  field: { marginBottom: space.md },
  hint: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginBottom: space.md, lineHeight: 17 },
  editActions: { flexDirection: 'row', gap: space.md },
});
