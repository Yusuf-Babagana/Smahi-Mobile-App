
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
import { IconSymbol } from '@/src/components/IconSymbol';
import { storage } from '@/src/utils/storage';
import { adminAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { User } from '@/src/types';

export default function AdminDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    totalBookings: 0,
    pendingVerifications: 0,
  });
  const [users, setUsers] = useState<User[]>([]);

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

      const statsData = await adminAPI.getStats();
      setStats(statsData);

      const allUsers = await adminAPI.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading admin data:', error);
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
          await logout();
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Dashboard</Text>
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

        <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Platform Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalUsers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Total Users
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalArtisans}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Artisans
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalBookings}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Bookings
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9500' }]}>
                {stats.pendingVerifications}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Pending
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.dark ? '#1C1C1E' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            All Users ({users.length})
          </Text>
          {users.map((u) => (
            <View
              key={u.id}
              style={[styles.userItem, { borderBottomColor: theme.colors.border }]}
            >
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>{u.name}</Text>
                <Text style={[styles.userEmail, { color: theme.dark ? '#98989D' : '#666' }]}>
                  {u.email}
                </Text>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      u.role === 'super_admin'
                        ? '#FF3B30'
                        : u.role === 'agent'
                          ? '#FF9500'
                          : u.role === 'artisan'
                            ? '#34C759'
                            : '#007AFF',
                  },
                ]}
              >
                <Text style={styles.roleText}>{u.role.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
