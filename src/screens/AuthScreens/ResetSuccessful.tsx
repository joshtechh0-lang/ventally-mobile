import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp, WINDOW_HEIGHT } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';

const ResetSuccessful = () => {
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

  const handleContinue = () => {
    const fromSettings = (route.params as any)?.fromSettings;
    const role = (route.params as any)?.role;

    if (fromSettings) {
      if (role === 'venter') {
        navigation.navigate(routes.venterSecurity as never);
      } else if (role === 'listener') {
        navigation.navigate(routes.listenerSettingsTab as never);
      } else if (role === 'admin') {
        navigation.navigate(routes.adminSecurity as never);
      } else {
        navigation.navigate(routes.logIn as never);
      }
    } else {
      navigation.navigate(routes.logIn as never);
    }
  };

  useEffect(() => {
    const fromSettings = (route.params as any)?.fromSettings;
    const role = (route.params as any)?.role;

    const timer = setTimeout(() => {
      if (fromSettings) {
        if (role === 'venter') {
          navigation.navigate(routes.venterSecurity as never);
        } else if (role === 'listener') {
          navigation.navigate(routes.listenerSettingsTab as never);
        } else if (role === 'admin') {
          navigation.navigate(routes.adminSecurity as never);
        } else {
          navigation.navigate(routes.logIn as never);
        }
      } else {
        navigation.navigate(routes.logIn as never);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [route.params]);

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: wp(6),
    },
    contentContainer: {
      height: WINDOW_HEIGHT / 3,
      alignItems: 'center',
      padding: hp(2),
      borderRadius: hp(2.6),
      backgroundColor: "transparent",
      justifyContent: "center",
      alignContent: "center"
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
      textAlign: 'center',
    },
    checkmarkCircle: {
      width: hp(7),
      height: hp(7),
      borderRadius: hp(6),
      alignSelf: "center",
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(4),
    },
    checkmarkIcon: {
      width: hp(3.5),
      height: hp(3.5),
      resizeMode: "contain",
      tintColor: theme.white,
      alignSelf: "center",
    },
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <GlassView opacity={0.02} bordered style={styles.contentContainer}>
          <GlassView style={styles.checkmarkCircle}>
            <Image
              source={tickIcon}
              style={styles.checkmarkIcon}
              resizeMode="contain"
            />
          </GlassView>
          <Text style={styles.title}>{t('ResetSuccessful.title')}</Text>
          <Text style={styles.subtitle}>
            {t('ResetSuccessful.description')}
          </Text>
        </GlassView>
      </View>
    </AuthWrapper>
  );
};

export default ResetSuccessful;