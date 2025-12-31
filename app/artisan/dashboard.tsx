
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@/components/IconSymbol';
import { storage } from '@/src/utils/storage';
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { User, Artisan, Booking } from '@/src/types';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// --- Helper for Date Formatting ---
const formatDate = (dateString: string) => {
  if (!dateString) return { day: '00', month: '---' };
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  return { day, month };
};

// --- Reusable Stat Card ---
interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconSymbolName;
  color: string;
  delay: number;
  fullWidth?: boolean;
}

const StatCard = ({ label, value, icon, color, delay, fullWidth }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={[
        styles.statCard,
        { backgroundColor: theme.colors.card },
        fullWidth && styles.statCardFull
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
};

export default function ArtisanDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadData = async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) return router.replace('/login');
      setUser(currentUser);

      const artisanProfile = await artisanAPI.getArtisanByUserId(currentUser.id);
      setArtisan(artisanProfile);

      if (artisanProfile) {
        const artisanBookings = await bookingAPI.getBookingsByArtisan(artisanProfile.id);
        setBookings(artisanBookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'See you soon!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        }
      },
    ]);
  };

  const handleBookingPress = (booking: Booking) => {
    Alert.alert('Booking Details', `Service request for ${booking.time}\nStatus: ${booking.status}`);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* 1. Header with Profile Avatar (Clickable) */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <Pressable
          style={styles.headerProfile}
          onPress={() => router.push('/artisan/profile')}
        >
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'A'}</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>View Profile</Text>
          </View>
        </Pressable>

        <Pressable onPress={handleLogout} style={[styles.iconBtn, { backgroundColor: theme.colors.card }]}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={theme.colors.primary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* 2. Verification Alert */}
        {artisan?.verificationStatus !== 'approved' && (
          <Animated.View entering={FadeInDown} style={styles.alertBox}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9500" />
            <Text style={styles.alertText}>
              Status: <Text style={{ fontWeight: '700' }}>{artisan?.verificationStatus?.toUpperCase()}</Text>.
              {'\n'}Complete verification to accept jobs.
            </Text>
          </Animated.View>
        )}

        {/* 3. Stats Grid (Added Earnings) */}
        <View style={styles.grid}>
          {/* Main Earner Card */}
          <StatCard
            label="Total Earnings"
            value="₦ 450,000"
            icon="banknote.fill" // Ensure this icon exists in your IconSymbol mapping
            color="#34C759"
            delay={100}
            fullWidth
          />
          <StatCard
            label="Rating"
            value={artisan?.rating?.toFixed(1) || '0.0'}
            icon="star.fill"
            color="#FFD700"
            delay={200}
          />
          <StatCard
            label="Pending Jobs"
            value={bookings.filter(b => b.status === 'pending').length}
            icon="clock.fill"
            color="#FF9500"
            delay={300}
          />
        </View>

        {/* 4. Recent Activity List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Requests</Text>
          <Pressable><Text style={{ color: theme.colors.primary }}>See All</Text></Pressable>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="calendar.badge.exclamationmark" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No bookings requests yet.</Text>
          </View>
        ) : (
          bookings.map((booking, i) => {
            const { day, month } = formatDate(booking.date);
            return (
              <Animated.View
                key={booking.id}
                entering={FadeInDown.delay(400 + (i * 100))}
              >
                <Pressable
                  onPress={() => handleBookingPress(booking)}
                  style={({ pressed }) => [
                    styles.bookingCard,
                    { backgroundColor: theme.colors.card, opacity: pressed ? 0.9 : 1 }
                  ]}
                >
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateMonth}>{month}</Text>
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.bookingTitle, { color: theme.colors.text }]}>
                      New Service Request
                    </Text>
                    <Text style={styles.bookingTime}>Time: {booking.time}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: booking.status === 'confirmed' ? '#34C75920' : '#FF950020'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: booking.status === 'confirmed' ? '#34C759' : '#FF9500'
                      }]}>
                        {booking.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#C7C7CC" />
                </Pressable>
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, color: '#999' },
  iconBtn: { padding: 10, borderRadius: 12 },

  alertBox: {
    backgroundColor: '#FFF4E5',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
    borderWidth: 1, borderColor: '#FFE0B2'
  },
  alertText: { flex: 1, color: '#663C00', fontSize: 14, lineHeight: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%', // flexible width
    flexGrow: 1,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statCardFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 13, color: '#999', fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },

  emptyState: { alignItems: 'center', padding: 40, opacity: 0.6 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 16 },

  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  dateBox: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 16,
  },
  dateDay: { fontWeight: '800', fontSize: 18, color: '#333' },
  dateMonth: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  bookingInfo: { flex: 1 },
  bookingTitle: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  bookingTime: { color: '#888', fontSize: 13, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});

