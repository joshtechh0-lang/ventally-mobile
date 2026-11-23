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
import { GlassModal } from '../../components';
import { tickIcon } from '../../assets/icons';

const PasswordChangeOTP = () => {
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
    const [showSuccess, setShowSuccess] = useState(false);

    const email = (route.params as any)?.email || '';
    const newPassword = (route.params as any)?.newPassword || '';

    useEffect(() => {
        if (__DEV__) {
            setCode('');
        }
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    const handleVerify = async () => {
        if (code.length !== 4) {
            toastError({ text: t('Common.pleaseCompleteAllFields') || 'Please enter the complete verification code', theme });
            return;
        }

        setLoading(true);
        try {
            // API call to verify code and change password
            // const response = await apiInstance.post('/auth/confirm-password-change', { email, code, newPassword });

            // Simulate success for now
            setShowSuccess(true);
        } catch (error: any) {
            toastError({ text: error?.error || 'Failed to verify code', theme });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            // API call to resend OTP
            // await apiInstance.post('auth/request-password-change-otp', { email });
            toastSuccess({ text: t('EmailVerification.otpSent') || 'OTP sent successfully', theme });
        } catch (error: any) {
            toastError({ text: error?.error || 'Failed to send OTP', theme });
        } finally {
            setResendLoading(false);
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
            height: WINDOW_HEIGHT / 2.5,
            alignItems: 'center',
            padding: hp(3),
            borderRadius: hp(2.6),
            justifyContent: "center",
            backgroundColor: theme.black + "20",
        },
        title: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(1.5),
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + 'cc',
            textAlign: 'center',
            marginBottom: hp(4),
            lineHeight: hp(2.2),
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
            paddingBottom: hp(2),
        },
    });

    return (
        <AuthWrapper key={langKey}>
            <View style={styles.container}>
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
                        <Text style={styles.title}>{t('PasswordChangeOTP.title')}</Text>
                        <Text style={styles.subtitle}>
                            {t('PasswordChangeOTP.subtitle', { email })}
                        </Text>

                        <View style={styles.codeContainer}>
                            <OTPInput
                                value={code}
                                onChange={handleCodeChange}
                                cellCount={4}
                            />
                        </View>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>
                                {t('PasswordChangeOTP.didntReceive')}{' '}
                            </Text>
                            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                <Text style={styles.resendLink}>
                                    {t('PasswordChangeOTP.resend')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </GlassView>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t('PasswordChangeOTP.verify')}
                        onPress={handleVerify}
                        disabled={loading || code.length !== 4}
                        buttonStyle={{ width: '100%' }}
                        glassStyles={{ width: '100%' }}
                    />
                </View>
            </View>
            <Loader isVisible={loading} />
            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                showButtons={false}
                visible={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    navigation.navigate(routes.profile as never);
                }}
                title={t("ChangePassword.resetSuccessTitle")}
                message={t("ChangePassword.resetSuccessMessage")}
            />
        </AuthWrapper>
    );
};

export default PasswordChangeOTP;
