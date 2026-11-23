import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch } from 'react-redux';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { Button, ScreenHeader, Dropdown } from '../../components';
import GlassView from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import { addBalance } from '../../store/slices/userSlice';
import type { RootState } from '../../store/store';
import { tickIcon, x } from '../../assets/icons';

const AMOUNT_OPTIONS = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
];

const PAYMENT_OPTIONS = [
  { label: 'Apple Pay', value: 'applepay' },
  { label: 'Credit Card', value: 'creditcard' },
  { label: 'PayPal', value: 'paypal' },
];

type ModalType = 'paymentSuccess' | 'fundsAdded' | 'paymentFailed' | null;

const VenterAddCreditScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const balance = useSelector((state: RootState) => state.user.user.balance ?? 0);
  const sessionType = useSelector((state: RootState) => state.call.sessionType);

  const [amount, setAmount] = useState('20');
  const [paymentMethod, setPaymentMethod] = useState('applepay');
  const [modal, setModal] = useState<ModalType>(null);
  const [addedAmount, setAddedAmount] = useState(0);

  const handleBack = () => navigation.goBack();

  const handleConfirm = () => {
    const amountNum = parseInt(amount, 10);
    // Simulate payment: 90% success for demo
    const success = Math.random() > 0.1;
    if (success) {
      dispatch(addBalance(amountNum));
      setAddedAmount(amountNum);
      setModal('paymentSuccess');
    } else {
      setModal('paymentFailed');
    }
  };

  const handlePaymentSuccessClose = () => {
    setModal(null);
    setTimeout(() => setModal('fundsAdded'), 100);
  };

  const handleFundsAddedClose = () => {
    setModal(null);
    // If user came from finding listener flow, go to finding listener
    if (sessionType) {
      (navigation as any).navigate(routes.chatStack, {
        screen: routes.findingListener,
      });
    } else {
      navigation.goBack();
    }
  };

  const handlePaymentFailedTryAgain = () => {
    setModal(null);
    handleConfirm();
  };

  const handlePaymentFailedClose = () => setModal(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(2),
      justifyContent: "center",
      alignContent: "center"
    },
    card: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
      marginBottom: hp(3),
      borderRadius: hp(2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.5),
      color: theme.white,
      marginBottom: hp(3),
      textAlign: 'center',
    },
    dropdownWrap: {
      marginBottom: hp(2),
    },
    buttonWrap: {
      marginTop: hp(3),
    },
    glassBg: {
      backgroundColor: theme.black + "20"
    },
    dropdownStyles: {
      paddingHorizontal: wp(3),
      borderWidth: hp(.1),
      borderColor: theme.white60,
      borderRadius: 999,
    }
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title="" onBackPress={handleBack} showBackButton />

      <View style={styles.container}>

        <View style={styles.content}>
          // @ts-ignore
          // @ts-ignore
          <GlassView bordered glassStyles={[styles.card, styles.glassBg] as any}>
            <Text style={styles.title}>{t('VenterAddCredit.title')}</Text>

            <View style={styles.dropdownWrap}>
              <Dropdown
                placeholder={t('VenterAddCredit.selectAmount')}
                options={AMOUNT_OPTIONS}
                value={amount}
                onSelect={setAmount}
                containerStyle={styles.dropdownStyles}
                subContainerStyle={{
                  borderBottomWidth: 0
                }}
              />
            </View>
            <View style={styles.dropdownWrap}>
              <Dropdown
                placeholder={t('VenterAddCredit.choosePaymentMethod')}
                options={PAYMENT_OPTIONS}
                value={paymentMethod}
                onSelect={setPaymentMethod}
                containerStyle={styles.dropdownStyles}
                subContainerStyle={{
                  borderBottomWidth: 0
                }}
              />
            </View>
          </GlassView>

          <View style={styles.buttonWrap}>
            <Button
              title={t('VenterAddCredit.confirm')}
              onPress={handleConfirm}
              buttonStyle={{}}
              titleStyle={{}}
              glassStyles={styles.glassBg}
              disabled={false}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View>
        </View>
      </View>

      {/* Payment Successful modal - tap outside to see Funds Added */}
      <GlassModal
        iconContainerStyle={{
          borderWidth: hp(.4),
          borderColor: theme.white
        }}
        visible={modal === 'paymentSuccess'}
        onClose={handlePaymentSuccessClose}
        dismissOnOverlayPress
        showIcon
        icon={tickIcon}
        iconBorder
        title={t('VenterAddCredit.paymentSuccessTitle')}
        message={t('VenterAddCredit.paymentSuccessMessage')}
        showButtons={false}
        // @ts-ignore
        dismissOnOverlayPress
        dismissOnBackPress
      />

      {/* Funds Added modal - tap outside to close and go to finding listener */}
      <GlassModal
        //  iconContainerStyle={{
        //   borderWidth:hp(.3),
        //   borderColor:theme.white
        // }}
        iconBorder={false}
        visible={modal === 'fundsAdded'}
        onClose={handleFundsAddedClose}
        dismissOnOverlayPress
        showIcon
        icon={tickIcon}

        title={t('VenterAddCredit.fundsAddedTitle')}
        message={t('VenterAddCredit.fundsAddedMessage', { balance: String(Math.round(balance)) })}
        showButtons={false}
        // @ts-ignore
        dismissOnOverlayPress
        dismissOnBackPress
      />

      {/* Payment Failed modal */}
      <GlassModal
        iconContainerStyle={{
          borderWidth: hp(.4),
          borderColor: theme.white
        }}
        visible={modal === 'paymentFailed'}
        showVerticalButtons
        onClose={handlePaymentFailedClose}
        showIcon
        icon={x}
        iconBorder
        title={t('VenterAddCredit.paymentFailedTitle')}
        message={t('VenterAddCredit.paymentFailedMessage')}
        showButtons
        primaryButtonText={t('VenterAddCredit.tryAgain')}
        secondaryButtonText={t('VenterAddCredit.close')}
        onPrimaryPress={handlePaymentFailedTryAgain}
        onSecondaryPress={handlePaymentFailedClose}
        dismissOnOverlayPress={false}
        dismissOnBackPress
      />
    </HomeWrapper>
  );
};

export default VenterAddCreditScreen;
