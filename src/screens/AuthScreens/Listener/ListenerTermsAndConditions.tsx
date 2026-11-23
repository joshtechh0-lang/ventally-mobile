import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import Button from '../../../components/Button';
import AuthStepsHeader from '../../../components/AuthStepsHeader';
import { tickIcon } from '../../../assets/icons';
import { routes } from '../../../navigation/routes';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../../utils/keyboard';
import { toastError } from '../../../utils/toast';

const ListenerTermsAndConditions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountTypeChanging } = (route.params as any) || {};
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const [allAgreed, setAllAgreed] = useState(false);
  const isAllChecked = allAgreed;

  useEffect(() => {
    if (__DEV__) {
      setAllAgreed(true);
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (!isAllChecked) {
      toastError({ text: t('Common.pleaseCompleteAllFields'), theme });
      return;
    }
    (navigation as any).navigate(routes.listenerTraining, { accountTypeChanging });
  };

  const TERM_SUMMARIES = [
    { id: 'liability', icon: '🔒', title: t('ListenerTermsAndConditions.liabilityWaiver'), summary: t('ListenerTermsAndConditions.liabilitySummary') },
    { id: 'payment', icon: '💰', title: t('ListenerTermsAndConditions.paymentTerms'), summary: t('ListenerTermsAndConditions.paymentSummary') },
    { id: 'agreement', icon: '🔒', title: t('ListenerTermsAndConditions.listenerAgreement'), summary: t('ListenerTermsAndConditions.agreementSummary') },
    { id: 'nda', icon: '🔒', title: t('ListenerTermsAndConditions.nda'), summary: t('ListenerTermsAndConditions.ndaSummary') },
    { id: 'conduct', icon: '📋', title: t('ListenerTermsAndConditions.codeOfConduct'), summary: t('ListenerTermsAndConditions.conductSummary') },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp(5), paddingTop: hp(2) },
    termsContainer: { marginTop: hp(1), marginBottom: hp(1) },
    checkbox: { width: hp(2), height: hp(2), borderRadius: hp(0.5), borderWidth: 2, borderColor: theme.white + '40', justifyContent: 'center', alignItems: 'center', marginRight: wp(3) },
    checkboxChecked: { backgroundColor: theme.white, borderColor: theme.white },
    checkmark: { tintColor: theme.black, height: hp(1.4), width: hp(1.4) },
    termTitle: { flex: 1, fontFamily: fontFamilies.normal, fontSize: hp(1.6), color: theme.white, lineHeight: hp(2) },
    continueButtonContainer: { paddingBottom: hp(4) },
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        <AuthStepsHeader
          handleBack={handleBack}
          title={t('ListenerTermsAndConditions.title')}
          glassyTitle={false}
        />
        {/* Progress indicator */}
        <View style={{ marginBottom: hp(1.5) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(0.5) }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ListenerTermsAndConditions.stepIndicator', 'Step 4 of 5 — Legal Agreement')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ListenerTermsAndConditions.almostDone', 'Almost done!')}</Text>
          </View>
          <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(1), height: hp(0.5) }}>
            <View style={{ width: '80%', backgroundColor: 'rgba(167,139,250,0.8)', borderRadius: hp(1), height: hp(0.5) }} />
          </View>
        </View>
        <KeyboardAwareScrollView
          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={getKeyboardAwareContentStyle()}
        >
          <View style={styles.termsContainer}>
            {TERM_SUMMARIES.map((item) => (
              <View key={item.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.5), padding: hp(1.5), marginBottom: hp(1.5) }}>
                <Text style={{ color: theme.white, fontSize: hp(1.5), fontFamily: fontFamilies.semiBold, marginBottom: hp(0.5) }}>
                  {item.icon} {item.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
                  {item.summary}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.5), padding: hp(1.5), marginTop: hp(1) }}
              onPress={() => setAllAgreed(prev => !prev)}
            >
              <View style={[styles.checkbox, allAgreed && styles.checkboxChecked, { marginTop: hp(0.3) }]}>
                {allAgreed && <Image source={tickIcon} style={styles.checkmark} />}
              </View>
              <Text style={[styles.termTitle, { flex: 1 }]}>
                {t('ListenerTermsAndConditions.agreeAll') || 'I have read and agree to all Ventally Support Guide terms & policies.'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
        <View style={styles.continueButtonContainer}>
          <Button
            title={isAllChecked ? t('ListenerTermsAndConditions.agreeAndContinue') || 'Agree & Continue →' : t('ListenerTermsAndConditions.continue')}
            onPress={handleContinue}
          />
        </View>
      </View>
    </AuthWrapper>
  );
};

export default ListenerTermsAndConditions;
