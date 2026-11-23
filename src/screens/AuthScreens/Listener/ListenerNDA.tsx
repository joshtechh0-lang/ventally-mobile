import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import Button from '../../../components/Button';
import AuthStepsHeader from '../../../components/AuthStepsHeader';
import { routes } from '../../../navigation/routes';

const ListenerNDA = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountTypeChanging, from } = (route.params as any) || {};
  const { theme } = useTheme();
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

  const handleContinue = () => {
    // Navigate to next screen
    (navigation as any).navigate(routes.listenerCodeOfConduct, { accountTypeChanging });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    scrollContent: {
      paddingBottom: hp(4),
    },
    effectiveDate: {
      marginTop: hp(2),
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(3),
    },
    introText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.6),
      marginBottom: hp(2.5),
    },
    companyName: {
      fontFamily: fontFamilies.semiBold,
      color: theme.white,
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      lineHeight: hp(2.8),
      color: theme.white,
      marginBottom: hp(1.5),
      marginTop: hp(2),
    },
    bulletPoint: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white,
      lineHeight: hp(2.6),
      marginBottom: hp(1.5),
      paddingLeft: wp(2),
    },
    continueButtonContainer: {
      paddingBottom: hp(4),
    },
  });

  return (
    <AuthWrapper>

      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader
          handleBack={handleBack}
          title={t('ListenerNDA.title')}
          glassyTitle={false}
        />

        <ScrollView
          style={{ flex: 1, marginTop: hp(2) }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Effective Date */}
          <Text style={styles.effectiveDate}>
            {t('ListenerNDA.effectiveDate')}
          </Text>

          {/* Introduction */}
          <Text style={styles.introText}>
            {t('ListenerNDA.introText1')}
          </Text>

          {/* Dynamic Sections */}
          {(t('ListenerNDA.sections', { returnObjects: true }) as any[]).map((section, index) => (
            <View key={index}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.subsections?.map((sub: any, subIndex: number) => (
                <View key={subIndex}>
                  {!!sub.title && <Text style={styles.sectionTitle}>{sub.title}</Text>}
                  {!!sub.text && <Text style={styles.bulletPoint}>{sub.text}</Text>}

                  {/* Nested Bullets if present */}
                  {sub.bullets?.map((bullet: string, bIndex: number) => (
                    <Text key={bIndex} style={[styles.bulletPoint, { paddingLeft: wp(4) }]}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ))}

              {/* Direct Bullets if present (fallback for simpler sections if any) */}
              {section.bullets?.map((bullet: string, bIndex: number) => (
                <Text key={bIndex} style={styles.bulletPoint}>{bullet}</Text>
              ))}
            </View>
          ))}

          {/* Signatures */}
          <View>
            <Text style={styles.sectionTitle}>{t('ListenerNDA.signatures.title')}</Text>
            <Text style={styles.bulletPoint}>{t('ListenerNDA.signatures.text')}</Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        {from !== "settings" && <View style={styles.continueButtonContainer}>
          <Button
            title={t('ListenerNDA.continue')}
            onPress={handleContinue}

          />
        </View>}
      </View>
    </AuthWrapper>
  );
};

export default ListenerNDA;