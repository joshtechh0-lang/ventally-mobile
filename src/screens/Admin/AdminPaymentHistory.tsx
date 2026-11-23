import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminPaymentHistoryItem } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';

const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return '--';
    return `${amount.toFixed(2)}`;
};

const formatDate = (iso: string) => {
    if (!iso) return '--';
    try {
        const d = new Date(iso);
        const today = new Date();
        const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return isToday ? `Today ${timeStr}` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) + ` ${timeStr}`;
    } catch {
        return '--';
    }
};

const AdminPaymentHistory = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { getPaymentHistory } = useAdmin();

    const [payments, setPayments] = useState<AdminPaymentHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;
    const offsetRef = React.useRef(0);
    const isFetchingRef = React.useRef(false);

    const fetchPayments = useCallback(async (isRefresh = false, isLoadMore = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (isRefresh) {
            setRefreshing(true);
        } else if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const currentOffset = isRefresh ? 0 : offsetRef.current;
            const res = await getPaymentHistory(
                undefined, undefined, undefined, undefined, undefined,
                LIMIT, currentOffset
            );
            const data = res?.payments ?? [];
            if (isRefresh) {
                setPayments(data);
                offsetRef.current = LIMIT;
            } else {
                setPayments(prev => [...prev, ...data]);
                offsetRef.current = currentOffset + LIMIT;
            }
            setTotal(res?.pagination?.total ?? 0);
        } catch (err) {
            console.warn('Failed to load payment history:', err);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [getPaymentHistory]);

    useEffect(() => {
        fetchPayments(true);
    }, []);

    const onRefresh = () => fetchPayments(true);

    const handleLoadMore = () => {
        if (payments.length < total && !isFetchingRef.current) {
            fetchPayments(false, true);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        listContent: {
            paddingBottom: hp(4),
            gap: hp(1.5),
        },
        paymentItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: hp(1.5),
            paddingHorizontal: wp(6),
            borderRadius: hp(2.5),
        },
        amountText: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.2),
            color: theme.white,
        },
        dateText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
        },
    });

    const renderItem = ({ item }: { item: AdminPaymentHistoryItem }) => (
        <GlassView bordered >
            <View style={styles.paymentItem}>
                <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
        </GlassView>
    );

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.financialStats.paymentHistory.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <FlatList
                    data={payments}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.white}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator size="small" color={theme.white} style={{ marginVertical: hp(2) }} />
                        ) : null
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View style={{ alignItems: 'center', paddingTop: hp(10) }}>
                                <Text style={styles.dateText}>No payment history found.</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

export default AdminPaymentHistory;
