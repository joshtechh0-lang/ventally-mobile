import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';

const ListenerProfile = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(1),
    },
    subtitle: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '80',
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('Listener.profile.title')}</Text>
        <Text style={styles.subtitle}>{t('Listener.profile.subtitle')}</Text>
      </View>
    </HomeWrapper>
  );
};

export default ListenerProfile;

