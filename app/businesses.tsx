import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { businessAPI, categoryAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Avatar, EmptyState, SkeletonCard } from '@/src/components/ui';

// The client-facing business directory — BusinessProfileViewSet is
// public/searchable on the backend, but nothing consumed it from the
// client side of the app until now; a verified business's only visible
// result was a badge on a screen no client ever opened. Deliberately its
// own flat screen (not folded into the artisan Home tab), same reasoning
// as businessAPI's own comment: a business is not an artisan, and this
// endpoint has no location/distance ranking to drive the artisan Home
// screen's map/distance UI with.
export default function BusinessesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    categoryAPI.getBusinessCategoriesFlat().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async (pageNumber: number, search: string, category: number | null) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await businessAPI.getBusinesses({ search: search || undefined, category: category || undefined }, pageNumber);
      const results = data.results || [];

      setBusinesses(prev => (pageNumber === 1 ? results : [...prev, ...results]));
      setHasMore(!!data.next);
      setPage(pageNumber);
    } catch (error) {
      console.log('Error fetching businesses:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => { load(1, searchQuery.trim(), categoryId); }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery, categoryId, load]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) load(page + 1, searchQuery.trim(), categoryId);
  };

  const renderItem = ({ item }: { item: any }) => {
    const name = item.business_name || t('Business');
    const isVerified = item.verification_status === 'approved';
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        onPress={() => router.push(`/business/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={name}
      >
        <Avatar name={name} uri={item.user_details?.profile_picture} gender={item.user_details?.gender} size={48} borderRadius={16} verified={isVerified} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.category} numberOfLines={1}>{item.category_name || t('Business')}</Text>
          {item.user_details?.state_details?.name ? (
            <View style={styles.locationRow}>
              <MaterialIcons name="place" size={12} color={color.ink300} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.user_details?.lga_details?.name ? `${item.user_details.lga_details.name}, ` : ''}
                {item.user_details.state_details.name}
              </Text>
            </View>
          ) : null}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={color.ink300} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
            <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('Businesses')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={18} color={color.ink400} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('Search businesses…')}
          placeholderTextColor={color.ink300}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={t('Clear search')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={color.ink400} />
          </Pressable>
        )}
      </View>

      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            onPress={() => setCategoryId(null)}
            style={[styles.filterChip, categoryId === null && styles.filterChipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: categoryId === null }}
          >
            <Text style={[styles.filterText, categoryId === null && styles.filterTextActive]}>{t('All')}</Text>
          </Pressable>
          {categories.map((cat: any) => {
            const selected = categoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.filterText, selected && styles.filterTextActive]} numberOfLines={1}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={businesses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: space.xl }}>
              <ActivityIndicator size="small" color={color.brand600} />
            </View>
          ) : null}
          ListEmptyComponent={
            <EmptyState
              icon="storefront"
              title={t('No businesses found')}
              message={t('Try a different search or category.')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },

  headerSafe: { backgroundColor: color.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  backButton: {
    width: 40, height: 40, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: color.border,
    alignItems: 'center', justifyContent: 'center',
  },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
    paddingHorizontal: space.lg, height: 44, marginHorizontal: space.xl, marginTop: space.md,
  },
  searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: color.ink900, paddingVertical: 0 },

  filterRow: { gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.md },
  filterChip: {
    height: 34, paddingHorizontal: space.md, borderRadius: radius.full,
    backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  filterText: { fontFamily: font.bold, fontSize: 12.5, color: color.ink600 },
  filterTextActive: { color: '#FFF' },

  skeletonWrap: { padding: space.xl },
  listContent: { padding: space.xl, paddingBottom: 50 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    padding: space.lg,
    borderRadius: radius.lg,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    ...shadow.e1,
  },
  info: { flex: 1, marginHorizontal: space.sm },
  name: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
  category: { fontFamily: font.bold, fontSize: 12, color: color.brand600, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontFamily: font.medium, fontSize: 11.5, color: color.ink400, flexShrink: 1 },
});
