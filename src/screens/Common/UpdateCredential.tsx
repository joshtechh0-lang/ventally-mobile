import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { Input, Button } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import GlassWrapper from '../../components/GlassWrapper';
import GlassView from '../../components/GlassWrapper';
import { useCredentialsChange } from '../../api/apiHooks/useCredentialsChange';
import { toastError, toastSuccess } from '../../utils/toast';
import { Loader } from '../../components/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';

const UpdateCredential = () => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const navigation = useNavigation();
    const route = useRoute();
    const { requestEmailChangeOTP, requestPhoneChangeOTP } = useCredentialsChange();

    const type = (route.params as any)?.type || 'email'; // 'email' | 'phone'
    const isEmail = type === 'email';

    const [currentValue, setCurrentValue] = useState('');
    const [newValue, setNewValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        setLoading(true);
        try {
            if (isEmail) {
                await requestEmailChangeOTP({ newEmail: newValue });
                toastSuccess({ text: t('EmailVerification.otpSent') || "OTP sent to your email", theme });
            } else {
                await requestPhoneChangeOTP({ newPhone: newValue });
                toastSuccess({ text: t('EmailVerification.otpSent') || "OTP sent to your phone", theme });
            }
            (navigation as any).navigate(routes.credentialChangeOTP, { type, newValue });
        } catch (error: any) {
            console.log('errrrrr', error);

            toastError({ text: error?.error || error?.response?.data?.message || 'Failed to send OTP', theme });
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: wp(5),
            paddingTop: hp(5),
            paddingBottom: hp(10),
        },
        card: {
            width: '100%',
            overflow: 'hidden',
        },
        cardContent: {
            padding: hp(3),
            alignItems: 'center',
        },
        cardTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        cardSubtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            textAlign: 'center',
            marginBottom: hp(3),
        },
        footerButton: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputWrapper: {
            width: '100%',
            paddingHorizontal: wp(4),
            paddingVertical: hp(0.2),
            marginBottom: hp(2.2),
            backgroundColor: theme.black + '10',
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader
                onBackPress={() => navigation.goBack()}
                title=""
            />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.container, getKeyboardAwareContentStyle()]}
                showsVerticalScrollIndicator={false}
            >
                <GlassWrapper bordered style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>
                            {isEmail ? t('UpdateEmail.title') : t('UpdatePhone.title')}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {isEmail ? t('UpdateEmail.subtitle') : t('UpdatePhone.subtitle')}
                        </Text>

                        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>
                            <Input
                                isPlaceholderVisible
                                placeholder={isEmail ? t('UpdateEmail.currentEmail') : t('UpdatePhone.currentPhone')}
                                value={currentValue}
                                onChangeText={setCurrentValue}
                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                keyboardType={isEmail ? 'email-address' : 'phone-pad'}
                                autoCapitalize="none"
                            />
                        </GlassView>
                        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>
                            <Input
                                isPlaceholderVisible
                                placeholder={isEmail ? t('UpdateEmail.newEmail') : t('UpdatePhone.newPhone')}
                                value={newValue}
                                onChangeText={setNewValue}
                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                keyboardType={isEmail ? 'email-address' : 'phone-pad'}
                                autoCapitalize="none"
                            />
                        </GlassView>
                    </View>
                </GlassWrapper>
                <View style={{ marginTop: hp(4) }}>
                    <Button
                        title={t('UpdateEmail.sendOTP')}
                        onPress={handleSendOTP}
                        disabled={!currentValue || !newValue || loading}
                        glassStyles={styles.footerButton}
                    />
                </View>
            </KeyboardAwareScrollView>
        </HomeWrapper>
    );
};

export default UpdateCredential;
