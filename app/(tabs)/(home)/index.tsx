import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Pressable, Linking, Animated
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Import Axios directly for the location fetch

import { artisanAPI, authAPI, categoryAPI, favoriteAPI } from '@/src/api/client';
import { useLocation } from '@/src/contexts/LocationContext';
import { CategoryGroup } from '@/src/types';
import {
  requestSpeechPermissions, startSpeechRecognition,
  stopSpeechRecognition, abortSpeechRecognition
} from '@/src/utils/speechRecognition';
import { BACKEND_URL, CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import {
  ArtisanCard, Avatar, Chip, EmptyState, LanguagePickerChip, SegmentedControl, SkeletonCard, useToast,
} from '@/src/components/ui';
import { recordSearch } from '@/src/utils/recommendations';
import { openDirections } from '@/src/utils/directions';

const DISTANCE_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Anywhere', value: null },
];
const CACHE_KEY = 'cached_artisans_list';

// A clean, minimal, on-brand map style (hides POI/transit/admin clutter,
// mutes road labels, tints water toward the brand palette) — the single
// biggest lever for making a map "feel" premium instead of a raw default
// Google Maps tile, the same approach Uber/Airbnb-style map apps use.
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f7fa' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa5b1' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f7fa' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e3f0e9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e7ebf0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dde3ea' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c9d4e0' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe3fb' }] },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterByDistance(artisans: any[], clientLat: number, clientLon: number, maxKm: number | null) {
  const withDistance = artisans.map((a) => {
    const lat = parseFloat(a.latitude ?? a.user_details?.latitude ?? a.user?.latitude);
    const lon = parseFloat(a.longitude ?? a.user_details?.longitude ?? a.user?.longitude);
    if (isNaN(lat) || isNaN(lon)) return { ...a, distance: Infinity };
    return { ...a, distance: haversineKm(clientLat, clientLon, lat, lon) };
  });
  withDistance.sort((a, b) => a.distance - b.distance);
  if (maxKm !== null) return withDistance.filter((a) => a.distance <= maxKm);
  return withDistance;
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { show: showToast } = useToast();
  const { location, isLoading: locationLoading, errorMsg: locationError, requestLocationPermission } = useLocation();
  const aiParams = useLocalSearchParams<{ aiSearch?: string; aiCategoryId?: string; aiCategoryName?: string }>();

  // --- Map polish: ref for programmatic camera moves (auto-fit, recenter),
  // a looping pulse animation for the "You are here" marker, and a
  // ready-flag since fitToCoordinates can only run once the native map view
  // actually exists. ---
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

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

  // Distance Limit
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationMode, setLocationMode] = useState<'live' | 'saved'>('live');
  const [showDropdown, setShowDropdown] = useState(false);
  // Categories (hierarchical from API)
  const [parentCategories, setParentCategories] = useState<CategoryGroup[]>([]);
  const [expandedParentId, setExpandedParentId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Search Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Auto-fit the camera to frame the user + every visible artisan marker,
  // instead of a fixed zoom level regardless of how spread out they are —
  // re-runs whenever the artisan list changes so the frame stays accurate.
  useEffect(() => {
    if (viewMode !== 'map' || !mapReady || !location || !mapRef.current) return;
    const coords = [{ latitude: location.latitude, longitude: location.longitude }];
    for (const artisan of artisans) {
      const lat = artisan?.latitude ?? artisan?.user_details?.latitude;
      const lon = artisan?.longitude ?? artisan?.user_details?.longitude;
      if (lat != null && lon != null) {
        coords.push({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      }
    }
    if (coords.length > 1) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [viewMode, mapReady, location, artisans]);

  const recenterMap = useCallback(() => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  }, [location]);

  // --- 1. FETCH LOCATION DATA (States & LGAs) ---
  const fetchLocations = async () => {
    try {
      const [statesRes, lgasRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/locations/states/`).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/locations/lgas/`).catch(() => ({ data: [] }))
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

  // Fetch locations + categories once on mount
  useEffect(() => {
    fetchLocations();
    categoryAPI.getCategories().then(setParentCategories).catch(() => {});
  }, []);

  // Location permission is requested here, at the point of first real use
  // (this screen needs it for "nearby artisans"), not unconditionally at
  // app launch before the user has any context for why it's needed.
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Save the client's GPS point on their profile (fire-and-forget) so
  // "use my saved address" search works even when GPS is off later.
  const coordsSynced = useRef(false);
  useEffect(() => {
    if (location && !coordsSynced.current) {
      coordsSynced.current = true;
      authAPI.saveCoordinates(location.latitude, location.longitude).catch(() => {});
    }
  }, [location]);

  // Voice Search
  useEffect(() => {
    return () => { abortSpeechRecognition(); };
  }, []);

  // --- Handle AI-initiated search/category params from the AI chat screen ---
  useEffect(() => {
    if (aiParams.aiSearch) {
      setSearchQuery(aiParams.aiSearch);
      setActiveSearch(aiParams.aiSearch);
      setPage(1);
      setHasMore(true);
      fetchArtisans(1, true, undefined, aiParams.aiSearch);
      // Clear the param so it doesn't re-trigger
      router.replace('/(tabs)/(home)' as any);
    } else if (aiParams.aiCategoryId) {
      const catId = parseInt(aiParams.aiCategoryId, 10);
      if (!isNaN(catId)) {
        setSelectedCategoryId(catId);
        setSearchQuery('');
        setActiveSearch('');
        setPage(1);
        setHasMore(true);
        fetchArtisans(1, true, catId, '');
        recordSearch(catId, aiParams.aiCategoryName);
      }
      router.replace('/(tabs)/(home)' as any);
    }
  }, [aiParams.aiSearch, aiParams.aiCategoryId]);

  const toggleVoiceSearch = async () => {
    if (isVoiceSearching) {
      setIsVoiceSearching(false);
      setIsTranscribing(true);
      const transcript = await stopSpeechRecognition();
      setIsTranscribing(false);
      if (transcript) {
        setSearchQuery(transcript);
        setActiveSearch(transcript);
      } else {
        // ___NO_API_KEY___/___QUOTA_ERROR___ are internal sentinels from
        // stopSpeechRecognition() — neither is meaningful to a user, both
        // just mean "voice search isn't available right now." The old
        // no-key message literally said "Set it in src/constants/config.ts,"
        // a developer instruction with no user able to act on it.
        let message = t('No speech detected. Please try again.');
        if (transcript === '___NO_API_KEY___' || transcript === '___QUOTA_ERROR___') {
          message = t('Voice search is temporarily unavailable. Please try again later or type your search.');
        }
        showToast(message, { type: 'info' });
      }
      return;
    }

    const granted = await requestSpeechPermissions();
    if (!granted) {
      showToast('Microphone permission is needed for voice search.', { type: 'error' });
      return;
    }

    setIsVoiceSearching(true);
    try {
      await startSpeechRecognition();
    } catch (err) {
      console.error('[HomeScreen] Failed to start:', err);
      setIsVoiceSearching(false);
      showToast('Failed to start voice recording. Please try again.', { type: 'error' });
    }
  };

  // --- 2. DATA NORMALIZER ---
  const processArtisans = useCallback((list: any[]) => {
    if (!Array.isArray(list)) return [];

    return list.map(artisan => {
      // A. Fix Image URLs
      // ArtisanProfileSerializer (the artisans list endpoint) has NO
      // top-level profile_picture field at all — only nested under
      // user_details. Reading artisan.profile_picture alone was always
      // undefined here, so every consumer of this processed list (the
      // "Top rated near you" rail, the map markers) silently fell back to
      // initials/gender icons even when a real photo existed. ArtisanCard
      // avoided this by checking user_details first — matching that order
      // here so the fix applies once, centrally, to every consumer.
      let pic = artisan.profile_picture || artisan.user_details?.profile_picture || artisan.user?.profile_picture;
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

      // C. FIX LOCATION (ID -> Name)
      let lga = artisan.lga;
      let state = artisan.state;

      // Try to map ID to Name if locationMap is ready
      if (locationMap[lga]) lga = locationMap[lga];
      if (locationMap[state]) state = locationMap[state];

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
  const fetchArtisans = useCallback(async (pageNum: number, shouldRefresh = false, newCategory?: number | null, newSearch?: string) => {
    const categoryToUse = newCategory !== undefined ? newCategory : selectedCategoryId;
    const searchToUse = newSearch !== undefined ? newSearch : activeSearch;

    if (!shouldRefresh && !hasMore) return;

    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);
      setError(null);

      const filters: any = {
        service: categoryToUse,
        search: searchToUse,
        use_saved: locationMode === 'saved'
      };

      if (locationMode === 'live' && location) {
        filters.latitude = location.latitude;
        filters.longitude = location.longitude;
      }

      const data = await artisanAPI.getArtisans(filters, pageNum);
      let results = Array.isArray(data) ? data : (data.results || []);

      if (locationMode === 'live' && location && maxDistance !== null) {
        results = filterByDistance(results, location.latitude, location.longitude, maxDistance);
      }

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
      console.log("FETCH ARTISANS ERROR:", err);
      if (pageNum === 1) setError("Could not load artisans.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategoryId, activeSearch, hasMore, processArtisans, location, maxDistance]);

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
        fetchArtisans(1, true, selectedCategoryId, searchQuery);
        if (searchQuery.trim()) recordSearch(undefined, searchQuery);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategoryId]);

  // --- 1b. CATEGORY SEARCH DROPDOWN ---
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearchingCategories(true);
      setShowSearchDropdown(true);
      const results = await categoryAPI.searchCategories(trimmed);
      setSearchResults(results);
      setIsSearchingCategories(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearchResultTap = (cat: any) => {
    setSearchQuery('');
    setActiveSearch('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    handleParentSelect(cat.id);
  };

  // --- 2. MAIN FETCH EFFECT (Location, Distance, Category, Initial, Mode) ---
  useEffect(() => {
    // If saved mode, we don't need live location
    if (locationMode === 'saved') {
      setPage(1);
      setHasMore(true);
      fetchArtisans(1, true);
    } else if (!locationLoading) {
      // For live mode, wait for GPS
      setPage(1);
      setHasMore(true);
      fetchArtisans(1, true);
    }
  }, [location, maxDistance, locationLoading, locationMode]);


  // --- Category Handlers ---
  const handleParentSelect = (parentId: number | null) => {
    // Tapping a parent toggles the subcategory row — no API call because
    // artisans are assigned to subcategories (leaf nodes), not parent groups.
    setExpandedParentId(expandedParentId === parentId ? null : parentId);
    // Clear any active subcategory filter when exploring parents
    setSelectedSubcategoryId(null);
    setSelectedCategoryId(null);
    if (parentId === null) {
      // "All" — clear the filter and fetch everything
      setSearchQuery('');
      setActiveSearch('');
      setPage(1);
      setHasMore(true);
      fetchArtisans(1, true, null, '');
    }
  };

  const handleSubcategorySelect = (subId: number) => {
    setSelectedSubcategoryId(subId);
    setSelectedCategoryId(subId);
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
    setHasMore(true);
    fetchArtisans(1, true, subId, '');
    const sub = expandedParent?.subcategories?.find((s) => s.id === subId);
    recordSearch(subId, sub?.name);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveSearch('');
    setSelectedSubcategoryId(null);
    setSelectedCategoryId(null);
    setExpandedParentId(null);
    setMaxDistance(null);
    setPage(1);
    setHasMore(true);
    fetchArtisans(1, true, null, '');
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

  const handleRetry = () => {
    setPage(1);
    setHasMore(true);
    fetchArtisans(1, true);
  };

  const togglingFavoriteIdsRef = useRef<Set<number | string>>(new Set());

  const handleToggleFavorite = async (artisanId: number | string) => {
    // Guards against a rapid double-tap firing two overlapping requests,
    // whose responses could land out of order and disagree with the
    // actual server-side state.
    if (togglingFavoriteIdsRef.current.has(artisanId)) return;
    togglingFavoriteIdsRef.current.add(artisanId);

    // Optimistic — flip immediately, then reconcile with the server's
    // actual result.
    setArtisans(prev => prev.map(a => (a.id === artisanId ? { ...a, is_favorited: !a.is_favorited } : a)));
    try {
      const result = await favoriteAPI.toggle(artisanId);
      setArtisans(prev => prev.map(a => (a.id === artisanId ? { ...a, is_favorited: result.favorited } : a)));
    } catch (error) {
      console.log('Toggle favorite error:', error);
      setArtisans(prev => prev.map(a => (a.id === artisanId ? { ...a, is_favorited: !a.is_favorited } : a)));
    } finally {
      togglingFavoriteIdsRef.current.delete(artisanId);
    }
  };

  const openProfile = useCallback((id: number | string) => {
    router.push(`/artisan/${id}`);
  }, [router]);

  // "Top rated near you" rail — verified artisans sorted by rating
  const topRated = useMemo(
    () =>
      artisans
        .filter(a => a.is_verified || a.user_details?.is_verified)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10),
    [artisans]
  );

  const expandedParent = parentCategories.find(c => c.id === expandedParentId);

  const listHeader = (
    <View>
      {/* Trust banner */}
      <View style={styles.trustBanner}>
        <View style={styles.trustIcon}>
          <MaterialIcons name="verified-user" size={18} color={color.accent600} />
        </View>
        <Text style={styles.trustText}>
          {t('Every artisan is ID-verified by our field agents before they appear here.')}
        </Text>
      </View>

      {/* Top rated rail */}
      {topRated.length > 0 && (
        <View style={styles.railSection}>
          <Text style={styles.sectionHeading}>{t('Top rated near you')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.railScroll}
          >
            {topRated.map((a) => {
              const u = a.user_details || a.user || a;
              const railName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || (u.email || '').split('@')[0];
              return (
                <Pressable
                  key={a.id}
                  onPress={() => openProfile(a.id)}
                  accessibilityRole="button"
                  accessibilityLabel={railName}
                  style={({ pressed }) => [styles.railCard, pressed && { opacity: 0.85 }]}
                >
                  <Avatar name={railName} uri={a.profile_picture} gender={u.gender} size={48} borderRadius={16} verified />
                  <Text style={styles.railName} numberOfLines={1}>{railName}</Text>
                  <Text style={styles.railTrade} numberOfLines={1}>
                    {i18n.language === 'ha' && a.category_name_ha ? a.category_name_ha : (a.profession_name || a.category_name || t('Artisan'))}
                  </Text>
                  <View style={styles.railRating}>
                    <MaterialIcons name="star" size={12} color={color.star} />
                    <Text style={styles.railRatingText}>{a.rating || 4.8}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {artisans.length > 0 && (
        <Text style={[styles.sectionHeading, styles.listHeading]}>{t('All artisans')}</Text>
      )}

      {/* Category chips (moved from filtersArea) */}
      <View style={styles.categoryListWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListScroll}
        >
          <Chip
            label={t('All')}
            selected={selectedCategoryId === null && expandedParentId === null}
            onPress={() => handleParentSelect(null)}
          />
          {parentCategories.map((cat) => {
            const catLabel = i18n.language === 'ha' && cat.name_ha ? cat.name_ha : cat.name;
            return (
              <Chip
                key={cat.id}
                label={catLabel}
                selected={expandedParentId === cat.id || selectedCategoryId === cat.id}
                onPress={() => handleParentSelect(cat.id)}
              />
            );
          })}
        </ScrollView>
        {expandedParent && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryListScroll}
          >
            {expandedParent.subcategories.map((sub) => {
              const subLabel = i18n.language === 'ha' && sub.name_ha ? sub.name_ha : sub.name;
              return (
                <Chip
                  key={sub.id}
                  label={subLabel}
                  subcategory
                  selected={selectedSubcategoryId === sub.id}
                  onPress={() => handleSubcategorySelect(sub.id)}
                />
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- BRAND HEADER --- */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: space.md }}>
              <Text style={styles.greetingTitle}>{t('greeting')}</Text>
              <TouchableOpacity
                style={styles.locationSelector}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('Finding services near')}
              >
                <MaterialIcons
                  name={locationMode === 'live' ? 'near-me' : 'home'}
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.locationModeText} numberOfLines={1}>
                  {locationMode === 'live' ? t('Current GPS Location') : t('Saved Home Address')}
                </Text>
                <MaterialIcons
                  name={showDropdown ? 'expand-less' : 'expand-more'}
                  size={16}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.headerIcons}>
              {/* EN / HA Segmented Toggle */}
              <View style={styles.langTrack}>
                {(['en', 'ha'] as const).map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, i18n.language === lang && styles.langBtnActive]}
                    onPress={() => i18n.changeLanguage(lang)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: i18n.language === lang }}
                  >
                    <Text style={[styles.langText, i18n.language === lang && styles.langTextActive]}>
                      {lang.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Message language — separate from the EN/HA toggle above
                  (that one switches the app's own interface text; this one
                  sets which language incoming chat messages get
                  automatically translated into). */}
              <LanguagePickerChip variant="dark" />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/chat/ai')}
                accessibilityRole="button"
                accessibilityLabel="AI assistant"
              >
                <MaterialIcons name="auto-awesome" size={18} color="#FACC15" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/chat')}
                accessibilityRole="button"
                accessibilityLabel={t('Chats')}
              >
                <MaterialIcons name="chat-bubble-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Dropdown Menu */}
          {showDropdown && (
            <View style={styles.dropdownOverlay}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setLocationMode('live'); setShowDropdown(false); }}
              >
                <View style={[styles.dropdownIconBox, locationMode === 'live' && styles.activeIconBox]}>
                  <MaterialIcons name="near-me" size={18} color={locationMode === 'live' ? '#FFF' : color.ink400} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownTitle, locationMode === 'live' && styles.activeDropdownTitle]}>{t('Real-time GPS')}</Text>
                  <Text style={styles.dropdownSub}>{t("Based on your phone's sensors")}</Text>
                </View>
                {locationMode === 'live' && <MaterialIcons name="check-circle" size={20} color={color.brand600} />}
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setLocationMode('saved'); setShowDropdown(false); }}
              >
                <View style={[styles.dropdownIconBox, locationMode === 'saved' && styles.activeIconBox]}>
                  <MaterialIcons name="home" size={18} color={locationMode === 'saved' ? '#FFF' : color.ink400} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownTitle, locationMode === 'saved' && styles.activeDropdownTitle]}>{t('Registered Address')}</Text>
                  <Text style={styles.dropdownSub}>{t('The address in your profile')}</Text>
                </View>
                {locationMode === 'saved' && <MaterialIcons name="check-circle" size={20} color={color.brand600} />}
              </TouchableOpacity>
            </View>
          )}

          {/* Elevated search + mic */}
          <View style={styles.searchSection}>
            <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
              <MaterialIcons name="search" size={20} color={color.ink300} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('What service do you need?')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={color.ink300}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {isLoading && searchQuery !== '' && (
                <ActivityIndicator size="small" color={color.brand600} />
              )}
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} accessibilityRole="button" accessibilityLabel={t('Clear search')}>
                  <MaterialIcons name="cancel" size={18} color={color.ink300} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.voiceBtn, (isVoiceSearching || isTranscribing) && styles.voiceBtnActive]}
                onPress={toggleVoiceSearch}
                accessibilityRole="button"
                accessibilityLabel={t('Voice search')}
              >
                <MaterialIcons
                  name={(isVoiceSearching || isTranscribing) ? 'mic' : 'mic-none'}
                  size={20}
                  color={(isVoiceSearching || isTranscribing) ? '#FFF' : color.brand600}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Category Search Dropdown ── */}
          {showSearchDropdown && (
            <View style={styles.searchDropdown}>
              {isSearchingCategories ? (
                <ActivityIndicator size="small" color={color.brand600} style={{ padding: 12 }} />
              ) : searchResults.length === 0 ? (
                <Text style={styles.searchDropdownEmpty}>
                  {t('noMatchingServices')}
                </Text>
              ) : (
                <ScrollView
                  style={styles.searchDropdownScroll}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {searchResults.map((cat: any) => {
                    const label = i18n.language === 'ha' && cat.name_ha ? cat.name_ha : cat.name;
                    const parentLabel = i18n.language === 'ha' && cat.parent_name_ha
                      ? cat.parent_name_ha
                      : cat.parent_name;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.searchDropdownItem}
                        onPress={() => handleSearchResultTap(cat)}
                      >
                        <MaterialIcons name="search" size={16} color={color.ink400} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.searchDropdownText} numberOfLines={1}>
                            {label}
                          </Text>
                          {parentLabel && (
                            <Text style={styles.searchDropdownParent} numberOfLines={1}>
                              {parentLabel}
                            </Text>
                          )}
                        </View>
                        <MaterialIcons name="chevron-right" size={16} color={color.ink300} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* --- FILTERS (light area) --- */}
      <View style={styles.filtersArea}>
        {/* View toggle + distance chips */}
        <View style={styles.controlsRow}>
          <SegmentedControl
            compact
            segments={[
              { value: 'list', label: t('List') },
              { value: 'map', label: t('Map') },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.distanceScroll}
          >
            {DISTANCE_OPTIONS.map((opt, i) => (
              <Chip
                key={i}
                label={t(opt.label)}
                selected={maxDistance === opt.value}
                onPress={() => setMaxDistance(opt.value)}
                style={styles.distanceChip}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.flex}>
        <View style={styles.mapWrap}>
          {location ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              customMapStyle={MAP_STYLE}
              onMapReady={() => setMapReady(true)}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* Client Marker — a pin + "You are here" label over a softly
                  pulsing radar ring, the same real-time-location cue
                  Google Maps/Uber use, rather than a static pin.
                  tracksViewChanges is on by default for this one marker
                  only (it's the single animated marker; every other
                  artisan marker below explicitly turns it off for perf). */}
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                anchor={{ x: 0.5, y: 0.7 }}
              >
                <View style={styles.youAreHereWrap}>
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      {
                        opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
                        transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.8] }) }],
                      },
                    ]}
                  />
                  <MaterialIcons name="location-on" size={34} color={color.brand600} />
                  <View style={styles.youAreHerePill}>
                    <Text style={styles.youAreHereText}>{t('You are here')}</Text>
                  </View>
                </View>
              </Marker>

              {/* Artisan Markers — each professional's own avatar (photo,
                  gender fallback, or initials), matching the approved map
                  design's plain circular pins. */}
              {artisans.map((artisan) => {
                const lat = artisan?.latitude ?? artisan?.user_details?.latitude;
                const lon = artisan?.longitude ?? artisan?.user_details?.longitude;
                if (lat != null && lon != null) {
                  const parsedLat = parseFloat(lat);
                  const parsedLon = parseFloat(lon);
                  // a.profile_picture is the already-resolved absolute URL
                  // from processArtisans() above — same fields the "Top
                  // rated near you" rail uses (u.user_details fallback chain
                  // included), not the raw unprocessed nested value.
                  const markerUser = artisan.user_details || artisan.user || artisan;
                  const artisanName = `${markerUser.first_name || ''} ${markerUser.last_name || ''}`.trim() || t('Artisan');
                  const categoryName = i18n.language === 'ha' && artisan?.category_name_ha
                    ? artisan.category_name_ha
                    : (artisan?.category_name || artisan?.category?.name || artisan?.service_category || artisan?.user_details?.service_category || "Artisan");
                  const hasDistance = typeof artisan.distance === 'number' && artisan.distance !== Infinity;
                  return (
                    <Marker
                      key={artisan.id}
                      coordinate={{ latitude: parsedLat, longitude: parsedLon }}
                      onCalloutPress={() => openProfile(artisan.id)}
                      tracksViewChanges={false}
                    >
                      <View style={styles.artisanMarker}>
                        <Avatar
                          name={artisanName}
                          uri={artisan.profile_picture}
                          gender={markerUser.gender}
                          size={40}
                          borderRadius={20}
                        />
                      </View>
                      <Callout tooltip onPress={() => openProfile(artisan.id)}>
                        <View style={styles.premiumCallout}>
                          <Text style={styles.calloutName}>{artisanName}</Text>
                          <View style={styles.calloutBadge}>
                            <Text style={styles.calloutBadgeText}>{categoryName}</Text>
                          </View>
                          <View style={styles.calloutRating}>
                            <MaterialIcons name="star" size={10} color={color.star} />
                            <Text style={styles.calloutRatingText}>{artisan.rating || 4.8}</Text>
                            {hasDistance && (
                              <>
                                <Text style={styles.calloutDot}>·</Text>
                                <Text style={styles.calloutDistance}>{artisan.distance.toFixed(1)} {t('km')}</Text>
                              </>
                            )}
                          </View>
                          <Pressable
                            onPress={() => openDirections(parsedLat, parsedLon)}
                            style={styles.calloutDirectionsBtn}
                            hitSlop={6}
                            accessibilityRole="button"
                            accessibilityLabel={t('Get directions')}
                          >
                            <MaterialIcons name="directions" size={12} color={color.brand600} />
                            <Text style={styles.calloutDirectionsText}>{t('Directions')}</Text>
                          </Pressable>
                          <Text style={styles.calloutAction}>{t('Tap to view profile')}</Text>
                          <View style={styles.calloutTail} />
                        </View>
                      </Callout>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapView>
          ) : (
            <View style={styles.mapCenter}>
              {locationError ? (
                <>
                  <MaterialIcons name="location-off" size={36} color={color.ink300} />
                  <Text style={styles.mapCenterText}>{locationError}</Text>
                  <TouchableOpacity onPress={requestLocationPermission} style={styles.retryBtn}>
                    <MaterialIcons name="refresh" size={18} color="#FFF" />
                    <Text style={styles.retryBtnText}>{t('Try again')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <ActivityIndicator color={color.brand600} />
                  <Text style={styles.mapCenterText}>{t('Capturing GPS...')}</Text>
                </>
              )}
            </View>
          )}

          {/* Recenter FAB — snaps the camera back to the user's own
              location, the standard map-app affordance once someone has
              panned/zoomed away exploring nearby markers. */}
          {location && (
            <Pressable
              onPress={recenterMap}
              style={styles.recenterBtn}
              accessibilityRole="button"
              accessibilityLabel={t('Recenter on my location')}
              hitSlop={6}
            >
              <MaterialIcons name="my-location" size={20} color={color.brand600} />
            </Pressable>
          )}
        </View>

        {/* Nearby artisans — shown below the map itself (not instead of
            it), matching the approved map design: compact rows with a
            direct call button, sorted the same way the map's own markers
            and the plain list view already are (nearest first). */}
        <FlatList
          data={artisans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const u = item.user_details || item.user || item;
            const displayName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || t('Artisan');
            const professionName = i18n.language === 'ha' && item?.category_name_ha
              ? item.category_name_ha
              : (item?.profession_name || item?.category_name || t('Artisan'));
            const hasDistance = typeof item.distance === 'number' && item.distance !== Infinity;
            const phone = item.phone || u.phone_number;
            return (
              <Pressable
                onPress={() => openProfile(item.id)}
                style={({ pressed }) => [styles.mapRow, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
              >
                <Avatar name={displayName} uri={item.profile_picture} gender={u.gender} size={56} borderRadius={28} />
                <View style={styles.mapRowInfo}>
                  <Text style={styles.mapRowName} numberOfLines={1}>{displayName} ({professionName})</Text>
                  <Text style={styles.mapRowSubtitle} numberOfLines={1}>{item.bio || professionName}</Text>
                  <View style={styles.mapRowMetaLine}>
                    <MaterialIcons name="star" size={13} color={color.star} />
                    <Text style={styles.mapRowRating}>{item.rating || 4.8}</Text>
                    <Text style={styles.mapRowReviews}>
                      ({item.total_reviews ?? item.review_count ?? 0} {t('reviews')})
                    </Text>
                  </View>
                  {hasDistance && (
                    <View style={styles.mapRowMetaLine}>
                      <MaterialIcons name="place" size={12} color={color.brand600} />
                      <Text style={styles.mapRowDistance}>{item.distance.toFixed(1)} {t('km away')}</Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => phone && Linking.openURL(`tel:${phone}`)}
                  style={styles.mapRowCallBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t('Call')}
                  hitSlop={8}
                >
                  <MaterialIcons name="call" size={20} color={color.brand600} />
                </Pressable>
              </Pressable>
            );
          }}
          contentContainerStyle={styles.mapListContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            artisans.length > 0 ? (
              <Text style={styles.mapListHeading}>
                {t('{{count}} professionals nearby', { count: artisans.length })}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon="search-off"
                title={t('No artisans found in this area.')}
                message={t('Try changing your category or search query.')}
                actionLabel={t('Clear filters')}
                onAction={handleClearFilters}
              />
            ) : null
          }
        />
      </View>
      ) : (
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={styles.skeletonWrap}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <FlatList
              data={artisans}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ArtisanCard
                  artisan={item}
                  onPress={() => openProfile(item.id)}
                  onBook={() => openProfile(item.id)}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                  isFavorited={!!item.is_favorited}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={color.brand600} />}
              ListHeaderComponent={listHeader}
              ListFooterComponent={
                <View style={styles.footer}>
                  {isFetchingMore && <ActivityIndicator color={color.brand600} />}
                  {!hasMore && artisans.length > 0 && <Text style={styles.footerMsg}>{t('No more artisans nearby')}</Text>}
                  {artisans.length === 0 && !isLoading && error && (
                    <EmptyState
                      icon="cloud-off"
                      title={t('Could not load artisans')}
                      message={t('Check your connection and try again.')}
                      actionLabel={t('Try again')}
                      onAction={handleRetry}
                    />
                  )}
                  {artisans.length === 0 && !isLoading && !error && (
                    <EmptyState
                      icon="search-off"
                      title={t('No artisans found in this area.')}
                      message={t('Try changing your category or search query.')}
                      actionLabel={t('Clear filters')}
                      onAction={handleClearFilters}
                    />
                  )}
                  {hasMore && !isFetchingMore && artisans.length > 0 && (
                    <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreBtn} accessibilityRole="button">
                      <Text style={styles.loadMoreText}>{t('loadMore')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },

  headerContainer: {
    backgroundColor: color.brand900,
    paddingBottom: space.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: space.xl,
    marginTop: space.md,
    marginBottom: space.lg,
  },
  greetingTitle: {
    fontFamily: font.extrabold,
    fontSize: 19,
    letterSpacing: -0.19,
    color: '#FFF',
    marginBottom: 6,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  locationModeText: {
    color: '#FFF',
    fontFamily: font.bold,
    fontSize: 12.5,
    flexShrink: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  langTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  langBtnActive: { backgroundColor: '#FFF' },
  langText: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.7)',
  },
  langTextActive: { color: color.brand900 },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  searchSection: { paddingHorizontal: space.xl },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    paddingLeft: 14,
    paddingRight: 6,
    height: 52,
    ...shadow.e3,
  },
  searchBarFocused: {
    borderWidth: 1.5,
    borderColor: color.brand600,
  },
  searchInput: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: 14.5,
    color: color.ink900,
    paddingVertical: 0,
  },
  voiceBtn: {
    width: 40,
    height: 40,
    backgroundColor: color.brand100,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBtnActive: { backgroundColor: color.danger600 },

  /* ── Category Search Dropdown ── */
  searchDropdown: {
    marginHorizontal: space.xl,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    ...shadow.e3,
    maxHeight: 220,
    marginTop: space.sm,
  },
  searchDropdownScroll: { maxHeight: 220 },
  searchDropdownEmpty: {
    padding: space.lg,
    fontFamily: font.bold,
    color: color.ink300,
    fontSize: 13,
    textAlign: 'center',
  },
  searchDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  searchDropdownText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: color.ink900,
  },
  searchDropdownParent: {
    fontFamily: font.bold,
    fontSize: 11,
    color: color.ink300,
    marginTop: 1,
  },

  // Location mode dropdown
  dropdownOverlay: {
    position: 'absolute',
    top: 84,
    left: space.xl,
    right: space.xl,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: space.sm,
    zIndex: 1000,
    ...shadow.e3,
    borderWidth: 1,
    borderColor: color.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    gap: space.md,
    borderRadius: radius.md,
  },
  dropdownIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: color.surfaceChip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBox: { backgroundColor: color.brand600 },
  dropdownTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  activeDropdownTitle: { color: color.brand600 },
  dropdownSub: { fontFamily: font.medium, fontSize: 12, color: color.ink400 },
  dropdownDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: space.md },

  // Filters area (below header)
  filtersArea: { paddingTop: space.md },
  categoryScroll: { paddingHorizontal: space.xl, gap: 8 },
  subcategoryScroll: { paddingHorizontal: space.xl, gap: 6, marginTop: space.sm },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    marginTop: space.md,
    gap: space.md,
  },
  distanceScroll: { gap: 6, alignItems: 'center' },
  distanceChip: { height: 32 },

  // Content
  listContent: { paddingBottom: 96, paddingHorizontal: space.xl, paddingTop: space.md },
  skeletonWrap: { paddingHorizontal: space.xl, paddingTop: space.lg },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.accent100,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.lg,
  },
  trustIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#0F766E',
  },
  sectionHeading: { ...type.heading },
  listHeading: { marginBottom: space.md },
  categoryListWrap: { marginBottom: space.sm },
  categoryListScroll: { paddingHorizontal: space.xl, gap: 8 },
  railSection: { marginBottom: space.lg },
  railScroll: { gap: space.md, paddingVertical: space.md },
  railCard: {
    width: 124,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.md,
    alignItems: 'flex-start',
    ...shadow.e1,
  },
  railName: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: color.ink900,
    marginTop: space.sm,
  },
  railTrade: {
    fontFamily: font.bold,
    fontSize: 11.5,
    color: color.ink400,
    marginTop: 2,
  },
  railRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  railRatingText: { fontFamily: font.extrabold, fontSize: 11.5, color: color.ink900 },

  footer: { paddingVertical: space.xxl, alignItems: 'center' },
  loadMoreBtn: {
    paddingHorizontal: space.xl,
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: color.border,
  },
  loadMoreText: { fontFamily: font.extrabold, color: color.ink600, fontSize: 13 },
  footerMsg: {
    fontFamily: font.bold,
    textAlign: 'center',
    color: color.ink300,
    marginTop: space.lg,
    fontSize: 13,
  },

  // Map — a fixed-height card with a scrollable list of nearby artisans
  // below it (not a full-screen map instead of the list), matching the
  // approved map design.
  flex: { flex: 1 },
  mapWrap: {
    height: 210,
    backgroundColor: color.surfaceSunken,
    marginTop: space.md,
    marginBottom: space.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },
  recenterBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.e2,
  },
  mapCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md },
  mapCenterText: { fontFamily: font.bold, marginTop: 4, color: color.ink400, textAlign: 'center', paddingHorizontal: space.xl },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.brand600,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    marginTop: space.sm,
  },
  retryBtnText: { fontFamily: font.extrabold, fontSize: 13, color: '#FFF' },

  // "You are here" client marker — pin + label pill, matching the design,
  // plus a softly pulsing radar ring behind the pin for a real-time feel.
  youAreHereWrap: { alignItems: 'center' },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -17,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.brand600,
  },
  youAreHerePill: {
    backgroundColor: color.brand600,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: -6,
    ...shadow.e2,
  },
  youAreHereText: { fontFamily: font.extrabold, fontSize: 10, color: '#FFF' },

  artisanMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    padding: 2,
    ...shadow.e2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
  },

  // Nearby-artisans list under the map
  mapListContent: { paddingHorizontal: space.xl, paddingBottom: space.xxl },
  mapListHeading: { ...type.heading, marginBottom: space.md },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    padding: space.md,
    marginBottom: space.md,
    gap: space.md,
    ...shadow.e1,
  },
  mapRowInfo: { flex: 1 },
  mapRowName: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  mapRowSubtitle: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 2 },
  mapRowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  mapRowRating: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink900 },
  mapRowReviews: { fontFamily: font.medium, fontSize: 11.5, color: color.ink400 },
  mapRowDistance: { fontFamily: font.extrabold, fontSize: 11.5, color: color.brand600 },
  mapRowCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCallout: {
    backgroundColor: '#FFF',
    padding: space.md,
    borderRadius: radius.lg,
    width: 160,
    alignItems: 'center',
    ...shadow.e3,
    borderWidth: 1,
    borderColor: color.border,
  },
  calloutTail: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  calloutName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900, textAlign: 'center' },
  calloutBadge: {
    backgroundColor: color.surfaceChip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginVertical: 4,
  },
  calloutBadgeText: {
    fontFamily: font.extrabold,
    fontSize: 10,
    color: color.ink600,
    textTransform: 'uppercase',
  },
  calloutRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calloutRatingText: { fontFamily: font.extrabold, fontSize: 12, color: color.ink900 },
  calloutDot: { fontFamily: font.bold, fontSize: 12, color: color.ink300 },
  calloutDistance: { fontFamily: font.extrabold, fontSize: 11, color: color.brand600 },
  calloutDirectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: color.brand100,
  },
  calloutDirectionsText: { fontFamily: font.extrabold, fontSize: 10, color: color.brand600 },
  calloutAction: {
    fontFamily: font.extrabold,
    fontSize: 10,
    color: color.brand600,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
