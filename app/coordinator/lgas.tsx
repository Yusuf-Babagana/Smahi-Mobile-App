import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { locationAPI } from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { color, font, radius, space } from '@/constants/theme';
import { EmptyState } from '@/src/components/ui';

// LGA-Level Management (Coordinator Dashboard spec item 4) — the picker
// step of State -> LGA -> Agents -> Activities. Tapping an LGA opens its
// full drill-down (app/coordinator/lga/[id].tsx) without ever leaving the
// Coordinator Dashboard flow.
export default function CoordinatorLGAListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [lgas, setLgas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user?.state) {
            setLoading(false);
            return;
        }
        locationAPI.getLGAs(Number(user.state))
            .then((data: any) => setLgas(data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user?.state]);

    const filtered = searchQuery.trim()
        ? lgas.filter((l) => l.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        : lgas;

    const renderItem = ({ item }: any) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => router.push({ pathname: '/coordinator/lga/[id]', params: { id: item.id, name: item.name } })}
            accessibilityRole="button"
        >
            <View style={styles.iconTile}>
                <MaterialIcons name="location-city" size={18} color={color.brand600} />
            </View>
            <Text style={styles.lgaName}>{item.name}</Text>
            <MaterialIcons name="chevron-right" size={22} color={color.ink300} />
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{t('LGA management')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <View style={styles.subHeader}>
                <MaterialIcons name="place" size={14} color={color.brand600} />
                <Text style={styles.subHeaderText}>
                    {t('Select an LGA in')}{' '}
                    <Text style={styles.subHeaderStrong}>{user?.state_details?.name || t('your state')}</Text>
                </Text>
            </View>

            <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color={color.ink400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('Search LGA…')}
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

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={color.brand600} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="location-off"
                            title={t('No LGAs found')}
                            message={t('LGAs in your state will appear here.')}
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

    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: space.sm,
        backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border,
        paddingHorizontal: space.lg, height: 44, marginHorizontal: space.xl, marginTop: space.md,
    },
    searchInput: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: color.ink900, paddingVertical: 0 },

    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    iconTile: {
        width: 36, height: 36, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
        marginRight: space.md,
    },
    lgaName: { flex: 1, fontFamily: font.extrabold, fontSize: 14.5, color: color.ink900 },
});
