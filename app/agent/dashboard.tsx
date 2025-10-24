
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
import { authAPI, verificationAPI } from '@/src/api/client';
import { User, Verification } from '@/src/types';

export default function AgentDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);

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

      const pendingVerifications = await verificationAPI.getPendingVerifications();
      setVerifications(pendingVerifications);
    } catch (error) {
      console.error('Error loading agent data:', error);
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

  const handleApprove = async (verificationId: string) => {
    try {
      await verificationAPI.updateVerification(verificationId, 'approved', user!.id);
      Alert.alert('Success', 'Verification approved');
      loadData();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      Alert.alert('Error', error.message || 'Failed to approve verification');
    }
  };

  const handleReject = async (verificationId: string) => {
    Alert.alert('Reject Verification', 'Are you sure you want to reject this verification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await verificationAPI.updateVerification(verificationId, 'rejected', user!.id);
            Alert.alert('Success', 'Verification rejected');
            loadData();
          } catch (error: any) {
            console.error('Error rejecting verification:', error);
            Alert.alert('Error', error.message || 'Failed to reject verification');
          }
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Agent Dashboard</Text>
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
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Pending Verifications ({verifications.length})
          </Text>
          {verifications.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              No pending verifications
            </Text>
          ) : (
            verifications.map((verification) => (
              <View
                key={verification.id}
                style={[
                  styles.verificationItem,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.verificationInfo}>
                  <Text style={[styles.verificationText, { color: theme.colors.text }]}>
                    Artisan ID: {verification.artisanId.substring(0, 8)}...
                  </Text>
                  <Text style={[styles.verificationDate, { color: theme.dark ? '#98989D' : '#666' }]}>
                    Requested: {new Date(verification.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.verificationActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(verification.id)}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(verification.id)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  verificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  verificationInfo: {
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  verificationDate: {
    fontSize: 12,
  },
  verificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
