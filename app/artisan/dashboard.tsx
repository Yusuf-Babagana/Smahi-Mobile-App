
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { storage } from '@/src/utils/storage';
import { authAPI, artisanAPI, bookingAPI } from '@/src/api/client';
import { User, Artisan, Booking } from '@/src/types';

export default function ArtisanDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
        return;
      }

      setUser(currentUser);

      const artisanProfile = await artisanAPI.getArtisanByUserId(currentUser.id);
      setArtisan(artisanProfile);

      if (artisanProfile) {
        const artisanBookings = await bookingAPI.getBookingsByArtisan(artisanProfile.id);
        setBookings(artisanBookings);
      }
    } catch (error) {
      console.error('Error loading artisan data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Artisan Dashboard
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Welcome Back!</Text>
          <Text style={[styles.cardText, { color: theme.dark ? '#98989D' : '#666' }]}>
            {user?.name}
          </Text>
          <Text style={[styles.cardText, { color: theme.dark ? '#98989D' : '#666' }]}>
            {user?.email}
          </Text>
        </View>

        {artisan ? (
          <>
            <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Profile Status
              </Text>
              <View style={styles.statusRow}>
                <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Category:
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {artisan.category}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Verification:
                </Text>
                <Text
                  style={[
                    styles.value,
                    {
                      color:
                        artisan.verificationStatus === 'approved'
                          ? '#34C759'
                          : artisan.verificationStatus === 'pending'
                          ? '#FF9500'
                          : theme.colors.text,
                    },
                  ]}
                >
                  {artisan.verificationStatus.toUpperCase()}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Rating:
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {artisan.rating.toFixed(1)} ⭐ ({artisan.reviewCount} reviews)
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Bookings ({bookings.length})
              </Text>
              {bookings.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  No bookings yet
                </Text>
              ) : (
                bookings.map((booking) => (
                  <View key={booking.id} style={styles.bookingItem}>
                    <Text style={[styles.bookingText, { color: theme.colors.text }]}>
                      {booking.date} at {booking.time}
                    </Text>
                    <Text
                      style={[
                        styles.bookingStatus,
                        {
                          color:
                            booking.status === 'confirmed'
                              ? '#34C759'
                              : booking.status === 'pending'
                              ? '#FF9500'
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              No Artisan Profile
            </Text>
            <Text style={[styles.cardText, { color: theme.dark ? '#98989D' : '#666' }]}>
              You need to create an artisan profile to start receiving bookings.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  logoutButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookingText: {
    fontSize: 14,
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});
