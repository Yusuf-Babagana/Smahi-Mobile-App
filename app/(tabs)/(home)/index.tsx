import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Alert,
  TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Pressable
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Import Axios directly for the location fetch

import { artisanAPI, categoryAPI } from '@/src/api/client';
import { useLocation } from '@/src/contexts/LocationContext';
import { CategoryGroup } from '@/src/types';
import {
  requestSpeechPermissions, startSpeechRecognition,
  stopSpeechRecognition, abortSpeechRecognition
} from '@/src/utils/speechRecognition';
import { BACKEND_URL, CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import {
  ArtisanCard, Avatar, Chip, EmptyState, SegmentedControl, SkeletonCard,
} from '@/src/components/ui';

const DISTANCE_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Anywhere', value: null },
];
const CACHE_KEY = 'cached_artisans_list';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { location, isLoading: locationLoading } = useLocation();

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

  // --- 1. FETCH LOCATION DATA (States & LGAs) ---
  const fetchLocations = async () => {
    try {
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

  // Fetch locations + categories once on mount
  useEffect(() => {
    fetchLocations();
    categoryAPI.getCategories().then(setParentCategories).catch(() => {});
  }, []);

  // Voice Search
  useEffect(() => {
    return () => { abortSpeechRecognition(); };
  }, []);

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
        Alert.alert(
          'No Result',
          transcript === null
            ? 'Set your OpenAI API key in src/constants/config.ts to enable voice transcription.'
            : 'No speech detected. Please try again.'
        );
      }
      return;
    }

    const granted = await requestSpeechPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Microphone permission is needed for voice search.');
      return;
    }

    setIsVoiceSearching(true);
    try {
      await startSpeechRecognition();
    } catch (err) {
      console.error('[HomeScreen] Failed to start:', err);
      setIsVoiceSearching(false);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

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

      if (maxDistance !== null) {
        filters.max_distance = maxDistance;
      }

      const data = await artisanAPI.getArtisans(filters, pageNum);
      const results = Array.isArray(data) ? data : (data.results || []);

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
                  <Avatar name={railName} uri={a.profile_picture} size={48} borderRadius={16} verified />
                  <Text style={styles.railName} numberOfLines={1}>{railName}</Text>
                  <Text style={styles.railTrade} numberOfLines={1}>
                    {i18n.language === 'ha' && a.category_name_ha ? a.category_name_ha : (a.profession_name || t('Artisan'))}
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
        {/* Parent category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
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

        {/* Expanded subcategory chips */}
        {expandedParent && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subcategoryScroll}
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
        <View style={styles.mapWrap}>
          {location ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* Client Marker */}
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title={t('Your Location')}
                pinColor={color.brand600}
              >
                <View style={styles.pulseContainer}>
                  <View style={styles.pulseDot} />
                </View>
              </Marker>

              {/* Artisan Markers */}
              {artisans.map((artisan) => {
                const lat = artisan?.latitude || artisan?.user_details?.latitude;
                const lon = artisan?.longitude || artisan?.user_details?.longitude;
                if (lat && lon) {
                  return (
                    <Marker
                      key={artisan.id}
                      coordinate={{ latitude: parseFloat(lat), longitude: parseFloat(lon) }}
                      onCalloutPress={() => openProfile(artisan.id)}
                    >
                      <View style={styles.artisanMarker}>
                        <View style={styles.markerInner}>
                          <MaterialIcons name="handyman" size={14} color="#FFF" />
                        </View>
                      </View>
                      <Callout tooltip onPress={() => openProfile(artisan.id)}>
                        <View style={styles.premiumCallout}>
                          <Text style={styles.calloutName}>{artisan.user_details?.first_name} {artisan.user_details?.last_name}</Text>
                          <View style={styles.calloutBadge}>
                            <Text style={styles.calloutBadgeText}>
                              {i18n.language === 'ha' && artisan?.category_name_ha
                                ? artisan.category_name_ha
                                : (artisan?.category_name || artisan?.category?.name || artisan?.service_category || artisan?.user_details?.service_category || "Artisan")}
                            </Text>
                          </View>
                          <View style={styles.calloutRating}>
                            <MaterialIcons name="star" size={10} color={color.star} />
                            <Text style={styles.calloutRatingText}>{artisan.rating || 4.8}</Text>
                          </View>
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
              <ActivityIndicator color={color.brand600} />
              <Text style={styles.mapCenterText}>{t('Capturing GPS...')}</Text>
            </View>
          )}
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
                  {artisans.length === 0 && !isLoading && (
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

  // Map
  mapWrap: { flex: 1, backgroundColor: color.surfaceSunken, marginTop: space.md },
  map: { width: '100%', height: '100%' },
  mapCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapCenterText: { fontFamily: font.bold, marginTop: 10, color: color.ink400 },

  pulseContainer: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: color.brand600,
    borderWidth: 3,
    borderColor: '#FFF',
    ...shadow.e2,
  },
  artisanMarker: {
    padding: 2,
    borderRadius: radius.md,
    backgroundColor: '#FFF',
    ...shadow.e2,
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
  },
  markerInner: {
    backgroundColor: color.brand900,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  calloutAction: {
    fontFamily: font.extrabold,
    fontSize: 10,
    color: color.brand600,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
