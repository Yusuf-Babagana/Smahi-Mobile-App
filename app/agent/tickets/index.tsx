import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ticketAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Badge, EmptyState, SkeletonCard } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

function ticketBadge(status: string): BadgeStatus {
    switch (status) {
        case 'resolved': return 'verified';
        case 'pending': return 'pending';
        case 'closed': return 'cancelled';
        default: return 'confirmed';
    }
}

export default function TicketListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = async () => {
        try {
            const data = await ticketAPI.getTickets();
            setTickets(data);
        } catch (error) {
            console.log('Error fetching tickets:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const renderItem = ({ item }: any) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => router.push({ pathname: '/agent/tickets/[id]', params: { id: item.id } })}
            accessibilityRole="button"
        >
            <View style={styles.cardHeader}>
                <Text style={styles.ticketId}>#{item.id.toString().padStart(4, '0')}</Text>
                <Badge label={t(item.status)} status={ticketBadge(item.status)} />
            </View>

            <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <MaterialIcons name="chevron-right" size={18} color={color.ink300} />
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('My complaints')}</Text>
                    <Pressable
                        onPress={() => router.push('/agent/tickets/create')}
                        style={styles.addButton}
                        accessibilityRole="button"
                        accessibilityLabel={t('New complaint')}
                    >
                        <MaterialIcons name="add" size={22} color="#FFF" />
                    </Pressable>
                </View>
            </SafeAreaView>

            {loading ? (
                <View style={styles.skeletonWrap}>
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchTickets(); }}
                            tintColor={color.brand600}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="inbox"
                            title={t('No complaints found')}
                            message={t('Tap the + button to report an issue')}
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: color.brand600,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadow.cta,
    },

    skeletonWrap: { padding: space.xl },
    listContent: { padding: space.xl },

    card: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        padding: space.lg,
        marginBottom: space.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: space.sm,
    },
    ticketId: { fontFamily: font.extrabold, fontSize: 11.5, color: color.ink300, letterSpacing: 0.3 },
    subject: { fontFamily: font.extrabold, fontSize: 15, color: color.ink900, marginBottom: 4 },
    description: { fontFamily: font.medium, fontSize: 13.5, color: color.ink600, lineHeight: 20 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: space.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: space.md,
    },
    date: { fontFamily: font.bold, fontSize: 12, color: color.ink400 },
});
