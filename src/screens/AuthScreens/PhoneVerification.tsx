import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import OTPInput from '../../components/OTPInput';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';

const PhoneVerification = () => {
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

  const phone = (route.params as any)?.phone || '';

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

  const handleVerifyAccount = async () => {
    if (code.length !== 4) {
      toastError({ text: 'Please enter the complete verification code', theme });
      return;
    }

    setLoading(true);
    try {
      // API call to verify code
      // await apiInstance.post('/auth/verify-phone', { phone, code });
      
      toastSuccess({ text: 'Phone verified successfully', theme });
      (navigation as any).navigate(routes.createNewPassword, { phone, code });
    } catch (error) {
      // For development, still navigate
      (navigation as any).navigate(routes.createNewPassword, { phone, code });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // API call to resend code
      // await apiInstance.post('/auth/resend-code', { phone });
      toastSuccess({ text: 'Verification code sent', theme });
    } catch (error) {
      toastError({ text: 'Failed to resend code', theme });
    } finally {
      setResendLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
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
      paddingHorizontal: wp(2),
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
      fontSize: hp(1.4),
      color: theme.white + '80',
      textAlign: 'center',
      marginBottom: hp(4),
    },
    codeContainer: {
      width: '100%',
      marginBottom: hp(2),
      alignItems: 'center',
    },
    resendContainer: {
      marginBottom: hp(4),
    },
    resendText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.3),
      color: theme.white + '80',
      textAlign: 'center',
    },
    resendLink: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.3),
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
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{t('PhoneVerification.title')}</Text>
            <Text style={styles.subtitle}>
              {t('PhoneVerification.subtitle', { phone })}
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

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {t('PhoneVerification.didntReceive')}{' '}
                <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                  <Text style={styles.resendLink}>
                    {t('PhoneVerification.resend')}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={t('PhoneVerification.verifyAccount')}
                onPress={handleVerifyAccount}
                disabled={loading}
               
                titleStyle={{
                  fontSize: hp(1.4),
                }}
                glassStyles={{
                  width: '100%',
                }}
                leftIcon={null}
                iconStyle={null}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthWrapper>
  );
};

export default PhoneVerification;