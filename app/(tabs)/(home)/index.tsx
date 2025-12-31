import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { artisanAPI, authAPI } from '@/src/api/client';
import { ArtisanCard } from '@/src/components/ArtisanCard';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';

// Categories for filter
const CATEGORIES = ["All", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Mechanic"];

export default function ClientHomeScreen() {
  const router = useRouter();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // --- FETCH ARTISANS ---
  const fetchArtisans = useCallback(async () => {
    try {
      setLoading(true);
      // Pass filters to the API
      const filters = {
        service: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery
      };

      const data = await artisanAPI.getArtisans(filters);
      setArtisans(data);
    } catch (error) {
      console.error("Failed to fetch artisans", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial Load & Refresh
  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtisans();
  };

  // --- HANDLERS ---
  const handleBook = (artisanId: number) => {
    // Navigate to booking screen (We will build this next)
    // router.push(`/booking/new?artisanId=${artisanId}`);
    alert(`Booking feature for Artisan #${artisanId} coming next!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. HEADER & SEARCH */}
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
          onSubmitEditing={fetchArtisans}
        />
      </View>

      {/* 2. CATEGORY FILTER */}
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

      {/* 3. ARTISAN LIST */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {loading ? "Searching..." : `${artisans.length} Artisans Found`}
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={artisans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ArtisanCard
                artisan={item}
                onPress={() => console.log('View profile')}
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