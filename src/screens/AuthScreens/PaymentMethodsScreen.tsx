import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { ScreenHeader } from '../../components';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import { applepay, creditCard } from '../../assets/icons';
import { useStripe, usePlatformPay, PlatformPay } from '@stripe/stripe-react-native';
import apiInstance from '../../api/apiInstance';
import { toastError, toastSuccess } from '../../utils/toast';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isPlatformPaySupported, confirmPlatformPaySetupIntent } = usePlatformPay();

  const getSetupIntentSecret = async () => {
    const response: any = await apiInstance.post('payments/payg-setup-intent', {});
    const clientSecret = response?.clientSecret || response?.data?.clientSecret;
    if (!clientSecret) throw new Error('Failed to create setup intent');
    return clientSecret;
  };

  const handleCreditCard = async () => {
    try {
      setLoading(true);
      const clientSecret = await getSetupIntentSecret();
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'Ventally',
        allowsDelayedPaymentMethods: true,
      });
      if (initError) throw new Error(initError.message);
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          toastError({ text: presentError.message, theme });
        }
      } else {
        toastSuccess({ text: 'Card saved successfully!', theme });
        navigation.goBack();
      }
    } catch (err: any) {
      toastError({ text: err?.message || 'Failed to save card', theme });
    } finally {
      setLoading(false);
    }
  };

  const handleApplePay = async () => {
    try {
      setLoading(true);
      const supported = await isPlatformPaySupported();
      if (!supported) {
        toastError({ text: `${Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'} is not available on this device`, theme });
        return;
      }
      const clientSecret = await getSetupIntentSecret();
      const platformPayParams = Platform.OS === 'ios' ? {
        applePay: {
          cartItems: [{ label: 'Ventally', amount: '0.00', paymentType: PlatformPay.PaymentType.Immediate }],
          merchantCountryCode: 'US',
          currencyCode: 'USD',
        },
      } : {
        googlePay: {
          testEnv: false,
          merchantName: 'Ventally',
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          billingAddressConfig: { format: PlatformPay.BillingAddressFormat.Full, isPhoneNumberRequired: false, isRequired: false },
        },
      };
      const { error } = await confirmPlatformPaySetupIntent(clientSecret, platformPayParams);
      if (error) {
        toastError({ text: error.message, theme });
      } else {
        toastSuccess({ text: `${Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'} saved successfully!`, theme });
        navigation.goBack();
      }
    } catch (err: any) {
      toastError({ text: err?.message || 'Payment failed', theme });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) },
    title: { fontFamily: fontFamilies.bold, fontSize: hp(2.5), color: theme.white, marginBottom: hp(1) },
    subtitle: { fontFamily: fontFamilies.normal, fontSize: hp(1.6), color: theme.white + '80', marginBottom: hp(3) },
    option: { marginBottom: hp(2) },
    optionInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(2), paddingHorizontal: wp(4), gap: wp(4) },
    optionIcon: { width: wp(12), height: hp(4), resizeMode: 'contain' },
    optionText: { fontFamily: fontFamilies.semiBold, fontSize: hp(1.8), color: theme.white },
    optionSubtext: { fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white + '70', marginTop: hp(0.3) },
  });

  return (
    <AuthWrapper>
      <ScreenHeader title="Payment Methods" onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose how you'd like to pay for sessions</Text>

        {loading && <ActivityIndicator size="large" color={theme.white} style={{ marginBottom: hp(2) }} />}

        <TouchableOpacity style={styles.option} onPress={handleCreditCard} disabled={loading}>
          <GlassView radius={hp(2)}>
            <View style={styles.optionInner}>
              <Image source={creditCard} style={styles.optionIcon} />
              <View>
                <Text style={styles.optionText}>Credit / Debit Card</Text>
                <Text style={styles.optionSubtext}>Save a card for Pay As You Go billing</Text>
              </View>
            </View>
          </GlassView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleApplePay} disabled={loading}>
          <GlassView radius={hp(2)}>
            <View style={styles.optionInner}>
              <Image source={applepay} style={styles.optionIcon} />
              <View>
                <Text style={styles.optionText}>{Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'}</Text>
                <Text style={styles.optionSubtext}>Use {Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'} for fast, secure payments</Text>
              </View>
            </View>
          </GlassView>
        </TouchableOpacity>

      </ScrollView>
    </AuthWrapper>
  );
};

export default PaymentMethodsScreen;
