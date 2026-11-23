import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, WINDOW_HEIGHT, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import OTPInput from '../../components/OTPInput';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import GlassView from '../../components/GlassWrapper';
import { Button } from '../../components';
import apiInstance from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import OTPResendBlock from '../../components/shared/OTPResendBlock';

const SignUpOTP = () => {
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
  const [code, setCode] = useState('');
  const isSubmitting = React.useRef(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [showSmsOption, setShowSmsOption] = useState(false);

  const email = (route.params as any)?.email || '';

  useEffect(() => {
    if (__DEV__) {
      // Auto-fill code for development
      setCode('1234');
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleVerifyAccount = async (overrideCode?: string) => {
    if (isSubmitting.current || loading) return;
    const activeCode = overrideCode || code;
    if (activeCode.length !== 4) {
      toastError({ text: 'Please enter the complete verification code', theme });
      return;
    }
    isSubmitting.current = true;
    setLoading(true);
    try {
      await apiInstance.post('auth/verify-email', { email, otp: activeCode });
      if (!isMounted.current) return;
      toastSuccess({ text: 'Email verified successfully', theme });
      (navigation as any).navigate(routes.microphoneRequest, { email, code: activeCode });
    } catch (error) {
      console.log('error', error);
      const errMsg = (error as any)?.error || (error as any)?.message || '';
      if (errMsg.toLowerCase().includes('already verified')) {
        if (!isMounted.current) return;
        toastSuccess({ text: 'Email verified successfully', theme });
        (navigation as any).navigate(routes.microphoneRequest, { email });
      } else if (errMsg.toLowerCase().includes('expired')) {
        toastError({ text: 'Your code has expired. Please request a new one.', theme });
      } else if (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('incorrect')) {
        toastError({ text: 'Incorrect code. Please check and try again.', theme });
      } else {
        toastError({ text: errMsg || 'Verification failed. Please try again.', theme });
      }
      // For development, still navigate
      // (navigation as any).navigate(routes.createNewPassword, { email, code });
    } finally {
      setLoading(false);
    }
  };
  const isEmail = (input: string): boolean => {
    // Simple email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim());
  };
  const { canResend, formatted: cooldownLabel, startCooldown } = useResendCooldown(email, 45);

  const handleSendSms = async () => {
    if (!smsPhone) return;
    setSmsSending(true);
    try {
      await apiInstance.post('auth/send-sms-otp', { phone: smsPhone });
      toastSuccess({ text: t('EmailVerification.smsSent', 'SMS sent! Check your phone.'), theme });
      setShowSmsOption(false);
    } catch (e: any) {
      toastError({ text: e?.error || 'Failed to send SMS', theme });
    } finally {
      setSmsSending(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setLoading(true);
    try {
      const response = await apiInstance.post('auth/resend-verification', { email });
      console.log('response', response);
      startCooldown();
      isSubmitting.current = false;
      setCode('');
      toastSuccess({ text: 'Code sent! Check your inbox.', theme });
    } catch (error) {
      toastError({ text: 'Failed to resend code', theme });
    } finally {
      setResendLoading(false);
      setLoading(false);
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
      alignItems: 'center',
      padding: hp(2),
      paddingVertical: hp(3),
      borderRadius: hp(2.6),
      backgroundColor: "transparent",
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '80',
      textAlign: 'center',
      marginBottom: hp(4),
      lineHeight: hp(2),
    },
    codeContainer: {
      width: '100%',
      marginBottom: hp(2),
      alignItems: 'center',
    },
    resendContainer: {
      flexDirection: "row",
      gap: wp(1),
      marginTop: hp(2),
      alignItems: "center",
      justifyContent: "center",
    },
    resendText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
      textAlign: 'center',
    },
    resendLink: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      textDecorationLine: 'underline',
    },
    buttonContainer: {
      width: '100%',
    },
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassView bordered style={styles.contentContainer}>
            <Text style={styles.title}>{t('EmailVerification.title')}</Text>
            <Text style={styles.subtitle}>
              {t('EmailVerification.subtitle', { email })}
            </Text>

            <View style={styles.codeContainer}>
              <OTPInput
                value={code}
                onChange={handleCodeChange}
                cellCount={4}
                onComplete={(completedCode) => {
                  setCode(completedCode);
                  setTimeout(() => handleVerifyAccount(), 300);
                }}
              />
            </View>

            <OTPResendBlock
              canResend={canResend}
              cooldownLabel={cooldownLabel}
              resendLoading={resendLoading}
              onResend={handleResend}
            />

            <View style={{ marginTop: hp(2), padding: hp(1.5), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.5), width: '100%' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.medium, marginBottom: hp(0.5) }}>{t('EmailVerification.notReceiving', '📧 Not receiving the email?')}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('EmailVerification.checkSpam', '• Check your Spam or Junk folder')}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('EmailVerification.waitAndResend', '• Wait up to 5 minutes and try resending')}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('EmailVerification.contactSupport', '• Contact support at info@ventally.co')}</Text>
              <View style={{ marginTop: hp(1.5), paddingTop: hp(1.5), borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.medium, marginBottom: hp(1) }}>{t('EmailVerification.verifySMS', '📱 Or verify via SMS instead')}</Text>
                <View style={{ flexDirection: 'row', gap: wp(2) }}>
                  <TextInput
                    placeholder="+1234567890"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={smsPhone}
                    onChangeText={setSmsPhone}
                    keyboardType="phone-pad"
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: hp(1), paddingHorizontal: wp(3), paddingVertical: hp(1), color: theme.white, fontSize: hp(1.4), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' }}
                  />
                  <TouchableOpacity
                    onPress={handleSendSms}
                    disabled={smsSending || !smsPhone}
                    style={{ backgroundColor: 'rgba(167,139,250,0.2)', borderRadius: hp(1), paddingHorizontal: wp(3), justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(167,139,250,0.4)' }}
                  >
                    <Text style={{ color: theme.white, fontSize: hp(1.4), fontFamily: fontFamilies.medium }}>{smsSending ? '...' : 'Send'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>


          </GlassView>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            title={t('EmailVerification.verifyAccount')}
            onPress={handleVerifyAccount}
            disabled={loading}
            buttonStyle={{
              width: '100%',
            }}
          />
        </View>
      </View>
      <Loader isVisible={loading} />
    </AuthWrapper>
  );
};

export default SignUpOTP