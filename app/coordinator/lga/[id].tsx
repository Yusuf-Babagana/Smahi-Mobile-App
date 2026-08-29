import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { coordinatorAPI } from '@/src/api/client';
import { color, font, radius, space } from '@/constants/theme';
import { Avatar, Badge, EmptyState, StatTile } from '@/src/components/ui';
import type { BadgeStatus } from '@/src/components/ui';
import { ACTIVITY_ACTION_ICONS, activityBadgeStatus, formatActivityWhen } from '@/src/utils/activityLog';

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    payment: 'payments',
    quality: 'thumb-down',
    no_show: 'event-busy',
    harassment: 'report',
    other: 'help-outline',
};

function reportBadgeStatus(reportStatus: string): BadgeStatus {
    if (reportStatus === 'resolved') return 'verified';
    if (reportStatus === 'dismissed') return 'cancelled';
    if (reportStatus === 'investigating') return 'confirmed';
    return 'pending';
}

function agentBadge(accountStatus: string): { bg: string; fg: string; label: string } {
    if (accountStatus === 'pending_approval') return { bg: '#FEF3C7', fg: '#92400E', label: 'Pending' };
    if (accountStatus === 'suspended') return { bg: '#FDECEC', fg: '#B91C1C', label: 'Suspended' };
    if (accountStatus === 'rejected') return { bg: '#FDECEC', fg: '#B91C1C', label: 'Rejected' };
    if (accountStatus === 'dismissed') return { bg: '#F1F5F9', fg: color.ink400, label: 'Dismissed' };
    return { bg: color.accent100, fg: '#0F766E', label: 'Active' };
}

function SectionHeader({ icon, title }: { icon: keyof typeof MaterialIcons.glyphMap; title: string }) {
    return (
        <View style={styles.sectionHeaderRow}>
            <MaterialIcons name={icon} size={16} color={color.brand600} />
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );
}

// LGA-Level Management (Coordinator Dashboard spec item 4) — State -> LGA
// -> Agents -> Activities, all on one screen: agents assigned here (and
// their status), verification activity, reports/escalations, booking
// performance, and recent activity — everything CoordinatorLGAOverviewView
// returns in a single call, so this drill-down never sends the coordinator
// to a separate system.
export default function CoordinatorLGAOverviewScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id, name } = useLocalSearchParams();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOverview = useCallback(async () => {
        try {
            const result = await coordinatorAPI.getLGAOverview(String(id));
            setData(result);
        } catch (error) {
            console.log('Error fetching LGA overview:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchOverview();
    }, [id, fetchOverview]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOverview();
    };

    const lgaName = data?.lga?.name || name || t('LGA');

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
                        <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
                    </Pressable>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{lgaName}</Text>
                        <Text style={styles.headerSubtitle}>{t('LGA overview')}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={color.brand600} />
                </View>
            ) : !data ? (
                <EmptyState icon="error-outline" title={t('Could not load this LGA')} message={t('Please try again.')} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* AGENTS */}
                    <SectionHeader icon="supervisor-account" title={t('Agents assigned to this LGA')} />
                    {data.agents.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyCardText}>{t('No agents assigned to this LGA yet.')}</Text>
                        </View>
                    ) : (
                        data.agents.map((agent: any) => {
                            const name = `${agent.first_name || ''} ${agent.last_name || ''}`.trim();
                            const badge = agentBadge(agent.account_status);
                            return (
                                <View key={agent.id} style={styles.agentCard}>
                                    <Avatar name={name} gender={agent.gender} size={40} />
                                    <View style={{ flex: 1, marginHorizontal: space.md }}>
                                        <Text style={styles.agentName} numberOfLines={1}>{name}</Text>
                                        <Text style={styles.agentMeta} numberOfLines={1}>
                                            {t('{{registered}} registered', { registered: agent.artisans_registered })}
                                            {' • '}
                                            {t('{{verified}} verified', { verified: agent.artisans_verified })}
                                        </Text>
                                    </View>
                                    <Badge label={t(badge.label)} bg={badge.bg} fg={badge.fg} />
                                </View>
                            );
                        })
                    )}

                    {/* VERIFICATION */}
                    <SectionHeader icon="verified" title={t('Verification activity')} />
                    <View style={styles.statsRow}>
                        <StatTile icon="groups" value={data.verification.total_artisans} label={t('Artisans')} />
                        <StatTile icon="done-all" value={data.verification.verified_artisans} label={t('Verified')} tileBg={color.accent100} tileFg={color.accent600} />
                        <StatTile icon="hourglass-top" value={data.verification.pending_verification} label={t('Pending')} tileBg="#FEF3C7" tileFg="#92400E" />
                    </View>

                    {/* PERFORMANCE */}
                    <SectionHeader icon="insights" title={t('Performance')} />
                    <View style={styles.statsRow}>
                        <StatTile icon="event" value={data.performance.total_bookings} label={t('Bookings')} />
                        <StatTile icon="check-circle" value={data.performance.completed_bookings} label={t('Completed')} tileBg={color.accent100} tileFg={color.accent600} />
                        <StatTile icon="cancel" value={data.performance.cancelled_bookings} label={t('Cancelled')} tileBg="#FDECEC" tileFg="#B91C1C" />
                    </View>

                    {/* REPORTS / ESCALATIONS */}
                    <SectionHeader icon="report" title={t('Reports & escalations')} />
                    {Object.keys(data.reports_by_status).length > 0 && (
                        <View style={styles.chipRow}>
                            {Object.entries(data.reports_by_status).map(([key, count]) => (
                                <Badge key={key} label={`${t(key)}: ${count}`} status={reportBadgeStatus(key)} />
                            ))}
                        </View>
                    )}
                    {data.reports.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyCardText}>{t('No reports connected to this LGA.')}</Text>
                        </View>
                    ) : (
                        data.reports.map((report: any) => (
                            <View key={report.id} style={styles.reportCard}>
                                <View style={styles.reportTop}>
                                    <View style={styles.reportIconTile}>
                                        <MaterialIcons name={CATEGORY_ICONS[report.category] || 'help-outline'} size={16} color={color.brand600} />
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: space.md }}>
                                        <Text style={styles.reportReporter} numberOfLines={1}>{report.reporter_name || report.reporter_email}</Text>
                                        <Text style={styles.reportCategory}>{t(report.category)}</Text>
                                    </View>
                                    <Badge label={t(report.status)} status={reportBadgeStatus(report.status)} />
                                </View>
                                <Text style={styles.reportDescription} numberOfLines={2}>{report.description}</Text>
                            </View>
                        ))
                    )}

                    {/* RECENT ACTIVITY */}
                    <SectionHeader icon="history" title={t('Recent activity')} />
                    {data.recent_activity.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyCardText}>{t('No activity recorded here yet.')}</Text>
                        </View>
                    ) : (
                        data.recent_activity.map((item: any) => {
                            const { date, time } = formatActivityWhen(item.created_at);
                            return (
                                <View key={item.id} style={styles.activityCard}>
                                    <View style={styles.activityIconTile}>
                                        <MaterialIcons name={ACTIVITY_ACTION_ICONS[item.action] || 'history'} size={16} color={color.brand600} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityLine} numberOfLines={2}>
                                            <Text style={styles.activityActor}>{item.actor_name}</Text>
                                            <Text style={styles.activityArrow}> {'→'} </Text>
                                            <Text style={styles.activityAction}>{item.action_display}</Text>
                                        </Text>
                                        <Text style={styles.activityMeta}>{date} {'•'} {time}</Text>
                                    </View>
                                    {!!item.status && <Badge label={t(item.status)} status={activityBadgeStatus(item.status)} />}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
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
    headerSubtitle: { fontFamily: font.bold, fontSize: 11, color: color.ink400, marginTop: 1 },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: space.xl, paddingBottom: 60 },

    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xl, marginBottom: space.md },
    sectionHeaderText: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },

    emptyCard: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        padding: space.lg,
        alignItems: 'center',
    },
    emptyCardText: { fontFamily: font.medium, fontSize: 13, color: color.ink400, textAlign: 'center' },

    agentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    agentName: { fontFamily: font.extrabold, fontSize: 14, color: color.ink900 },
    agentMeta: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400, marginTop: 2 },

    statsRow: { flexDirection: 'row', gap: space.md },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md },

    reportCard: {
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    reportTop: { flexDirection: 'row', alignItems: 'center' },
    reportIconTile: {
        width: 32, height: 32, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
    },
    reportReporter: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900 },
    reportCategory: { fontFamily: font.bold, fontSize: 11.5, color: color.ink400, marginTop: 1 },
    reportDescription: { fontFamily: font.medium, fontSize: 12.5, color: color.ink600, marginTop: space.sm, lineHeight: 18 },

    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        padding: space.lg,
        borderRadius: radius.lg,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: '#EEF2F8',
    },
    activityIconTile: {
        width: 32, height: 32, borderRadius: radius.md,
        backgroundColor: color.brand100, alignItems: 'center', justifyContent: 'center',
        marginRight: space.md,
    },
    activityLine: { fontSize: 13, lineHeight: 18 },
    activityActor: { fontFamily: font.extrabold, color: color.ink900 },
    activityArrow: { fontFamily: font.bold, color: color.ink300 },
    activityAction: { fontFamily: font.bold, color: color.ink600 },
    activityMeta: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: 2 },
});
