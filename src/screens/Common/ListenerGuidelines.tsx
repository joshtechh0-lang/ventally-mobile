import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import ListenerCodeOfConduct from '../AuthScreens/Listener/ListenerCodeOfConduct';

const ListenerGuidelines = () => {
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
      color: theme.white60,
      fontSize: hp(1.4),
      marginBottom: hp(1.5),
      fontFamily: fontFamilies.normal,
    },
    body: {
      color: theme.white + 'CC',
      fontSize: hp(1.5),
      lineHeight: hp(2.2),
      fontFamily: fontFamilies.normal,
    },
    sectionTitle: {
      color: theme.white,
      fontSize: hp(1.7),
      marginTop: hp(2.2),
      marginBottom: hp(1),
      fontFamily: fontFamilies.medium,
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title={t('Policies.guidelines.title')} onBackPress={handleBack} />
      <ListenerCodeOfConduct />
      {/* <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>{t('Policies.effectiveDate')}</Text>
        <Text style={styles.meta}>{t('Policies.contact')}</Text>

        <Text style={styles.body}>{t('Policies.commonIntro')}</Text>

        <Text style={styles.sectionTitle}>{t('Policies.section1Title')}</Text>
        <Text style={styles.body}>{t('Policies.section1Body')}</Text>

        <Text style={styles.sectionTitle}>{t('Policies.section2Title')}</Text>
        <Text style={styles.body}>{t('Policies.section2Body')}</Text>

        <View style={{ height: hp(4) }} />
      </ScrollView> */}
    </HomeWrapper>
  );
};

export default ListenerGuidelines;
