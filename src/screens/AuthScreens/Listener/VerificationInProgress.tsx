import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp, alpha } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import { verificationInprogress } from '../../../assets/icons';
import { routes } from '../../../navigation/routes';
import { logout, updateUser } from '../../../store/slices/userSlice';
import { AppDispatch } from '../../../store/store';
import apiInstance, { ApiResponse } from '../../../api/apiInstance';

const VerificationInProgress = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  useEffect(() => {
    let intervalId: any;

    const checkVerificationStatus = async () => {
      try {
        const response: ApiResponse = await apiInstance.get('auth/profile');

         const status =
          response?.data?.user?.verificationDocumentStatus ??
          response?.data?.user?.verificationStatus;


        if (response.success && (status === 'approved' || status === 'verified') && response.data?.user?.isVerified) {
          dispatch(updateUser(response.data.user));
          navigation.navigate(routes.verificationVerified as never);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Keep checking every 10 seconds
    intervalId = setInterval(checkVerificationStatus, 10000);

        return () => {
            if (intervalId) clearInterval(intervalId);
    };
  }, [navigation, dispatch]);

  const handleLogOut = async () => {
    await dispatch(logout());
    (navigation as any).navigate(routes.logIn as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: 'center',
      padding: hp(4),
    },
    icon: {
      width: hp(10),
      height: hp(10),
      resizeMode: "contain",
      tintColor: theme.white,
      marginBottom: hp(5)
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(1.5)

    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white60,
      lineHeight: hp(2.5),
      textAlign: "center",
      //  marginBottom: hp(10)


    },
    logoutButton: {
      paddingVertical: hp(1.6),
      paddingHorizontal: wp(6),
    },
    logoutText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '80',
      textAlign: 'center',
    }
    ,
    btnContainer: {
      flex: 1,
      justifyContent: "flex-end",
      gap: hp(2)
    }
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <View style={{ flex: 1 }} />
        <Image source={verificationInprogress}
          style={styles.icon} />
        <Text style={styles.title}>
          {t("VerificationInProgress.title")}
        </Text>
        <Text style={styles.description}>
          {t("VerificationInProgress.description")}
        </Text>

        <View style={styles.btnContainer}>
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 12 }]}
                    onPress={() => (navigation as any).navigate(routes.listenerHomeTab as never)}
                >
                    <Text style={styles.logoutText}>Wait for Approval</Text>
                </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutText}>{t('VerificationInProgress.logOut')}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </AuthWrapper>
  );
};

export default VerificationInProgress;