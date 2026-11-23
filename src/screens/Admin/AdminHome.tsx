import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, BackHandler, ActivityIndicator } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import HomeHeader from '../../components/shared/HomeHeader';
import GlassWrapper from '../../components/GlassWrapper';
import { logoWithText, notification } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Dropdown } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import apiInstance from '../../api/apiInstance';

const PERIOD_OPTIONS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const SESSION_TRAFFIC_DATA = [
  { value: 3200, label: 'Sun' },
  { value: 3800, label: 'Mon' },
  { value: 4600, label: 'Tue', frontColor: '#C4AED0' },
  { value: 3800, label: 'Wed' },
  { value: 3200, label: 'Thu' },
  { value: 4400, label: 'Fri' },
  { value: 4400, label: 'Sat' },
];

const FALLBACK_CARDS = [
  { key: 'activeUsers', value: '--', change: '--', positive: true },
  { key: 'monthlySessions', value: '--', change: '--', positive: false },
  { key: 'newSignups', value: '--', change: '--', positive: true },
  { key: 'listenerOnlineMinutes', value: '--', change: '--', positive: true },
];

const formatNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

const formatChange = (pct: number) =>
  `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;

const AdminHome = () => {
  // Add hardware back press listener to exit app
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.isFocused()) {
          BackHandler.exitApp();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const { getReportStats } = useAdmin();

  const [selectedPeriod, setSelectedPeriod] = React.useState('week');
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [onlineListeners, setOnlineListeners] = React.useState<number | null>(null);
  const [onlineVenters, setOnlineVenters] = React.useState<number | null>(null);
  const [inAppListeners, setInAppListeners] = React.useState<number | null>(null);
  const [overviewCards, setOverviewCards] = React.useState(FALLBACK_CARDS);
  const [engagementData, setEngagementData] = React.useState<{ value: number; label: string }[]>([]);

  // Fetch online listener count
  React.useEffect(() => {
    const fetchOnline = () => {
      apiInstance.get('availability/listeners')
        .then((res: any) => {
          const count = res?.data?.count ?? res?.data?.listeners?.length ?? 0;
          setOnlineListeners(count);
        })
        .catch(() => {});
      apiInstance.get('availability/venters/online')
        .then((res: any) => { setOnlineVenters(res?.data?.count ?? 0); })
        .catch(() => {});
      apiInstance.get('availability/listeners/inapp')
        .then((res: any) => { setInAppListeners(res?.data?.count ?? 0); })
        .catch(() => {});
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 30000);
    return () => clearInterval(interval);
  }, []);

// Load stats on mount and re-fetch when period changes
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await getReportStats();
        const cards24h = res?.stats?.applicationStatus24h?.cards;
        const hourlyData = res?.stats?.applicationStatus24h?.userProgressEngagementRatio;

        if (cards24h) {
          setOverviewCards([
            {
              key: 'activeUsers',
              value: formatNumber(cards24h.activeUsers?.value ?? 0),
              change: formatChange(cards24h.activeUsers?.changePercent ?? 0),
              positive: (cards24h.activeUsers?.changePercent ?? 0) >= 0,
            },
            {
              key: 'monthlySessions',
              value: formatNumber(cards24h.monthlySessions?.value ?? 0),
              change: formatChange(cards24h.monthlySessions?.changePercent ?? 0),
              positive: (cards24h.monthlySessions?.changePercent ?? 0) >= 0,
            },
            {
              key: 'newSignups',
              value: formatNumber(cards24h.newSignups?.value ?? 0),
              change: formatChange(cards24h.newSignups?.changePercent ?? 0),
              positive: (cards24h.newSignups?.changePercent ?? 0) >= 0,
            },
            {
              key: 'listenerOnlineMinutes',
              value: formatNumber(cards24h.listenerOnlineMinutes?.value ?? 0),
              change: formatChange(cards24h.listenerOnlineMinutes?.changePercent ?? 0),
              positive: (cards24h.listenerOnlineMinutes?.changePercent ?? 0) >= 0,
            },
          ]);
        }

        if (hourlyData && hourlyData.length > 0) {
          // Build labels based on selectedPeriod
          const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const now = new Date();

          const getLabel = (idx: number, total: number): string => {
            if (selectedPeriod === 'week') {
              // last 7 day names
              const d = new Date(now);
              d.setDate(d.getDate() - (total - 1 - idx));
              return DAYS[d.getDay()];
            }
            // month or year → distribute across last 12 months
            const monthIdx = (now.getMonth() - (11 - idx) + 12) % 12;
            return MONTHS[monthIdx];
          };

          // Aggregate into up to 12 buckets for month/year; keep all for week
          const BUCKETS = selectedPeriod === 'week' ? 7 : 12;
          const bucketSize = Math.ceil(hourlyData.length / BUCKETS);
          const aggregated = Array.from({ length: BUCKETS }, (_, bi) => {
            const slice = hourlyData.slice(bi * bucketSize, (bi + 1) * bucketSize);
            const avg = slice.length ? slice.reduce((s: number, x: any) => s + (x.activeUsers ?? 0), 0) : 0;
            return { value: avg, label: getLabel(bi, BUCKETS) };
          });

          setEngagementData(aggregated);
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [selectedPeriod]); // re-fetch when period dropdown changes


  // User Progress chart (LineChart) — live hourly data or fallback
  const chartData =
    engagementData.length > 0
      ? engagementData
      : [
        { value: 0, label: 'Jan' },
        { value: 0, label: 'Feb' },
        { value: 2200, label: 'Mar' },
        { value: 3600, label: 'Apr' },
        { value: 4500, label: 'May' },
        { value: 3000, label: 'Jun' },
        { value: 1700, label: 'Jul' },
      ];

  // Session Traffic chart (BarChart) — same live data; fallback to day-of-week static
  const barData =
    engagementData.length > 0
      ? engagementData.map((d, i) => ({
        value: d.value,
        label: d.label,
        frontColor: i === engagementData.reduce((best, x, j) => x.value > engagementData[best].value ? j : best, 0)
          ? theme.magenda
          : theme.white,
      }))
      : SESSION_TRAFFIC_DATA.map(d => ({ ...d, frontColor: theme.white }));

  const barMax = Math.max(...barData.map(d => d.value), 1000);
  const barMaxRounded = Math.ceil(barMax / 1000) * 1000 + 1000;
  const barYLabels = Array.from({ length: 6 }, (_, i) => {
    const v = (barMaxRounded / 5) * i;
    return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(Math.round(v));
  });

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingBottom: hp(14),
    },
    scrollContent: {
      flex: 1,
      paddingBottom: hp(4),
    },
    overviewTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(2),
    },
    cardsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(4),
    },
    card: {
      width: '47%',
      paddingVertical: hp(2),
      paddingHorizontal: wp(3),
      borderRadius: hp(2),
      marginBottom: hp(1.5),
      backgroundColor: theme.black + '08'
    },
    cardLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + 'cc',
      marginBottom: hp(0.5),
    },
    cardValue: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
    },
    cardChange: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.3),
    },
    chartSection: {
      marginTop: hp(1),
    },
    chartTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(2),
    },
    chartWrapper: {
      padding: wp(4),
      borderRadius: hp(2),
      overflow: 'hidden',
    },
    chartContainer: {
      width: '100%',
    },
    dropdownContainer: {
      width: wp(30),
    },
    dropdownSubContainer: {
      height: hp(4),
      borderBottomWidth: 0,
      backgroundColor: theme.white + '1A',
      borderRadius: hp(2),
      paddingHorizontal: wp(3),
    },
    dropdownSelectedText: {
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      color: theme.white,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    barChartTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
    },
    loaderRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(4),
    },
    loaderCard: {
      width: '47%',
      height: hp(9),
      borderRadius: hp(2),
      marginBottom: hp(1.5),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.black + '08'
    },
  });

  return (
    <HomeWrapper>
      <HomeHeader
        leftIcon={logoWithText}
        admin
        title={t('Admin.home.welcome')}
        subtitle={t('Admin.home.adminStore')}
        rightIcon={notification}
        onRightPress={() => {
          (navigation as any).navigate(routes.notifications);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.overviewTitle}>{t('Admin.home.overview')}</Text>

        {/* Overview Cards */}
        {statsLoading ? (
          <View style={styles.loaderRow}>
            {FALLBACK_CARDS.map((card) => (
              <GlassWrapper key={card.key} glassStyles={styles.loaderCard}>
                <ActivityIndicator size="small" color={theme.white} />
              </GlassWrapper>
            ))}
          </View>
        ) : (
          <View style={styles.cardsGrid}>
            {overviewCards.map((card) => (
              <GlassWrapper key={card.key} glassStyles={styles.card}>
                <Text style={styles.cardLabel}>
                  {t(`Admin.home.${card.key}`)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}>
                  <Text style={styles.cardValue}>{card.value}</Text>
                  <Text
                    style={[
                      styles.cardChange,
                      { color: card.positive ? theme.success : theme.error },
                    ]}
                  >
                    {card.change}
                  </Text>
                </View>
              </GlassWrapper>
            ))}
          </View>
        )}

        {/* Live Online Stats */}
    <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: hp(2) }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(2), padding: hp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
          <View style={{ width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: '#4ade80' }} />
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fontFamilies.semiBold, fontSize: hp(1.4) }}>Available Listeners</Text>
        </View>
        <Text style={{ color: '#fff', fontFamily: fontFamilies.bold, fontSize: hp(2.5) }}>{onlineListeners !== null ? onlineListeners : '--'}</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(2), padding: hp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
          <View style={{ width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: '#a78bfa' }} />
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fontFamilies.semiBold, fontSize: hp(1.4) }}>In-App</Text>
        </View>
        <Text style={{ color: '#fff', fontFamily: fontFamilies.bold, fontSize: hp(2.5) }}>{inAppListeners !== null ? inAppListeners : '--'}</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(2), padding: hp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
          <View style={{ width: wp(2), height: wp(2), borderRadius: wp(1), backgroundColor: '#60a5fa' }} />
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fontFamilies.semiBold, fontSize: hp(1.4) }}>Venters Online</Text>
        </View>
        <Text style={{ color: '#fff', fontFamily: fontFamilies.bold, fontSize: hp(2.5) }}>{onlineVenters !== null ? onlineVenters : '--'}</Text>
      </View>
    </View>

    {/* User Progress / Engagement Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>
            {t('Admin.home.userProgress')}
          </Text>
          <GlassWrapper bordered style={styles.chartWrapper}>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                areaChart
                curved
                width={wp(75)}
                height={hp(20)}
                hideDataPoints={false}
                spacing={wp(10.5)}
                initialSpacing={wp(3)}
                color={theme.magenda}
                thickness={2}
                startFillColor={theme.magenda}
                endFillColor={theme.magenda}
                startOpacity={0.4}
                endOpacity={0.05}
                xAxisColor={theme.white20}
                yAxisColor={'transparent'}
                xAxisLabelTextStyle={{
                  color: theme.white60,
                  fontFamily: fontFamilies.normal,
                  fontSize: hp(1.2),
                }}
                yAxisTextStyle={{
                  color: theme.white60,
                  fontFamily: fontFamilies.normal,
                  fontSize: hp(1.2),
                }}
                hideAxesAndRules={false}
                rulesColor={theme.white + '15'}
                rulesType="dashed"
                dashGap={5}
                dashWidth={2}
                noOfSections={4}
                maxValue={5000}
                backgroundColor="transparent"
                yAxisLabelTexts={['1K', '2K', '3K', '4K', '5K']}
              />
            </View>
          </GlassWrapper>
        </View>

        {/* Session Traffic Chart */}
        <View style={[styles.chartSection, { marginTop: hp(4) }]}>
          <GlassWrapper bordered style={styles.chartWrapper}>
            <View style={styles.headerRow}>
              <Text style={styles.barChartTitle}>
                {t('Admin.home.sessionTraffic')}
              </Text>
              <Dropdown
                options={PERIOD_OPTIONS}
                value={selectedPeriod}
                onSelect={setSelectedPeriod}
                placeholder="Select"
                containerStyle={styles.dropdownContainer}
                subContainerStyle={styles.dropdownSubContainer}
                selectedTextStyle={styles.dropdownSelectedText}
              />
            </View>

            <View style={[styles.chartContainer, { height: hp(28) }]}>
              <BarChart
                data={barData}
                barWidth={wp(7)}
                spacing={wp(4.5)}
                roundedTop
                roundedBottom
                hideRules={false}
                rulesColor={theme.white + '15'}
                rulesType="solid"
                yAxisColor="transparent"
                xAxisColor="transparent"
                yAxisLabelTexts={barYLabels}
                yAxisTextStyle={{
                  color: theme.white,
                  fontFamily: fontFamilies.normal,
                  fontSize: hp(1.4),
                }}
                xAxisLabelTextStyle={{
                  color: theme.white,
                  fontFamily: fontFamilies.normal,
                  fontSize: hp(1.4),
                  textAlign: 'center',
                }}
                noOfSections={5}
                maxValue={barMaxRounded}
                backgroundColor="transparent"
                height={hp(22)}
                width={wp(80)}
                initialSpacing={wp(3)}
              />
            </View>
          </GlassWrapper>
        </View>
      </ScrollView>
    </HomeWrapper>
  );
};

export default AdminHome;
