import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, WINDOW_HEIGHT, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import OTPInput from '../../components/OTPInput';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import GlassView from '../../components/GlassWrapper';
import apiInstance from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import OTPResendBlock from '../../components/shared/OTPResendBlock';

const EmailVerification = () => {
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
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const email = (route.params as any)?.email || '';

  useEffect(() => {
    if (__DEV__) {
      // Auto-fill code for development
      setCode('');
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleVerifyAccount = async () => {
    if (code.length !== 4) {
      toastError({ text: 'Please enter the complete verification code', theme });
      return;
    }

    const fromSettings = (route.params as any)?.fromSettings;
    const role = (route.params as any)?.role;

    setLoading(true);
    try {
      // API call to verify code
      // const response = await apiInstance.post('/auth/verify-email', { email, code });
      // console.log('response', response);

      // toastSuccess({ text: 'Email verified successfully', theme });
      (navigation as any).navigate(routes.createNewPassword, {
        email,
        code,
        fromSettings,
        role
      });
    } catch (error: any) {
      // For development, still navigate
      (navigation as any).navigate(routes.createNewPassword, {
        email,
        code,
        fromSettings,
        role
      });
    } finally {
      setLoading(false);
    }
  };

  const { canResend, formatted: cooldownLabel, startCooldown } = useResendCooldown(email);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      const response = await apiInstance.post('auth/request-password-reset', { email: email });
      console.log('response', response);
      if ((response as any).success) {
        startCooldown();
        toastSuccess({ text: response?.data?.message || 'OTP sent successfully', theme });
      } else {
        toastError({ text: (response as any).error || 'Failed to send OTP', theme });
      }
    } catch (error: any) {
      console.log('error', error);
      toastError({ text: error?.error || 'Failed to send OTP', theme });
    } finally {
      setLoading(false)
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
      color: theme.white + 'cc',
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
    <AuthWrapper key={langKey}>
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
                  // Auto-verify when code is complete (optional)
                  console.log('Code completed:', completedCode);
                }}
              />
            </View>

            <OTPResendBlock
              canResend={canResend}
              cooldownLabel={cooldownLabel}
              resendLoading={resendLoading}
              onResend={handleResend}
            />


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

            glassStyles={{
              width: '100%',
            }}
            leftIcon={null}
            iconStyle={null}
          />
        </View>
      </View>
      <Loader isVisible={loading} />
    </AuthWrapper>
  );
};

export default EmailVerification;