import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Import Storage

import { artisanAPI } from '@/src/api/client';
import { ArtisanCard } from '@/components/ArtisanCard';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

// Categories for filter
const CATEGORIES = ["All", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Mechanic"];
const CACHE_KEY = 'cached_artisans_list'; // ✅ Key for storage

export default function ClientHomeScreen() {
  const router = useRouter();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. LOAD CACHE ON MOUNT ---
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          console.log('Loaded artisans from cache');
          setArtisans(JSON.parse(cachedData));
          setLoading(false); // Show content immediately
        }
      } catch (e) {
        console.error("Failed to load cache", e);
      }
    };
    loadCache();
  }, []);

  // --- 2. FETCH FROM API ---
  const fetchArtisans = useCallback(async (isRefresh = false) => {
    try {
      // Only show full-screen loader if we have NO data and aren't refreshing
      if (artisans.length === 0 && !isRefresh) setLoading(true);

      const filters = {
        service: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery
      };

      const data = await artisanAPI.getArtisans(filters);

      if (data) {
        setArtisans(data);

        // ✅ Save to Cache only if viewing "All" (Main list)
        if (selectedCategory === 'All' && searchQuery === '') {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Failed to fetch artisans", error);
      // ❌ DO NOT clear artisans here. We keep the old data visible.
      if (isRefresh) {
        Alert.alert("Network Error", "Could not update the list. Showing saved artisans.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial Fetch (Network update)
  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtisans(true);
  };

  const handleBook = (artisanId: number) => {
    Alert.alert("Coming Soon", `Booking feature for Artisan #${artisanId} is coming next!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER & SEARCH */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find a Pro</Text>
          <Text style={styles.subGreeting}>Who do you need today?</Text>
        </View>
        <View style={styles.profileBtn}>
          <IconSymbol name="person.circle" size={36} color={colors.primary} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artisans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => fetchArtisans()}
        />
      </View>

      {/* CATEGORY FILTER */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ARTISAN LIST */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {loading && artisans.length === 0 ? "Loading..." : `${artisans.length} Artisans Found`}
        </Text>

        {/* ✅ UI LOGIC: 
           If loading AND no data -> Show Spinner
           If data exists (even if loading) -> Show List
        */}
        {loading && artisans.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={artisans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ArtisanCard
                artisan={item}
                onPress={() => router.push({
                  pathname: '/artisan-profile',
                  params: { id: item.id }
                })}
                onBook={() => handleBook(item.id)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <IconSymbol name="exclamationmark.circle" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No artisans found in this category.</Text>
              </View>
            )}
          />
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 16, color: colors.textSecondary },
  profileBtn: { padding: 4 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#EEE', marginBottom: 20
  },
  searchInput: { flex: 1, fontSize: 16 },

  categoryList: { paddingBottom: 20 },
  categoryChip: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#FFF', borderRadius: 24,
    marginRight: 10, borderWidth: 1, borderColor: '#EEE'
  },
  categoryChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  categoryText: { fontWeight: '600', color: colors.text },
  categoryTextActive: { color: '#FFF' },

  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: colors.text },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 16, color: colors.textSecondary, fontSize: 16 },
});