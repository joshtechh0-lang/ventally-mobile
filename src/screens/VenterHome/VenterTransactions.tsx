import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../../components/GlassWrapper';
import HomeWrapper from '../../wrapper/HomeWrapper';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { ScreenHeader } from '../../components';
import TransactionsTable from '../../components/TransactionsTable';
import { useWallet } from '../../api/apiHooks/useWallet';
import { Transaction } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';
import { Loader } from '../../components';

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    return amount.toFixed(2);
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

const VenterTransactions = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getTransactions } = useWallet();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    useFocusEffect(
        useCallback(() => {
            fetchTransactions(0, true);
        }, [])
    );

    const fetchTransactions = async (newOffset: number, isRefresh: boolean) => {
        if (isRefresh) {
            setLoading(true);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await getTransactions(LIMIT, newOffset);
            if (response?.transactions) {
                const mappedTransactions = response.transactions.map(mapTransactionToRow);

                if (isRefresh) {
                    console.log('mappedTransactions======>>>>>', mappedTransactions);
                    setTransactions(mappedTransactions);
                } else {
                    setTransactions(prev => [...prev, ...mappedTransactions]);
                }

                if (response.pagination) {
                    setHasMore(response.pagination.total > newOffset + LIMIT);
                    setOffset(newOffset + LIMIT);
                } else {
                    setHasMore(response.transactions.length === LIMIT);
                    setOffset(newOffset + LIMIT);
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toastError({ text: t('Common.errors.fetchingData') });
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTransactions(0, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading && transactions.length > 0) {
            fetchTransactions(offset, false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        headerContainer: {
            marginBottom: hp(2),
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.5),
            color: theme.white,
            textAlign: 'center',
        },
    });



    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Wallet.transactions')}
            />

            <View style={{ flex: 1, padding: hp(2) }}>

                <TransactionsTable
                    transactions={transactions}
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (loadingMore ? <ActivityIndicator size="small" color={theme.primary} /> : null)}
                    contentContainerStyle={{ paddingBottom: hp(10) }}
                />
            </View>

        </HomeWrapper>
    );
};

export default VenterTransactions;
