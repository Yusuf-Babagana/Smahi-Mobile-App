import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/contexts/AuthContext';
import { agentAPI, referralAPI } from '@/src/api/client';
import { color, font, radius, space, shadow } from '@/constants/theme';
import { Avatar, Button, StatTile, useToast, useConfirm } from '@/src/components/ui';
import { useOfflineQueue } from '@/src/utils/offlineQueue';
import { ReferralSummary } from '@/src/types';

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

      {/* HEADER */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Avatar name={displayName} uri={user?.profile_picture} gender={user?.gender} size={48} borderRadius={14} />

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerRole}>{t('Field Agent')}</Text>
            <Text style={styles.headerName} numberOfLines={1}>{displayName}</Text>
            <View style={styles.headerMetaRow}>
              <MaterialIcons name="place" size={13} color={color.ink300} />
              <Text style={styles.headerMetaText} numberOfLines={1}>{lgaName}, {stateName}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/change-password')}
              accessibilityRole="button"
              accessibilityLabel={t('Change password')}
            >
              <Ionicons name="key-outline" size={18} color={color.ink600} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel={t('Log out')}
            >
              <MaterialIcons name="logout" size={18} color={color.ink600} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.idRow}>
          <View style={styles.idPill}>
            <MaterialIcons name="badge" size={13} color={color.brand600} />
            <Text style={styles.idPillText}>{user?.serial_number || t('No ID assigned')}</Text>
          </View>
          <TouchableOpacity onPress={copyAgentId} accessibilityRole="button" accessibilityLabel={t('Copy Agent ID')}>
            <MaterialIcons name="content-copy" size={14} color={color.ink300} />
          </TouchableOpacity>

          {referral?.coordinator && (
            <View style={styles.sponsorRow}>
              <MaterialIcons name="verified-user" size={13} color={color.accent600} />
              <Text style={styles.sponsorText} numberOfLines={1}>
                {t('Supervised by {{name}}', { name: referral.coordinator.name })}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
      >
        {/* STATS */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCell} onPress={() => router.push('/agent/artisans')} activeOpacity={0.7}>
            <StatTile icon="engineering" value={stats.total_artisans} label={t('Artisans')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push({ pathname: '/agent/artisans', params: { filter: 'approved' } })}
            activeOpacity={0.7}
          >
            <StatTile icon="verified" value={stats.verified_artisans} label={t('Verified')} tileBg={color.accent100} tileFg={color.accent600} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCell}
            onPress={() => router.push({ pathname: '/agent/artisans', params: { filter: 'pending' } })}
            activeOpacity={0.7}
          >
            <StatTile icon="hourglass-top" value={stats.pending_verification} label={t('Pending')} tileBg={color.warn100} tileFg={color.warn600} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCell} onPress={() => router.push('/agent/service-requests')} activeOpacity={0.7}>
            <StatTile
              icon="event-note"
              value={stats.pending_service_requests}
              label={t('Requests')}
              tileBg={stats.pending_service_requests > 0 ? '#FDECEC' : color.brand100}
              tileFg={stats.pending_service_requests > 0 ? color.danger600 : color.brand600}
            />
          </TouchableOpacity>
        </View>

        {/* OFFLINE SYNC */}
        {syncCounts.total > 0 && (
          <View style={styles.syncCard}>
            <View style={styles.syncHeaderRow}>
              <View style={[styles.syncIconWrap, { backgroundColor: syncCounts.pending_sync > 0 ? color.warn100 : color.accent100 }]}>
                <MaterialIcons
                  name={syncCounts.pending_sync > 0 ? 'cloud-upload' : 'cloud-done'}
                  size={18}
                  color={syncCounts.pending_sync > 0 ? color.warn600 : color.accent600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>{t('Sync status')}</Text>
                <Text style={styles.syncSubtitle}>
                  {syncCounts.pending_sync > 0
                    ? t('{{count}} items queued for upload', { count: syncCounts.pending_sync })
                    : t('All registrations synced')}
                </Text>
              </View>
            </View>

            <View style={styles.syncCountsRow}>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: color.warn600 }]}>{syncCounts.pending_sync}</Text>
                <Text style={styles.syncCountLabel}>{t('Pending')}</Text>
              </View>
              <View style={styles.syncCountBox}>
                <Text style={[styles.syncCountValue, { color: color.accent600 }]}>{syncCounts.server_verified}</Text>
                <Text style={styles.syncCountLabel}>{t('Synced')}</Text>
              </View>
              {syncCounts.failed > 0 && (
                <View style={styles.syncCountBox}>
                  <Text style={[styles.syncCountValue, { color: color.danger600 }]}>{syncCounts.failed}</Text>
                  <Text style={styles.syncCountLabel}>{t('Needs review')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* REGISTER */}
        <Text style={styles.sectionLabel}>{t('Register')}</Text>
        <View style={styles.registerRow}>
          <Button
            title={t('Artisan')}
            icon="person-add-alt-1"
            onPress={() => router.push('/agent/register')}
            style={styles.registerButton}
          />
          <Button
            title={t('Business')}
            icon="storefront"
            variant="secondary"
            onPress={() => router.push('/agent/register-business')}
            style={styles.registerButton}
          />
        </View>

        {/* MANAGE */}
        <Text style={styles.sectionLabel}>{t('Manage')}</Text>
        <View style={styles.listCard}>
          <TouchableOpacity style={styles.listRow} onPress={() => router.push('/agent/artisans')} activeOpacity={0.7}>
            <View style={[styles.listIconWrap, { backgroundColor: color.brand100 }]}>
              <MaterialIcons name="engineering" size={20} color={color.brand600} />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={styles.listTitle}>{t('Artisans')}</Text>
              <Text style={styles.listSubtitle}>{t('{{count}} enrolled', { count: stats.total_artisans })}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listRow} onPress={() => router.push('/agent/businesses')} activeOpacity={0.7}>
            <View style={[styles.listIconWrap, { backgroundColor: color.accent100 }]}>
              <MaterialIcons name="domain" size={20} color={color.accent600} />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={styles.listTitle}>{t('Businesses')}</Text>
              <Text style={styles.listSubtitle}>{t('Registered businesses')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listRow} onPress={() => router.push('/agent/service-requests')} activeOpacity={0.7}>
            <View style={[styles.listIconWrap, { backgroundColor: stats.pending_service_requests > 0 ? color.warn100 : color.brand100 }]}>
              <MaterialIcons
                name="assignment"
                size={20}
                color={stats.pending_service_requests > 0 ? color.warn600 : color.brand600}
              />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={styles.listTitle}>{t('Service requests')}</Text>
              <Text style={[styles.listSubtitle, stats.pending_service_requests > 0 && { color: color.warn600, fontFamily: font.bold }]}>
                {stats.pending_service_requests > 0
                  ? t('{{count}} waiting', { count: stats.pending_service_requests })
                  : t('Client requests')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listRow} onPress={() => router.push('/agent/clients')} activeOpacity={0.7}>
            <View style={[styles.listIconWrap, { backgroundColor: '#F3E8FF' }]}>
              <MaterialIcons name="people-alt" size={20} color="#9333EA" />
            </View>
            <View style={styles.listTextWrap}>
              <Text style={styles.listTitle}>{t('Clients')}</Text>
              <Text style={styles.listSubtitle}>{t('{{count}} registered', { count: stats.total_clients })}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
          </TouchableOpacity>
        </View>

        {/* RECENTLY REGISTERED */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t('Recently registered')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/agent/artisans')}
            style={styles.viewAllBtn}
            accessibilityRole="button"
            accessibilityLabel={t('View all artisans')}
          >
            <Text style={styles.viewAllText}>{t('View all')}</Text>
            <MaterialIcons name="chevron-right" size={16} color={color.brand600} />
          </TouchableOpacity>
        </View>

        {recentArtisans.length > 0 ? (
          <View style={styles.listCard}>
            {recentArtisans.map((item, index) => {
              const person = item.user_details || {};
              const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || t('Artisan');
              const trade = i18n.language === 'ha' && item.category_name_ha
                ? item.category_name_ha
                : (item.profession_name || item.category_name || t('General Artisan'));
              const isVerified = item.verification_status === 'approved';
              const isLast = index === recentArtisans.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.artisanRow, pressed && { backgroundColor: color.surfaceSunken }]}
                    onPress={() => router.push({ pathname: '/agent/artisans/[id]', params: { id: item.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                  >
                    <Avatar name={name} uri={person.profile_picture} gender={person.gender} size={44} verified={isVerified} />

                    <View style={styles.artisanMeta}>
                      <Text style={styles.artisanName} numberOfLines={1}>{name}</Text>
                      <Text style={styles.tradeText} numberOfLines={1}>{trade}</Text>
                    </View>

                    {person.registration_fee_paid === false ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#FDECEC' }]}>
                        <Text style={[styles.statusBadgeText, { color: color.danger600 }]}>{t('Unpaid')}</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: isVerified ? color.accent100 : color.warn100 }]}>
                        <Text style={[styles.statusBadgeText, { color: isVerified ? color.accent600 : color.warn600 }]}>
                          {isVerified ? t('Verified') : t('Pending')}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  {!isLast && <View style={styles.listDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="engineering" size={28} color={color.ink300} />
            </View>
            <Text style={styles.emptyTitle}>{t('No artisans registered yet')}</Text>
            <Text style={styles.emptySubtitle}>
              {t("You're the agent for this LGA — start onboarding local tradespeople.")}
            </Text>
            <Button
              title={t('Register your first artisan')}
              icon="person-add"
              onPress={() => router.push('/agent/register')}
              compact
              style={{ marginTop: space.md }}
            />
          </View>
        )}

        {/* REFERRAL CODE */}
        <Text style={styles.sectionLabel}>{t('Your referral code')}</Text>
        <View style={styles.referralCard}>
          <Text style={styles.referralHint}>
            {t('Share this code — anyone who registers with it is added to your network.')}
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText} selectable>{agentReferralCode}</Text>
          </View>

          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareWhatsAppBtn} onPress={shareWhatsApp} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
              <Text style={styles.shareBtnText}>{t('WhatsApp')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareSMSBtn} onPress={shareSMS} activeOpacity={0.8}>
              <MaterialIcons name="sms" size={16} color="#FFF" />
              <Text style={styles.shareBtnText}>{t('SMS')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareCopyBtn} onPress={copyReferralCode} activeOpacity={0.8}>
              <MaterialIcons name="content-copy" size={16} color={color.ink900} />
              <Text style={[styles.shareBtnText, { color: color.ink900 }]}>{t('Copy')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.referralStatsRow}>
            <View style={styles.referralStatBox}>
              <Text style={styles.referralStatNum}>{referral?.total_artisans_registered ?? stats.total_artisans}</Text>
              <Text style={styles.referralStatLabel}>{t('Enrolled')}</Text>
            </View>
            <View style={styles.referralStatDivider} />
            <View style={styles.referralStatBox}>
              <Text style={[styles.referralStatNum, { color: color.accent600 }]}>{stats.verified_artisans}</Text>
              <Text style={styles.referralStatLabel}>{t('Verified')}</Text>
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
    backgroundColor: color.surfaceSunken,
  },

  /* HEADER */
  headerSafe: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: space.sm,
    gap: space.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerRole: {
    fontFamily: font.bold,
    fontSize: 11.5,
    color: color.ink400,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerName: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: color.ink900,
    marginTop: 1,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  headerMetaText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: color.ink400,
  },
  headerActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: color.surfaceChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    flexWrap: 'wrap',
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.brand100,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  idPillText: {
    fontFamily: font.bold,
    fontSize: 11.5,
    color: color.brand600,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  sponsorText: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: color.ink400,
    flexShrink: 1,
  },

  /* SCROLL CONTENT */
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: 110,
  },

  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
  },
  statCell: {
    flex: 1,
  },

  sectionLabel: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: color.ink900,
    marginBottom: space.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
    marginTop: space.lg,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.brand600,
  },

  /* SYNC CARD */
  syncCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: color.border,
    ...shadow.e1,
  },
  syncHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  syncIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitle: {
    fontFamily: font.bold,
    fontSize: 13,
    color: color.ink900,
  },
  syncSubtitle: {
    fontFamily: font.medium,
    fontSize: 11,
    color: color.ink400,
    marginTop: 1,
  },
  syncCountsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  syncCountBox: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.sm,
    padding: space.sm,
    alignItems: 'center',
  },
  syncCountValue: {
    fontFamily: font.extrabold,
    fontSize: 15,
  },
  syncCountLabel: {
    fontFamily: font.medium,
    fontSize: 10.5,
    color: color.ink400,
    marginTop: 2,
  },

  /* REGISTER */
  registerRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
  },
  registerButton: {
    flex: 1,
  },

  /* LIST CARD (Manage / Recently registered) */
  listCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
    marginBottom: space.lg,
    ...shadow.e1,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    gap: space.md,
  },
  listIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextWrap: {
    flex: 1,
  },
  listTitle: {
    fontFamily: font.bold,
    fontSize: 14.5,
    color: color.ink900,
  },
  listSubtitle: {
    fontFamily: font.medium,
    fontSize: 12,
    color: color.ink400,
    marginTop: 2,
  },
  listDivider: {
    height: 1,
    backgroundColor: color.border,
    marginLeft: space.md + 40 + space.md,
  },

  /* RECENTLY REGISTERED ROWS */
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    gap: space.md,
  },
  artisanMeta: {
    flex: 1,
  },
  artisanName: {
    fontFamily: font.bold,
    fontSize: 14,
    color: color.ink900,
  },
  tradeText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: color.ink400,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusBadgeText: {
    fontFamily: font.bold,
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.xl,
    alignItems: 'center',
    marginBottom: space.lg,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  emptyTitle: {
    fontFamily: font.bold,
    fontSize: 14.5,
    color: color.ink900,
  },
  emptySubtitle: {
    fontFamily: font.medium,
    fontSize: 12,
    color: color.ink400,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  /* REFERRAL CODE */
  referralCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.lg,
    marginBottom: space.xl,
    ...shadow.e1,
  },
  referralHint: {
    fontFamily: font.medium,
    fontSize: 12.5,
    color: color.ink400,
    lineHeight: 18,
  },
  codeBox: {
    backgroundColor: color.surfaceSunken,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.brand600,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    marginVertical: space.md,
  },
  codeText: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: color.brand600,
    letterSpacing: 2,
  },
  shareRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  shareWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  shareSMSBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.brand600,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  shareCopyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surfaceChip,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  shareBtnText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  referralStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  referralStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatNum: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: color.ink900,
  },
  referralStatLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    color: color.ink400,
    marginTop: 2,
  },
  referralStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: color.border,
  },
});
