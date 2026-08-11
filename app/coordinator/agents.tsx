import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { coordinatorAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard, useToast, useConfirm } from '@/src/components/ui';

export default function CoordinatorAgentList() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { show: showToast } = useToast();
    const confirm = useConfirm();

    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchAgents = useCallback(async (pageNumber: number) => {
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await coordinatorAPI.getAgents(pageNumber);
            const newResults = data.results || [];

            setAgents(prev => (pageNumber === 1 ? newResults : [...prev, ...newResults]));
            setHasMore(!!data.next);
            setPage(pageNumber);
        } catch (error) {
            console.log('Error fetching agents:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchAgents(1);
    }, [user, fetchAgents]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchAgents(page + 1);
    };

    const toggleStatus = async (agent: any) => {
        const nextStatus = agent.account_status === 'suspended' ? 'active' : 'suspended';
        const verb = nextStatus === 'suspended' ? t('Suspend') : t('Reactivate');

        const ok = await confirm({
            title: `${verb} ${agent.first_name}?`,
            message: nextStatus === 'suspended'
                ? t('They will not be able to log in until reactivated.')
                : t('They will regain access immediately.'),
            confirmLabel: verb,
            destructive: nextStatus === 'suspended',
        });
        if (!ok) return;

        setUpdatingId(agent.id);
        try {
            await coordinatorAPI.setAgentStatus(agent.id, nextStatus);
            setAgents(prev => prev.map(a => (a.id === agent.id ? { ...a, account_status: nextStatus } : a)));
        } catch (error) {
            console.log('Error updating agent status:', error);
            showToast(t('Could not update this agent. Please try again.'), { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const renderItem = ({ item }: any) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        const suspended = item.account_status === 'suspended';

        return (
            <View style={styles.card}>
                <Avatar name={name} size={44} />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statChip}>
                            <MaterialIcons name="person-add" size={12} color={color.brand600} />
                            <Text style={styles.statText}>{item.artisans_registered} {t('registered')}</Text>
                        </View>
                        <View style={styles.statChip}>
                            <MaterialIcons name="verified" size={12} color={color.accent600} />
                            <Text style={styles.statText}>{item.artisans_verified} {t('verified')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionCol}>
                    <Badge
                        label={suspended ? t('Suspended') : t('Active')}
                        bg={suspended ? '#FDECEC' : color.accent100}
                        fg={suspended ? '#B91C1C' : '#0F766E'}
                    />
                    <Pressable
                        style={({ pressed }) => [styles.toggleBtn, pressed && { opacity: 0.7 }]}
                        onPress={() => toggleStatus(item)}
                        disabled={updatingId === item.id}
                        accessibilityRole="button"
                        accessibilityLabel={suspended ? t('Reactivate') : t('Suspend')}
                    >
                        {updatingId === item.id ? (
                            <ActivityIndicator size="small" color={color.ink400} />
                        ) : (
                            <Text style={styles.toggleText}>{suspended ? t('Reactivate') : t('Suspend')}</Text>
                        )}
                    </Pressable>
                </View>
            </View>
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

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('My agents')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Agents overseeing')}{' '}
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
                    data={agents}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <EmptyState
                            icon="groups"
                            title={t('No agents found in your state.')}
                            message={t('Agents registered in your state will appear here.')}
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
    email: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: space.sm, marginTop: 6 },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: color.surfaceSunken,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    statText: { fontFamily: font.bold, fontSize: 10.5, color: color.ink400 },

    actionCol: { alignItems: 'flex-end', gap: space.sm },
    toggleBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: color.border,
        minWidth: 76,
        alignItems: 'center',
    },
    toggleText: { fontFamily: font.extrabold, fontSize: 11, color: color.ink600 },
});
