import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import { fingerprintIcon } from '../../assets/icons';
import BiometricAuth from '../../hooks/Biometrics';
import biometricApi from '../../api/biometricApi';
import { getDeviceId, getDeviceName, storeBiometricEmail } from '../../utils/deviceInfo';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import GlassView from '../../components/GlassWrapper';
import { ScreenHeader } from '../../components';

const BiometricEnableScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user.user);

  const checkBiometricAvailability = useCallback(async () => {
    const { available, type } = await BiometricAuth.isSensorAvailable();
    setBiometricAvailable(available);
    setBiometricType(type ?? null);
  }, []);

  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  const handleTurnOn = async () => {
    setLoading(true);
    try {
      const { success, uniqueId } = await BiometricAuth.enableAndGetUniqueId();
      if (success && uniqueId) {
        // uniqueId is the device's biometric public key – unique per enrollment
        if (__DEV__) {
          console.log('Biometric unique ID (stored):', uniqueId);
        }

        // 1. Get Device Info
        const deviceId = await getDeviceId();
        const deviceName = await getDeviceName();

        // 2. Register with Backend
        console.log('[BiometricEnableScreen] Registering with backend...');
        const response = await biometricApi.registerBiometric({
          publicKey: uniqueId,
          deviceId: deviceId,
          deviceName: deviceName,
        });

        if (response.success) {
          // 3. Store email locally for biometric login later
          if (user?.email) {
            await storeBiometricEmail(user.email);
          }

          toastSuccess({ text: t('BiometricEnable.successMessage'), theme });
          navigation.navigate(routes.termsAndConditions as never);
        } else {
          console.error('Backend biometric registration failed:', response.error);
          toastError({ text: response.error || t('BiometricEnable.errorMessage'), theme });
        }
      } else {
        toastError({ text: t('BiometricEnable.notAvailable'), theme });
      }
    } catch (error) {
      console.error('Biometric enable error:', error);
      toastError({ text: t('BiometricEnable.errorMessage'), theme });
    } finally {
      setLoading(false);
    }
  };

  const handleNotNow = () => {
    // Navigate to language selection without enabling biometrics
    navigation.navigate(routes.termsAndConditions as never);
  };

  // TODO: Replace with actual fingerprint icon

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(6),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginVertical: hp(6),
    },
    card: {
      width: '100%',
      // borderRadius: hp(3),
      paddingVertical: hp(6),
      alignItems: 'center',
      justifyContent: 'center',

    },
    iconContainer: {
      // marginBottom: hp(4),
    },
    icon: {
      width: hp(12),
      height: hp(12),
      resizeMode: "contain",
    },
    buttonsContainer: {
      flex: 1,
      width: '100%',
      // alignItems:"flex-end",    
      justifyContent: "flex-end",
    },
    buttonWrapper: {
      width: '100%',
    },
  });

  if (loading) {
    return (
      <AuthWrapper key={langKey}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.white} />
        </View>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <View style={{ width: "100%", }}>
        <ScreenHeader title="" />
      </View>
      <View style={styles.container}>
        {/* Title */}
        <View style={{ flex: 1, width: "100%", alignSelf: "center", justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.title}>{t('BiometricEnable.title')}</Text>

          {/* Main Card with Icon */}
          <GlassView
            opacity={0.03}
            glassStyles={{
              width: "100%",
              // height: hp(10),

            }}
          >
            <View
              style={styles.card}
            >

              <Image
                source={fingerprintIcon}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

          </GlassView>
        </View>


        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title={t('BiometricEnable.turnOn')}
              onPress={handleTurnOn}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={loading}
              glassStyles={{
                marginBottom: hp(2),
              }}
            />
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              borderedGlassButton={true}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={loading}
              glassStyles={{
                backgroundColor: "transparent",
              }}
              title={t('BiometricEnable.notNow')}
              onPress={handleNotNow}

            />
          </View>
        </View>
      </View>
    </AuthWrapper>
  );
};

export default BiometricEnableScreen;
