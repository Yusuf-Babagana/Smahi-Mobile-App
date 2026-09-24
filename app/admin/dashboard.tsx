import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { adminAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { StatTile, EmptyState, SkeletonCard, useConfirm, useToast } from '@/src/components/ui';
import { NotificationBell } from '@/src/components/NotificationBell';

// This dashboard is read-only monitoring, with a few deliberate
// exceptions: Coordinator management (app/admin/coordinators.tsx, app/
// admin/create-coordinator.tsx) — Admin creating/suspending/dismissing
// state coordinators in-app, mirroring Coordinator-creates-Agent one
// level up the hierarchy; full User CRUD (app/admin/users.tsx); and the
// one-tap Verification section below — approving an artisan/business
// straight from here, routed through the same approve_artisan_verification/
// approve_business_verification functions the agent verify flow uses
// (core/services.py on the backend), so it enforces the same rules
// (registration fee paid) instead of being a raw is_verified toggle.
// Everything else privileged (moderate a review, resolve a dispute,
// suspend an artisan/client) still lives only in Django Admin.
export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const { show: showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [statsData, pending] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingVerifications().catch(() => []),
      ]);
      setStats(statsData);
      setPendingVerifications(pending);
    } catch (error) {
      console.log('Admin stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleVerify = async (targetUser: any) => {
    const name = `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim() || targetUser.email;
    const ok = await confirm({
      title: t('Verify this account?'),
      message: t('{{name}} will get the verified badge immediately.', { name }),
      confirmLabel: t('Verify'),
    });
    if (!ok) return;

    setVerifyingId(targetUser.id);
    try {
      await adminAPI.verifyUser(targetUser.id);
      setPendingVerifications(prev => prev.filter(u => u.id !== targetUser.id));
      showToast(t('{{name}} is now verified.', { name }), { type: 'success' });
      load();
    } catch (error: any) {
      const msg = error.response?.data?.error || t('Could not verify this account.');
      showToast(msg, { type: 'error' });
    } finally {
      setVerifyingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('Log Out'),
      message: t('Are you sure you want to exit?'),
      confirmLabel: t('Log Out'),
      cancelLabel: t('Cancel'),
      destructive: true,
    });
    if (ok) logout();
  };

  const displayName = `${user?.first_name || t('Admin')} ${user?.last_name || ''}`.trim();

  const healthColor = (score: number) => {
    if (score >= 70) return color.accent600;
    if (score >= 40) return color.warn600;
    return color.danger600;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brandName}>{t('S-MAHII Admin')}</Text>
              <Text style={styles.subGreeting}>{displayName}</Text>
            </View>
            <View style={styles.headerActions}>
              {/* Every Dashboard Must Be Connected (item 10) — Admin had
                  no Help Center/notifications entry point at all. */}
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

          <View style={styles.readOnlyBanner}>
            <MaterialIcons name="visibility" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.readOnlyText}>
              {t('Monitoring only — verify, moderate, and manage artisans/clients from Django Admin')}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingTop: space.xl, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: space.md }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : !stats ? (
          <EmptyState
            icon="error-outline"
            title={t('Could not load dashboard')}
            message={t('Pull down to try again.')}
          />
        ) : (
          <>
            {/* Marketplace health */}
            <Animated.View entering={FadeInUp.duration(350)} style={styles.healthCard}>
              <View style={styles.healthRow}>
                <View>
                  <Text style={styles.healthLabel}>{t('Marketplace health')}</Text>
                  <Text style={[styles.healthScore, { color: healthColor(stats.marketplace_health) }]}>
                    {stats.marketplace_health}
                  </Text>
                </View>
                <View style={[styles.healthTile, { backgroundColor: healthColor(stats.marketplace_health) + '1A' }]}>
                  <MaterialIcons name="insights" size={26} color={healthColor(stats.marketplace_health)} />
                </View>
              </View>
              <Text style={styles.healthHint}>
                {t('Based on verification rate and booking completion vs. cancellation.')}
              </Text>
            </Animated.View>

            {/* People */}
            <Animated.View entering={FadeInDown.delay(60).duration(350)}>
              <Text style={styles.sectionTitle}>{t('People')}</Text>
              <View style={styles.statsGrid}>
                <StatTile icon="people-outline" value={stats.total_users} label={t('Total users')} />
                <StatTile icon="handyman" value={stats.total_artisans} label={t('Artisans')} />
                <StatTile icon="groups" value={stats.total_clients} label={t('Clients')} />
                <StatTile icon="badge" value={stats.total_agents} label={t('Agents')} />
              </View>
            </Animated.View>

            {/* Coordinator management — the one write path this
                dashboard has, see the file's own top comment. */}
            <Animated.View entering={FadeInDown.delay(80).duration(350)}>
              <Pressable
                style={({ pressed }) => [styles.navCard, pressed && { opacity: 0.85 }]}
                onPress={() => router.push('/admin/coordinators')}
                accessibilityRole="button"
                accessibilityLabel={t('Manage coordinators')}
              >
                <View style={styles.navCardIconTile}>
                  <MaterialIcons name="map" size={22} color={color.brand600} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navCardTitle}>{t('Coordinators')}</Text>
                  <Text style={styles.navCardSubtitle}>{t('Create, suspend, or dismiss state coordinators')}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={color.ink300} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.navCard, pressed && { opacity: 0.85 }]}
                onPress={() => router.push('/admin/users')}
                accessibilityRole="button"
                accessibilityLabel={t('Manage all users')}
              >
                <View style={styles.navCardIconTile}>
                  <MaterialIcons name="manage-accounts" size={22} color={color.brand600} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navCardTitle}>{t('All users')}</Text>
                  <Text style={styles.navCardSubtitle}>{t('View, edit, or deactivate any account')}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={color.ink300} />
              </Pressable>
            </Animated.View>

            {/* Verification */}
            <Animated.View entering={FadeInDown.delay(100).duration(350)}>
              <Text style={styles.sectionTitle}>{t('Verification')}</Text>
              <View style={styles.statsGrid}>
                <StatTile
                  icon="verified"
                  value={stats.verified_artisans}
                  label={t('Verified')}
                  tileBg={color.accent100}
                  tileFg={color.accent600}
                />
                <StatTile
                  icon="schedule"
                  value={stats.pending_verification}
                  label={t('Pending review')}
                  tileBg={color.warn100}
                  tileFg={color.warn600}
                />
              </View>

              <View style={styles.card}>
                {pendingVerifications.length === 0 ? (
                  <Text style={styles.emptyText}>{t('No one is waiting on verification.')}</Text>
                ) : (
                  pendingVerifications.map((u: any, i: number) => {
                    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                    return (
                      <View key={u.id} style={[styles.verifyRow, i > 0 && styles.horizontalDivider]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userName} numberOfLines={1}>{name}</Text>
                          <View style={styles.metaRow}>
                            <View style={styles.roleBadge}>
                              <Text style={styles.roleText}>{t(u.role)}</Text>
                            </View>
                            {u.state_details?.name && (
                              <Text style={styles.userEmail}>{u.state_details.name}</Text>
                            )}
                          </View>
                        </View>
                        <Pressable
                          style={({ pressed }) => [styles.verifyButton, pressed && { opacity: 0.85 }]}
                          onPress={() => handleVerify(u)}
                          disabled={verifyingId === u.id}
                          accessibilityRole="button"
                          accessibilityLabel={t('Verify {{name}}', { name })}
                        >
                          {verifyingId === u.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <MaterialIcons name="check" size={15} color="#FFF" />
                              <Text style={styles.verifyButtonText}>{t('Verify')}</Text>
                            </>
                          )}
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            </Animated.View>

            {/* Bookings */}
            <Animated.View entering={FadeInDown.delay(140).duration(350)}>
              <Text style={styles.sectionTitle}>{t('Bookings')}</Text>
              <View style={styles.card}>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>{t('Total bookings')}</Text>
                  <Text style={styles.bookingValue}>{stats.total_bookings}</Text>
                </View>
                <View style={styles.horizontalDivider} />
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>{t('Completion rate')}</Text>
                  <Text style={[styles.bookingValue, { color: color.accent600 }]}>
                    {stats.booking_analytics?.completion_rate}%
                  </Text>
                </View>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>{t('Cancellation rate')}</Text>
                  <Text style={[styles.bookingValue, { color: color.danger600 }]}>
                    {stats.booking_analytics?.cancellation_rate}%
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Revenue */}
            <Animated.View entering={FadeInDown.delay(180).duration(350)}>
              <Text style={styles.sectionTitle}>{t('Revenue')}</Text>
              <View style={styles.card}>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>{t('Registration fees collected')}</Text>
                  <Text style={styles.bookingValue}>
                    ₦{Number(stats.revenue?.registration_fees_naira || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>{t('Payments')}</Text>
                  <Text style={styles.bookingValue}>{stats.revenue?.registration_fees_count}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Recent registrations */}
            <Animated.View entering={FadeInDown.delay(220).duration(350)}>
              <Text style={styles.sectionTitle}>{t('Recent registrations')}</Text>
              <View style={styles.card}>
                {(stats.recent_registrations || []).length === 0 ? (
                  <Text style={styles.emptyText}>{t('No registrations yet.')}</Text>
                ) : (
                  stats.recent_registrations.map((u: any, i: number) => (
                    <View key={u.id} style={[styles.userRow, i > 0 && styles.horizontalDivider]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                      </View>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{t(u.role)}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },

  header: {
    backgroundColor: color.brand900,
    paddingBottom: space.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    marginTop: space.md,
  },
  brandName: { color: '#FFF', fontFamily: font.extrabold, fontSize: 17, letterSpacing: 0.3 },
  subGreeting: { color: 'rgba(255,255,255,0.72)', fontFamily: font.bold, fontSize: 12.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  iconBtn: {
    width: 34, height: 34, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  logoutText: { color: '#FECACA', fontFamily: font.extrabold, fontSize: 12 },

  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: space.xl,
    marginTop: space.lg,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  readOnlyText: { color: 'rgba(255,255,255,0.85)', fontFamily: font.bold, fontSize: 11.5, flex: 1 },

  content: { flex: 1, paddingHorizontal: space.xl },

  healthCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginBottom: space.xl,
    ...shadow.e1,
  },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400 },
  healthScore: { fontFamily: font.extrabold, fontSize: 32, marginTop: 4 },
  healthTile: {
    width: 52, height: 52, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  healthHint: { fontFamily: font.medium, fontSize: 11.5, color: color.ink300, marginTop: space.sm },

  sectionTitle: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900, marginBottom: space.md, marginTop: space.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.xl },

  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginBottom: space.xl,
    ...shadow.e1,
  },
  navCardIconTile: {
    width: 44, height: 44, borderRadius: radius.lg,
    backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
  },
  navCardTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  navCardSubtitle: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 2 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginBottom: space.xl,
  },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.sm },
  bookingLabel: { fontFamily: font.bold, fontSize: 13, color: color.ink400 },
  bookingValue: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900 },
  horizontalDivider: { borderTopWidth: 1, borderTopColor: color.border },

  emptyText: { fontFamily: font.medium, fontSize: 13, color: color.ink300, textAlign: 'center', paddingVertical: space.sm },

  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm },
  userName: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900 },
  userEmail: { fontFamily: font.medium, fontSize: 11.5, color: color.ink300, marginTop: 1 },
  roleBadge: { backgroundColor: color.brand100, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { fontFamily: font.extrabold, fontSize: 10, color: color.brand600, textTransform: 'uppercase' },

  verifyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 3 },
  verifyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: color.accent600, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 7, minWidth: 74, justifyContent: 'center',
  },
  verifyButtonText: { color: '#FFF', fontFamily: font.extrabold, fontSize: 12 },
});
