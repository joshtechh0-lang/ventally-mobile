import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { OTPInput, Button } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import OTPResendBlock from '../../components/shared/OTPResendBlock';

const AdminVerifyOTP = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const route = useRoute();
    const { type, value }: any = route.params || {};

    const [otp, setOtp] = useState('');

    const { canResend, formatted: cooldownLabel, startCooldown } = useResendCooldown(`admin:${type}:${value}`);

    const handleResend = () => {
        if (!canResend) return;
        // TODO: invoke the appropriate change-OTP request when wired up
        startCooldown();
    };

    const handleVerify = () => {
        // Mock navigate to success
        (navigation as any).navigate(routes.adminInternal, {
            screen: routes.adminSecuritySuccess,
            params: {
                type: 'email',
                title: t('Admin.security.success.emailChanged'),
                subtitle: t('Admin.security.success.emailSubtitle')
            }
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(4),
            alignItems: 'center',
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.5),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
            marginBottom: hp(6),
            textAlign: 'center',
        },
        resendContainer: {
            flexDirection: 'row',
            marginTop: hp(4),
        },
        resendText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
        },
        resendButton: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.6),
            color: theme.white,
            textDecorationLine: 'underline',
            marginLeft: wp(1),
        },
        footer: {
            width: '100%',
            paddingTop: hp(8),
        }
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title=""
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <Text style={styles.title}>
                    {type === 'email' ? t('Admin.security.verification.emailTitle') : t('Admin.security.verification.phoneTitle')}
                </Text>
                <Text style={styles.subtitle}>
                    {type === 'email' ? t('Admin.security.verification.emailSubtitle') : t('Admin.security.verification.phoneSubtitle')}
                </Text>

                <OTPInput
                    value={otp}
                    onChange={setOtp}
                />

                <OTPResendBlock
                    canResend={canResend}
                    cooldownLabel={cooldownLabel}
                    onResend={handleResend}
                />

                <View style={styles.footer}>
                    <Button
                        title={t('Admin.security.verification.button')}
                        onPress={handleVerify}
                        buttonStyle={{}}
                        titleStyle={{}}
                        disabled={otp.length < 4}
                        glassStyles={{}}
                    />
                </View>
            </View>
        </HomeWrapper>
    );
};

export default AdminVerifyOTP;
