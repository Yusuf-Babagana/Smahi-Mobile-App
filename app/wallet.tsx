import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, Pressable, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { walletAPI } from '@/src/api/client';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { EmptyState, Button } from '@/src/components/ui';

// Shared across every role that can earn on the platform (agents today;
// artisans once booking-earning wiring lands) — the backend scopes
// everything to whoever's logged in, so there's nothing role-specific
// to branch on here.
export default function WalletScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const load = async () => {
    try {
      const [walletData, txData] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(txData.results || txData || []);
    } catch (error) {
      console.log('Error loading wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const formatMoney = (amount: number | string) => {
    const n = Number(amount) || 0;
    return `₦${Math.abs(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const submitWithdrawal = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert(t('Enter an amount'), t('Please enter how much you want to withdraw.'));
      return;
    }
    setSubmittingWithdraw(true);
    try {
      await walletAPI.requestWithdrawal(amount);
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      await load();
      Alert.alert(t('Request submitted'), t('Your withdrawal request has been submitted for approval.'));
    } catch (err: any) {
      const message = err?.response?.data?.error || t('Failed to submit your withdrawal request.');
      Alert.alert(t('Error'), message);
    } finally {
      setSubmittingWithdraw(false);
    }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand600} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[color.brand900, color.brand600]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>{t('Available balance')}</Text>
          {loading ? (
            <ActivityIndicator color="#FFF" style={{ marginTop: 10 }} />
          ) : (
            <Text style={styles.balanceValue}>{formatMoney(wallet?.balance || 0)}</Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>{t('S-MAHII Wallet')}</Text>
            <MaterialIcons name="account-balance-wallet" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>

        <View style={styles.actionRow}>
          <ActionItem
            icon="south"
            label={t('Withdraw')}
            tileBg={color.accent100}
            tileFg={color.accent600}
            onPress={() => setWithdrawModalVisible(true)}
          />
        </View>

        <Text style={styles.sectionTitle}>{t('Transaction history')}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={color.brand600} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="receipt-long"
            title={t('No transactions yet')}
            message={t('Your credits and payouts will show up here.')}
          />
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((txn: any, index: number) => {
              const isCredit = Number(txn.amount) >= 0;
              return (
                <View key={txn.id ?? index} style={[styles.transactionItem, index > 0 && styles.transactionDivider]}>
                  <View style={[styles.transIcon, { backgroundColor: isCredit ? color.accent100 : '#FDECEC' }]}>
                    <MaterialIcons
                      name={isCredit ? 'south' : 'north'}
                      size={16}
                      color={isCredit ? color.accent600 : '#B91C1C'}
                    />
                  </View>
                  <View style={{ flex: 1, paddingHorizontal: space.md }}>
                    <Text style={styles.transDesc} numberOfLines={1}>
                      {txn.description || t(txn.type)}
                    </Text>
                    <Text style={styles.transDate}>
                      {new Date(txn.created_at).toDateString()}
                      {txn.status === 'pending' ? ` · ${t('Pending')}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.transAmount, { color: isCredit ? color.accent600 : color.danger600 }]}>
                    {isCredit ? '+' : '-'}{formatMoney(txn.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Withdraw modal */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={type.heading}>{t('Request withdrawal')}</Text>
            <Text style={styles.modalHint}>
              {t('Available balance')}: {formatMoney(wallet?.balance || 0)}
            </Text>
            <TextInput
              style={styles.amountInput}
              placeholder={t('Amount')}
              placeholderTextColor={color.ink300}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <Button
                title={t('Cancel')}
                variant="secondary"
                onPress={() => setWithdrawModalVisible(false)}
                disabled={submittingWithdraw}
                style={{ flex: 1 }}
              />
              <Button
                title={t('Submit')}
                onPress={submitWithdrawal}
                loading={submittingWithdraw}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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

  actionRow: { flexDirection: 'row', marginBottom: space.xxl },
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

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: space.xl,
    paddingBottom: space.xxl,
  },
  modalHint: { fontFamily: font.medium, fontSize: 12.5, color: color.ink400, marginTop: 4, marginBottom: space.lg },
  amountInput: {
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: space.md,
    height: 52,
    fontFamily: font.bold,
    fontSize: 18,
    color: color.ink900,
    marginBottom: space.lg,
  },
  modalActions: { flexDirection: 'row', gap: space.sm },
});
