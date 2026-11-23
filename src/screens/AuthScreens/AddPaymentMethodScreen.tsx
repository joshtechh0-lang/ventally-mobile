import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { backIcon, calendarIcon, chevronIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toastSuccess, toastError } from '../../utils/toast';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { useStripe } from '@stripe/stripe-react-native';
import apiInstance from '../../api/apiInstance';

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fromScreen = (route.params as any)?.from;
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'manual'>('manual');

  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const validateExpiryDate = (date: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(date)) return false;

    const [month, year] = date.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return true;
  };

  const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateSecurityCode = (code: string): boolean => {
    return /^\d{3,4}$/.test(code);
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));

    if (validateCardNumber(formatted)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cardNumber;
        return next;
      });
    }
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setFormData((prev) => ({ ...prev, expiryDate: formatted }));

    if (validateExpiryDate(formatted)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.expiryDate;
        return next;
      });
    }
  };

  const handleSecurityCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
    setFormData((prev) => ({ ...prev, securityCode: cleaned }));

    if (validateSecurityCode(cleaned)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.securityCode;
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = t('AddPaymentMethod.errors.cardHolderNameRequired');
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = t('AddPaymentMethod.errors.cardNumberRequired');
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = t('AddPaymentMethod.errors.cardNumberInvalid');
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = t('AddPaymentMethod.errors.expiryDateRequired');
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = t('AddPaymentMethod.errors.expiryDateInvalid');
    }

    if (!formData.securityCode.trim()) {
      newErrors.securityCode = t('AddPaymentMethod.errors.securityCodeRequired');
    } else if (!validateSecurityCode(formData.securityCode)) {
      newErrors.securityCode = t('AddPaymentMethod.errors.securityCodeInvalid');
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = t('AddPaymentMethod.errors.billingAddressRequired');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('AddPaymentMethod.errors.cityRequired');
    }

    if (!formData.state.trim()) {
      newErrors.state = t('AddPaymentMethod.errors.stateRequired');
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = t('AddPaymentMethod.errors.zipCodeRequired');
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = t('AddPaymentMethod.errors.zipCodeInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualSubmit = async () => {
    if (__DEV__) {
      if (fromScreen) {
        navigation.goBack();
      } else {
        navigation.navigate(routes.paymentMethodSaved as never);
      }
      return;
    }
    if (validateForm()) {
      try {
        const paymentMethod = {
          id: `card-${Date.now()}`,
          type: 'credit-card',
          nameKey: 'PaymentMethods.creditCard',
          cardNumber: formData.cardNumber,
          cardHolderName: formData.cardHolderName,
          expiryDate: formData.expiryDate,
          isDefault: isDefault,
        };

        const existing = await AsyncStorage.getItem('savedPaymentMethods');
        const methods = existing ? JSON.parse(existing) : [];
        methods.push(paymentMethod);
        await AsyncStorage.setItem('savedPaymentMethods', JSON.stringify(methods));

        toastSuccess({
          text: t('PaymentMethodSaved.title'),
          theme
        });

        if (fromScreen) {
          navigation.goBack();
        } else {
          navigation.navigate(routes.paymentMethodSaved as never);
        }
      } catch (error) {
        console.error('Error saving payment method:', error);
        if (fromScreen) {
          navigation.goBack();
        } else {
          navigation.navigate(routes.paymentMethodSaved as never);
        }
      }
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      // 1. Create Payment Intent
      const response: any = await apiInstance.post('payments/create-intent', {
        amount: 10 // Example amount as per API docs
      });

      if (!response.success || !response.data?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const clientSecret = response.data.clientSecret;

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Ventally',
        allowsDelayedPaymentMethods: true,
        // defaultBillingDetails: {
        //     name: 'Ventally User',
        // }
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.log("Payment canceled or failed:", presentError);
        toastError({ text: 'Payment canceled' });
      } else {
        toastSuccess({ text: 'Payment confirmed successfully!' });
        if (fromScreen) {
          navigation.goBack();
        } else {
          navigation.navigate(routes.paymentMethodSaved as never);
        }
      }

    } catch (error: any) {
      console.log("Stripe Error:", error);
      toastError({ text: error.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  }


  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(4),
    },
    backButton: {
      width: hp(6),
      height: hp(6),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },

    inputContainer: {
      marginBottom: hp(2),
    },
    rowContainer: {
      flexDirection: 'row',
      gap: wp(3),
    },
    rowInput: {
      flex: 1,
    },
    defaultPaymentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(2),
      marginBottom: hp(4),
    },
    radioButton: {
      width: hp(2.5),
      height: hp(2.5),
      borderRadius: hp(1.25),
      borderWidth: 2,
      borderColor: theme.white + '50',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    radioButtonSelected: {
      borderColor: theme.magenda,
      // backgroundColor: theme.primary,
    },
    radioButtonInner: {
      width: hp(1.5),
      height: hp(1.5),
      borderRadius: hp(0.75),
      backgroundColor: theme.magenda,
    },
    defaultPaymentText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      flex: 1,
    },
    calendarIconContainer: {
      position: 'absolute',
      right: wp(4),
      top: hp(2.5),
      zIndex: 2,
    },
    calendarIcon: {
      width: hp(2.5),
      height: hp(2.5),
      tintColor: theme.white,
      opacity: 0.7,
    },
    submitButtonContainer: {
      paddingBottom: hp(4),
    },
    titleStyle: {
      fontSize: hp(1.6),
      marginBottom: hp(2),
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: hp(3),
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: hp(1.5),
      padding: hp(0.5),
    },
    tabButton: {
      flex: 1,
      paddingVertical: hp(1.2),
      alignItems: 'center',
      borderRadius: hp(1),
    },
    activeTab: {
      backgroundColor: theme.white + '10',
    },
    tabText: {
      color: theme.white + '60',
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
    },
    activeTabText: {
      color: theme.white,
      fontFamily: fontFamilies.semiBold,
    },
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        {/* Header with back button */}
        <AuthStepsHeader handleBack={handleBack} title={t('AddPaymentMethod.title')} glassyTitle={false} />




        <KeyboardAwareScrollView
          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={getKeyboardAwareContentStyle()}
        >
          {/* Card Holder Name */}
          <View style={styles.inputContainer}>
            <Input
              titleStyle={styles.titleStyle}
              value={formData.cardHolderName}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, cardHolderName: text }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.cardHolderName;
                  return next;
                });
              }}
              error={errors.cardHolderName}
              noTitle={false}
              title={t('AddPaymentMethod.cardHolderName')}
            />
          </View>

          {/* Card Number */}
          <View style={styles.inputContainer}>
            <Input
              titleStyle={styles.titleStyle}
              value={formData.cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
              error={errors.cardNumber}
              noTitle={false}
              title={t('AddPaymentMethod.cardNumber')}
            />
          </View>

          {/* Expiry Date and Security Code Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.rowInput]}>
              <Input
                titleStyle={styles.titleStyle}
                value={formData.expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                maxLength={5}
                error={errors.expiryDate}
                noTitle={false}
                title={t('AddPaymentMethod.expiryDate')}
                rightIcon={calendarIcon}

              />
            </View>
            <View style={[styles.inputContainer, styles.rowInput]}>
              <Input
                titleStyle={styles.titleStyle}
                value={formData.securityCode}
                onChangeText={handleSecurityCodeChange}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                error={errors.securityCode}
                noTitle={false}
                title={t('AddPaymentMethod.securityCode')}
              />
            </View>
          </View>

          {/* Billing Address */}
          <View style={styles.inputContainer}>
            <Input
              titleStyle={styles.titleStyle}
              value={formData.billingAddress}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, billingAddress: text }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.billingAddress;
                  return next;
                });
              }}
              error={errors.billingAddress}
              noTitle={false}
              title={t('AddPaymentMethod.billingAddress')}
            />
          </View>

          {/* City */}
          <View style={styles.inputContainer}>
            <Input
              titleStyle={styles.titleStyle}
              value={formData.city}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, city: text }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.city;
                  return next;
                });
              }}
              error={errors.city}
              noTitle={false}
              title={t('AddPaymentMethod.city')}
            />
          </View>

          {/* State and Zip Code Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.rowInput]}>
              <Input
                titleStyle={styles.titleStyle}
                value={formData.state}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, state: text.toUpperCase() }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.state;
                    return next;
                  });
                }}
                maxLength={2}
                error={errors.state}
                noTitle={false}
                title={t('AddPaymentMethod.state')}
              />
            </View>
            <View style={[styles.inputContainer, styles.rowInput]}>
              <Input
                titleStyle={styles.titleStyle}
                value={formData.zipCode}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').substring(0, 5);
                  setFormData((prev) => ({ ...prev, zipCode: cleaned }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.zipCode;
                    return next;
                  });
                }}
                keyboardType="numeric"
                maxLength={5}
                error={errors.zipCode}
                noTitle={false}
                title={t('AddPaymentMethod.zipCode')}
              />
            </View>
          </View>

          {/* Set as Default Payment Method */}
          <View style={styles.defaultPaymentContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                isDefault && styles.radioButtonSelected,
              ]}
              onPress={() => setIsDefault(!isDefault)}
            >
              {isDefault && <View style={styles.radioButtonInner} />}
            </TouchableOpacity>
            <Text style={styles.defaultPaymentText}>
              {t('AddPaymentMethod.setAsDefault')}
            </Text>
          </View>

          <View style={styles.submitButtonContainer}>
            <Button
              borderedGlassButton
              title={t('AddPaymentMethod.addPaymentMethod')}
              onPress={handleManualSubmit}
              buttonStyle={{ width: '100%' }}
              glassStyles={{ width: '100%' }}
              titleStyle={{ color: theme.white }}
              disabled={false}
            />
          </View>
        </KeyboardAwareScrollView>


      </View>
    </AuthWrapper>
  );
};

export default AddPaymentMethodScreen;
