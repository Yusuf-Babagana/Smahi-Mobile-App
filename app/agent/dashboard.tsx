import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// API & UTILS
import { authAPI, verificationAPI } from '@/src/api/client';
import { storage } from '@/src/utils/storage';
import { colors, shadows } from '@/styles/commonStyles';

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);

      const pendingList = await verificationAPI.getPendingVerifications();
      setVerifications(pendingList || []);
    } catch (error) {
      console.log('Error loading agent data:', error);
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

  // --- ACTIONS ---
  const handleLogout = async () => {
    Alert.alert('Logout', 'Sign out of Agent Account?', [
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
      await verificationAPI.updateVerification(verificationId, 'approved', user.id);
      Alert.alert('Success', 'Verification approved');
      loadData(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve');
    }
  };

  const handleReject = async (verificationId: string) => {
    Alert.alert('Reject', 'Reject this verification request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await verificationAPI.updateVerification(verificationId, 'rejected', user.id);
            loadData();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Helper Data
  const displayName = user ? `${user.name}` : 'Agent';
  const location = user?.lga ? `${user.lga}, ${user.state}` : 'Field Agent';

  return (
    <View style={styles.container}>

      {/* 1. HEADER GRADIENT */}
      <LinearGradient
        colors={[colors.primary, '#0056b3']}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeLabel}>Agent Dashboard</Text>
              <Text style={styles.nameLabel}>{displayName}</Text>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={12} color="#FFF" />
                <Text style={styles.locationText}>{location}</Text>
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

        {/* 2. STATS GRID */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{verifications.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="time" size={18} color="#F97316" />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Verified</Text>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₦0</Text>
            <Text style={styles.statLabel}>Balance</Text>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="wallet" size={18} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* 3. VERIFICATION LIST */}
        <Text style={styles.sectionTitle}>Verification Requests</Text>

        {verifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No pending verifications.</Text>
            <Text style={styles.emptySubText}>Great job! You're all caught up.</Text>
          </View>
        ) : (
          verifications.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestIcon}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>Artisan ID: {item.artisanId.substring(0, 8)}...</Text>
                  <Text style={styles.requestDate}>
                    Requested: {new Date(item.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>PENDING</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(item.id)}
                >
                  <Ionicons name="close-circle" size={18} color="#FFF" />
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { paddingBottom: 25, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  welcomeLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  nameLabel: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 2 },
  locationBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8
  },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, height: 44, width: 44, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { padding: 20 },

  // Stats Grid
  grid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    position: 'relative', ...shadows.small
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, fontWeight: '600' },
  iconCircle: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  // Verification List
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },

  emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#FFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD' },
  emptyText: { color: '#333', marginTop: 12, fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#999', fontSize: 13, marginTop: 4 },

  requestCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    ...shadows.small
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  requestIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  requestName: { fontSize: 15, fontWeight: '700', color: '#333' },
  requestDate: { fontSize: 12, color: '#888' },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#D97706' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  approveBtn: { backgroundColor: '#22C55E' },
  rejectBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },
});