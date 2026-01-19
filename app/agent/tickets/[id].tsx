import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ticketAPI } from '@/src/api/client';
import { colors } from '@/styles/commonStyles';

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams(); // This gets the ID from the URL
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSingleTicket();
        }
    }, [id]);

    const fetchSingleTicket = async () => {
        try {
            // ✅ Fetch specific ticket directly from server
            const data = await ticketAPI.getTicketDetail(id as string);
            setTicket(data);
        } catch (error) {
            console.log('Error fetching ticket:', error);
            Alert.alert("Error", "Could not load ticket details.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'closed': return '#6B7280';
            default: return '#3B82F6';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerMsg}>
                    <Text>Ticket details unavailable.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ticket #{id}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: getStatusColor(ticket.status) + '15' }]}>
                    <Ionicons name="information-circle" size={20} color={getStatusColor(ticket.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        Status: {ticket.status.toUpperCase()}
                    </Text>
                </View>

                {/* Main Info */}
                <Text style={styles.date}>{new Date(ticket.created_at).toDateString()}</Text>
                <Text style={styles.subject}>{ticket.subject}</Text>

                {/* Priority Badge */}
                <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Priority: {ticket.priority}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{ticket.lga || 'General'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Description */}
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{ticket.description}</Text>

                {/* Attachment (if any) */}
                {ticket.attachment && (
                    <View style={styles.attachmentBox}>
                        <Image source={{ uri: ticket.attachment }} style={styles.attachmentImage} resizeMode="cover" />
                    </View>
                )}

                <View style={styles.divider} />

                {/* Admin Response Placeholder */}
                <Text style={styles.sectionTitle}>Admin Response</Text>
                {ticket.assigned_to_details ? (
                    <View style={styles.adminBox}>
                        <Ionicons name="person-circle" size={40} color="#4B5563" />
                        <View>
                            <Text style={styles.adminName}>
                                Assigned to: {ticket.assigned_to_details.first_name}
                            </Text>
                            <Text style={styles.adminNote}>
                                The admin is reviewing your case. You will be notified when the status changes.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.pendingText}>No admin assigned yet.</Text>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerMsg: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backButton: { padding: 4 },

    content: { padding: 24 },

    statusBanner: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 20, gap: 8
    },
    statusText: { fontWeight: '700', fontSize: 14 },

    date: { color: '#9CA3AF', fontSize: 13, marginBottom: 4 },
    subject: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 12 },

    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#4B5563', textTransform: 'capitalize' },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    description: { fontSize: 16, color: '#4B5563', lineHeight: 24 },

    attachmentBox: { marginTop: 16, borderRadius: 12, overflow: 'hidden', height: 200, backgroundColor: '#F3F4F6' },
    attachmentImage: { width: '100%', height: '100%' },

    adminBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 },
    adminName: { fontWeight: '700', color: '#374151' },
    adminNote: { fontSize: 13, color: '#6B7280', maxWidth: '90%', marginTop: 2 },
    pendingText: { color: '#9CA3AF', fontStyle: 'italic' }
});