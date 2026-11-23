import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp, alpha } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import PermissionRequest from '../../../components/PermissionRequest';
import { verified, verificationInprogress } from '../../../assets/icons';
import { routes } from '../../../navigation/routes';
import Button from '../../../components/Button';
import { logout } from '../../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../../store/store';

const VerificationVerified = () => {
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
  const user = useSelector((state: RootState) => state.user.user);
  const role = user?.role || (user as any)?.user?.userType;

  const handleLetsStart = () => {
      (navigation as any).navigate(routes.listenerHomeTab as any);

    // if (role === 'venter') {
    //   (navigation as any).navigate(routes.venterHomeTab as any);
    // } else if (role === 'listener') {
    // } else if (role === 'admin') {
    //   (navigation as any).navigate(routes.adminHomeTab as any);
    // } else {
    //   (navigation as any).navigate(routes.logIn as any);
    // }
  };

  const handleLogOut = async () => {
    await dispatch(logout());
    (navigation as any).navigate(routes.logIn);
  };

  const styles = StyleSheet.create({
    container: {
      width:"100%",
      flex:1,
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
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(1.5)

    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white60,
      textAlign: "center",
      marginBottom: hp(2)


    },
    logoutButton: {
      paddingVertical: hp(1.5),
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
      position:"absolute",
      bottom:0,
     width:"100%",
      // justifyContent:"flex-end",
      gap:hp(2)
    }
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
          <Image source={verified}
            style={styles.icon} />
          <Text style={styles.title}>
            {t("VerificationVerified.title")}
          </Text>
          <Text style={styles.description}>
            {t("VerificationVerified.description")}
          </Text>

        <View style={styles.btnContainer}>
          <Button
            title={t("VerificationVerified.letsStart")}
            onPress={handleLetsStart}
          />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutText}>{t('VerificationInProgress.logOut')}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </AuthWrapper>
  );
};

export default VerificationVerified;