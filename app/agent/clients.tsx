import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { agentAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, EmptyState, SkeletonCard } from '@/src/components/ui';

export default function AgentClientList() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);      // Initial Load
    const [loadingMore, setLoadingMore] = useState(false); // Pagination Load
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);      // Are there more pages?

    useEffect(() => {
        if (user) {
            fetchStateClients(1); // Load Page 1 on start
        }
    }, [user]);

    const fetchStateClients = async (pageNumber: number) => {
        if (!hasMore && pageNumber > 1) return;

        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            // Scoped server-side to the agent's own state.
            const data = await agentAPI.getStateClients({}, pageNumber);

            const newResults = data.results || [];

            if (pageNumber === 1) {
                setClients(newResults); // Replace list
            } else {
                setClients(prev => [...prev, ...newResults]); // Append to list
            }

            setHasMore(!!data.next);
            setPage(pageNumber);

        } catch (error) {
            console.log('Error fetching state clients:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchStateClients(page + 1);
        }
    };

    const renderItem = ({ item }: any) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || t('Client');
        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'new', name, recipientId: item.id } })}
                accessibilityRole="button"
                accessibilityLabel={name}
            >
                <Avatar name={name} uri={item.profile_picture} gender={item.gender} size={48} verified={!!item.email_verified} />

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    <View style={styles.locRow}>
                        <MaterialIcons name="place" size={12} color={color.ink300} />
                        <Text style={styles.location} numberOfLines={1}>
                            {item.lga_details?.name || t('Local')}, {item.state_details?.name}
                        </Text>
                    </View>
                </View>

                <MaterialIcons name="chat-bubble-outline" size={20} color={color.brand600} />
            </Pressable>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: space.xl }}>
                <ActivityIndicator size="small" color={color.brand600} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('My state clients')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Listing all clients in')}{' '}
                    <Text style={styles.subHeaderStrong}>{user?.state_details?.name || t('your state')}</Text>
                </Text>
            </View>

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={clients}
                    renderItem={renderItem}
                    keyExtractor={(item: any, index) => item.id.toString() + index} // Unique key
                    contentContainerStyle={styles.listContent}

                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}

                    ListEmptyComponent={
                        <EmptyState
                            icon="person-search"
                            title={t('No clients found in this state.')}
                            message={t('Clients who register in your state will appear here.')}
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

    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        backgroundColor: color.brand100,
    },
    subHeaderText: { fontFamily: font.medium, color: color.brand600, fontSize: 13 },
    subHeaderStrong: { fontFamily: font.extrabold },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl, paddingBottom: 50 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    info: { flex: 1, marginHorizontal: space.md },
    name: { fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
    email: { fontFamily: font.bold, fontSize: 12.5, color: color.ink400, marginTop: 2 },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    location: { fontFamily: font.bold, fontSize: 11.5, color: color.ink300, flexShrink: 1 },
});
