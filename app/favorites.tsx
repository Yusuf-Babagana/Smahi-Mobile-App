import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { favoriteAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { ArtisanCard, EmptyState, SkeletonCard } from '@/src/components/ui';

export default function FavoritesScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const [artisans, setArtisans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const load = useCallback(async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await favoriteAPI.getFavorites(pageNumber);
            const results = data.results || [];

            setArtisans(prev => (pageNumber === 1 ? results : [...prev, ...results]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching favorites:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load(1);
        }, [load])
    );

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) load(page + 1);
    };

    const handleToggleFavorite = async (artisanId: number) => {
        // Unfavoriting here means it should leave this list entirely.
        setArtisans(prev => prev.filter(a => a.id !== artisanId));
        try {
            await favoriteAPI.toggle(artisanId);
        } catch (error) {
            console.log('Toggle favorite error:', error);
            load(1);
        }
    };

    const openProfile = (id: number) => router.push(`/artisan/${id}`);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Saved artisans')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {loading ? (
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
                            isFavorited
                        />
                    )}
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
                            icon="favorite-outline"
                            title={t('No saved artisans yet')}
                            message={t('Tap the heart on an artisan to save them here for later.')}
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
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },
});
