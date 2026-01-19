import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ticketAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';

export default function TicketListScreen() {
    const router = useRouter();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return '#10B981'; // Green
            case 'pending': return '#F59E0B';  // Orange
            case 'closed': return '#6B7280';   // Gray
            default: return '#3B82F6';         // Blue
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/agent/tickets/[id]', params: { id: item.id } })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.ticketId}>#{item.id.toString().padStart(4, '0')}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Complaints</Text>
                <TouchableOpacity onPress={() => router.push('/agent/tickets/create')} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTickets(); }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No complaints found</Text>
                            <Text style={styles.emptySubtext}>Tap the + button to report an issue</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backButton: { padding: 8 },
    addButton: {
        backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary,
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
    },
    listContent: { padding: 20 },

    card: {
        backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    ticketId: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    subject: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    description: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
    date: { fontSize: 12, color: '#9CA3AF' },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8 }
});