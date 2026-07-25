import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { agentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { EmailVerificationBanner } from '@/src/components/EmailVerificationBanner';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { Avatar } from '@/src/components/ui';

export default function AgentDashboard() {
  const router = useRouter();
  const { t } = useTranslation();

  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    total_artisans: 0,
    verified_artisans: 0,
    pending_verification: 0,
    total_clients: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // --- ACTIONS ---

  const fetchDashboardData = async () => {
    try {
      const data = await agentAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.log("Dashboard Error", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t("Log Out"),
      t("Are you sure you want to exit?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Log Out"),
          style: 'destructive',
          onPress: async () => {
            if (logout) {
              await logout();
            } else {
              await SecureStore.deleteItemAsync('accessToken');
              await SecureStore.deleteItemAsync('refreshToken');
              await AsyncStorage.removeItem('user');
            }
            router.replace('/login');
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
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
            <Text style={styles.brandName}>S-MAHII {t('Agent')}</Text>
            <Pressable style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel={t('Log Out')}>
              <MaterialIcons name="logout" size={16} color="#FECACA" />
              <Text style={styles.logoutText}>{t('Exit')}</Text>
            </Pressable>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <Avatar name={displayName} uri={user?.profile_picture} size={60} borderRadius={20} online />
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
          </View>

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
            title={t('State clients')}
            subtitle={t('View all')}
            icon="groups"
            tileBg={color.brand100}
            tileFg={color.brand600}
            onPress={() => router.push('/agent/clients')}
          />
          {user?.role === 'state_coordinator' && (
            <ActionCard
              title={t('My agents')}
              subtitle={t('Oversee & manage')}
              icon="supervisor-account"
              tileBg={color.accent100}
              tileFg={color.accent600}
              onPress={() => router.push('/coordinator/agents')}
            />
          )}
        </View>

        {/* PERFORMANCE OVERVIEW */}
        <Text style={styles.sectionTitle}>{t('Performance')}</Text>
        <View style={styles.statsCard}>
          <StatRow
            title={t('State clients')}
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
        </View>

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
});
