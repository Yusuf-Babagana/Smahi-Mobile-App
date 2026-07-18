import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@smaahi_search_history';
const BOOKING_HISTORY_KEY = '@smaahi_booking_history';

export interface SearchHistoryEntry {
  category_id?: number;
  category_name?: string;
  timestamp: number;
}

export interface BookingHistoryEntry {
  artisan_id: number;
  category_id?: number;
  category_name?: string;
  rating?: number;
  completed: boolean;
  timestamp: number;
}

export async function recordSearch(categoryId?: number, categoryName?: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    const history: SearchHistoryEntry[] = raw ? JSON.parse(raw) : [];
    history.unshift({ category_id: categoryId, category_name: categoryName, timestamp: Date.now() });
    const trimmed = history.slice(0, 50);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export async function recordBooking(
  artisanId: number,
  categoryId?: number,
  categoryName?: string,
  rating?: number,
  completed = true
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BOOKING_HISTORY_KEY);
    const history: BookingHistoryEntry[] = raw ? JSON.parse(raw) : [];
    history.unshift({
      artisan_id: artisanId,
      category_id: categoryId,
      category_name: categoryName,
      rating,
      completed,
      timestamp: Date.now(),
    });
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export async function getSearchHistory(): Promise<SearchHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getBookingHistory(): Promise<BookingHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKING_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

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

function getCategoryAffinity(artisan: any, searchHistory: SearchHistoryEntry[], bookingHistory: BookingHistoryEntry[]): number {
  const artisanCategoryId = artisan.category_id || artisan.service_category_id;
  if (!artisanCategoryId) return 0;

  let affinity = 0;

  const recentSearches = searchHistory.slice(0, 20);
  const searchMatches = recentSearches.filter(s => s.category_id === artisanCategoryId);
  affinity += Math.min(searchMatches.length * 0.15, 0.6);

  const completedBookings = bookingHistory.filter(b => b.completed && b.category_id === artisanCategoryId);
  affinity += Math.min(completedBookings.length * 0.2, 0.8);

  const avgRating = completedBookings.filter(b => b.rating).reduce((sum, b, _, arr) => sum + (b.rating || 0) / arr.length, 0);
  if (avgRating > 0) affinity += 0.1;

  return Math.min(affinity, 1);
}

function getDistanceScore(distanceKm: number): number {
  if (distanceKm <= 1) return 1;
  if (distanceKm <= 5) return 0.85;
  if (distanceKm <= 10) return 0.7;
  if (distanceKm <= 25) return 0.5;
  if (distanceKm <= 50) return 0.3;
  return 0.1;
}

export async function getRecommendedArtisans(
  artisans: any[],
  clientLat?: number | null,
  clientLon?: number | null,
  limit = 10
): Promise<any[]> {
  const searchHistory = await getSearchHistory();
  const bookingHistory = await getBookingHistory();

  if (searchHistory.length === 0 && bookingHistory.length === 0) {
    return artisans
      .slice()
      .sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, limit);
  }

  const scored = artisans.map((artisan: any) => {
    let score = 0;

    const affinity = getCategoryAffinity(artisan, searchHistory, bookingHistory);
    score += affinity * 0.45;

    const artisanLat = Number(artisan.user_details?.latitude || artisan.latitude);
    const artisanLon = Number(artisan.user_details?.longitude || artisan.longitude);
    if (clientLat && clientLon && artisanLat && artisanLon) {
      const dist = haversineKm(clientLat, clientLon, artisanLat, artisanLon);
      score += getDistanceScore(dist) * 0.25;
    } else {
      score += 0.15;
    }

    const rating = Number(artisan.rating) || 4.5;
    const normalizedRating = (rating - 3) / 2;
    score += Math.max(0, Math.min(1, normalizedRating)) * 0.2;

    const reviewCount = Number(artisan.review_count || artisan.total_reviews || 0);
    const popularityScore = Math.min(reviewCount / 50, 1);
    score += popularityScore * 0.1;

    if (artisan.is_verified || artisan.verification_status === 'approved') score += 0.05;

    if (artisan.is_available === false) score *= 0.3;

    return { ...artisan, _recommendationScore: score };
  });

  return scored
    .sort((a: any, b: any) => b._recommendationScore - a._recommendationScore)
    .slice(0, limit);
}
