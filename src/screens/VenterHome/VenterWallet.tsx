import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, FlatList, ActivityIndicator, Platform, Linking, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { routes } from '../../navigation/routes';
import { chevronIcon, tickIcon } from '../../assets/icons';
import VenterTransactions from './VenterTransactions';
import TransactionsTable from '../../components/TransactionsTable';
import { useWallet } from '../../api/apiHooks/useWallet';
import { usePayments } from '../../api/apiHooks/usePayments';
import { WalletBalance, Transaction } from '../../types/apiPayloadsTypes';
import { toastError, toastSuccess } from '../../utils/toast';
import { Loader, GlassModal } from '../../components';
import { useEffect } from 'react';
import EmptyState from '../../components/shared/EmptyState';

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return amount.toFixed(2)
};

const mapTransactionToRow = (transaction: Transaction) => {
  const amount = formatCurrency(transaction.amountCurrency);
  return {
    id: transaction.id,
    sessionCharges: (transaction.type === 'SESSION' || transaction.type === 'session_payment') ? amount : '-',
    fundAdditions: (transaction.type === 'DEPOSIT' || transaction.type === 'deposit') ? amount : '-',
    refunds: (transaction.type === 'REFUND' || transaction.type === 'refund') ? amount : '-',
    subscriptionCharge: (transaction.type === 'SUBSCRIPTION' || transaction.type === 'subscription_payment') ? amount : '-',
    type: transaction.type,
    amount: transaction.amountCurrency > 0 ? '+ ' + transaction.amountCurrency : '- ' + (transaction.amountCurrency * -1),
  };
};

const VenterWallet = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const { getBalance, getTransactions, getSubscription } = useWallet();
  const { cancelSubscription } = usePayments();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [filter, setFilter] = useState(t('Wallet.paymentMethods')); // or 'All' if key needed

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const fetchWalletData = async () => {
    setLoading(true);
    setLoadingSubscription(true);
    try {
      const balancePromise = getBalance().catch(err => {
        console.log('Error fetching balance:', err);
        return null;
      });
      const transactionsPromise = getTransactions(5, 0).catch(err => {
        console.log('Error fetching transactions:', err);
        return null;
      });
      const subscriptionPromise = getSubscription().catch(err => {
        console.log('Error fetching subscription:', err);
        return null;
      });

      const [balanceData, transactionsData, subscriptionData] = await Promise.all([
        balancePromise,
        transactionsPromise,
        subscriptionPromise
      ]);

      if (balanceData?.balance) {
        setBalance(balanceData.balance);
      }

      if (transactionsData?.transactions) {
        setRecentTransactions(transactionsData.transactions.map(mapTransactionToRow));
      }

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toastError({ text: t('Common.errors.fetchingData') });
    } finally {
      setLoading(false);
      setLoadingSubscription(false);
    }
  };

  const handleCancelPress = () => {
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await cancelSubscription();
      setCancelled(true);
      fetchWalletData(); // Refresh data
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toastError({ text: error?.message || t('Common.error.somethingWentWrong'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    navigation.navigate(routes.venterAddFunds as never);
  };

    const handleAddFunds = () => {
      (navigation as any).navigate(routes.venterAddFunds);
    };
  const handleAddPaymentMethod = () => {
    // @ts-ignore
    // @ts-ignore
    (navigation as any).navigate(routes.addPaymentMethod, { from: 'VenterWallet' });
  };

  const handleViewTransactions = () => {
    // @ts-ignore
    // @ts-ignore
    (navigation as any).navigate(routes.venterTransactions);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: hp(2),
      marginBottom: hp(3),
    },
    headerTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
    },
    content: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(10),
    },
    balanceTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(4.5),
      color: theme.white,
      marginBottom: hp(3),
      alignSelf: "center"
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(2),
      marginTop: hp(2),
    },
    paymentMethodsRow: {
      marginBottom: hp(4),
      gap: hp(2),
    },
    emptyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + "80",
    },
    transactionSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
      paddingVertical: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.white + '20',
    },
    summaryLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
    },
    summaryValue: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    paymentMethodCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4),
      borderRadius: hp(2),
      borderWidth: 1,
      borderColor: theme.white + '20',
      backgroundColor: theme.black + '20',
    },
    cardDetails: {
      flex: 1,
    },
    cardTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    cardSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + '70',
    },
    chevron: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      transform: [{ rotate: '-90deg' }]
    },
    // Subscription Section Styles
    premiumTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.8),
      color: theme.white,
    },
    premiumSubtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
    },
    manageSubscriptionButton: {
      width: '100%',
      marginTop: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(1),
      borderRadius: hp(999),
      backgroundColor: theme.white + "5"
    },
    manageSubscriptionButtonText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2.5),
    },
    detailLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      opacity: 0.9,
    },
    detailValue: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
    },
  });
  console.log("response data:", { balance, recentTransactions });


  return (
    <HomeWrapper key={langKey}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Wallet.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <GlassWrapper
          bordered
          glassStyles={{
            backgroundColor: theme.black + '10',
            borderRadius: hp(3),
            paddingVertical: hp(3),
            paddingHorizontal: wp(5),
            alignItems: 'center',
            marginBottom: hp(4),
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.3), fontFamily: fontFamilies.semiBold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: hp(1.5) }}>
            Your Wallet
          </Text>
          {/* Minutes row (subscriber) */}
          {subscription?.status === 'active' ? (() => {
            const memberMins = balance?.member_minutes ?? balance?.minutes ?? 0;
            const rolloverMins = balance?.rollover_minutes ?? 0;
            const total = Math.floor(memberMins + rolloverMins);
            return (
              <View style={{ alignItems: 'center', marginBottom: hp(2) }}>
                <Text style={styles.balanceTitle}>{total}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.5), fontFamily: fontFamilies.normal }}>minutes</Text>
                {rolloverMins > 0 && (
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, marginTop: hp(0.5) }}>
                    🔄 {rolloverMins} rolled over from last month
                  </Text>
                )}
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, marginTop: hp(0.4) }}>
                  Unused minutes roll over to next month
                </Text>
              </View>
            );
          })() : (
            <View style={{ alignItems: 'center', marginBottom: hp(2) }}>
              <Text style={styles.balanceTitle}>
                {balance ? formatCurrency(balance.currency, balance.currencyCode) : '0.00'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.5), fontFamily: fontFamilies.normal }}>available balance</Text>
            </View>
          )}
          <Button
            title={t('Wallet.addFunds')}
            onPress={handleAddFunds}
            buttonStyle={{ width: '100%' }}
            glassStyles={{ width: '100%', backgroundColor: theme.white + '20' }}
            titleStyle={{ color: theme.white }}
            disabled={false}
            borderedGlassButton
          />
        </GlassWrapper>

        {/* Filter Dropdown */}
        {/* <View style={{ zIndex: 1000, marginBottom: hp(3) }}>
          <Dropdown
            placeholder="All"
            containerStyle={{
              borderWidth: 1,
              borderColor: theme.white + "20",
              borderRadius: hp(999),
              backgroundColor: theme.black + "5",
              paddingHorizontal: wp(5),

            }}
            subContainerStyle={{
              borderBottomWidth: 0
            }}
            value={filter}
            options={[
              { label: 'All', value: 'All' },
              { label: 'Credit Card', value: 'Credit Card' },
              { label: 'PayPal', value: 'PayPal' },
            ]}
            onSelect={setFilter}
          />
        </View> */}

        {/* Payment Methods */}
        {/* <View>
          <Text style={styles.sectionTitle}>{t('Wallet.paymentMethods')}</Text>
          <View style={styles.paymentMethodsRow}>
            <Pressable style={styles.paymentMethodCard} onPress={handleAddPaymentMethod}>
              <View style={styles.cardDetails}>
                <Text style={styles.cardTitle}>Visa **** **** **** 4567</Text>
                <Text style={styles.cardSubtitle}>Default • Exp. 08/26</Text>
              </View>
              <Image source={chevronIcon} style={styles.chevron} resizeMode="contain" />
            </Pressable>
          </View>
        </View> */}

        {/* Transactions Summary */}

        <Text style={styles.sectionTitle}>{t('Wallet.transactions')}</Text>

        <TransactionsTable loading={loading} transactions={recentTransactions} />
        {recentTransactions?.length > 0 && <Button
          title={t('VenterWallet.viewAll')}
          onPress={handleViewTransactions}
          buttonStyle={{ width: '100%', marginBottom: hp(4) }}
          glassStyles={{ width: '100%', backgroundColor: theme.black + '5' }}
          titleStyle={{ color: theme.white }}
          disabled={false}
        />}



      </ScrollView>
      <Loader isVisible={loading} />

      <GlassModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onPrimaryPress={handleConfirmCancel}
        title={t('SubscriptionDetails.cancelSubscription')}
        message={t('SubscriptionDetails.cancelConfirmationMessage')}
        primaryButtonText={t('Common.yes')}
        secondaryButtonText={t('Common.no')}
        onSecondaryPress={() => setShowConfirm(false)}
      />

      <GlassModal
        icon={tickIcon}
        iconBorder={cancelled}
        visible={cancelled}
        onClose={() => setCancelled(false)}
        onPrimaryPress={() => {
          setShowConfirm(false);
          setCancelled(false);
        }}
        title={t('SubscriptionDetails.cancelled')}
        message={t('SubscriptionDetails.cancelledMessage')}
        primaryButtonText={t('Common.continue')}
        dismissOnBackPress
        bottomAttachedBtn
      />
    </HomeWrapper>
  );
};

export default VenterWallet;