import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { Loader, ScreenHeader } from '../../components';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import { fingerprintIcon, secureIcon } from '../../assets/icons';
import GlassView from '../../components/GlassWrapper';
import { useBiometric } from '../../api/apiHooks/useBiometric';
import BiometricAuth from '../../hooks/Biometrics';
import { useSelector } from 'react-redux';
import { useCredentialsChange } from '../../api/apiHooks/useCredentialsChange';
import { RootState } from '../../store/store';
import { clearBiometricEmail, getDeviceId, getDeviceName, storeBiometricEmail } from '../../utils/deviceInfo';
import { toastError, toastSuccess } from '../../utils/toast';

const SecuritySettings = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
     const [langKey, setLangKey] = React.useState(i18n.language);
     React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getBiometricStatus, registerBiometric, disableBiometric } = useBiometric();
    const { getTwoFactorSettings, updateTwoFactorSettings } = useCredentialsChange();
    const user = useSelector((state: RootState) => state.user.user);

    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const checkBiometricStatus = useCallback(async () => {
        try {
            const { available, type } = await BiometricAuth.isSensorAvailable();
            setBiometricAvailable(available);
            setBiometricType(type ?? null);

            if (available) {
                const statusRes = await getBiometricStatus();
                setIsBiometricEnabled(statusRes?.biometric?.enabled || false);
            }
        } catch (error) {
            console.error('Error checking biometric status:', error);
        }
    }, [getBiometricStatus]);

    const fetchTwoFactorStatus = useCallback(async () => {
        try {
            const statusRes = await getTwoFactorSettings();
            setTwoFactorEnabled(statusRes?.twoFactorAuthentication?.enabled || false);
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    }, [getTwoFactorSettings]);

    useEffect(() => {
        checkBiometricStatus();
        fetchTwoFactorStatus();
    }, [checkBiometricStatus, fetchTwoFactorStatus]);

    const handleBiometricToggle = async () => {
        console.log('[SecuritySettings] Toggle initiated. current state:', isBiometricEnabled);
        if (isBiometricEnabled) {
            // Disabling biometrics
            setLoading(true);
            try {
                console.log('[SecuritySettings] Disabling biometrics...');
                const res = await disableBiometric();
                console.log('[SecuritySettings] Disable response:', res);
                if (res) {
                    await BiometricAuth.deleteKeys();
                    await clearBiometricEmail();
                    setIsBiometricEnabled(false);
                    toastSuccess({ text: t('BiometricSettings.disabledSuccess') || 'Biometric authentication disabled' });
                }
            } catch (error: any) {
                console.error('[SecuritySettings] Error disabling biometric:', error);
                const errorMsg = error?.error || error?.message || t('BiometricSettings.somethingWentWrong');
                // Alert.alert(t('BiometricSettings.disableErrorTitle'), JSON.stringify(errorMsg));
                toastError({ text: errorMsg });
            } finally {
                setLoading(false);
            }
        } else {
            // Enabling biometrics
            if (!biometricAvailable) {
                console.warn('[SecuritySettings] Biometric sensor not available');
                toastError({ text: t('BiometricSettings.unavailable') || 'Biometric sensor not available' });
                return;
            }

            setLoading(true);
            try {
                console.log('[SecuritySettings] Enabling biometrics: Authenticating...');
                const { success, uniqueId } = await BiometricAuth.enableAndGetUniqueId();
                console.log('[SecuritySettings] Biometric auth result:', { success, hasUniqueId: !!uniqueId });

                if (success && uniqueId) {
                    const deviceId = await getDeviceId();
                    const deviceName = await getDeviceName();
                    console.log('[SecuritySettings] Device info:', { deviceId, deviceName });

                    console.log('[SecuritySettings] Registering with backend...');
                    const response = await registerBiometric({
                        publicKey: uniqueId,
                        deviceId,
                        deviceName,
                    });
                    console.log('[SecuritySettings] Registration response:', response);

                    if (response) {
                        if (user?.email) {
                            await storeBiometricEmail(user.email);
                        }
                        setIsBiometricEnabled(true);
                        toastSuccess({ text: t('BiometricSettings.enabledSuccess') || 'Biometric authentication enabled' });
                    }
                } else {
                    console.warn('[SecuritySettings] Biometric authentication failed or cancelled');
                }
            } catch (error: any) {
                console.error('[SecuritySettings] Error enabling biometric:', error);
                const errorMsg = error?.error || error?.message || t('BiometricSettings.somethingWentWrong');
                Alert.alert(t('BiometricSettings.enableErrorTitle'), JSON.stringify(errorMsg));
                toastError({ text: errorMsg });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleTwoFactorToggle = async () => {
        setLoading(true);
        try {
            const newStatus = !twoFactorEnabled;
            // Default to 'email' if enabling, per API docs requirement for method if enabled is true
            const res = await updateTwoFactorSettings({
                enabled: newStatus,
                method: newStatus ? 'email' : undefined
            });
            if (res) {
                setTwoFactorEnabled(newStatus);
                toastSuccess({
                    text: newStatus
                        ? t('Security.twoFactorEnabledSuccess') || 'Two-factor authentication enabled'
                        : t('Security.twoFactorDisabledSuccess') || 'Two-factor authentication disabled'
                });
            }
        } catch (error: any) {
            console.error('[SecuritySettings] Error toggling 2FA:', error);
            const errorMsg = error?.error || error?.message || t('Common.somethingWentWrong');
            toastError({ text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        socialCard: {
            paddingHorizontal: wp(3),
            paddingVertical: hp(1),
            borderRadius: hp(2),
            marginBottom: hp(1.5),
            backgroundColor: theme.black + "20",
        },
    });

    return (
        <HomeWrapper>
            <Loader isVisible={loading} />
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Security.title') || "Security"}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {biometricAvailable && (
                    <GlassView bordered glassStyles={styles.socialCard}>
                        <SettingsItem
                            leftIcon={secureIcon}
                            type='toggle'
                            title={`${t('Security.enableBiometrics')} `}
                            value={isBiometricEnabled}
                            onValueChange={handleBiometricToggle}
                        />
                    </GlassView>
                )}
                <SettingsContainer>

                    <SettingsItem
                        title={t('Security.resetPassword')}
                        onPress={() => {
                            navigation.navigate(routes.changePassword as never);
                        }}
                    />

                    <SettingsItem
                        title={t('Security.changeEmail')}
                        onPress={() => {
                            (navigation as any).navigate(routes.updateCredential, { type: 'email' });
                        }}
                    />

                    {/* <SettingsItem
                        title={t('Security.changePhone')}
                        onPress={() => {
                            (navigation as any).navigate(routes.updateCredential, { type: 'phone' });
                        }}
                    /> */}

                    <SettingsItem
                        title={t('Security.twoFactorEnabled')}
                        type="toggle"
                        value={twoFactorEnabled}
                        onValueChange={handleTwoFactorToggle}
                    />
                </SettingsContainer>
            </ScrollView>
        </HomeWrapper>
    );
};

export default SecuritySettings;
