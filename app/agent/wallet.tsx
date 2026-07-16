import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { walletAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { EmptyState } from '@/src/components/ui';

export default function AgentWalletScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWallet = async () => {
        try {
            const data = await walletAPI.getWalletData();
            setWallet(data);
        } catch (error) {
            console.log('Error loading wallet');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const formatMoney = (amount: number) => {
        return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    };

    const handleWithdraw = () => {
        Alert.alert(t("Request Payout"), t("Withdrawal functionality will be enabled once your bank account is verified."));
    };

    const ActionItem = ({ icon, label, tileBg, tileFg, onPress }: {
        icon: keyof typeof MaterialIcons.glyphMap;
        label: string;
        tileBg: string;
        tileFg: string;
        onPress?: () => void;
    }) => (
        <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.8 }]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
                <MaterialIcons name={icon} size={22} color={tileFg} />
            </View>
            <Text style={styles.actionText}>{label}</Text>
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
                    <Text style={styles.headerTitle}>{t('My wallet')}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWallet(); }} tintColor={color.brand600} />}
                showsVerticalScrollIndicator={false}
            >

                {/* Balance Card */}
                <LinearGradient
                    colors={[color.brand900, color.brand600]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <Text style={styles.balanceLabel}>{t('Total earnings')}</Text>
                    {loading ? (
                        <ActivityIndicator color="#FFF" style={{ marginTop: 10 }} />
                    ) : (
                        <Text style={styles.balanceValue}>{formatMoney(wallet?.balance || 0)}</Text>
                    )}
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardFooterText}>{t('S-MAHII Agent Account')}</Text>
                        <MaterialIcons name="account-balance-wallet" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>

                {/* Actions */}
                <View style={styles.actionRow}>
                    <ActionItem
                        icon="south"
                        label={t('Withdraw')}
                        tileBg={color.accent100}
                        tileFg={color.accent600}
                        onPress={handleWithdraw}
                    />
                    <ActionItem
                        icon="credit-card"
                        label={t('Bank details')}
                        tileBg={color.brand100}
                        tileFg={color.brand600}
                    />
                    <ActionItem
                        icon="schedule"
                        label={t('History')}
                        tileBg={color.warn100}
                        tileFg={color.warn600}
                    />
                </View>

                <Text style={styles.sectionTitle}>{t('Recent transactions')}</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={color.brand600} />
                ) : (
                    <View style={styles.transactionsList}>
                        {wallet?.transactions?.length > 0 ? (
                            wallet.transactions.map((txn: any, index: number) => (
                                <View key={index} style={[styles.transactionItem, index > 0 && styles.transactionDivider]}>
                                    <View style={[styles.transIcon, { backgroundColor: txn.type === 'credit' ? color.accent100 : '#FDECEC' }]}>
                                        <MaterialIcons
                                            name={txn.type === 'credit' ? 'south' : 'north'}
                                            size={16}
                                            color={txn.type === 'credit' ? color.accent600 : '#B91C1C'}
                                        />
                                    </View>
                                    <View style={{ flex: 1, paddingHorizontal: space.md }}>
                                        <Text style={styles.transDesc} numberOfLines={1}>{txn.description}</Text>
                                        <Text style={styles.transDate}>{new Date(txn.date).toDateString()}</Text>
                                    </View>
                                    <Text style={[styles.transAmount, { color: txn.type === 'credit' ? color.accent600 : color.danger600 }]}>
                                        {txn.type === 'credit' ? '+' : '-'}{formatMoney(txn.amount)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <EmptyState
                                icon="receipt-long"
                                title={t('No transactions yet')}
                                message={t('Your credits and payouts will show up here.')}
                            />
                        )}
                    </View>
                )}

            </ScrollView>
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

    content: { padding: space.xl },

    balanceCard: {
        borderRadius: radius.xxl,
        padding: space.xxl,
        marginBottom: space.xxl,
        ...shadow.cta,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.78)',
        fontFamily: font.extrabold,
        fontSize: 11.5,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    balanceValue: { color: '#FFF', fontFamily: font.extrabold, fontSize: 34, letterSpacing: -0.68 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: space.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.18)',
        paddingTop: space.lg,
    },
    cardFooterText: { color: 'rgba(255,255,255,0.9)', fontFamily: font.bold, fontSize: 12 },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xxl },
    actionButton: {
        alignItems: 'center',
        width: '31%',
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        paddingVertical: space.lg,
    },
    iconTile: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: space.sm,
    },
    actionText: { fontFamily: font.extrabold, fontSize: 12, color: color.ink600 },

    sectionTitle: { ...type.heading, marginBottom: space.md },

    transactionsList: {
        backgroundColor: color.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#EEF2F8',
        paddingHorizontal: space.lg,
    },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
    transactionDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    transIcon: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transDesc: { fontFamily: font.extrabold, fontSize: 13.5, color: color.ink900 },
    transDate: { fontFamily: font.bold, fontSize: 11, color: color.ink300, marginTop: 2 },
    transAmount: { fontFamily: font.extrabold, fontSize: 13.5 },
});
