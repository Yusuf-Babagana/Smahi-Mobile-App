import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // Standard Expo Icons

// API & UTILS
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { colors, shadows } from '@/styles/commonStyles';

export default function ArtisanDashboard() {
  const router = useRouter();

  // STATE
  const [user, setUser] = useState<any>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true); // Availability Toggle

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    try {
      // 1. Get Current User
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) return router.replace('/login');
      setUser(currentUser);

      // 2. Get Artisan Profile
      // Note: Assuming currentUser.id links to artisan profile
      const artisanProfile = await artisanAPI.getArtisanByUserId(currentUser.id);
      setArtisan(artisanProfile);

      // 3. Get Bookings
      if (artisanProfile) {
        const artisanBookings = await bookingAPI.getBookingsByArtisan(artisanProfile.id);
        setBookings(artisanBookings || []);
      }
    } catch (error) {
      console.log("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // --- DERIVED DATA ---
  const displayName = user ? `${user.name}` : 'Artisan';
  const serviceCategory = artisan?.service_category || 'Service Provider';
  const rating = artisan?.rating ? artisan.rating.toFixed(1) : '5.0';
  const jobCount = bookings.length;
  // Dummy earnings for now (Backend update needed for real earnings)
  const earnings = "₦ 0.00";

  return (
    <View style={styles.container}>

      {/* 1. HEADER WITH GRADIENT */}
      <LinearGradient
        colors={[colors.primary, '#0056b3']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeLabel}>Welcome back,</Text>
              <Text style={styles.nameLabel}>{displayName}</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceText}>{serviceCategory}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* 2. AVAILABILITY CARD */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.dot, { backgroundColor: isAvailable ? '#22C55E' : '#EF4444' }]} />
              <Text style={styles.statusTitle}>
                {isAvailable ? "Available for Jobs" : "Currently Busy"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#767577", true: "#bbf7d0" }}
              thumbColor={isAvailable ? "#22C55E" : "#f4f3f4"}
            />
          </View>
          <Text style={styles.statusSubtitle}>
            {isAvailable
              ? "Clients can find you in search results."
              : "You are hidden from new clients."}
          </Text>
        </View>

        {/* 3. STATS GRID */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="wallet" size={22} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="briefcase" size={22} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{jobCount}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEFCE8' }]}>
              <Ionicons name="star" size={22} color="#EAB308" />
            </View>
            <Text style={styles.statValue}>{rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* 4. VERIFICATION ALERT */}
        {artisan?.verificationStatus !== 'approved' && (
          <View style={styles.alertBox}>
            <Ionicons name="warning" size={24} color="#C2410C" />
            <Text style={styles.alertText}>
              Your account is <Text style={{ fontWeight: '700' }}>Pending Verification</Text>.
              Please visit an agent in your LGA to get verified.
            </Text>
          </View>
        )}

        {/* 5. QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionList}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/artisan/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert("Coming Soon")}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="images" size={20} color="#9333EA" />
            </View>
            <Text style={styles.actionText}>My Portfolio</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { borderBottomWidth: 0 }]} onPress={() => Alert.alert("Coming Soon")}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="settings" size={20} color="#E11D48" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  welcomeLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  nameLabel: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 2 },
  serviceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 8
  },
  serviceText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, height: 44, width: 44, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  // Status Card
  statusCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, ...shadows.medium },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  statusSubtitle: { fontSize: 13, color: '#666' },

  // Grid
  grid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    alignItems: 'center', ...shadows.small
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', fontWeight: '600' },

  // Alert
  alertBox: {
    backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FFEDD5'
  },
  alertText: { flex: 1, fontSize: 13, color: '#9A3412', lineHeight: 20 },

  // Actions
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  actionList: { backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 5, ...shadows.small },
  actionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
});