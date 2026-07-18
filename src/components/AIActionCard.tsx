import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { AIAction, AIArtisanResult } from '@/src/types';

interface AIActionCardProps {
  action: AIAction;
  onArtisanPress: (artisanId: number) => void;
  onNavigate: (route: string) => void;
  onSearchLocal: (query: string) => void;
  onCategoryLocal: (categoryId: number, categoryName: string) => void;
}

function ArtisanMiniCard({
  artisan,
  onPress,
}: {
  artisan: AIArtisanResult;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.miniCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>
          {artisan.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.miniInfo}>
        <View style={styles.miniNameRow}>
          <Text style={styles.miniName} numberOfLines={1}>{artisan.name}</Text>
          {artisan.is_verified && (
            <MaterialIcons name="verified" size={14} color={color.accent600} />
          )}
        </View>
        <Text style={styles.miniCategory}>{artisan.category || 'Artisan'}</Text>
      </View>
      <View style={styles.miniRating}>
        <MaterialIcons name="star" size={12} color={color.star} />
        <Text style={styles.miniRatingText}>{artisan.rating > 0 ? artisan.rating.toFixed(1) : 'New'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AIActionCard({
  action,
  onArtisanPress,
  onNavigate,
  onSearchLocal,
  onCategoryLocal,
}: AIActionCardProps) {
  if (!action) return null;

  // --- Navigation action ---
  if (action.type === 'navigation') {
    const screenLabels: Record<string, string> = {
      home: 'Home',
      bookings: 'My Bookings',
      profile: 'My Profile',
      chat: 'Messages',
      help: 'Help Center',
    };
    const screenIcons: Record<string, string> = {
      home: 'home',
      bookings: 'event-note',
      profile: 'person',
      chat: 'chat',
      help: 'help-outline',
    };
    const { screen, route } = action.data;
    return (
      <View style={styles.actionContainer}>
        <View style={styles.navCard}>
          <View style={styles.navIconWrap}>
            <MaterialIcons
              name={(screenIcons[screen] as any) || 'open-in-new'}
              size={22}
              color={color.brand600}
            />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>{screenLabels[screen] || screen}</Text>
            <Text style={styles.navSubtitle}>Tap to open</Text>
          </View>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onNavigate(route)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Artisan profile action ---
  if (action.type === 'artisan_profile') {
    const { data } = action;
    if (!data.found) {
      return (
        <View style={styles.actionContainer}>
          <View style={styles.emptyCard}>
            <MaterialIcons name="search-off" size={28} color={color.ink300} />
            <Text style={styles.emptyText}>No artisan found matching "{data.name}"</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.actionContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {data.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{data.name}</Text>
                {data.is_verified && (
                  <MaterialIcons name="verified" size={16} color={color.accent600} />
                )}
              </View>
              <Text style={styles.profileCategory}>{data.category || 'Artisan'}</Text>
              {data.rating != null && data.rating > 0 && (
                <View style={styles.profileRatingRow}>
                  <MaterialIcons name="star" size={14} color={color.star} />
                  <Text style={styles.profileRating}>{data.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
          {data.bio ? (
            <Text style={styles.profileBio} numberOfLines={3}>{data.bio}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => data.user_id && onArtisanPress(data.user_id)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Search results / Category filter ---
  const results =
    action.type === 'search_results'
      ? action.data.results
      : action.data.results;
  const label =
    action.type === 'search_results'
      ? `Results for "${action.data.query}"`
      : `${action.data.category} artisans`;
  const categoryId =
    action.type === 'category_filter' ? action.data.category_id : undefined;
  const categoryName =
    action.type === 'category_filter' ? action.data.category : undefined;

  if (!results || results.length === 0) {
    return (
      <View style={styles.actionContainer}>
        <View style={styles.emptyCard}>
          <MaterialIcons name="search-off" size={28} color={color.ink300} />
          <Text style={styles.emptyText}>No artisans found for "{label}"</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              if (action.type === 'search_results') {
                onSearchLocal(action.data.query);
              } else if (categoryId && categoryName) {
                onCategoryLocal(categoryId, categoryName);
              }
            }}
          >
            <Text style={styles.retryBtnText}>Search on Home screen</Text>
            <MaterialIcons name="open-in-new" size={14} color={color.brand600} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.actionContainer}>
      <View style={styles.resultsCard}>
        <View style={styles.resultsHeader}>
          <MaterialIcons
            name={action.type === 'search_results' ? 'search' : 'category'}
            size={16}
            color={color.brand600}
          />
          <Text style={styles.resultsTitle}>{label}</Text>
          <Text style={styles.resultsCount}>{results.length} found</Text>
        </View>
        <View style={styles.resultsList}>
          {results.slice(0, 4).map((artisan) => (
            <ArtisanMiniCard
              key={artisan.id}
              artisan={artisan}
              onPress={() => onArtisanPress(artisan.user_id)}
            />
          ))}
        </View>
        {results.length > 4 && (
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => {
              if (action.type === 'search_results') {
                onSearchLocal(action.data.query);
              } else if (categoryId && categoryName) {
                onCategoryLocal(categoryId, categoryName);
              }
            }}
          >
            <Text style={styles.seeAllBtnText}>See all {results.length} results</Text>
            <MaterialIcons name="arrow-forward" size={14} color={color.brand600} />
          </TouchableOpacity>
        )}
        {results.length <= 4 && (
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => {
              if (action.type === 'search_results') {
                onSearchLocal(action.data.query);
              } else if (categoryId && categoryName) {
                onCategoryLocal(categoryId, categoryName);
              }
            }}
          >
            <Text style={styles.seeAllBtnText}>View on Home screen</Text>
            <MaterialIcons name="open-in-new" size={14} color={color.brand600} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: space.sm,
    marginBottom: space.xs,
  },

  // --- Navigation card ---
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.brand100,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
    borderWidth: 1,
    borderColor: color.brand600 + '20',
  },
  navIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.e1,
  },
  navInfo: { flex: 1 },
  navTitle: {
    fontFamily: font.bold,
    fontSize: 14,
    color: color.ink900,
  },
  navSubtitle: {
    fontFamily: font.medium,
    fontSize: 11.5,
    color: color.ink400,
    marginTop: 1,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.brand600,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Artisan profile card ---
  profileCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    ...shadow.e1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.md,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: color.brand100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.md,
  },
  profileAvatarText: {
    fontFamily: font.extrabold,
    fontSize: 20,
    color: color.brand600,
  },
  profileInfo: { flex: 1 },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: color.ink900,
  },
  profileCategory: {
    fontFamily: font.bold,
    fontSize: 12,
    color: color.ink400,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  profileRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileRating: {
    fontFamily: font.bold,
    fontSize: 13,
    color: color.ink600,
  },
  profileBio: {
    fontFamily: font.medium,
    fontSize: 13,
    color: color.ink600,
    lineHeight: 19,
    marginBottom: space.md,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.brand600,
    borderRadius: radius.md,
    paddingVertical: space.md,
  },
  viewProfileBtnText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: '#FFF',
  },

  // --- Empty state ---
  emptyCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: '#EEF2F8',
  },
  emptyText: {
    fontFamily: font.medium,
    fontSize: 13.5,
    color: color.ink400,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    backgroundColor: color.brand100,
  },
  retryBtnText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.brand600,
  },

  // --- Search/category results ---
  resultsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: '#EEF2F8',
    ...shadow.e1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultsTitle: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 13,
    color: color.ink900,
  },
  resultsCount: {
    fontFamily: font.semibold,
    fontSize: 11.5,
    color: color.brand600,
    backgroundColor: color.brand100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  resultsList: {
    gap: space.sm,
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    gap: space.sm,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: color.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: color.brand600,
  },
  miniInfo: { flex: 1 },
  miniNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniName: {
    fontFamily: font.bold,
    fontSize: 13,
    color: color.ink900,
    flexShrink: 1,
  },
  miniCategory: {
    fontFamily: font.medium,
    fontSize: 11,
    color: color.ink400,
    marginTop: 1,
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniRatingText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: color.ink600,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  seeAllBtnText: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: color.brand600,
  },
});
