import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API & UTILS
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { colors, shadows } from '@/styles/commonStyles'; // Adjusted to match standard path

const BASE_URL = 'https://smahi1.pythonanywhere.com/api';
const CLOUD_NAME = 'dvj6cw5dq';

export default function ArtisanDashboard() {
  const router = useRouter();

  // STATE
  const [user, setUser] = useState<any>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    try {
      // 1. Get Token
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return router.replace('/login');

      // 2. Fetch Fresh User Profile
      try {
        const userRes = await axios.get(`${BASE_URL}/auth/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);

        // 3. Fetch Artisan Details
        const artisanProfile = await artisanAPI.getArtisanByUserId(userRes.data.id);
        setArtisan(artisanProfile);

        // 4. Fetch Bookings
        if (artisanProfile) {
          const artisanBookings = await bookingAPI.getBookingsByArtisan(artisanProfile.id);
          setBookings(artisanBookings || []);
        }

      } catch (err) {
        console.log("Error fetching data", err);
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

  const getImageUrl = (imgData: any) => {
    if (!imgData) return null;
    let url = typeof imgData === 'string' ? imgData : imgData.url;
    if (!url) return null;
    if (!url.startsWith('http') && url.includes('image/upload')) {
      return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
    }
    if (url.startsWith('http:')) {
      return url.replace('http:', 'https:');
    }
    return url;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getDisplayName = () => {
    if (!user) return 'Artisan';
    if (user.first_name) return user.first_name;
    if (user.name) return user.name;
    return 'Artisan';
  };

  const displayName = getDisplayName();
  const serviceCategory = artisan?.service_category || user?.service_category || 'Service Provider';
  const rating = artisan?.rating ? artisan.rating.toFixed(1) : '5.0';
  const jobCount = bookings.length;
  // Use a more realistic format if possible, or keep as string
  const earnings = "₦ 0.00";
  const profilePicUrl = getImageUrl(user?.profile_picture);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER */}
      <LinearGradient
        colors={['#103d75', '#1e64bc']} // A richer, deeper blue gradient
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>

            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeLabel}>Welcome back,</Text>
              <Text style={styles.nameLabel} numberOfLines={1}>{displayName}</Text>
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceText}>{serviceCategory}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => router.push('/artisan/profile')}>
                {profilePicUrl ? (
                  <Image source={{ uri: profilePicUrl }} style={styles.headerAvatar} />
                ) : (
                  <View style={styles.headerAvatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{displayName.charAt(0)}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 2. AVAILABILITY CARD */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.dot, { backgroundColor: isAvailable ? '#22C55E' : '#9CA3AF' }]} />
              <Text style={styles.statusTitle}>
                {isAvailable ? "Available for Jobs" : "Currently Offline"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
              thumbColor={isAvailable ? "#22C55E" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
          <Text style={styles.statusSubtitle}>
            {isAvailable
              ? "You are visible to clients in search results."
              : "Switch on when you are ready to take new jobs."}
          </Text>
        </View>

        {/* 3. STATS GRID */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="briefcase-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{jobCount}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEFCE8' }]}>
              <Ionicons name="star-outline" size={24} color="#EAB308" />
            </View>
            <Text style={styles.statValue}>{rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* 4. VERIFICATION ALERT */}
        {artisan?.verificationStatus && artisan?.verificationStatus !== 'approved' && (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={24} color="#C2410C" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Verification Pending</Text>
              <Text style={styles.alertText}>
                Visit an agent in your LGA to verify your account and start receiving more jobs.
              </Text>
            </View>
          </View>
        )}

        {/* 5. QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionList}>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/chat')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#15803d" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Messages</Text>
              <Text style={styles.actionSubtitle}>Chat with your clients</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/artisan/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="person-outline" size={22} color="#0369a1" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/artisan/portfolio')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="images-outline" size={22} color="#7e22ce" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>My Portfolio</Text>
              <Text style={styles.actionSubtitle}>Showcase your work</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => Alert.alert("Coming Soon")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="settings-outline" size={22} color="#be123c" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>App preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10
  },

  welcomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginBottom: 2 },
  nameLabel: { fontSize: 26, fontWeight: '700', color: '#FFF', letterSpacing: -0.5 },
  serviceBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  serviceText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitials: { color: '#FFF', fontSize: 22, fontWeight: '700' },

  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 0,
    borderRadius: 14,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },

  scrollContent: { paddingHorizontal: 20, marginTop: -25 },

  // Status Card
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  statusSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18 },

  // Grid
  grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8F8F8'
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  statValue: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  // Alert
  alertBox: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#9A3412', marginBottom: 2 },
  alertText: { fontSize: 13, color: '#9A3412', lineHeight: 18 },

  // Actions
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12, marginLeft: 4 },
  actionList: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  actionSubtitle: { fontSize: 12, color: '#9CA3AF' },
});