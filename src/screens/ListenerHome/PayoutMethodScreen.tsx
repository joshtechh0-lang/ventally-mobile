import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import { tickIcon, bankIcon, walletIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { Button, Loader } from '../../components';
import { apiInstance } from '../../api';
import { toastError, toastSuccess } from '../../utils/toast';
import GlassModal from '../../components/shared/GlassModal';

const PayoutMethodScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();
    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'card' | null>(null);
    const [loading, setLoading] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [availableBalance, setAvailableBalance] = useState(0);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [bankConnected, setBankConnected] = useState(false);

    useEffect(() => {
        fetchBankAccountStatus();
    }, []);

    const fetchBankAccountStatus = async () => {
        try {
            setLoading(true);
            const [bankRes, summaryRes]: any[] = await Promise.all([
                apiInstance.get('earnings/bank-account/status'),
                apiInstance.get('earnings/summary'),
            ]);
            if (bankRes?.data?.status?.payoutEnabled) {
                setSelectedMethod('bank');
                setBankConnected(true);
            }
            if (summaryRes?.data) {
                setAvailableBalance(summaryRes.data.availableBalance ?? summaryRes.data.pendingBalance ?? 0);
            }
        } catch (err: any) {
            console.log(err);
            toastError({ text: err?.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (method: 'bank' | 'card') => {
        if (method === 'card') return;
        if (bankConnected) {
            setSelectedMethod('bank');
            return;
        }
        setSelectedMethod(method);
        navigation.navigate(routes.linkBankAccount as never);
    };

    const handleContinue = async () => {
        if (bankConnected) {
            setWithdrawAmount('');
            setShowWithdrawModal(true);
            return;
        }
        navigation.navigate(routes.linkBankAccount as never);
    };

    const handleWithdrawSubmit = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || isNaN(amount) || amount <= 0) {
            toastError({ text: t('Listener.wallet.withdrawError', 'Please enter a valid amount') });
            return;
        }
        if (amount > availableBalance) {
            toastError({ text: t('Listener.wallet.exceedsBalance', 'Amount exceeds your available balance') });
            return;
        }
        setWithdrawLoading(true);
        try {
            const res: any = await apiInstance.post('earnings/withdraw', { amount });
            if (res?.data?.success || res?.status === 200 || res?.status === 201) {
                toastSuccess({ text: t('Listener.wallet.withdrawSuccess', 'Withdrawal request submitted successfully') });
                setShowWithdrawModal(false);
                setAvailableBalance(prev => prev - amount);
            }
        } catch (err: any) {
            console.log(err);
            toastError({ text: err?.response?.data?.error || err?.message || 'Withdrawal failed' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            justifyContent: "center",
            alignItems: "center"
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(4),
        },
        methodCard: {
            padding: hp(2.5),
            borderRadius: hp(2),
            marginBottom: hp(2),
            backgroundColor: theme.white + '10',
            borderWidth: 1,
            borderColor: theme.white + '20',
        },
        disabledCard: {
            opacity: 0.6
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: hp(1)
        },
        iconTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(3)
        },
        icon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: 'contain'
        },
        methodTitle: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
        },
        checkbox: {
            width: hp(2.5),
            height: hp(2.5),
            borderRadius: hp(0.5),
            borderWidth: 1,
            borderColor: theme.magenda,
            justifyContent: "center",
            alignItems: "center"
        },
        checkedBox: {
            backgroundColor: theme.magenda,
        },
        checkIcon: {
            width: hp(1.5),
            height: hp(1.5),
            tintColor: theme.white,
        },
        description: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            marginTop: hp(1),
            lineHeight: hp(2.2)
        },
        footerText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            textAlign: 'center',
            marginTop: hp(6),
            lineHeight: hp(2.4),
            paddingHorizontal: wp(5)
        },
        modalBalanceText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'AA',
            textAlign: 'center',
            marginBottom: hp(2),
        },
        modalBalanceAmount: {
            fontFamily: fontFamilies.bold,
            color: theme.white,
        },
        amountInput: {
            width: '100%',
            height: hp(6),
            borderRadius: hp(1.5),
            borderWidth: 1,
            borderColor: theme.white + '30',
            backgroundColor: theme.white + '10',
            paddingHorizontal: wp(4),
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title={t('Listener.payout.title', "Payout Method")}
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <View style={styles.container}>
                <View style={{ alignSelf: "center", width: "100%" }}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelect('bank')}>
                        <GlassView
                            glassStyles={StyleSheet.flatten([
                                styles.methodCard,
                                selectedMethod === 'bank' && { backgroundColor: theme.black + "10", borderColor: theme.white + '40' }
                            ]) as any}
                        >
                            <View style={styles.row}>
                                <View style={styles.iconTitleRow}>
                                    <Image source={bankIcon} style={styles.icon} />
                                    <Text style={styles.methodTitle}>{t('Listener.payout.bankAccount', "Bank Account")}</Text>
                                </View>
                                <View style={[styles.checkbox, selectedMethod === 'bank' && styles.checkedBox]}>
                                    {selectedMethod === 'bank' && <Image source={tickIcon} style={styles.checkIcon} />}
                                </View>
                            </View>
                            <Text style={styles.description}>
                                {t('Listener.payout.bankAccountDesc', 'Transfers are sent automatically to your linked bank account. All transfers are securely processed through Stripe.')}
                            </Text>
                        </GlassView>
                    </TouchableOpacity>
                    <Button
                        title={bankConnected ? t('Listener.wallet.withdrawEarnings', 'Withdraw funds') : t('Common.continue')}
                        onPress={() => handleContinue()}
                        glassStyles={{ width: '100%', alignSelf: "center" }}
                        titleStyle={{}}
                        disabled={false}
                    />
                    <Text style={styles.footerText}>
                        {t('Listener.payout.footer', "Transfers typically arrive within 1 to 3 business days, depending on your bank.")}
                    </Text>
                </View>
            </View>

            <GlassModal
                visible={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                title={t('Listener.wallet.withdrawAmount', 'Withdraw Amount')}
                showIcon={false}
                showButtons={true}
                primaryButtonText={t('Listener.wallet.withdraw', 'Withdraw')}
                secondaryButtonText={t('Common.cancel')}
                onPrimaryPress={handleWithdrawSubmit}
                onSecondaryPress={() => setShowWithdrawModal(false)}
                primaryButtonDisabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                dismissOnOverlayPress={!withdrawLoading}
            >
                <Text style={styles.modalBalanceText}>
                    {t('Listener.wallet.availableForPayout', 'Available for Payout')}:{' '}
                    <Text style={styles.modalBalanceAmount}>${availableBalance.toFixed(2)}</Text>
                </Text>
                <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor={theme.white + '50'}
                    keyboardType="decimal-pad"
                    value={withdrawAmount}
                    onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        const parts = cleaned.split('.');
                        if (parts.length > 2) return;
                        if (parts[1] && parts[1].length > 2) return;
                        setWithdrawAmount(cleaned);
                    }}
                    maxLength={10}
                />
                {parseFloat(withdrawAmount) > availableBalance && withdrawAmount !== '' && (
                    <Text style={{ color: '#FF6B6B', fontFamily: fontFamilies.normal, fontSize: hp(1.4), textAlign: 'center', marginTop: hp(1) }}>
                        {t('Listener.wallet.exceedsBalance', 'Amount exceeds your available balance')}
                    </Text>
                )}
            </GlassModal>

            <Loader isVisible={loading || withdrawLoading} />
        </HomeWrapper>
    );
};

export default PayoutMethodScreen;
