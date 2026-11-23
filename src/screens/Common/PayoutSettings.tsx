import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Loader } from '../../components';
import EmptyState from '../../components/shared/EmptyState';
import { fontFamilies } from '../../utils/fontFamilies';
import { useEarnings } from '../../api/apiHooks/useEarnings';
import type { Payout } from '../../types/apiPayloadsTypes';
import { formatDateDayTime } from '../../utils/date';

const PAGE_LIMIT = 20;

const PayoutSettings = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getPayouts } = useEarnings();

    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Guards to prevent double calls
    const isFetchingRef = useRef(false);
    const offsetRef = useRef(0);

    const handleBack = () => {
        navigation.goBack();
    };

    // Fetch on screen focus (fresh load)
    useFocusEffect(
        useCallback(() => {
            fetchPayouts(true);
        }, [])
    );

    const fetchPayouts = async (isRefresh = false) => {
        // Prevent duplicate calls
        if (isFetchingRef.current) return;
        if (!isRefresh && !hasMore) return;

        isFetchingRef.current = true;
        const currentOffset = isRefresh ? 0 : offsetRef.current;

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await getPayouts(PAGE_LIMIT, currentOffset);

            if (res?.payouts) {
                if (isRefresh) {
                    setPayouts(res.payouts);
                } else {
                    setPayouts(prev => [...prev, ...res.payouts]);
                }
                offsetRef.current = currentOffset + res.payouts.length;
                setHasMore(res.pagination?.hasMore ?? false);
                if (__DEV__) {
                    setPayouts((prev: any) => ([...prev, {
                        id: "123",
                        amount: 100,
                        status: "completed",
                        createdAt: new Date().toISOString(),
                        processedAt: new Date().toISOString(),
                    }]))
                }
            }
        } catch (error) {
            console.log('Error fetching payouts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            isFetchingRef.current = false;
        }
    };

    const onRefresh = () => {
        offsetRef.current = 0;
        setHasMore(true);
        fetchPayouts(true);
    };

    const onEndReached = () => {
        if (!loading && hasMore) {
            fetchPayouts(false);
        }
    };

    const getStatusColor = (status: Payout['status']) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'processing': return '#FFC107';
            case 'pending': return '#FF9800';
            case 'failed': return '#F44336';
            case 'cancelled': return '#9E9E9E';
            default: return theme.white;
        }
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            color: theme.white60,
            fontSize: hp(1.8),
        },
        item: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: hp(1.5),
            borderWidth: hp(.1),
            borderColor: theme.white20,
            borderRadius: hp(1.5),
            marginBottom: hp(2),
            backgroundColor: theme.black + "10",
        },
        leftColumn: {
            flex: 1,
            gap: hp(1),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: "space-between"
        },
        title: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2),
            color: theme.white,
        },
        date: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            marginTop: hp(0.3),
        },
        statusBadge: {
            paddingHorizontal: wp(2),
            paddingVertical: hp(0.3),
            borderRadius: hp(1),
            marginTop: hp(0.5),
            alignSelf: 'flex-start',
        },
        statusText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.2),
            textTransform: 'capitalize',
        },
        amount: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2),
            color: theme.white,
        },
    });

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <EmptyState
                title={t('Payout.emptyTitle') || "Payout details will appear here"}
                description={t('Payout.emptyDescription') || "Payout details will appear here"}
            />
        );
    };

    const renderItem = ({ item }: { item: Payout }) => {
        const statusColor = getStatusColor(item.status);
        return (
            <View style={styles.item}>
                <View style={styles.leftColumn}>
                    <Text style={styles.title}>{item.amount?.toFixed(2)}</Text>
                    <Text style={styles.date}>
                        {formatDateDayTime(item.processedAt || item.createdAt)}
                    </Text>

                </View>
            </View>
        );
    };

    return (
        <HomeWrapper>
            <Loader isVisible={loading && payouts.length === 0} />
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Profile.payout') || "Payout Settings"}
            />

            <FlatList
                data={payouts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    padding: hp(2),
                    flexGrow: 1,
                }}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty()}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
            />
        </HomeWrapper>
    );
};

export default PayoutSettings;
