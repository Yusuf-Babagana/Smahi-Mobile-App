import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';

export default function AgentListScreen() {
    const router = useRouter();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            // In a real app, ensure this API returns only agents for this LGA
            const data = await adminAPI.getAgents();
            // Client-side filter if backend returns everyone (Safety check)
            const myAgents = Array.isArray(data) ? data.filter((u: any) => u.role === 'agent') : [];
            setAgents(myAgents);
        } catch (error) {
            console.log("Error fetching agents", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={[styles.avatar, styles.placeholder]}>
                    <Text style={styles.placeholderText}>{item.first_name?.[0]}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.detail}>{item.email}</Text>
                    <Text style={styles.detail}>{item.phone_number || 'No Phone'}</Text>
                </View>

                <View style={styles.statusCol}>
                    <View style={[styles.badge, { backgroundColor: item.is_active ? '#D1FAE5' : '#FEE2E2' }]}>
                        <Text style={[styles.badgeText, { color: item.is_active ? '#065F46' : '#991B1B' }]}>
                            {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Field Agents</Text>
                <TouchableOpacity onPress={() => router.push('/lg-admin/agents/create')} style={styles.addButton}>
                    <Ionicons name="person-add" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={agents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No agents found in this LGA.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backButton: { padding: 8 },
    addButton: { backgroundColor: colors.primary, padding: 8, borderRadius: 20 },

    listContent: { padding: 20 },
    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
    placeholder: { backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    detail: { fontSize: 12, color: '#6B7280' },
    statusCol: { alignItems: 'flex-end' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#6B7280' }
});