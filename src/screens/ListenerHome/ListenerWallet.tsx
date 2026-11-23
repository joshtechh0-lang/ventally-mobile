import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { LineChart } from "react-native-gifted-charts";
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { useEarnings } from '../../api/apiHooks/useEarnings';
import { Loader } from '../../components';
import type { EarningsSummaryResponse, EarningTransaction } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';

const ListenerWallet = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  const navigation = useNavigation();
  const { getEarningsSummary, getEarningsTransactions } = useEarnings();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EarningsSummaryResponse | null>(null);
  const [transactions, setTransactions] = useState<EarningTransaction[]>([]);

  // Fetch earnings data on screen focus
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  useFocusEffect(
    React.useCallback(() => {
      fetchEarningsData();
    }, [])
  );

  const fetchEarningsData = async () => {
    setLoading(true);
    try {
      // Fetch summary and transactions in parallel
      const [summaryRes, transactionsRes] = await Promise.all([
        getEarningsSummary().catch(() => null),
        getEarningsTransactions(10).catch(() => null),
      ]);

      if (summaryRes) {
        setSummary(summaryRes);
      }
      if (transactionsRes?.earnings) {
        setTransactions(transactionsRes.earnings);
      }
    } catch (error) {
      console.log('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build chart data from recent transactions
  const lineData = transactions.length > 0
    ? transactions.slice(0, 5).reverse().map((tx, index) => ({
      value: tx.netAmount,
      label: `Day ${index + 1}`,
    }))
    : [
      { value: 0, label: 'Day 1' },
      { value: 0, label: 'Day 2' },
      { value: 0, label: 'Day 3' },
      { value: 0, label: 'Day 4' },
      { value: 0, label: 'Day 5' },
    ];

  const maxChartValue = Math.max(...lineData.map(d => d.value), 100);

  const handleWithdraw = () => {
    if ((!summary?.availableBalance || summary.availableBalance <= 0) && !__DEV__) {
      toastError({ text: t('Listener.wallet.noBalance') || "No Balance" })
      return;
    }
    (navigation as any).navigate(routes.listenerInternal as any, { screen: routes.payoutMethod } as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    headerTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(3),
    },
    mainCard: {
      padding: hp(3),
      alignItems: 'center',
      borderRadius: hp(2.5),
      backgroundColor: theme.white + "10",

    },
    earningAmount: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(4.5),
      color: theme.white,
      marginBottom: hp(0.5),
      alignSelf: 'center'
    },
    earningLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
      alignSelf: 'center'
    },
    withdrawButton: {
      width: '100%',
      marginVertical: hp(2),
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(3),
      marginBottom: hp(4),
    },
    statCard: {
      flex: 1,
      padding: hp(2),
      borderRadius: hp(2),
      backgroundColor: theme.black + '20',
    },
    statAmount: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.5),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    statLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + 'cc',
      marginBottom: hp(0.5),
    },
    updateLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + 'cc',
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(2),
    },
    chartCard: {
      padding: hp(2),
      borderRadius: hp(2.5),
      backgroundColor: theme.black + '20',
      marginBottom: hp(10),
    }
  });

  return (
    <HomeWrapper key={langKey}>
      <Loader isVisible={loading} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>{t('Listener.wallet.title') || 'Wallet'}</Text>

        <GlassView bordered glassStyles={styles.mainCard}>
          <Text style={styles.earningAmount}>
            {summary?.lifetimeEarnings?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.earningLabel}>{t('Listener.wallet.totalEarnings') || 'Lifetime total'}</Text>
        </GlassView>

        <Button
          title={t('Listener.wallet.withdraw') || 'Withdraw'}
          onPress={handleWithdraw}
          glassStyles={styles.withdrawButton}
          titleStyle={{}}

        />



        <View style={styles.statsRow}>
          <GlassView bordered glassStyles={styles.statCard}>
            <Text style={styles.statAmount}>
              {summary?.availableBalance?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statLabel}>{t('Listener.wallet.availableForPayout') || "Available for Payout"}</Text>
          </GlassView>
          <GlassView bordered glassStyles={styles.statCard}>
            <Text style={styles.statAmount}>
              {summary?.pendingBalance?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statLabel}>{t('Listener.wallet.pendingEarnings') || 'Pending balance'}</Text>
          </GlassView>
        </View>

        {/* Payout rate info */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.8), padding: hp(1.8), marginBottom: hp(2.5), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ fontFamily: fontFamilies.semiBold, fontSize: hp(1.3), color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: hp(1) }}>
            Your payout rate
          </Text>
          <View style={{ flexDirection: 'row', gap: wp(5), marginBottom: hp(1) }}>
            <View>
              <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(1.9), color: theme.white }}>~$0.15<Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: 'rgba(255,255,255,0.5)' }}>/min</Text></Text>
              <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.45)', marginTop: hp(0.2) }}>Ad-funded sessions</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View>
              <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(1.9), color: theme.white }}>~$0.20<Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: 'rgba(255,255,255,0.5)' }}>/min</Text></Text>
              <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.45)', marginTop: hp(0.2) }}>Paid sessions</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.3)' }}>🔒 Your rate is locked in at the start of each session</Text>
        </View>

        {/* <GlassView bordered glassStyles={styles.chartCard}>
          <Text style={styles.sectionTitle}>{t('Listener.wallet.activityBreakdown')}</Text>
          <LineChart
            data={lineData}
            areaChart
            curved
            isAnimated
            animationDuration={1200}
            startFillColor={theme.white}
            startOpacity={0.1}
            endFillColor={theme.white}
            endOpacity={0.01}
            initialSpacing={20}
            endSpacing={20}
            color={theme.white}
            thickness={2}
            hideDataPoints
            yAxisColor="transparent"
            xAxisColor={theme.white + "20"}
            yAxisTextStyle={{ color: theme.white + "80", fontSize: hp(1.4) }}
            xAxisLabelTextStyle={{ color: theme.white + "80", fontSize: hp(1.4) }}
            rulesColor={theme.white + "10"}
            rulesType="solid"
            yAxisThickness={0}
            xAxisThickness={1}
            hideRules={false}
            maxValue={maxChartValue}
            noOfSections={4}
            width={wp(75)}
            height={hp(20)}
            pointerConfig={{
              pointerStripHeight: hp(20),
              pointerStripColor: theme.white + "50",
              pointerStripWidth: 2,
              pointerColor: theme.white + "50",
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: any) => {
                return (
                  <View
                    style={{
                      height: 90,
                      width: 100,
                      justifyContent: 'center',
                      marginTop: -40,
                      marginLeft: -45,
                    }}>
                    <Text style={{ color: theme.white, fontSize: 12, marginBottom: 4, textAlign: 'center', fontFamily: fontFamilies.medium }}>
                      {items[0].label}
                    </Text>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: theme.white }}>
                      <Text style={{ fontWeight: 'bold', textAlign: 'center', color: theme.black, fontSize: 13 }}>
                        {'$' + items[0].value.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              },
            }}
          />
        </GlassView> */}

      {/* Earnings empty state */}
      {transactions.length === 0 && !loading && (
        <View style={{ marginHorizontal: wp(5), marginTop: hp(2), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(2), padding: hp(2.5) }}>
          <Text style={{ color: theme.white, fontSize: hp(1.8), fontFamily: fontFamilies.semiBold, marginBottom: hp(1), textAlign: 'center' }}>
            {t('ListenerWallet.firstSessionEarnings', '💰 Your first session earnings will appear here')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.5), fontFamily: fontFamilies.normal, textAlign: 'center', marginBottom: hp(0.5) }}>
            {t('ListenerWallet.firstSessionTip', 'Most Listeners receive their first session within 48h of activation.')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, textAlign: 'center' }}>
            {t('ListenerWallet.availabilityReminder', 'Make sure your Availability is turned ON to start receiving sessions')}
          </Text>
        </View>
      )}
      </ScrollView>
    </HomeWrapper>
  );
};

export default ListenerWallet;
