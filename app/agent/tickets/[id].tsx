import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ticketAPI } from '@/src/api/client';
import { color, font, radius, space, type } from '@/constants/theme';
import { Avatar, Badge } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';

function ticketBadge(status: string): BadgeStatus {
    switch (status) {
        case 'resolved': return 'verified';
        case 'pending': return 'pending';
        case 'closed': return 'cancelled';
        default: return 'confirmed';
    }
}

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams(); // This gets the ID from the URL
    const router = useRouter();
    const { t } = useTranslation();
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

    const Header = (
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                    <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                </Pressable>
                <Text style={styles.headerTitle}>{t('Ticket')} #{id}</Text>
                <View style={{ width: 40 }} />
            </View>
        </SafeAreaView>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={color.brand600} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.container}>
                {Header}
                <View style={styles.centerMsg}>
                    <Text style={styles.centerMsgText}>{t('Ticket details unavailable.')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {Header}

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status + meta */}
                <View style={styles.statusRow}>
                    <Badge label={t(ticket.status)} status={ticketBadge(ticket.status)} />
                    <Text style={styles.date}>{new Date(ticket.created_at).toDateString()}</Text>
                </View>
                <Text style={styles.subject}>{ticket.subject}</Text>

                {/* Priority / area chips */}
                <View style={styles.badgeRow}>
                    <View style={styles.metaChip}>
                        <MaterialIcons name="flag" size={13} color={color.ink400} />
                        <Text style={styles.metaChipText}>{t('Priority')}: {ticket.priority}</Text>
                    </View>
                    <View style={styles.metaChip}>
                        <MaterialIcons name="place" size={13} color={color.ink400} />
                        <Text style={styles.metaChipText}>{ticket.lga || t('General')}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('Description')}</Text>
                    <Text style={styles.description}>{ticket.description}</Text>

                    {ticket.attachment && (
                        <View style={styles.attachmentBox}>
                            <Image source={{ uri: ticket.attachment }} style={styles.attachmentImage} resizeMode="cover" />
                        </View>
                    )}
                </View>

                {/* Admin Response */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('Admin response')}</Text>
                    {ticket.assigned_to_details ? (
                        <View style={styles.adminBox}>
                            <Avatar name={ticket.assigned_to_details.first_name || 'Admin'} size={40} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.adminName}>
                                    {t('Assigned to')}: {ticket.assigned_to_details.first_name}
                                </Text>
                                <Text style={styles.adminNote}>
                                    {t('The admin is reviewing your case. You will be notified when the status changes.')}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.pendingText}>{t('No admin assigned yet.')}</Text>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.surfaceSunken },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: color.surfaceSunken },
    centerMsg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerMsgText: { fontFamily: font.bold, color: color.ink400 },

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

    content: { padding: space.xl, paddingBottom: 60 },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.md,
    },
    date: { fontFamily: font.bold, color: color.ink300, fontSize: 12 },
    subject: { ...type.titleMd, marginBottom: space.md },

    badgeRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.xl },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: color.surfaceChip,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    metaChipText: {
        fontFamily: font.bold,
        fontSize: 12,
        color: color.ink600,
        textTransform: 'capitalize',
    },

    card: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        padding: space.lg,
        marginBottom: space.lg,
    },
    sectionTitle: { ...type.heading, marginBottom: space.md },
    description: { ...type.body },

    attachmentBox: {
        marginTop: space.lg,
        borderRadius: radius.md,
        overflow: 'hidden',
        height: 200,
        backgroundColor: color.surfaceChip,
    },
    attachmentImage: { width: '100%', height: '100%' },

    adminBox: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    adminName: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900 },
    adminNote: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 2, lineHeight: 18 },
    pendingText: { fontFamily: font.medium, color: color.ink300, fontStyle: 'italic' },
});
