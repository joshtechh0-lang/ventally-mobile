import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import { chevronIcon } from '../../assets/icons';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import type { AdminPaymentHistoryItem } from '../../types/apiPayloadsTypes';
import Dropdown from '../../components/Dropdown';

const formatCurrency = (amount: number, currency = 'USD') => {
    if (amount >= 1000000) return `${(amount / 1000000)?.toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000)?.toFixed(1)}K`;
    return `${amount?.toFixed(2)}`;
};

const formatDate = (iso: string) => {
    if (!iso) return '--';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch {
        return '--';
    }
};

const STATUS_COLOR: Record<string, string> = {
    completed: '#4CAF50',
    pending: '#FFC107',
    failed: '#F44336',
    expired: '#9E9E9E',
};

/** Always builds 12 full calendar months of data going back from today */
const build12MonthData = (payments: AdminPaymentHistoryItem[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Build ordered list of last 12 months
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthNames[d.getMonth()] });
    }
    const buckets: Record<string, number> = {};
    months.forEach(m => (buckets[m.key] = 0));

    payments.forEach(p => {
        if (p.status === 'completed') {
            const d = new Date(p.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (key in buckets) buckets[key] = (buckets[key] || 0) + (p.amount || 0);
        }
    });

    return months.map(m => ({ label: m.label, value: buckets[m.key] }));
};

const AdminFinancialStats = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { getReportStats, getPaymentHistory, getAdminPaymentStats } = useAdmin();

    // ── State ──────────────────────────────────────────────────────────
    const [chartPeriod, setChartPeriod] = useState('30');
    const [statsLoading, setStatsLoading] = useState(true);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [engagementData, setEngagementData] = useState<{ value: number; label: string }[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<AdminPaymentHistoryItem[]>([]);
    const [paymentTotal, setPaymentTotal] = useState(0);
    const [paymentStats, setPaymentStats] = useState<any>(null);

    // ── Fetch stats (overview cards + engagement chart) ────────────────
    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await getReportStats();
            const hourlyData = res?.stats?.applicationStatus24h?.userProgressEngagementRatio;
            if (hourlyData && hourlyData.length > 0) {
                setEngagementData(
                    hourlyData.map((item: any, idx: number) => ({
                        value: item.sessions ?? 0,
                        label: `H${idx + 1}`,
                    }))
                );
            }

            const pStats = await getAdminPaymentStats();
            setPaymentStats(pStats);
        } catch (err) {
            console.warn('Failed to load financial stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // ── Fetch payment history (fetch enough to cover 30 days) ──────────
    const fetchPayments = useCallback(async () => {
        try {
            setPaymentsLoading(true);
            const res = await getPaymentHistory(undefined, undefined, undefined, undefined, undefined, 100, 0);
            setPaymentHistory(res?.payments ?? []);
            setPaymentTotal(res?.pagination?.total ?? 0);
        } catch (err) {
            console.warn('Failed to load payment history:', err);
        } finally {
            setPaymentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchPayments();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchPayments()]);
        setRefreshing(false);
    }, [fetchStats, fetchPayments]);

    // ── Chart: always 12 months, scrollable ────────────────────────────
    const chartData = useMemo(() => {
        const from12 = build12MonthData(paymentHistory);
        if (from12.some(d => d.value > 0)) return from12;
        // Static fallback when no real payments
        return [
            { value: 3200, label: 'Jan' }, { value: 3800, label: 'Feb' },
            { value: 2100, label: 'Mar' }, { value: 3600, label: 'Apr' },
            { value: 4200, label: 'May' }, { value: 2800, label: 'Jun' },
            { value: 3100, label: 'Jul' }, { value: 3900, label: 'Aug' },
            { value: 2600, label: 'Sep' }, { value: 4500, label: 'Oct' },
            { value: 3300, label: 'Nov' }, { value: 3700, label: 'Dec' },
        ];
    }, [paymentHistory]);

    const maxChartValue = Math.max(...chartData.map(d => d.value), 1000);
    const chartMax = Math.ceil(maxChartValue / 1000) * 1000 + 1000;
    // Index of the highest-value point for highlighting
    const maxIdx = chartData.reduce((best, d, i) => d.value > chartData[best].value ? i : best, 0);

    const pieData = [
        { value: 30, color: theme.chart3, text: '30%' },
        { value: 30, color: theme.chart4, text: '30%' },
        { value: 20, color: theme.chart1, text: '20%' },
        { value: 20, color: theme.chart2, text: '20%' },
    ];

    // ── Styles ─────────────────────────────────────────────────────────
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        horizontalCardsScroll: {
            paddingRight: wp(5),
            gap: wp(4),
            marginBottom: hp(3),
        },
        statCard: {
            width: wp(70),
            padding: wp(4),
            borderRadius: hp(2.5),
            height: hp(18),
            justifyContent: 'space-between',
        },
        cardLabel: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'cc',
            marginBottom: hp(1),
        },
        cardTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: theme.white,
            lineHeight: hp(2.6),
        },
        revenueValue: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.8),
            color: theme.white,
        },
        seeAnalytics: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(1),
        },
        linkText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white,
            textDecorationLine: 'underline',
            lineHeight: hp(2),
            marginRight: wp(1),
        },
        chevron: {
            width: hp(1.8),
            height: hp(1.8),
            tintColor: theme.white,
            transform: [{ rotate: '-90deg' }],
        },
        trendContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(1),
        },
        trendText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + 'cc',
            marginLeft: wp(1),
        },
        chartContainer: {
            padding: wp(5),
            borderRadius: hp(3),
            backgroundColor: 'rgba(0,0,0,0.2)',
            marginBottom: hp(3),
        },
        chartHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(3),
        },
        chartTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.2),
            color: theme.white,
        },
        dropdownContainer: {
            width: wp(28),
        },
        dropdownSubContainer: {
            height: hp(4),
            borderBottomWidth: 0,
            backgroundColor: theme.white + '10',
            borderRadius: hp(2),
            paddingHorizontal: wp(3),
        },
        dropdownSelectedText: {
            fontSize: hp(1.4),
            fontFamily: fontFamilies.normal,
            color: theme.white,
        },
        highlightBadge: {
            backgroundColor: '#B692C2',
            paddingHorizontal: wp(2),
            paddingVertical: hp(0.4),
            borderRadius: hp(1),
            position: 'absolute',
            top: -hp(3),
            alignSelf: 'center',
        },
        highlightText: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.4),
            color: theme.white,
        },
        pieContainer: {
            alignItems: 'center',
            marginVertical: hp(2),
        },
        // Payment history
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(2),
        },
        sectionTitle: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.2),
            color: theme.white,
        },
        sectionSubtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + '80',
        },
        paymentCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.8),
            borderRadius: hp(2),
            marginBottom: hp(1.5),
            backgroundColor: 'rgba(255,255,255,0.06)',
        },
        paymentLeft: {
            flex: 1,
        },
        paymentEmail: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.7),
            color: theme.white,
            marginBottom: hp(0.4),
        },
        paymentDate: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + '70',
        },
        paymentRight: {
            alignItems: 'flex-end',
        },
        paymentAmount: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.9),
            color: theme.white,
            marginBottom: hp(0.4),
        },
        statusBadge: {
            paddingHorizontal: wp(2),
            paddingVertical: hp(0.3),
            borderRadius: hp(1),
        },
        statusText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.2),
            color: theme.white,
        },
        loaderCard: {
            height: hp(8),
            borderRadius: hp(2),
            marginBottom: hp(1.5),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.06)',
        },
        emptyText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + '80',
            textAlign: 'center',
            paddingVertical: hp(3),
        },
        cardLoader: {
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.financialStats.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.white} />}
            >
                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalCardsScroll}
                    snapToInterval={wp(74)}
                    decelerationRate="fast"
                >
                    <GlassView glassStyles={styles.statCard}>
                        <Text style={styles.cardLabel}>{t('Admin.financialStats.cards.update', { defaultValue: 'Update' })}</Text>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={theme.white} />
                        ) : (
                            <>
                                <Text style={styles.cardTitle}>
                                    {t('Admin.financialStats.cards.revenueIncrease', {
                                        percentage: paymentStats?.weeklyRevenueIncrease?.increasePercent?.toFixed(1) || '0.0',
                                        period: '1 week'
                                    })}
                                </Text>
                                <TouchableOpacity style={styles.seeAnalytics}>
                                    <Text style={styles.linkText}>{formatCurrency(paymentStats?.weeklyRevenueIncrease?.currentRevenue || 0)}</Text>
                                    {/* <Image source={chevronIcon} style={styles.chevron} resizeMode="contain" /> */}
                                </TouchableOpacity>
                            </>
                        )}
                    </GlassView>

                    {/* Next Expected Revenue card */}
                    <GlassView glassStyles={styles.statCard}>
                        <Text style={styles.cardLabel}>{t('Admin.financialStats.cards.nextExpected', { defaultValue: 'Next Expected Revenue' })}</Text>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={theme.white} />
                        ) : (
                            <Text style={styles.revenueValue}>
                                {formatCurrency(paymentStats?.nextExpectedRevenue?.totalRevenue || 0)}
                            </Text>
                        )}
                        <View style={styles.trendContainer}>
                            <Text style={styles.trendText}>
                                📊 In next {paymentStats?.nextExpectedRevenue?.windowDays || 7} days
                            </Text>
                        </View>
                    </GlassView>

                    {/* Weekly Sales card (Last 8 Weeks) */}
                    <GlassView glassStyles={styles.statCard}>
                        <Text style={styles.cardLabel}>{t('Admin.financialStats.cards.weeklySales', { defaultValue: 'Weekly Sales' })}</Text>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={theme.white} />
                        ) : (() => {
                            const series = paymentStats?.weeklySalesData?.series || [];
                            const totalWeeklyRevenue = series.reduce((acc: number, d: any) => acc + (d.revenue || 0), 0);
                            return (
                                <>
                                    <Text style={styles.revenueValue}>
                                        {formatCurrency(totalWeeklyRevenue)}
                                    </Text>
                                    <View style={styles.trendContainer}>
                                        <Text style={styles.trendText}>Last {paymentStats?.weeklySalesData?.windowWeeks || 8} weeks</Text>
                                    </View>
                                </>
                            );
                        })()}
                    </GlassView>

                    {/* Page Visits card */}
                    <GlassView glassStyles={styles.statCard}>
                        <Text style={styles.cardLabel}>{t('Admin.financialStats.cards.pageVisits', { defaultValue: 'Page Visits' })}</Text>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={theme.white} />
                        ) : (
                            <Text style={styles.revenueValue}>
                                {engagementData.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                            </Text>
                        )}
                        <View style={styles.trendContainer}>
                            <Text style={styles.trendText}>↗ 5% vs last month</Text>
                        </View>
                    </GlassView>
                </ScrollView>

                {/* ── Session Engagement Chart ────────────────────────────── */}
                <GlassView bordered glassStyles={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>{t('Admin.financialStats.taskProgress.title')}</Text>
                        <View style={{
                            backgroundColor: theme.white + '10',
                            paddingHorizontal: wp(3), paddingVertical: hp(0.8),
                            borderRadius: hp(2),
                        }}>
                            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white }}>
                                12 Months
                            </Text>
                        </View>
                    </View>

                    {statsLoading || paymentsLoading ? (
                        <ActivityIndicator size="large" color={theme.white} style={{ height: hp(25) }} />
                    ) : (() => {
                        // 6 months visible at a time; 12 months total → scrollable
                        const VISIBLE = 6;
                        const SPACING = Math.floor((wp(100) - wp(20) - wp(12)) / VISIBLE); // screen - padding - yAxis
                        const CHART_W = SPACING * 12 + wp(5);
                        const fmtVal = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));

                        return (
                            <LineChart
                                data={chartData.map((d, i) => ({
                                    ...d,
                                    // Value label above every point
                                    dataPointText: fmtVal(d.value),
                                    textColor: i === maxIdx ? theme.magenda : theme.white + 'cc',
                                    textShiftY: -hp(1.5),
                                    textShiftX: -wp(2),
                                    // Highlight max: purple vertical strip
                                    showVerticalLine: i === maxIdx,
                                    verticalLineColor: theme.magenda + '40',
                                    verticalLineThickness: SPACING,
                                    // Max dot styling
                                    dataPointColor: i === maxIdx ? theme.magenda : (theme.white + '60'),
                                    dataPointRadius: i === maxIdx ? 6 : 3,
                                }))}
                                height={hp(25)}
                                width={CHART_W}
                                initialSpacing={SPACING / 2}
                                spacing={SPACING}
                                color={theme.magenda}
                                thickness={3}
                                hideRules={false}
                                rulesColor={theme.white + '15'}
                                rulesType="dashed"
                                yAxisColor="transparent"
                                xAxisColor={theme.white20}
                                yAxisTextStyle={{ color: theme.white + 'cc', fontSize: hp(1.3), width: wp(8) }}
                                xAxisLabelTextStyle={{ color: theme.white + 'cc', fontSize: hp(1.3) }}
                                noOfSections={5}
                                maxValue={chartMax}
                                yAxisLabelTexts={Array.from({ length: 6 }, (_, i) => {
                                    const v = (chartMax / 5) * i;
                                    return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(Math.round(v));
                                })}
                                curved
                                areaChart
                                startFillColor={theme.magenda}
                                endFillColor={theme.magenda}
                                startOpacity={0.4}
                                endOpacity={0.05}
                                showDataPointLabelOnFocus={false}
                                pointerConfig={{
                                    pointerStripColor: theme.magenda,
                                    pointerStripWidth: 2,
                                    pointerColor: theme.white,
                                    radius: 5,
                                    pointerLabelWidth: wp(20),
                                    pointerLabelHeight: hp(5),
                                    autoAdjustPointerLabelPosition: true,
                                    pointerLabelComponent: (items: any) => {
                                        if (!items || !items[0]) return null;
                                        const val = items[0].value;
                                        return (
                                            <View style={[
                                                styles.highlightBadge,
                                                { backgroundColor: theme.magenda, position: 'relative', top: 0, alignSelf: 'center' },
                                            ]}>
                                                <Text style={styles.highlightText}>{fmtVal(val)}</Text>
                                            </View>
                                        );
                                    },
                                }}
                            />
                        );
                    })()}

                </GlassView>

                {/* ── Revenue Sources Pie Chart ───────────────────────────── */}
                <GlassView bordered glassStyles={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>{t('Admin.financialStats.revenueSources.title')}</Text>
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: theme.white + '10', paddingHorizontal: wp(3),
                            paddingVertical: hp(0.8), borderRadius: hp(2),
                        }}>
                            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white, marginRight: wp(1) }}>
                                {t('Admin.financialStats.revenueSources.revenue')}
                            </Text>
                            {/* <Image source={chevronIcon} style={{ width: hp(1.2), height: hp(1.2), tintColor: theme.white }} resizeMode="contain" /> */}
                        </View>
                    </View>

                    <View style={styles.pieContainer}>
                        <PieChart
                            data={pieData}
                            donut
                            showText
                            textColor="white"
                            radius={hp(10)}
                            innerRadius={0}
                            textSize={hp(1.6)}
                            fontWeight="bold"
                            focusOnPress
                            showValuesAsLabels
                            showTextBackground={false}
                            strokeColor="rgba(0,0,0,0.5)"
                            strokeWidth={2}
                        />
                    </View>
                </GlassView>



                {/* Bottom spacer */}
                <View style={{ height: hp(5) }} />
            </ScrollView>
        </HomeWrapper>
    );
};

export default AdminFinancialStats;
