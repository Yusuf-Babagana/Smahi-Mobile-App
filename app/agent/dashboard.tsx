import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Alert, Dimensions, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function AgentDashboard() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    total_artisans: 0,
    verified_artisans: 0,
    pending_tickets: 0,
    resolved_tickets: 0,
    total_agents: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- ACTIONS ---

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.log("Dashboard Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
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

  const QuickStat = ({ value, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickStat} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ActionButton = ({ title, icon, color1, color2, onPress }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={[color1, color2]} style={styles.actionGradient}>
        <View style={styles.actionIconCircle}>
          <Ionicons name={icon} size={24} color={color1} />
        </View>
        <Text style={styles.actionText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const StatRow = ({ title, value, icon, color, trend }: any) => (
    <View style={styles.statRow}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statRowText}>
        <Text style={styles.statRowLabel}>{title}</Text>
        <Text style={styles.statRowValue}>{value}</Text>
      </View>
      {trend && (
        <View style={styles.trendBadge}>
          <Ionicons name="arrow-up" size={12} color="#10B981" />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. HEADER SECTION */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4338ca']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>

          {/* Top Bar with Logout */}
          <View style={styles.topBar}>
            <View style={styles.branding}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.brandName}>Smahi Agent</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="power" size={20} color="#FECACA" />
              <Text style={styles.logoutText}>Exit</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </Text>
                </View>
              )}
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.first_name || 'Agent'} {user?.last_name || ''}
              </Text>

              <View style={styles.idBadge}>
                <Text style={styles.idLabel}>ID:</Text>
                <Text style={styles.idValue}>{user?.serial_number || 'PENDING'}</Text>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#93C5FD" />
                <Text style={styles.locationText}>
                  {user?.lga_details?.name || 'Local Govt'}, {user?.state_details?.name || 'State'}
                </Text>
              </View>
            </View>
          </View>

        </SafeAreaView>
      </LinearGradient>

      {/* 2. FLOATING STATS CARD */}
      <View style={styles.floatingStatsContainer}>
        <View style={styles.floatingStatsCard}>
          <QuickStat
            value={stats.total_artisans}
            label="Artisans"
            color="#4F46E5"
            onPress={() => router.push('/agent/artisans')}
          />
          <View style={styles.verticalDivider} />
          <QuickStat value={stats.verified_artisans} label="Verified" color="#10B981" />
          <View style={styles.verticalDivider} />
          <QuickStat value={stats.pending_tickets} label="Pending" color="#F59E0B" />
        </View>
      </View>

      {/* 3. SCROLL CONTENT */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        showsVerticalScrollIndicator={false}
      >

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Agent Actions</Text>
        <View style={styles.actionGrid}>
          <ActionButton
            title="Register Artisan"
            icon="person-add"
            color1="#4F46E5" color2="#4338ca"
            onPress={() => router.push('/agent/register')}
          />

          {/* ✅ FIXED: Now points to /agent/tickets (mapped to app/agent/tickets/index.tsx) */}
          <ActionButton
            title="My Complaints"
            icon="document-text"
            color1="#F59E0B" color2="#D97706"
            onPress={() => router.push('/agent/tickets')}
          />

          <ActionButton
            title="Verify Identity"
            icon="scan"
            color1="#10B981" color2="#059669"
            onPress={() => Alert.alert("Scan", "Scanner opening...")}
          />
          <ActionButton
            title="My Wallet"
            icon="wallet"
            color1="#EC4899" color2="#DB2777"
            onPress={() => Alert.alert("Balance", "₦0.00")}
          />
        </View>

        {/* PERFORMANCE OVERVIEW */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.statsCard}>
          <StatRow title="Funds Collected" value="₦0.00" icon="cash" color="#10B981" trend="+0%" />
          <View style={styles.horizontalDivider} />
          <StatRow title="Resolved Cases" value={stats.resolved_tickets} icon="checkmark-done-circle" color="#3B82F6" />
          <View style={styles.horizontalDivider} />
          <StatRow title="Pending Verifications" value="0" icon="time" color="#F59E0B" />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: { height: 240, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, paddingBottom: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 10, marginBottom: 20 },
  branding: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  brandName: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },

  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  logoutText: { color: '#FECACA', fontSize: 12, fontWeight: '700' },

  // Profile Section
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarPlaceholder: { backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#1e1b4b' },

  profileInfo: { flex: 1 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  idBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  idLabel: { color: '#BFDBFE', fontSize: 11, fontWeight: '600', marginRight: 4 },
  idValue: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#BFDBFE', fontSize: 12, fontWeight: '500' },

  // Floating Stats
  floatingStatsContainer: { position: 'absolute', top: 200, left: 20, right: 20, zIndex: 10 },
  floatingStatsCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, alignItems: 'center', justifyContent: 'space-between' },
  quickStat: { alignItems: 'center', flex: 1 },
  quickStatValue: { fontSize: 20, fontWeight: '800' },
  quickStatLabel: { fontSize: 11, color: '#6B7280', marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  verticalDivider: { width: 1, height: 32, backgroundColor: '#F3F4F6' },

  // Content
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginTop: 24, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Action Grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: (width - 52) / 2, height: 100, borderRadius: 20, shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, backgroundColor: '#FFF', overflow: 'hidden' },
  actionGradient: { flex: 1, padding: 14, justifyContent: 'space-between' },
  actionIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // Stats Rows
  statsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  statRowText: { flex: 1 },
  statRowLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  statRowValue: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendText: { color: '#10B981', fontSize: 11, fontWeight: '700', marginLeft: 2 },
  horizontalDivider: { height: 1, backgroundColor: '#F3F4F6' },
});