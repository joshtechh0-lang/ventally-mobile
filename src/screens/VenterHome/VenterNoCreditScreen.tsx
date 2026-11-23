import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { Button, ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';

const VenterNoCreditScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();

  const handleBack = () => navigation.goBack();

  const handleAddCredit = () => {
    (navigation as any).navigate(routes.venterAddCredit);
  };

  const handleUpgradePlan = () => {
    (navigation as any).navigate(routes.venterMySubscription);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: wp(2),
    },
    card: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
      marginBottom: hp(3),
      borderRadius: hp(2),
      backgroundColor: theme.black + '20',
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(1.5),
      textAlign: 'center',
    },
    description: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white + '99',
      textAlign: 'center',
      lineHeight: hp(2.4),
      marginBottom: hp(3),
    },
    buttonWrap: {
      marginTop: hp(1),
    },
    glassBg: {
      backgroundColor: theme.black + '20',
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title="" onBackPress={handleBack} showBackButton />

      <View style={styles.container}>

        <View style={styles.content}>
          <GlassView bordered glassStyles={styles.card}>
            <Text style={styles.title}>{t('VenterNoCredit.title')}</Text>
            <Text style={styles.description}>
              {t('VenterNoCredit.description')}
            </Text>

            <View style={styles.buttonWrap}>
              <Button
                title={t('VenterNoCredit.addCredit')}
                onPress={handleAddCredit}
                buttonStyle={{}}
                titleStyle={{ fontSize: hp(1.8) }}
                glassStyles={styles.glassBg}
                disabled={false}
                leftIcon={undefined}
                iconStyle={{}}
              />
            </View>
            <View style={styles.buttonWrap}>
              <Button
                title={t('VenterNoCredit.upgradePlan')}
                onPress={handleUpgradePlan}
                buttonStyle={{}}
                titleStyle={{ fontSize: hp(1.8) }}
                glassStyles={styles.glassBg}
                disabled={false}
                leftIcon={undefined}
                iconStyle={{}}
                borderedGlassButton
              />
            </View>
          </GlassView>

        </View>
      </View>
    </HomeWrapper>
  );
};

export default VenterNoCreditScreen;
