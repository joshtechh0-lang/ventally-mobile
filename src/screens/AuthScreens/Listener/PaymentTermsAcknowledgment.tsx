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

const PaymentTermsAcknowledgment = ({ route }: any) => {
  const navigation = useNavigation();
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
    (navigation as any).navigate(routes.listenerAgreement, { accountTypeChanging });
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
      lineHeight: hp(2.3),

    },
    introText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      lineHeight: hp(2.6),

      color: theme.white,
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
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader
          handleBack={handleBack}
          title={t('PaymentTermsAcknowledgment.title')}
          glassyTitle={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Effective Date */}
          <Text style={styles.effectiveDate}>
            {t('PaymentTermsAcknowledgment.effectiveDate')}
          </Text>

          {/* Introduction */}
          <Text style={styles.introText}>
            {t('PaymentTermsAcknowledgment.introText1')}
          </Text>

          <Text style={styles.introText}>
            {t('PaymentTermsAcknowledgment.introText2')}
          </Text>

          {/* Dynamic Sections */}
          {(t('PaymentTermsAcknowledgment.sections', { returnObjects: true }) as any[]).map((section, index) => (
            <View key={index}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.bullets?.map((bullet: string, bIndex: number) => (
                <Text key={bIndex} style={styles.bulletPoint}>{bullet}</Text>
              ))}
            </View>
          ))}

          {/* Signatures */}
          <View>
            <Text style={styles.sectionTitle}>
              {t('PaymentTermsAcknowledgment.signatures.title')}
            </Text>
            <Text style={styles.bulletPoint}>
              {t('PaymentTermsAcknowledgment.signatures.text')}
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        {from !== "settings" && <View style={styles.continueButtonContainer}>
          <Button
            title={t('PaymentTermsAcknowledgment.continue')}
            onPress={handleContinue}


            disabled={false}
            glassStyles={{
              width: '100%',
            }}
          />
        </View>}
      </View>
    </AuthWrapper>
  );
};

export default PaymentTermsAcknowledgment;