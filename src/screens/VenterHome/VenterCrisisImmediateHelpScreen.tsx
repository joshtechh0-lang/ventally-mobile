import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';

const VenterCrisisImmediateHelpScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(4),
    },
    card: {
      width: '100%',
      paddingHorizontal: wp(8),
      paddingVertical: hp(4),
      borderRadius: hp(2.5),
      // backgroundColor: theme.black + '10',
      borderColor: theme.white + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.5),
      color: theme.white,
      marginBottom: hp(2),
      textAlign: 'center',
      width: '100%',
    },
    bodyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + '90',
      lineHeight: hp(2.6),
      marginBottom: hp(2),
      textAlign: 'center',
      width: '100%',
    },
    buttonContainer: {
      marginTop: hp(2),
      width: '100%',
    },
  });

  const handleBack = () => {
    (navigation as any).goBack();
  };

  const handleContinue = () => {
    (navigation as any).navigate(routes.venterCrisis988Support);
  };

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <GlassView bordered glassStyles={styles.card}>
          <Text style={styles.title}>
            {t('CrisisWarning.immediateHelpTitle')}
          </Text>
          <Text style={styles.bodyText}>
            {t('CrisisWarning.immediateHelpMessage')}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title={t('CrisisWarning.continue')}
              onPress={handleContinue}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{
                width: '100%',
                backgroundColor: theme.black + '10',
                borderWidth: 0,
              }}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View>
        </GlassView>
      </View>
    </HomeWrapper>
  );
};

export default VenterCrisisImmediateHelpScreen;
