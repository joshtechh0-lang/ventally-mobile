import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import TermsAndConditionsContent from '../../components/TermsAndConditionsContent';
import AuthWrapper from '../../wrapper/AuthWrapper';

const SafetyPolicy = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    meta: {
      color: theme.white,
      fontSize: hp(1.6),
      marginBottom: hp(1.5),
      fontFamily: fontFamilies.normal,
    },
    body: {
      color: theme.white,
      fontSize: hp(1.6),
      lineHeight: hp(2.6),
      fontFamily: fontFamilies.normal,
    },
    sectionTitle: {
      color: theme.white,
      fontSize: hp(1.8),
      marginTop: hp(2.2),
      marginBottom: hp(1),
      fontFamily: fontFamilies.medium,
    },
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={{ width: "100%" }}>
        <ScreenHeader title={t('Policies.safety.title')} onBackPress={handleBack} />

      </View>
      <View style={{ flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) }}>
        <TermsAndConditionsContent title={t('Policies.safety.title')} />

      </View>
    </AuthWrapper>
  );
};

export default SafetyPolicy;
