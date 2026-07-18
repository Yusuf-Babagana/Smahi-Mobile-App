import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { adminAPI } from '@/src/api/client';
import { color, font, radius, shadow, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, SkeletonCard } from '@/src/components/ui';

export default function AgentListScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            // Backend has no agents-only endpoint yet — fetch all users and
            // filter to agents client-side (the filter below already did this).
            const data = await adminAPI.getAllUsers();
            const myAgents = Array.isArray(data) ? data.filter((u: any) => u.role === 'agent') : [];
            setAgents(myAgents);
        } catch (error) {
            console.log("Error fetching agents", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return (
            <View style={styles.card}>
                <Avatar name={name} uri={item.profile_picture} size={46} />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.detail} numberOfLines={1}>{item.email}</Text>
                    <Text style={styles.detail}>{item.phone_number || t('No Phone')}</Text>
                </View>
                <Badge
                    label={item.is_active ? t('Active') : t('Inactive')}
                    status={item.is_active ? 'verified' : 'cancelled'}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('Field agents')}</Text>
                    <Pressable
                        onPress={() => router.push('/lg-admin/agents/create')}
                        style={styles.addButton}
                        accessibilityRole="button"
                        accessibilityLabel={t('Add agent')}
                    >
                        <MaterialIcons name="person-add" size={20} color="#FFF" />
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
                    data={agents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="badge"
                            title={t('No agents found in this LGA.')}
                            message={t('Agents you create will appear here.')}
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
    detail: { fontFamily: font.bold, fontSize: 12, color: color.ink400, marginTop: 1 },
});
