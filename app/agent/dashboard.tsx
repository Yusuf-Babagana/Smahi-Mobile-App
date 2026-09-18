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
  Linking,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, referralAPI } from '@/src/api/client';
import { color, font, radius, space, shadow } from '@/constants/theme';
import { Avatar, useToast, useConfirm } from '@/src/components/ui';
import { useOfflineQueue } from '@/src/utils/offlineQueue';
import { ReferralSummary } from '@/src/types';

const { width } = Dimensions.get('window');

export default function AgentDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const confirm = useConfirm();
  const { show: showToast } = useToast();
  const { user, logout } = useAuth();

  // If a State Coordinator somehow enters here, redirect directly to Coordinator Command Center
  useEffect(() => {
    if (user?.role === 'state_coordinator') {
      router.replace('/coordinator/dashboard');
    }
  }, [user?.role, router]);

  const { counts: syncCounts } = useOfflineQueue('agent_register_artisan');

  const [stats, setStats] = useState({
    total_artisans: 0,
    verified_artisans: 0,
    pending_verification: 0,
    total_clients: 0,
    pending_service_requests: 0,
  });

  const [recentArtisans, setRecentArtisans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [referral, setReferral] = useState<ReferralSummary | null>(null);

  const fetchAgentData = async () => {
    try {
      const statsData = await agentAPI.getDashboardStats();
      if (statsData) setStats(statsData);
    } catch (error) {
      console.log('Error fetching agent stats:', error);
    }

    try {
      const referralData = await referralAPI.getMyReferral();
      setReferral(referralData);
    } catch (error) {
      console.log('Error fetching agent referral:', error);
    }

    try {
      const artisansData = await agentAPI.getStateArtisans({}, 1);
      if (artisansData?.results) {
        setRecentArtisans(artisansData.results.slice(0, 4));
      }
    } catch (error) {
      console.log('Error fetching recent artisans:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  // Refetch whenever this screen regains focus — e.g. navigating back
  // after registering an artisan/business/agent, which keeps this
  // screen's earlier instance mounted rather than remounting it, so
  // the counts otherwise stayed stale until a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      fetchAgentData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgentData();
  };

  const agentReferralCode = referral?.referral_code || user?.serial_number || 'SMAHI-AGENT';

  const shareText = `Join S-MAHI as an artisan or registered business in our LGA!\n\n1. Download S-MAHI on Google Play:\nhttps://play.google.com/store/apps/details?id=com.smahi.app\n\n2. Register using my Agent Referral Code:\n${agentReferralCode}\n\nStart onboarding to connect with customers in our community!`;

  const copyReferralCode = async () => {
    await Clipboard.setStringAsync(shareText);
    showToast(t('Referral message and link copied!'), { type: 'success' });
  };

  const copyAgentId = async () => {
    const id = user?.serial_number || agentReferralCode;
    await Clipboard.setStringAsync(id);
    showToast(t('Agent ID copied to clipboard!'), { type: 'success' });
  };

  const shareWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    Linking.openURL(url).catch(() => {
      showToast(t('WhatsApp not installed or could not be opened.'), { type: 'error' });
    });
  };

  const shareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    Linking.openURL(url).catch(() => {
      showToast(t('Could not open SMS messenger.'), { type: 'error' });
    });
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('Log Out'),
      message: t('Are you sure you want to log out of the Agent Portal?'),
      confirmLabel: t('Log Out'),
      destructive: true,
    });
    if (ok) {
      await logout();
      router.replace('/welcome');
    }
  };

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Field Agent';
  const lgaName = (user as any)?.lga_details?.name || (user as any)?.lga?.name || 'Local Government';
  const stateName = (user as any)?.state_details?.name || (user as any)?.state?.name || 'State';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. HERO FIELD CREDENTIAL HEADER */}
      <LinearGradient
        colors={['#071E3D', '#0B2E5B', '#1B5FD9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fieldHeader}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          {/* Top Bar: Live Jurisdiction Pill, Key & Logout */}
          <View style={styles.topBar}>
            <View style={styles.territoryBadge}>
              <View style={styles.liveDot} />
              <Ionicons name="location-sharp" size={13} color="#22D3EE" />
              <Text style={styles.territoryText}>{lgaName.toUpperCase()} {t('FIELD OFFICE')}</Text>
            </View>

            <View style={styles.topActionsRow}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push('/change-password')}
                accessibilityRole="button"
                accessibilityLabel={t('Change password')}
              >
                <Ionicons name="key-outline" size={17} color="#38BDF8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel={t('Log out')}
              >
                <MaterialIcons name="logout" size={18} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Agent Identity Tile */}
          <View style={styles.agentProfileRow}>
            <View style={styles.avatarGlowWrap}>
              <Avatar
                name={displayName}
                uri={user?.profile_picture}
                gender={user?.gender}
                size={62}
                borderRadius={20}
              />
            </View>

            <View style={styles.profileTextWrap}>
              <View style={styles.roleTag}>
                <Ionicons name="shield-checkmark" size={12} color="#38BDF8" />
                <Text style={styles.roleLabel}>{t('OFFICIAL FIELD AGENT')}</Text>
              </View>

              <Text style={styles.agentName} numberOfLines={1}>{displayName}</Text>

              <View style={styles.badgeRow}>
                <TouchableOpacity
                  style={styles.idBadge}
                  onPress={copyAgentId}
                  accessibilityRole="button"
                  accessibilityLabel={t('Copy Agent ID')}
                >
                  <MaterialIcons name="fingerprint" size={13} color="#22D3EE" />
                  <Text style={styles.idBadgeText}>{user?.serial_number || 'AGT-ID'}</Text>
                  <MaterialIcons name="content-copy" size={11} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                <View style={styles.locationPill}>
                  <Ionicons name="map-outline" size={12} color="#93C5FD" />
                  <Text style={styles.locationText}>{lgaName}, {stateName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Coordinator Supervisor Endorsement */}
          {referral?.coordinator && (
            <View style={styles.sponsorBanner}>
              <MaterialIcons name="verified-user" size={15} color="#34D399" />
              <Text style={styles.sponsorText}>
                {t('Supervised by State Coordinator {{name}}', { name: referral.coordinator.name })}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* 2. ELEVATED FLOATING KPI DECK (4 Interactive Pods) */}
      <View style={styles.statsOverlapContainer}>
        <View style={styles.statsCard}>
          {/* Stat 1: Total Artisans */}
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push('/agent/artisans')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconTile, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="engineering" size={16} color="#1D4ED8" />
            </View>
            <Text style={[styles.statValue, { color: '#0F172A' }]}>{stats.total_artisans}</Text>
            <Text style={styles.statLabel}>{t('Artisans')}</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          {/* Stat 2: Verified Badges */}
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push({ pathname: '/agent/artisans', params: { filter: 'approved' } })}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconTile, { backgroundColor: '#ECFDF5' }]}>
              <MaterialIcons name="verified" size={16} color="#059669" />
            </View>
            <Text style={[styles.statValue, { color: '#059669' }]}>{stats.verified_artisans}</Text>
            <Text style={styles.statLabel}>{t('Verified')}</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          {/* Stat 3: Pending Review */}
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push({ pathname: '/agent/artisans', params: { filter: 'pending' } })}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconTile, { backgroundColor: '#FFFBEB' }]}>
              <MaterialIcons name="hourglass-top" size={16} color="#D97706" />
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.pending_verification}</Text>
            <Text style={styles.statLabel}>{t('Pending')}</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          {/* Stat 4: Service Requests */}
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push('/agent/service-requests')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconTile, { backgroundColor: stats.pending_service_requests > 0 ? '#FEF2F2' : '#EEF2FF' }]}>
              <MaterialIcons
                name="event-note"
                size={16}
                color={stats.pending_service_requests > 0 ? '#DC2626' : '#4F46E5'}
              />
            </View>
            <Text
              style={[
                styles.statValue,
                { color: stats.pending_service_requests > 0 ? '#DC2626' : '#4F46E5' },
              ]}
            >
              {stats.pending_service_requests}
            </Text>
            <Text style={styles.statLabel}>{t('Requests')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. SCROLLABLE OPERATIONS STREAM */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B5FD9" />}
      >
        {/* OFFLINE SYNC CARD */}
        {syncCounts.total > 0 && (
          <View style={styles.syncCard}>
            <View style={styles.syncHeaderRow}>
              <View style={[styles.syncIconWrap, { backgroundColor: syncCounts.pending_sync > 0 ? '#FEF3C7' : '#DCFCE7' }]}>
                <MaterialIcons
                  name={syncCounts.pending_sync > 0 ? 'cloud-upload' : 'cloud-done'}
                  size={18}
                  color={syncCounts.pending_sync > 0 ? '#D97706' : '#16A34A'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>{t('Offline Sync Queue')}</Text>
                <Text style={styles.syncSubtitle}>
                  {syncCounts.pending_sync > 0
                    ? t('{{count}} items queued for cloud upload', { count: syncCounts.pending_sync })
                    : t('All registrations synced with server')}
                </Text>
              </View>
            </View>

            <View style={styles.syncCountsRow}>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: '#D97706' }]}>{syncCounts.pending_sync}</Text>
                <Text style={styles.syncCountLabel}>{t('Pending')}</Text>
              </View>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: '#059669' }]}>{syncCounts.server_verified}</Text>
                <Text style={styles.syncCountLabel}>{t('Synced')}</Text>
              </View>
              {syncCounts.failed > 0 && (
                <View style={styles.syncCountBox}>
                  <Text style={[styles.syncCountValue, { color: '#DC2626' }]}>{syncCounts.failed}</Text>
                  <Text style={styles.syncCountLabel}>{t('Needs Review')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* PRIMARY GROUND ACTIONS (Hero Banners) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('Ground Operations')}</Text>
          <Text style={styles.sectionCaption}>{t('Direct Field Registration')}</Text>
        </View>

        <View style={styles.heroActionDeck}>
          {/* Hero 1: Register Artisan */}
          <TouchableOpacity
            style={styles.heroActionCard}
            onPress={() => router.push('/agent/register')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1B5FD9', '#1044A5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionGradient}
            >
              <View style={styles.heroActionTop}>
                <View style={styles.heroIconCircle}>
                  <MaterialIcons name="person-add-alt-1" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroBadgePill}>
                  <Text style={styles.heroBadgeText}>{t('PRIMARY TASK')}</Text>
                </View>
              </View>

              <Text style={styles.heroActionTitle}>{t('Register Artisan')}</Text>
              <Text style={styles.heroActionDesc}>
                {t('Onboard local tradespeople, mechanics, plumbers, and carpenters.')}
              </Text>

              <View style={styles.heroActionFooter}>
                <Text style={styles.heroActionCta}>{t('Start Registration')}</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Hero 2: Register Business */}
          <TouchableOpacity
            style={styles.heroActionCard}
            onPress={() => router.push('/agent/register-business')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0F766E', '#065F46']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionGradient}
            >
              <View style={styles.heroActionTop}>
                <View style={[styles.heroIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <MaterialIcons name="storefront" size={24} color="#FFFFFF" />
                </View>
                <View style={[styles.heroBadgePill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.heroBadgeText}>{t('ENTERPRISE')}</Text>
                </View>
              </View>

              <Text style={styles.heroActionTitle}>{t('Register Business')}</Text>
              <Text style={styles.heroActionDesc}>
                {t('Enroll shops, repair centers, clinics, and local enterprises.')}
              </Text>

              <View style={styles.heroActionFooter}>
                <Text style={styles.heroActionCta}>{t('Register Shop')}</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 4-GRID TERRITORY MANAGEMENT HUB */}
        <View style={[styles.sectionHeaderRow, { marginTop: space.lg }]}>
          <Text style={styles.sectionTitle}>{t('Territory Hub')}</Text>
          <Text style={styles.sectionCaption}>{t('Manage LGA Directory')}</Text>
        </View>

        <View style={styles.hubGrid}>
          {/* Hub 1: LGA Artisans Directory */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push('/agent/artisans')}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="engineering" size={22} color="#1D4ED8" />
            </View>
            <Text style={styles.hubCardTitle}>{t('LGA Artisans')}</Text>
            <Text style={styles.hubCardSub}>{t('{{count}} enrolled', { count: stats.total_artisans })}</Text>
            <View style={styles.hubChevronWrap}>
              <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Hub 2: LGA Businesses Directory */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push('/agent/businesses')}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <MaterialIcons name="domain" size={22} color="#059669" />
            </View>
            <Text style={styles.hubCardTitle}>{t('LGA Businesses')}</Text>
            <Text style={styles.hubCardSub}>{t('Physical verify')}</Text>
            <View style={styles.hubChevronWrap}>
              <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Hub 3: Service Requests */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push('/agent/service-requests')}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconWrap, { backgroundColor: stats.pending_service_requests > 0 ? '#FEF3C7' : '#EEF2FF' }]}>
              <MaterialIcons
                name="assignment"
                size={22}
                color={stats.pending_service_requests > 0 ? '#D97706' : '#4F46E5'}
              />
            </View>
            <Text style={styles.hubCardTitle}>{t('Service Bookings')}</Text>
            <Text
              style={[
                styles.hubCardSub,
                stats.pending_service_requests > 0 && { color: '#D97706', fontFamily: font.bold },
              ]}
            >
              {stats.pending_service_requests > 0
                ? t('{{count}} waiting', { count: stats.pending_service_requests })
                : t('Client requests')}
            </Text>
            <View style={styles.hubChevronWrap}>
              <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Hub 4: LGA Clients */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push('/agent/clients')}
            activeOpacity={0.8}
          >
            <View style={[styles.hubIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <MaterialIcons name="people-alt" size={22} color="#9333EA" />
            </View>
            <Text style={styles.hubCardTitle}>{t('LGA Clients')}</Text>
            <Text style={styles.hubCardSub}>{t('{{count}} registered', { count: stats.total_clients })}</Text>
            <View style={styles.hubChevronWrap}>
              <MaterialIcons name="chevron-right" size={18} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. RECENT LGA ARTISANS LIST STREAM */}
        <View style={[styles.sectionHeaderRow, { marginTop: space.xl }]}>
          <Text style={styles.sectionTitle}>{t('Recent LGA Artisans')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/agent/artisans')}
            style={styles.viewAllBtn}
            accessibilityRole="button"
            accessibilityLabel={t('View all artisans')}
          >
            <Text style={styles.viewAllText}>{t('View All')}</Text>
            <MaterialIcons name="chevron-right" size={16} color="#1B5FD9" />
          </TouchableOpacity>
        </View>

        {recentArtisans.length > 0 ? (
          <View style={styles.recentStreamCard}>
            {recentArtisans.map((item, index) => {
              const person = item.user_details || {};
              const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || t('Artisan');
              const trade = i18n.language === 'ha' && item.category_name_ha
                ? item.category_name_ha
                : (item.profession_name || item.category_name || t('General Artisan'));
              const isVerified = item.verification_status === 'approved';
              const isLast = index === recentArtisans.length - 1;

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.artisanRow,
                    isLast && { borderBottomWidth: 0 },
                    pressed && { backgroundColor: '#F8FAFC' },
                  ]}
                  onPress={() => router.push({ pathname: '/agent/artisans/[id]', params: { id: item.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                >
                  <Avatar
                    name={name}
                    uri={person.profile_picture}
                    gender={person.gender}
                    size={46}
                    verified={isVerified}
                  />

                  <View style={styles.artisanMeta}>
                    <Text style={styles.artisanName} numberOfLines={1}>{name}</Text>
                    <View style={styles.tradePill}>
                      <Text style={styles.tradeText} numberOfLines={1}>{trade}</Text>
                    </View>
                  </View>

                  {person.registration_fee_paid === false ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEF2F2' }]}>
                      <MaterialIcons name="error-outline" size={13} color="#DC2626" />
                      <Text style={[styles.statusBadgeText, { color: '#DC2626', fontFamily: font.extrabold }]}>
                        {t('₦2.5k Unpaid')}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB' }]}>
                      <MaterialIcons
                        name={isVerified ? 'verified' : 'schedule'}
                        size={13}
                        color={isVerified ? '#059669' : '#D97706'}
                      />
                      <Text style={[styles.statusBadgeText, { color: isVerified ? '#059669' : '#D97706' }]}>
                        {isVerified ? t('Verified') : t('Pending')}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyArtisansCard}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="engineering" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>{t('No artisans registered yet')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('You are the official agent for this LGA. Start onboarding local tradespeople today!')}
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaButton}
              onPress={() => router.push('/agent/register')}
            >
              <MaterialIcons name="person-add" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCtaText}>{t('Register First Artisan')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. AGENT VIP RECRUITMENT PASS */}
        <View style={[styles.sectionHeaderRow, { marginTop: space.xl }]}>
          <Text style={styles.sectionTitle}>{t('Agent Recruitment Pass')}</Text>
          <Text style={styles.sectionCaption}>{t('Share Your Referral Code')}</Text>
        </View>

        <View style={styles.referralPassCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralPassHeader}
          >
            <View style={styles.passHeaderLeft}>
              <View style={styles.passChip}>
                <Ionicons name="sparkles" size={12} color="#F59E0B" />
                <Text style={styles.passChipText}>{t('OFFICIAL PASS')}</Text>
              </View>
              <Text style={styles.passTitle}>{t('Field Referral Code')}</Text>
            </View>
            <View style={styles.qrBadgeCircle}>
              <MaterialIcons name="qr-code-2" size={24} color="#38BDF8" />
            </View>
          </LinearGradient>

          <View style={styles.referralPassBody}>
            <Text style={styles.passInstruction}>
              {t('Share this code with artisans and businesses so they enroll under your direct field supervision.')}
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeText} selectable>
                {agentReferralCode}
              </Text>
            </View>

            {/* Tactile 1-Tap Share Triggers */}
            <View style={styles.shareDeck}>
              <TouchableOpacity
                style={styles.shareWhatsAppBtn}
                onPress={shareWhatsApp}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                <Text style={styles.shareBtnText}>{t('WhatsApp')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareSMSBtn}
                onPress={shareSMS}
                activeOpacity={0.8}
              >
                <MaterialIcons name="sms" size={16} color="#FFF" />
                <Text style={styles.shareBtnText}>{t('SMS')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareCopyBtn}
                onPress={copyReferralCode}
                activeOpacity={0.8}
              >
                <MaterialIcons name="content-copy" size={16} color="#0F172A" />
                <Text style={[styles.shareBtnText, { color: '#0F172A' }]}>{t('Copy')}</Text>
              </TouchableOpacity>
            </View>

            {/* Performance Stats */}
            <View style={styles.passStatsRow}>
              <View style={styles.passStatBox}>
                <Text style={styles.passStatNum}>
                  {referral?.total_artisans_registered ?? stats.total_artisans}
                </Text>
                <Text style={styles.passStatLabel}>{t('Artisans Enrolled')}</Text>
              </View>
              <View style={styles.passStatDivider} />
              <View style={styles.passStatBox}>
                <Text style={[styles.passStatNum, { color: '#059669' }]}>
                  {stats.verified_artisans}
                </Text>
                <Text style={styles.passStatLabel}>{t('Verified Badges')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },

  /* 1. HERO FIELD HEADER */
  fieldHeader: {
    paddingBottom: 44,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  safeHeader: {
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  territoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  liveDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  territoryText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: '#F8FAFC',
    letterSpacing: 0.6,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  agentProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    gap: 14,
  },
  avatarGlowWrap: {
    padding: 2.5,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  profileTextWrap: {
    flex: 1,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleLabel: {
    fontFamily: font.extrabold,
    fontSize: 10,
    color: '#93C5FD',
    letterSpacing: 1,
  },
  agentName: {
    fontFamily: font.extrabold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  idBadgeText: {
    fontFamily: font.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    gap: 4,
  },
  locationText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#E0F2FE',
  },
  sponsorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sponsorText: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: '#E0F2FE',
  },

  /* 2. ELEVATED FLOATING STATS CARD */
  statsOverlapContainer: {
    paddingHorizontal: 16,
    marginTop: -30,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#071E3D',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statIconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: font.extrabold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: font.bold,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },

  /* 3. SCROLL CONTENT */
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: font.extrabold,
    fontSize: 14.5,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCaption: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: '#94A3B8',
  },

  /* SYNC CARD */
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  syncHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  syncIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitle: {
    fontFamily: font.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  syncSubtitle: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  syncCountsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  syncCountBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  syncCountValue: {
    fontFamily: font.extrabold,
    fontSize: 15,
  },
  syncCountLabel: {
    fontFamily: font.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },

  /* HERO ACTIONS DECK */
  heroActionDeck: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  heroActionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  heroActionGradient: {
    padding: 16,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  heroActionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontFamily: font.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroActionTitle: {
    fontFamily: font.extrabold,
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: -0.3,
  },
  heroActionDesc: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  heroActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroActionCta: {
    fontFamily: font.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* 4-GRID HUB */
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  hubCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    position: 'relative',
  },
  hubIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hubCardTitle: {
    fontFamily: font.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  hubCardSub: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  hubChevronWrap: {
    position: 'absolute',
    top: 14,
    right: 12,
  },

  /* RECENT ARTISANS STREAM */
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: '#1B5FD9',
  },
  recentStreamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 2,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  artisanMeta: {
    flex: 1,
  },
  artisanName: {
    fontFamily: font.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  tradePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  tradeText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#475569',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeText: {
    fontFamily: font.bold,
    fontSize: 11,
  },
  emptyArtisansCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: font.bold,
    fontSize: 14.5,
    color: '#0F172A',
  },
  emptySubtitle: {
    fontFamily: font.medium,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5FD9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  emptyCtaText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  /* 5. AGENT VIP RECRUITMENT PASS */
  referralPassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  referralPassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passHeaderLeft: {},
  passChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passChipText: {
    fontFamily: font.bold,
    fontSize: 10,
    color: '#F59E0B',
    letterSpacing: 0.6,
  },
  passTitle: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 2,
  },
  qrBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralPassBody: {
    padding: 16,
  },
  passInstruction: {
    fontFamily: font.medium,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  codeContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  codeText: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: '#1B5FD9',
    letterSpacing: 2,
  },
  shareDeck: {
    flexDirection: 'row',
    gap: 8,
  },
  shareWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  shareSMSBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5FD9',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  shareCopyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  shareBtnText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  passStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  passStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  passStatNum: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: '#0F172A',
  },
  passStatLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  passStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
});
