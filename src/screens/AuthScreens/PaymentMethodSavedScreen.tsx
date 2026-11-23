import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import { tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';

const PaymentMethodSavedScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  useEffect(() => {
    // Auto-navigate to payment methods after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate(routes.subscriptionSuccess as never);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',

      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(3),
    },

    successCard: {
      padding : wp(6),
      alignItems: 'center',
    },
    checkmarkCircle: {
      width: hp(6),
      height: hp(6),
      borderWidth:hp(.4),
      borderRadius: hp(5),
      borderColor:theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(4),
      alignSelf:"center"
    },
    checkmarkIcon: {
      width: hp(4),
      height: hp(4),
      tintColor: theme.white,
      resizeMode:"contain",
      alignSelf:"center",
    },
    successTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1),
    },
    successMessage: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      textAlign: 'center',
      opacity: 0.9,
    },
  });

  return (
    <AuthWrapper>
      <View style={styles.container}>
        <GlassView
        bordered
          radius={hp(3)}
          style={{width:"100%"}}
        >
          <View style={styles.successCard}>
          <View style={styles.checkmarkCircle}>
            <Image
              source={tickIcon}
              style={styles.checkmarkIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.successTitle}>
            {t('PaymentMethodSaved.title')}
          </Text>
          <Text style={styles.successMessage}>
              {t('PaymentMethodSaved.message')}
            </Text>
          </View>
        </GlassView>
      </View>
    </AuthWrapper>
  );
};

export default PaymentMethodSavedScreen;
