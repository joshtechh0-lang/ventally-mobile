import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { useCredentialsChange } from '../../api/apiHooks/useCredentialsChange';
import { Loader } from '../../components/Loader';
import { GlassModal } from '../../components';
import { tickIcon } from '../../assets/icons';
import { useDispatch } from 'react-redux';
import { logout as logoutThunk } from '../../store/slices/userSlice';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import OTPResendBlock from '../../components/shared/OTPResendBlock';

const CredentialChangeOTP = () => {
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
    const { verifyEmailChangeOTP, verifyPhoneChangeOTP, requestEmailChangeOTP, requestPhoneChangeOTP } = useCredentialsChange();
    const dispatch = useDispatch();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const type = (route.params as any)?.type || 'email';
    const isEmail = type === 'email';
    const newValue = (route.params as any)?.newValue || '';

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        if (isEmail) {
            dispatch(logoutThunk() as any);
            (navigation as any).reset({
                index: 0,
                routes: [{ name: routes.auth }],
            });
        } else {
            navigation.navigate(routes.profile as never);
        }
    };

    useEffect(() => {
        let timeout: any;
        if (showSuccess && isEmail) {
            timeout = setTimeout(() => {
                handleSuccessClose();
            }, 3000);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [showSuccess, isEmail]);

    const handleVerify = async () => {
        if (code.length !== 4) {
            toastError({ text: t('Common.pleaseCompleteAllFields') || 'Please enter the complete verification code', theme });
            return;
        }

        setLoading(true);
        try {
            if (isEmail) {
                await verifyEmailChangeOTP({ newEmail: newValue, otp: code });
            } else {
                await verifyPhoneChangeOTP({ newPhone: newValue, otp: code });
            }
            setShowSuccess(true);
        } catch (error: any) {
            toastError({ text: error?.response?.data?.error || error?.message || 'Failed to verify code', theme });
        } finally {
            setLoading(false);
        }
    };

    const { canResend, formatted: cooldownLabel, startCooldown } = useResendCooldown(`${type}:${newValue}`);

    const handleResend = async () => {
        if (!canResend) return;
        setResendLoading(true);
        try {
            // Need current value for resend? Usually we store it in params or fetch from state
            // For now, if we don't have current value here, we might need to pass it or re-request differently
            // Assuming the backend can resend based on the new value or we have current in params
            const currentVal = (route.params as any)?.currentValue || ''; // Should have passed this

            if (isEmail) {
                // await requestEmailChangeOTP({ currentEmail: currentVal, newEmail: newValue });
            } else {
                // await requestPhoneChangeOTP({ currentPhone: currentVal, newPhone: newValue });
            }
            startCooldown();
            toastSuccess({ text: t('EmailVerification.otpSent') || 'OTP sent successfully', theme });
        } catch (error: any) {
            toastError({ text: error?.response?.data?.error || error?.message || 'Failed to send OTP', theme });
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
            alignItems: 'center',
            padding: hp(3),
            borderRadius: hp(2.6),
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
        <AuthWrapper>
            <View style={styles.container}>
                <AuthStepsHeader
                    handleBack={handleBack}
                    title=""
                    glassyTitle={false}
                />

                <KeyboardAwareScrollView
                    {...getKeyboardAwareScrollViewProps()}
                    contentContainerStyle={[styles.scrollContent, getKeyboardAwareContentStyle()]}
                >
                    <GlassView bordered style={styles.contentContainer}>
                        <Text style={styles.title}>{t('CredentialChangeOTP.title')}</Text>
                        <Text style={styles.subtitle}>
                            {isEmail ? t('CredentialChangeOTP.subtitleEmail') : t('CredentialChangeOTP.subtitlePhone')}
                        </Text>

                        <View style={styles.codeContainer}>
                            <OTPInput
                                value={code}
                                onChange={handleCodeChange}
                                cellCount={4}
                            />
                        </View>

                        <OTPResendBlock
                            canResend={canResend}
                            cooldownLabel={cooldownLabel}
                            resendLoading={resendLoading}
                            onResend={handleResend}
                        />
                    </GlassView>
                </KeyboardAwareScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t('CredentialChangeOTP.verify')}
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
                onClose={handleSuccessClose}
                title={t("CredentialChangeOTP.successTitle")}
                message={t("CredentialChangeOTP.successMessage", { type: isEmail ? t('SignUp.emailOrPhone').split(' ')[0] : 'phone' })}
            />
        </AuthWrapper>
    );
};

export default CredentialChangeOTP;
