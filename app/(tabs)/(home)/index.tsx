import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Import Axios directly for the location fetch

import { artisanAPI } from '@/src/api/client';
import { ArtisanCard } from '@/src/components/ArtisanCard';
import { colors, shadows } from '@/styles/commonStyles';
import { LanguageToggle } from '@/src/components/LanguageToggle';

const RAW_CATEGORIES = ["All", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Mechanic"];
const CACHE_KEY = 'cached_artisans_list';
const CLOUD_NAME = 'dvj6cw5dq';
const BACKEND_URL = 'https://smahi1.pythonanywhere.com';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // --- State ---
  const [artisans, setArtisans] = useState<any[]>([]);
  const [locationMap, setLocationMap] = useState<Record<number, string>>({}); // Store ID -> Name
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- 1. FETCH LOCATION DATA (States & LGAs) ---
  const fetchLocations = async () => {
    try {
      // ⚠️ REPLACE these endpoints with the actual ones used in your Registration
      // Example: '/api/locations/states/' or '/api/common/lgas/'
      const [statesRes, lgasRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/common/states/`).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/common/lgas/`).catch(() => ({ data: [] }))
      ]);

      const map: Record<number, string> = {};

      // Map States: { 4757: "Kano", ... }
      if (Array.isArray(statesRes.data)) {
        statesRes.data.forEach((item: any) => {
          map[item.id] = item.name;
        });
      }

      // Map LGAs: { 42: "Tarauni", ... }
      if (Array.isArray(lgasRes.data)) {
        lgasRes.data.forEach((item: any) => {
          map[item.id] = item.name;
        });
      }

      setLocationMap(map);
    } catch (err) {
      console.log("Failed to fetch location map:", err);
    }
  };

  // Fetch locations once on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // --- 2. DATA NORMALIZER ---
  const processArtisans = useCallback((list: any[]) => {
    if (!Array.isArray(list)) return [];

    return list.map(artisan => {
      // A. Fix Image URLs
      let pic = artisan.profile_picture;
      if (pic) {
        if (pic.includes('image/upload') && !pic.startsWith('http')) {
          pic = `https://res.cloudinary.com/${CLOUD_NAME}/${pic}`;
        } else if (pic.startsWith('/')) {
          pic = `${BACKEND_URL}${pic}`;
        }
        if (pic.startsWith('http:')) {
          pic = pic.replace('http:', 'https:');
        }
      }

      // B. Fix Phone Mapping
      const phone = artisan.phone || artisan.phone_number || null;

      // C. ✅ FIX LOCATION (ID -> Name)
      // Check if it's an ID (number) and exists in our map. 
      // If map isn't loaded yet, keep the ID temporarily or show 'Loading...'
      let lga = artisan.lga;
      let state = artisan.state;

      // Try to map ID to Name if locationMap is ready
      if (locationMap[lga]) lga = locationMap[lga];
      if (locationMap[state]) state = locationMap[state];

      // Fallback: If it's still a number, user might see "42", but it will update once fetchLocations finishes

      return {
        ...artisan,
        profile_picture: pic,
        phone: phone,
        lga: lga,
        state: state
      };
    });
  }, [locationMap]); // Re-run this when locationMap updates

  // --- API FETCH FUNCTION ---
  const fetchArtisans = useCallback(async (pageNum: number, shouldRefresh = false, newCategory?: string, newSearch?: string) => {
    const categoryToUse = newCategory !== undefined ? newCategory : selectedCategory;
    const searchToUse = newSearch !== undefined ? newSearch : activeSearch;

    if (!shouldRefresh && !hasMore) return;

    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);
      setError(null);

      const filters = {
        service: categoryToUse === 'All' ? undefined : categoryToUse,
        search: searchToUse
      };

      const data = await artisanAPI.getArtisans(filters, pageNum);
      const results = Array.isArray(data) ? data : (data.results || []);

      // Store Raw Data first, process later or immediately
      // We process immediately here, but relying on locationMap state
      const processedData = processArtisans(results);

      if (shouldRefresh || pageNum === 1) {
        setArtisans(processedData);
        if (categoryToUse === 'All' && !searchToUse) {
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(processedData)).catch(e => console.log(e));
        }
      } else {
        setArtisans(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          return [...prev, ...processedData.filter(p => !existingIds.has(p.id))];
        });
      }
      setHasMore(!!data.next);

    } catch (err: any) {
      if (pageNum === 1) setError("Could not load artisans.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategory, activeSearch, hasMore, processArtisans]); // Added processArtisans dependency

  // --- RE-PROCESS WHEN MAP LOADS ---
  // This ensures that if artisans load BEFORE locations, they get updated once locations arrive
  useEffect(() => {
    if (Object.keys(locationMap).length > 0 && artisans.length > 0) {
      setArtisans(prev => processArtisans(prev));
    }
  }, [locationMap]);

  // --- 1. DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== activeSearch) {
        setActiveSearch(searchQuery);
        setPage(1);
        setHasMore(true);
        fetchArtisans(1, true, selectedCategory, searchQuery);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  // --- 2. INITIAL LOAD ---
  useEffect(() => {
    const loadCache = async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached && artisans.length === 0) {
        setArtisans(JSON.parse(cached));
      }
    };
    loadCache();
    fetchArtisans(1, true, 'All', '');
  }, []);

  // --- Handlers ---
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (searchQuery !== '') {
      setSearchQuery('');
      setActiveSearch('');
    } else {
      setPage(1);
      setHasMore(true);
      fetchArtisans(1, true, cat, '');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArtisans(nextPage);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    // Also re-fetch locations in case they changed (rare but good practice)
    fetchLocations();
    fetchArtisans(1, true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- HEADER --- */}
      <LinearGradient
        colors={['#103d75', '#1e64bc']}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>

          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{t('greeting')}</Text>
              <Text style={styles.subGreeting}>{t('subGreeting')}</Text>
            </View>

            <View style={styles.headerIcons}>
              <View style={{ transform: [{ scale: 0.9 }] }}>
                <LanguageToggle />
              </View>

              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/chat')}>
                <Ionicons name="chatbubbles-outline" size={20} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {isLoading && searchQuery !== '' && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 5 }} />
            )}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={18} color="#CCC" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* --- CONTENT --- */}
      <View style={styles.listContainer}>

        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {RAW_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategorySelect(cat)}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {t(`categories.${cat}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {artisans.length > 0 ? `${artisans.length} Professionals Found` : 'Top Professionals'}
          </Text>
        </View>

        {isLoading && artisans.length === 0 ? (
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
              />
            )}
            contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}

            ListFooterComponent={
              <View style={styles.footer}>
                {isFetchingMore && <ActivityIndicator color={colors.primary} />}
                {hasMore && !isFetchingMore && artisans.length > 0 && (
                  <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreBtn}>
                    <Text style={styles.loadMoreText}>{t('loadMore')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            }

            ListEmptyComponent={() => (
              <View style={styles.center}>
                <Ionicons name="search" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>{t('noResults')}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  headerContainer: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 4,
    ...shadows.medium
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5
  },
  subGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBtn: {
    width: 40, height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFF'
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%'
  },

  listContainer: { flex: 1 },

  categoryWrapper: {
    marginTop: 16,
    marginBottom: 4,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingRight: 12
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.small
  },
  categoryChipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
    transform: [{ scale: 1.02 }]
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280'
  },
  categoryTextActive: {
    color: '#FFF'
  },

  listHeader: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111'
  },

  center: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 15, fontWeight: '500' },

  footer: { paddingVertical: 24, alignItems: 'center' },
  loadMoreBtn: {
    paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 20,
    borderWidth: 1, borderColor: '#E5E7EB', ...shadows.small
  },
  loadMoreText: { color: '#333', fontWeight: '600', fontSize: 13 }
});