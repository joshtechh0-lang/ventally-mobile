import React from 'react';
import { View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { ScreenHeader } from '../../components';
import TermsAndConditionsContent from '../../components/TermsAndConditionsContent';
import AuthWrapper from '../../wrapper/AuthWrapper';

const TermsOfUse = () => {
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

  return (
    <AuthWrapper>
      <View style={{ width: "100%" }}>
        <ScreenHeader title={t('Policies.terms.title')} onBackPress={handleBack} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) }}>
        <TermsAndConditionsContent />
      </View>
    </AuthWrapper>
  );
};

export default TermsOfUse;
