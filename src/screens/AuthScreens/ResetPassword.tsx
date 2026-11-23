import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, WINDOW_HEIGHT, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import GlassView from '../../components/GlassWrapper';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { Loader } from '../../components/Loader';
import apiInstance from '../../api/apiInstance';

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      // Auto-fill email for development
      setEmailOrPhone('test@example.com');
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };
  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim());
  };

  // Validate phone number (10–15 digits, optional +)
  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleaned);
  };
  const validateEmailOrPhone = (input: string): { isValid: boolean; error: string } => {
    if (!input || input.trim().length === 0) {
      return { isValid: false, error: 'Email or phone number is required' };
    }
    const trimmed = input.trim();
    if (isEmail(trimmed)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    } else {
      if (!isValidPhoneNumber(trimmed)) {
        return { isValid: false, error: 'Please enter a valid phone number (e.g., +1234567890)' };
      }
    }
    return { isValid: true, error: '' };
  };
  const handleSendOTP = async () => {
    if (!emailOrPhone.trim()) {
      toastError({ text: 'Please enter your email or phone number', theme });
      return;
    }
    // API call to send OTP
    // await apiInstance.post('/auth/forgot-password', { email_phone: emailOrPhone });

    // Determine if it's email or phone and navigate accordingly
    const isEmail = validateEmailOrPhone(emailOrPhone).isValid;
    const fromSettings = (route.params as any)?.fromSettings;
    const role = (route.params as any)?.role;

    if (isEmail) {
      try {
        setLoading(true);
        const response = await apiInstance.post('auth/request-password-reset', { email: emailOrPhone });
        console.log('response', response);
        if ((response as any).success) {
          toastSuccess({ text: response?.data?.message || 'OTP sent successfully', theme });
          (navigation as any).navigate(routes.emailVerification, {
            email: emailOrPhone,
            fromSettings,
            role
          });
        } else {
          toastError({ text: (response as any).error || 'Failed to send OTP', theme });
        }
      } catch (error: any) {
        console.log('error', error);
        toastError({ text: error?.error || 'Failed to send OTP', theme });
      } finally {
        setLoading(false)
      }
    } else if (isValidPhoneNumber(emailOrPhone.trim())) {
      try {
        setLoading(true);
        const response = await apiInstance.post('auth/request-password-reset', { phone: emailOrPhone.trim() });
        console.log('response', response);
        if ((response as any).success) {
          toastSuccess({ text: response?.data?.message || 'OTP sent to your phone', theme });
          (navigation as any).navigate(routes.emailVerification, {
            phone: emailOrPhone.trim(),
            fromSettings,
            role
          });
        } else {
          toastError({ text: (response as any).error || 'Failed to send OTP', theme });
        }
      } catch (error: any) {
        console.log('error', error);
        toastError({ text: error?.error || 'Failed to send OTP', theme });
      } finally {
        setLoading(false);
      }
    } else {
      toastError({ text: 'Please enter a valid email or phone number', theme });
    }

  };

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),

    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: hp(4),
    },
    contentContainer: {
      height: WINDOW_HEIGHT / 3,
      alignItems: 'center',
      padding: hp(2),
      borderRadius: hp(2.6),
      justifyContent: "center",
      alignContent: "center",
      backgroundColor: theme.black + "20",

    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + 'cc',
      textAlign: 'center',
      marginBottom: hp(4),
      lineHeight: hp(2),
    },
    inputContainer: {
      width: '100%',

    },
    buttonContainer: {
      width: '100%',
    },
    input: {
      borderWidth: 1,
      borderRadius: 999,
      borderColor: theme.white20,
      paddingHorizontal: wp(3),
      backgroundColor: "rgba(0,0,0,0.15)",
    }
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader
          handleBack={handleBack}
          title=""
          glassyTitle={false}
        />


        <KeyboardAwareScrollView

          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={[getKeyboardAwareContentStyle(), {
            justifyContent: "center"
          }]}
        >
          <GlassView bordered style={styles.contentContainer}>
            <Text style={styles.title}>{t('ResetPassword.title')}</Text>
            <Text style={styles.subtitle}>{t('ResetPassword.subtitle')}</Text>

            {/* <View style={styles.inputContainer}> */}
            <Input
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              inputContainerStyle={styles.input}
              inputStyle={{ fontSize: hp(1.8) }}
            />
            {/* </View> */}


          </GlassView>
        </KeyboardAwareScrollView>
        <View style={styles.buttonContainer}>
          <Button
            title={t('ResetPassword.sendOTP')}
            onPress={handleSendOTP}
            disabled={loading}


          />
        </View>
      </View>
      <Loader isVisible={loading} />
    </AuthWrapper>
  );
};

export default ResetPassword;