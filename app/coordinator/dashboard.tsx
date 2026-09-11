import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, coordinatorAPI, referralAPI, locationAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Avatar, useToast, useConfirm } from '@/src/components/ui';
import { ReferralSummary } from '@/src/types';

const { width } = Dimensions.get('window');

export default function CoordinatorDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const confirm = useConfirm();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_artisans: 0,
    verified_artisans: 0,
    pending_verification: 0,
    total_clients: 0,
    total_agents: 0,
    active_agents: 0,
    pending_agents: 0,
    total_businesses: 0,
    pending_business_verification: 0,
    attention_required: {
      pending_artisan_verification: 0,
      pending_business_verification: 0,
      pending_agent_approvals: 0,
      open_reports: 0,
    },
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [referral, setReferral] = useState<ReferralSummary | null>(null);
  const [lgas, setLgas] = useState<any[]>([]);

  const fetchCoordinatorData = useCallback(async () => {
    try {
      // 1. Dashboard Stats
      const statsData = await agentAPI.getDashboardStats();
      if (statsData) {
        setStats(prev => ({
          ...prev,
          ...statsData,
          total_agents: statsData.total_agents ?? statsData.active_agents ?? prev.total_agents,
          active_agents: statsData.active_agents ?? prev.active_agents,
          pending_agents: statsData.pending_agents ?? prev.pending_agents,
        }));
      }

      // 2. Activity Log
      const activityData = await coordinatorAPI.getActivityLog(1);
      setRecentActivity((activityData.results || []).slice(0, 5));

      // 3. Referral Network
      const referralData = await referralAPI.getMyReferral();
      setReferral(referralData);

      // 4. LGAs in this State
      if (user?.state) {
        const lgaList = await locationAPI.getLGAs(Number(user.state));
        setLgas(lgaList || []);
      }
    } catch (error) {
      console.log('Error fetching coordinator dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.state]);

  useEffect(() => {
    fetchCoordinatorData();
  }, [fetchCoordinatorData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoordinatorData();
  };

  const copyReferralCode = async () => {
    const code = referral?.referral_code;
    if (!code) return;
    await Clipboard.setStringAsync(code);
    showToast(t('Referral code copied!'), { type: 'success' });
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('Log Out'),
      message: t('Are you sure you want to log out of the Coordinator Command Center?'),
      confirmLabel: t('Log Out'),
      destructive: true,
    });
    if (ok) {
      await logout();
      router.replace('/welcome');
    }
  };

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'State Coordinator';
  const stateName = (user as any)?.state_details?.name || 'State';
  const serialId = user?.serial_number || `COORD-${stateName.slice(0, 3).toUpperCase()}-${user?.id ?? '01'}`;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. EXECUTIVE HEADER DECK */}
      <LinearGradient
        colors={['#081830', '#0E2448', '#163668']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.executiveHeader}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          {/* Top Bar: Official Jurisdiction Pill & Actions */}
          <View style={styles.topBar}>
            <View style={styles.jurisdictionBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#F59E0B" />
              <Text style={styles.jurisdictionText}>{stateName.toUpperCase()} {t('STATE EXECUTIVE')}</Text>
            </View>

            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/change-password')}
                accessibilityRole="button"
                accessibilityLabel={t('Change password')}
              >
                <Ionicons name="key-outline" size={17} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push('/coordinator/reports')}
                accessibilityRole="button"
                accessibilityLabel={t('Dispute reports')}
              >
                <MaterialIcons name="notifications-none" size={20} color="#FFFFFF" />
                {(stats.attention_required?.open_reports ?? 0) > 0 && (
                  <View style={styles.notificationDot} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel={t('Log out')}
              >
                <MaterialIcons name="logout" size={19} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Coordinator Profile Presentation */}
          <View style={styles.coordinatorProfileRow}>
            <View style={styles.avatarWrapper}>
              <Avatar
                name={displayName}
                uri={user?.profile_picture}
                gender={user?.gender}
                size={58}
                borderRadius={18}
              />
              <View style={styles.executivePillBadge}>
                <Ionicons name="star" size={10} color="#0F172A" />
              </View>
            </View>

            <View style={styles.profileTextWrap}>
              <Text style={styles.executiveRoleLabel}>{t('STATE COORDINATOR')}</Text>
              <Text style={styles.coordinatorName} numberOfLines={1}>{displayName}</Text>
              <View style={styles.idRow}>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>{serialId}</Text>
                </View>
                <View style={styles.lgaCountBadge}>
                  <MaterialIcons name="domain" size={12} color="#93C5FD" />
                  <Text style={styles.lgaCountText}>{lgas.length} {t('LGAs')}</Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* 2. SCROLLABLE COMMAND DECK */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />
        }
      >
        {/* HERO CTA: RECRUIT & ONBOARD NEW AGENT */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.recruitHeroCard}
          onPress={() => router.push('/coordinator/create-agent')}
        >
          <LinearGradient
            colors={['#1E3A8A', '#1E40AF', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.recruitHeroGradient}
          >
            <View style={styles.recruitHeroLeft}>
              <View style={styles.recruitIconWrap}>
                <MaterialIcons name="person-add-alt-1" size={24} color="#F59E0B" />
              </View>
              <View style={styles.recruitTextWrap}>
                <Text style={styles.recruitHeroTitle}>{t('Recruit New Agent')}</Text>
                <Text style={styles.recruitHeroSubtitle}>
                  {t('Onboard agent with personal email & send credentials')}
                </Text>
              </View>
            </View>
            <View style={styles.recruitChevronWrap}>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* STATE-WIDE STRATEGIC KPIS */}
        <Text style={styles.deckSectionHeader}>{t('State Overview Metrics')}</Text>
        <View style={styles.statsDeckGrid}>
          {/* Card 1: Active Agents */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/coordinator/agents')}
            activeOpacity={0.8}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <MaterialIcons name="supervisor-account" size={18} color="#2563EB" />
              </View>
              <Text style={styles.metricBadgePositive}>
                {stats.pending_agents > 0 ? `${stats.pending_agents} pending` : 'Active'}
              </Text>
            </View>
            <Text style={styles.metricValue}>{stats.total_agents || stats.active_agents || 0}</Text>
            <Text style={styles.metricLabel}>{t('Field Agents')}</Text>
            <Text style={styles.metricSubtext}>
              {t('Overseeing {{count}} LGAs', { count: lgas.length })}
            </Text>
          </TouchableOpacity>

          {/* Card 2: State Artisans */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push({ pathname: '/agent/artisans', params: { filter: 'approved' } })}
            activeOpacity={0.8}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <MaterialIcons name="handyman" size={18} color="#059669" />
              </View>
              <Text style={[styles.metricBadgePositive, { backgroundColor: '#ECFDF5', color: '#059669' }]}>
                {stats.verified_artisans} {t('Verified')}
              </Text>
            </View>
            <Text style={styles.metricValue}>{stats.total_artisans || 0}</Text>
            <Text style={styles.metricLabel}>{t('State Artisans')}</Text>
            <Text style={styles.metricSubtext}>
              {stats.pending_verification} {t('pending verification')}
            </Text>
          </TouchableOpacity>

          {/* Card 3: Registered Businesses */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/agent/businesses')}
            activeOpacity={0.8}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="storefront" size={18} color="#D97706" />
              </View>
            </View>
            <Text style={styles.metricValue}>{stats.total_businesses || 0}</Text>
            <Text style={styles.metricLabel}>{t('Businesses')}</Text>
            <Text style={styles.metricSubtext}>
              {stats.pending_business_verification || 0} {t('pending review')}
            </Text>
          </TouchableOpacity>

          {/* Card 4: Registered Clients */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/agent/clients')}
            activeOpacity={0.8}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <MaterialIcons name="groups" size={18} color="#9333EA" />
              </View>
            </View>
            <Text style={styles.metricValue}>{stats.total_clients || 0}</Text>
            <Text style={styles.metricLabel}>{t('State Clients')}</Text>
            <Text style={styles.metricSubtext}>{t('Across state territory')}</Text>
          </TouchableOpacity>
        </View>

        {/* GOVERNANCE & COMMAND ACTIONS */}
        <Text style={styles.deckSectionHeader}>{t('Executive Governance')}</Text>
        <View style={styles.actionsPanel}>
          <TouchableOpacity
            style={styles.actionRowItem}
            onPress={() => router.push('/coordinator/agents')}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <MaterialIcons name="manage-accounts" size={22} color="#4F46E5" />
            </View>
            <View style={styles.actionRowTextWrap}>
              <Text style={styles.actionRowTitle}>{t('My Agents Directory')}</Text>
              <Text style={styles.actionRowSubtitle}>{t('Manage, activate, and review agent performance')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRowItem}
            onPress={() => router.push('/coordinator/lgas')}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <MaterialIcons name="map" size={22} color="#16A34A" />
            </View>
            <View style={styles.actionRowTextWrap}>
              <Text style={styles.actionRowTitle}>{t('LGA Territory Coverage')}</Text>
              <Text style={styles.actionRowSubtitle}>{t('Explore each LGA, agent assignments & gaps')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRowItem}
            onPress={() => router.push('/coordinator/activity-log')}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="history" size={22} color="#2563EB" />
            </View>
            <View style={styles.actionRowTextWrap}>
              <Text style={styles.actionRowTitle}>{t('State Activity Audit Log')}</Text>
              <Text style={styles.actionRowSubtitle}>{t('Live feed of all agent actions and verifications')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRowItem}
            onPress={() => router.push('/coordinator/reports')}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <MaterialIcons name="report-problem" size={22} color="#DC2626" />
            </View>
            <View style={styles.actionRowTextWrap}>
              <Text style={styles.actionRowTitle}>{t('Disputes & Incident Reports')}</Text>
              <Text style={styles.actionRowSubtitle}>
                {stats.attention_required?.open_reports
                  ? t('{{count}} open reports requiring review', { count: stats.attention_required.open_reports })
                  : t('Track client and artisan disputes')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* STATE REFERRAL CODE CARD */}
        <Text style={styles.deckSectionHeader}>{t('Official State Referral Code')}</Text>
        <View style={styles.referralCard}>
          <View style={styles.referralTopRow}>
            <View style={styles.referralIconBox}>
              <MaterialIcons name="qr-code-2" size={26} color="#0B2E5B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.referralLabel}>{t('Share to recruit agents & service providers')}</Text>
              <Text style={styles.referralValue} selectable>
                {referral?.referral_code || 'SMAHI-STATE-REF'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyReferralCode}
              accessibilityRole="button"
              accessibilityLabel={t('Copy code')}
            >
              <MaterialIcons name="content-copy" size={16} color="#0B2E5B" />
              <Text style={styles.copyButtonText}>{t('Copy')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.referralStatsDeck}>
            <View style={styles.referralStatCell}>
              <Text style={styles.referralStatNum}>{referral?.total_agents ?? stats.total_agents ?? 0}</Text>
              <Text style={styles.referralStatSub}>{t('Agents Recruited')}</Text>
            </View>
            <View style={styles.referralStatDivider} />
            <View style={styles.referralStatCell}>
              <Text style={styles.referralStatNum}>
                {referral?.total_service_providers_recorded ?? stats.total_artisans ?? 0}
              </Text>
              <Text style={styles.referralStatSub}>{t('State Providers')}</Text>
            </View>
          </View>
        </View>

        {/* RECENT STATE ACTIVITIES */}
        {recentActivity.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.deckSectionHeader}>{t('Recent State Activities')}</Text>
              <TouchableOpacity onPress={() => router.push('/coordinator/activity-log')}>
                <Text style={styles.viewAllText}>{t('View all')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityListCard}>
              {recentActivity.map((act, index) => (
                <View key={act.id || index}>
                  <View style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityActionText}>
                        {act.action_display || act.action || t('Activity recorded')}
                      </Text>
                      <Text style={styles.activitySubText}>
                        {act.actor_name || t('Agent')} • {act.lga_details?.name || stateName}
                      </Text>
                    </View>
                    <Text style={styles.activityTimeText}>
                      {act.created_at ? new Date(act.created_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Slate-100 executive neutral canvas
  },
  executiveHeader: {
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  safeHeader: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  jurisdictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  jurisdictionText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: '#F8FAFC',
    letterSpacing: 0.8,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  coordinatorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  executivePillBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0E2448',
  },
  profileTextWrap: {
    flex: 1,
  },
  executiveRoleLabel: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: '#F59E0B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  coordinatorName: {
    fontFamily: font.extrabold,
    fontSize: 19,
    color: '#FFFFFF',
    marginTop: 2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  idBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  idBadgeText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  lgaCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 197, 253, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  lgaCountText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#93C5FD',
  },

  contentScroll: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },

  /* HERO RECRUIT CARD */
  recruitHeroCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: '#1E40AF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  recruitHeroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  recruitHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  recruitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recruitTextWrap: {
    flex: 1,
  },
  recruitHeroTitle: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recruitHeroSubtitle: {
    fontFamily: font.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  recruitChevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deckSectionHeader: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 10,
  },
  viewAllText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: color.brand600,
  },

  /* STATS GRID */
  statsDeckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  metricCard: {
    width: (width - 36 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBadgePositive: {
    fontFamily: font.bold,
    fontSize: 10,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricValue: {
    fontFamily: font.extrabold,
    fontSize: 22,
    color: '#0F172A',
  },
  metricLabel: {
    fontFamily: font.bold,
    fontSize: 13,
    color: '#334155',
    marginTop: 2,
  },
  metricSubtext: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* ACTIONS PANEL */
  actionsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionRowIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTextWrap: {
    flex: 1,
  },
  actionRowTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  actionRowSubtitle: {
    fontFamily: font.medium,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 72,
  },

  /* REFERRAL CARD */
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 22,
  },
  referralTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF1FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralLabel: {
    fontFamily: font.medium,
    fontSize: 12,
    color: '#64748B',
  },
  referralValue: {
    fontFamily: font.extrabold,
    fontSize: 17,
    color: '#0B2E5B',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF1FD',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyButtonText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: '#0B2E5B',
  },
  referralStatsDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  referralStatCell: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatNum: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: '#0F172A',
  },
  referralStatSub: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  referralStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  /* RECENT ACTIVITIES */
  activityListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  activityContent: {
    flex: 1,
  },
  activityActionText: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: '#0F172A',
  },
  activitySubText: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  activityTimeText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
