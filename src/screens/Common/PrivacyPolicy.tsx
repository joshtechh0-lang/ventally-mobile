import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import AuthWrapper from '../../wrapper/AuthWrapper';
import TermsAndConditionsContent from '../../components/TermsAndConditionsContent';

const PrivacyPolicy = () => {
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
    scrollContent: {
      paddingBottom: hp(6),
    },
    section: {
      marginBottom: hp(4),
    },
    mainTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(1),
      alignSelf: "center"
    },
    subheading: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginTop: hp(2.5),
      marginBottom: hp(1.5),
    },
    text: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.4),
      marginBottom: hp(1.5),
      opacity: 0.9,
    },
    bulletPoint: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.4),
      marginBottom: hp(1.2),
      marginLeft: wp(4),
      opacity: 0.9,
    },
  });

  return (
    <AuthWrapper>
      <View style={{ width: '100%' }}>
        <ScreenHeader title={t('Legal.privacyPolicy')} onBackPress={handleBack} />
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TermsAndConditionsContent title={t('Legal.privacyPolicy')} />
      </ScrollView>
    </AuthWrapper>
  );
};

export default PrivacyPolicy;
