import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { agentAPI, coordinatorAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { NotificationBell } from '@/src/components/NotificationBell';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar, useConfirm } from '@/src/components/ui';
import { useOfflineQueue, processQueue } from '@/src/utils/offlineQueue';
import { syncSubmitters } from '@/src/utils/syncSubmitters';
import { ACTIVITY_ACTION_ICONS, formatActivityWhen } from '@/src/utils/activityLog';

export default function AgentDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const confirm = useConfirm();

  const { user, logout } = useAuth();
  // Offline-first field registration: how many artisan registrations (or,
  // for a coordinator, agent creations) this device has queued locally,
  // confirmed by the server, or need attention — see
  // src/utils/offlineQueue.ts. This dashboard is shared between both
  // roles, and each uses a different queue type.
  const isCoordinator = user?.role === 'state_coordinator';
  const { counts: syncCounts } = useOfflineQueue(isCoordinator ? 'coordinator_create_agent' : 'agent_register_artisan');

  const [stats, setStats] = useState({
    total_artisans: 0,
    verified_artisans: 0,
    pending_verification: 0,
    total_clients: 0,
    // Client/User -> Agent Dashboard Connection (item 8) — present for
    // both roles, scoped to LGA (agent) or state (coordinator).
    pending_service_requests: 0,
    // Only ever populated for a state_coordinator — AgentDashboardStatsView
    // omits these entirely for a plain agent (no one "under" them to count).
    total_agents: undefined as number | undefined,
    active_agents: undefined as number | undefined,
    pending_agents: undefined as number | undefined,
    // Artisan/Business -> Coordinator Dashboard Connection (item 9) —
    // coordinator-only, same reasoning as the agent-oversight counts above.
    total_businesses: undefined as number | undefined,
    pending_business_verification: undefined as number | undefined,
    attention_required: undefined as {
      pending_artisan_verification: number;
      pending_business_verification: number;
      pending_agent_approvals: number;
      open_reports: number;
    } | undefined,
  });
  const [refreshing, setRefreshing] = useState(false);
  // Recent Activities — Coordinator Dashboard spec item 3. Only fetched
  // for a state_coordinator (see CoordinatorActivityLogView); a plain
  // agent has nothing to oversee, so this stays empty for them.
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // --- ACTIONS ---

  const fetchDashboardData = async () => {
    try {
      const data = await agentAPI.getDashboardStats();
      setStats(data);
      if (isCoordinator) {
        const activityData = await coordinatorAPI.getActivityLog(1);
        setRecentActivity((activityData.results || []).slice(0, 4));
      }
    } catch (error) {
      console.log("Dashboard Error", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t("Log Out"),
      message: t("Are you sure you want to exit?"),
      confirmLabel: t("Log Out"),
      cancelLabel: t("Cancel"),
      destructive: true,
    });
    if (ok) {
      if (logout) {
        await logout();
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await AsyncStorage.removeItem('user');
      }
      router.replace('/login');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
    // Pull-to-refresh doubles as "try syncing pending registrations now" —
    // an easy manual nudge for an agent who knows they just regained
    // signal, rather than waiting for the next automatic attempt.
    processQueue(syncSubmitters).catch(() => {});
  }, []);

  // --- SUB-COMPONENTS ---

  const QuickStat = ({ value, label, valueColor, onPress }: {
    value: string | number;
    label: string;
    valueColor: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.quickStat} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[styles.quickStatValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ActionCard = ({ title, subtitle, icon, tileBg, tileFg, onPress }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    tileBg: string;
    tileFg: string;
    onPress: () => void;
  }) => (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.actionIconTile, { backgroundColor: tileBg }]}>
        <MaterialIcons name={icon} size={20} color={tileFg} />
      </View>
      <Text style={styles.actionTitle} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.actionSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </Pressable>
  );

  const StatRow = ({ title, value, icon, tileBg, tileFg, trend }: {
    title: string;
    value: string | number;
    icon: keyof typeof MaterialIcons.glyphMap;
    tileBg: string;
    tileFg: string;
    trend?: string;
  }) => (
    <View style={styles.statRow}>
      <View style={[styles.iconBox, { backgroundColor: tileBg }]}>
        <MaterialIcons name={icon} size={20} color={tileFg} />
      </View>
      <View style={styles.statRowText}>
        <Text style={styles.statRowLabel}>{title}</Text>
        <Text style={styles.statRowValue}>{value}</Text>
      </View>
      {trend && (
        <View style={styles.trendBadge}>
          <MaterialIcons name="trending-up" size={12} color={color.accent600} />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
  );

  const displayName = `${user?.first_name || 'Agent'} ${user?.last_name || ''}`.trim();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. HEADER (brand900, flat) */}
      <View style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>

          {/* Top Bar with Logout */}
          <View style={styles.topBar}>
            <Text style={styles.brandName}>S-MAHII {isCoordinator ? t('Coordinator') : t('Agent')}</Text>
            <View style={styles.headerActions}>
              {/* Every Dashboard Must Be Connected (item 10) — a plain
                  agent had no path to the AI assistant/Help Center at all
                  (both were coordinator-only until now). */}
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

          {/* User Profile Section — tap through to My Profile (Digital ID,
              account settings, logout), same pattern as the artisan dashboard's
              avatar. This was previously the only screen with no entry point
              into app/agent/artisans/profile.tsx at all. */}
          <Pressable
            style={styles.profileSection}
            onPress={() => router.push('/agent/artisans/profile')}
            accessibilityRole="button"
            accessibilityLabel={t('My profile')}
          >
            <Avatar name={displayName} uri={user?.profile_picture} gender={user?.gender} size={60} borderRadius={20} online />
            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idLabel}>ID:</Text>
                <Text style={styles.idValue}>{user?.serial_number || 'PENDING'}</Text>
              </View>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={12} color="rgba(255,255,255,0.72)" />
                <Text style={styles.locationText}>
                  {user?.lga_details?.name || t('Local Govt')}, {user?.state_details?.name || t('State')}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
          </Pressable>

        </SafeAreaView>
      </View>

      {/* 2. FLOATING STATS CARD (overlaps header) */}
      <View style={styles.floatingStatsContainer}>
        <View style={styles.floatingStatsCard}>
          <QuickStat
            value={stats.total_artisans}
            label={t('Artisans')}
            valueColor={color.brand600}
            onPress={() => router.push('/agent/artisans')}
          />
          <View style={styles.verticalDivider} />
          <QuickStat value={stats.verified_artisans} label={t('Verified')} valueColor={color.accent600} />
          <View style={styles.verticalDivider} />
          <QuickStat value={stats.pending_verification} label={t('Pending')} valueColor={color.warn600} />
        </View>
      </View>

      {/* 3. SCROLL CONTENT */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 56 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >

        <EmailVerificationBanner />

        {/* SYNC STATUS — offline-first field registration. Only shown once
            this device has actually queued something, so a fresh install
            with no history isn't cluttered with an all-zero card. */}
        {syncCounts.total > 0 && (
          <View style={styles.syncCard}>
            <View style={styles.syncHeaderRow}>
              <MaterialIcons
                name={syncCounts.pending_sync > 0 ? 'cloud-off' : 'cloud-done'}
                size={18}
                color={syncCounts.pending_sync > 0 ? color.warn600 : color.accent600}
              />
              <Text style={styles.syncTitle}>{isCoordinator ? t('Agent creation sync status') : t('Registration sync status')}</Text>
            </View>
            <View style={styles.syncCountsRow}>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: color.warn600 }]}>{syncCounts.pending_sync}</Text>
                <Text style={styles.syncCountLabel}>{t('Pending sync')}</Text>
              </View>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: color.accent600 }]}>{syncCounts.server_verified}</Text>
                <Text style={styles.syncCountLabel}>{t('Server confirmed')}</Text>
              </View>
              {syncCounts.failed > 0 && (
                <View style={styles.syncCountBox}>
                  <Text style={[styles.syncCountValue, { color: color.danger600 }]}>{syncCounts.failed}</Text>
                  <Text style={styles.syncCountLabel}>{t('Needs attention')}</Text>
                </View>
              )}
            </View>
            {syncCounts.pending_sync > 0 && (
              <Text style={styles.syncHint}>
                {t("These registrations are saved on this device and will sync automatically once you're back online.")}
              </Text>
            )}
          </View>
        )}

        {/* QUICK ACTIONS — 2×2 grid of white cards with tonal icon tiles */}
        <Text style={styles.sectionTitle}>{t('Agent actions')}</Text>
        <View style={styles.actionGrid}>
          <ActionCard
            title={t('Register artisan')}
            subtitle={t('New profile')}
            icon="person-add"
            tileBg={color.brand100}
            tileFg={color.brand600}
            onPress={() => router.push('/agent/register')}
          />
          <ActionCard
            title={isCoordinator ? t('State clients') : t('LGA clients')}
            subtitle={t('View all')}
            icon="groups"
            tileBg={color.brand100}
            tileFg={color.brand600}
            onPress={() => router.push('/agent/clients')}
          />
          <ActionCard
            title={t('Service requests')}
            subtitle={
              stats.pending_service_requests
                ? t('{{count}} pending', { count: stats.pending_service_requests })
                : t('From clients')
            }
            icon="event-note"
            tileBg={stats.pending_service_requests ? color.warn100 : color.accent100}
            tileFg={stats.pending_service_requests ? color.warn600 : color.accent600}
            onPress={() => router.push('/agent/service-requests')}
          />
          <ActionCard
            title={t('Businesses')}
            subtitle={
              stats.pending_business_verification
                ? t('{{count}} pending', { count: stats.pending_business_verification })
                : t('Registrations')
            }
            icon="storefront"
            tileBg={stats.pending_business_verification ? color.warn100 : color.accent100}
            tileFg={stats.pending_business_verification ? color.warn600 : color.accent600}
            onPress={() => router.push('/agent/businesses')}
          />
          {user?.role === 'state_coordinator' && (
            <>
              <ActionCard
                title={t('My agents')}
                subtitle={
                  stats.pending_agents ? t('{{count}} pending approval', { count: stats.pending_agents }) : t('Oversee & manage')
                }
                icon="supervisor-account"
                tileBg={stats.pending_agents ? color.warn100 : color.accent100}
                tileFg={stats.pending_agents ? color.warn600 : color.accent600}
                onPress={() => router.push('/coordinator/agents')}
              />
              <ActionCard
                title={t('Create agent')}
                subtitle={t('Onboard new')}
                icon="person-add-alt"
                tileBg={color.accent100}
                tileFg={color.accent600}
                onPress={() => router.push('/coordinator/create-agent')}
              />
              <ActionCard
                title={t('Reports')}
                subtitle={t('Escalations')}
                icon="report"
                tileBg={color.warn100}
                tileFg={color.warn600}
                onPress={() => router.push('/coordinator/reports')}
              />
              <ActionCard
                title={t('LGA management')}
                subtitle={t('Drill into an LGA')}
                icon="location-city"
                tileBg={color.brand100}
                tileFg={color.brand600}
                onPress={() => router.push('/coordinator/lgas')}
              />
              <ActionCard
                title={t('Ask AI')}
                subtitle={t('Find an agent')}
                icon="auto-awesome"
                tileBg={color.accent100}
                tileFg={color.accent600}
                onPress={() => router.push('/chat/ai')}
              />
            </>
          )}
        </View>

        {/* PERFORMANCE OVERVIEW */}
        <Text style={styles.sectionTitle}>{t('Performance')}</Text>
        <View style={styles.statsCard}>
          <StatRow
            title={isCoordinator ? t('State clients') : t('LGA clients')}
            value={stats.total_clients}
            icon="groups"
            tileBg={color.brand100}
            tileFg={color.brand600}
          />
          <View style={styles.horizontalDivider} />
          <StatRow
            title={t('Verified artisans')}
            value={stats.verified_artisans}
            icon="done-all"
            tileBg={color.accent100}
            tileFg={color.accent600}
          />
          {isCoordinator && stats.total_agents !== undefined && (
            <>
              <View style={styles.horizontalDivider} />
              <StatRow
                title={t('Total agents')}
                value={stats.total_agents}
                icon="supervisor-account"
                tileBg={color.accent100}
                tileFg={color.accent600}
              />
              <View style={styles.horizontalDivider} />
              <StatRow
                title={t('Active agents')}
                value={stats.active_agents ?? 0}
                icon="check-circle"
                tileBg={color.accent100}
                tileFg={color.accent600}
              />
              <View style={styles.horizontalDivider} />
              <StatRow
                title={t('Registered businesses')}
                value={stats.total_businesses ?? 0}
                icon="storefront"
                tileBg={color.brand100}
                tileFg={color.brand600}
              />
            </>
          )}
        </View>

        {/* ATTENTION REQUIRED — Artisan/Business -> Coordinator Dashboard
            Connection (item 9): one glanceable summary of everything
            currently waiting on the coordinator, so nothing needing
            action gets missed in a separate list somewhere. */}
        {isCoordinator && stats.attention_required && (
          Object.values(stats.attention_required).some((n) => n > 0) && (
            <>
              <Text style={styles.sectionTitle}>{t('Needs your attention')}</Text>
              <View style={styles.attentionCard}>
                {stats.attention_required.pending_artisan_verification > 0 && (
                  <Pressable style={styles.attentionRow} onPress={() => router.push('/agent/artisans')}>
                    <MaterialIcons name="verified" size={16} color={color.warn600} />
                    <Text style={styles.attentionText}>
                      {t('{{count}} artisan(s) awaiting verification', { count: stats.attention_required.pending_artisan_verification })}
                    </Text>
                    <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
                  </Pressable>
                )}
                {stats.attention_required.pending_business_verification > 0 && (
                  <Pressable style={styles.attentionRow} onPress={() => router.push('/agent/businesses')}>
                    <MaterialIcons name="storefront" size={16} color={color.warn600} />
                    <Text style={styles.attentionText}>
                      {t('{{count}} business(es) awaiting verification', { count: stats.attention_required.pending_business_verification })}
                    </Text>
                    <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
                  </Pressable>
                )}
                {stats.attention_required.pending_agent_approvals > 0 && (
                  <Pressable style={styles.attentionRow} onPress={() => router.push('/coordinator/agents')}>
                    <MaterialIcons name="supervisor-account" size={16} color={color.warn600} />
                    <Text style={styles.attentionText}>
                      {t('{{count}} agent(s) awaiting approval', { count: stats.attention_required.pending_agent_approvals })}
                    </Text>
                    <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
                  </Pressable>
                )}
                {stats.attention_required.open_reports > 0 && (
                  <Pressable style={styles.attentionRow} onPress={() => router.push('/coordinator/reports')}>
                    <MaterialIcons name="report" size={16} color={color.warn600} />
                    <Text style={styles.attentionText}>
                      {t('{{count}} open report(s)', { count: stats.attention_required.open_reports })}
                    </Text>
                    <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
                  </Pressable>
                )}
              </View>
            </>
          )
        )}

        {/* RECENT ACTIVITIES — Coordinator Dashboard spec item 3. A short
            preview of the state-wide Activity Log; "View all" opens the
            full, paginated list (app/coordinator/activity-log.tsx). */}
        {isCoordinator && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginTop: 0 }]}>{t('Recent activities')}</Text>
              <Pressable onPress={() => router.push('/coordinator/activity-log')} accessibilityRole="button">
                <Text style={styles.viewAllLink}>{t('View all')}</Text>
              </Pressable>
            </View>
            <View style={styles.activityCard}>
              {recentActivity.length === 0 ? (
                <Text style={styles.activityEmpty}>{t('No activity yet.')}</Text>
              ) : (
                recentActivity.map((item, index) => {
                  const { date, time } = formatActivityWhen(item.created_at);
                  return (
                    <View key={item.id} style={[styles.activityRow, index > 0 && styles.activityRowDivider]}>
                      <View style={styles.activityIconTile}>
                        <MaterialIcons name={ACTIVITY_ACTION_ICONS[item.action] || 'history'} size={16} color={color.brand600} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityLine} numberOfLines={2}>
                          <Text style={styles.activityActor}>{item.actor_name}</Text>
                          <Text style={styles.activityArrow}> {'→'} </Text>
                          <Text style={styles.activityAction}>{item.action_display}</Text>
                        </Text>
                        <Text style={styles.activityMeta} numberOfLines={1}>
                          {item.lga_details?.name ? `${item.lga_details.name} ${'•'} ` : ''}{date} {'•'} {time}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },

  // Header
  header: {
    backgroundColor: color.brand900,
    paddingBottom: 64,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    marginTop: space.md,
    marginBottom: space.xl,
  },
  brandName: {
    color: '#FFF',
    fontFamily: font.extrabold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
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

  // Profile Section
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl },
  profileInfo: { flex: 1, marginLeft: space.lg },
  userName: { color: '#FFF', fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.19 },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 5,
  },
  idLabel: { color: 'rgba(255,255,255,0.72)', fontFamily: font.bold, fontSize: 10.5, marginRight: 4 },
  idValue: { color: '#FFF', fontFamily: font.extrabold, fontSize: 11.5, letterSpacing: 0.4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: 'rgba(255,255,255,0.72)', fontFamily: font.bold, fontSize: 12 },

  // Floating Stats
  floatingStatsContainer: { marginTop: -44, paddingHorizontal: space.xl, zIndex: 10 },
  floatingStatsCard: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.e2,
  },
  quickStat: { alignItems: 'center', flex: 1 },
  quickStatValue: { fontFamily: font.extrabold, fontSize: 20 },
  quickStatLabel: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    color: color.ink400,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  verticalDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: color.border },

  // Content
  content: { flex: 1, paddingHorizontal: space.xl, marginTop: -40 },
  sectionTitle: { ...type.heading, marginBottom: space.md, marginTop: space.xxl },

  // Action Grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  actionCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.lg,
    ...shadow.e1,
  },
  actionIconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },
  actionTitle: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900 },
  actionSubtitle: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400, marginTop: 2 },

  // Stats Rows
  statsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },

  syncCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    marginTop: space.lg,
  },
  syncHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.md },
  syncTitle: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
  syncCountsRow: { flexDirection: 'row', gap: space.xl },
  syncCountBox: { flex: 1 },
  syncCountValue: { fontFamily: font.extrabold, fontSize: 22 },
  syncCountLabel: { fontFamily: font.medium, fontSize: 12, color: color.ink400, marginTop: 2 },
  syncHint: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: space.md, lineHeight: 18 },

  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.md,
  },
  statRowText: { flex: 1 },
  statRowLabel: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400 },
  statRowValue: { fontFamily: font.extrabold, fontSize: 15.5, color: color.ink900, marginTop: 1 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.accent100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  trendText: { color: color.accent600, fontFamily: font.extrabold, fontSize: 11, marginLeft: 2 },
  horizontalDivider: { height: StyleSheet.hairlineWidth, backgroundColor: color.border },

  // Recent activities preview
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  viewAllLink: { fontFamily: font.extrabold, fontSize: 12.5, color: color.brand600 },
  activityCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  activityEmpty: { fontFamily: font.medium, fontSize: 13, color: color.ink400, textAlign: 'center', paddingVertical: space.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
  activityRowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border },
  activityIconTile: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
    marginRight: space.md,
  },
  activityLine: { fontSize: 13, lineHeight: 18 },
  activityActor: { fontFamily: font.extrabold, color: color.ink900 },
  activityArrow: { fontFamily: font.bold, color: color.ink300 },
  activityAction: { fontFamily: font.bold, color: color.ink600 },
  activityMeta: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: 2 },

  // Attention required (item 9)
  attentionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
    overflow: 'hidden',
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FDE68A',
  },
  attentionText: { flex: 1, fontFamily: font.bold, fontSize: 13, color: '#92400E' },
});
