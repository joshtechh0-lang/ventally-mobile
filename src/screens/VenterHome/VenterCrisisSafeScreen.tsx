import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import Button from '../../components/Button';
import GlassModal from '../../components/shared/GlassModal';
import { routes } from '../../navigation/routes';
import { useSelector } from 'react-redux';

const VenterCrisisSafeScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const [showCrisisEscalationModal, setShowCrisisEscalationModal] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSessionEndedReflectModal, setShowSessionEndedReflectModal] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isVenter } = useSelector((state: any) => state.user);
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.5),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(2),
      lineHeight: hp(3.2),
    },
    message: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + '95',
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(6),
    },
    buttonContainer: {
      position: 'absolute',
      bottom: hp(4),
      left: wp(5),
      right: wp(5),
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.black + '40',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });

  const handleBack = () => {
    (navigation as any).goBack();
  };

  const handleContinue = () => {
    setShowCrisisEscalationModal(true);
  };

  const handleModalContact988 = () => {
    console.log("click contact 988");

    setShowCrisisEscalationModal(false);
    Linking.openURL('tel:988').catch(() => { });
    (navigation as any).navigate(routes.venterCrisisSafe);

  };

  const handleModalContinue = () => {
    setShowCrisisEscalationModal(false);
    setShowSessionEndedModal(true);
    console.log("click continue");

  };

  const handleSessionEndedContact988 = () => {
    setShowSessionEndedModal(false);
    Linking.openURL('tel:988').catch(() => { });
    // (navigation as any).navigate(routes.venterCrisisDisclaimer);
  };

  const handleSessionEndedContinue = () => {
    setShowSessionEndedModal(false);
    setShowLoading(true);
    loadingTimeoutRef.current = setTimeout(() => {
      setShowLoading(false);
      setShowSessionEndedReflectModal(true);
      loadingTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const handleSessionEndedReflectOkay = () => {
    setShowSessionEndedReflectModal(false);
    if (isVenter) {
      (navigation as any).navigate(routes.venterHomeTab);
    } else {
      (navigation as any).navigate(routes.listenerHomeTab);
    }
  };

  return (
    <HomeWrapper>
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.white} />
        </View>
      )}
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('CrisisWarning.safeTitle')}
        </Text>

        <Text style={styles.message}>
          {t('CrisisWarning.safeMessage')}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('CrisisWarning.continue')}
          onPress={handleContinue}
          buttonStyle={{}}
          titleStyle={{}}
          disabled={false}
          glassStyles={{
            width: '100%',
            backgroundColor: theme.white + '5',
            borderWidth: 0,
          }}
          leftIcon={undefined}
          iconStyle={{}}
        />
      </View>

      <GlassModal
        visible={showCrisisEscalationModal}
        onClose={() => setShowCrisisEscalationModal(false)}
        showIcon={false}
        title={t('CrisisWarning.crisisEscalationTitle')}
        message={t('CrisisWarning.crisisEscalationMessage')}
        primaryButtonText={t('CrisisWarning.contact988')}
        secondaryButtonText={t('CrisisWarning.continue')}
        onPrimaryPress={handleModalContact988}
        onSecondaryPress={handleModalContinue}
        dismissOnOverlayPress={false}
        showVerticalButtons={true}
        secondaryButtonStyle={{
          backgroundColor: theme.black + '30',
        }}
      />

      <GlassModal
        visible={showSessionEndedModal}
        onClose={() => setShowSessionEndedModal(false)}
        showIcon={false}
        primaryButtonStyle={{
          backgroundColor: theme.white + '15',
        }}
        title={t('CrisisWarning.sessionEndedTitle')}
        message={t('CrisisWarning.sessionEndedMessage')}
        primaryButtonText={t('CrisisWarning.contact988')}
        secondaryButtonText={t('CrisisWarning.continue')}
        onPrimaryPress={handleSessionEndedContact988}
        onSecondaryPress={handleSessionEndedContinue}
        dismissOnOverlayPress={false}
        showVerticalButtons={true}
        secondaryButtonStyle={{
          backgroundColor: theme.black + '30',
        }}
      />

      <GlassModal
        visible={showSessionEndedReflectModal}
        onClose={() => setShowSessionEndedReflectModal(false)}
        showIcon={false}
        title={t('CrisisWarning.sessionEndedReflectTitle')}
        message={t('CrisisWarning.sessionEndedReflectMessage')}

        showButtons={false}
        primaryButtonText={t('CrisisWarning.ok')}
        bottomAttachedBtn
        secondaryButtonText=""
        onPrimaryPress={handleSessionEndedReflectOkay}
        dismissOnOverlayPress={false}
      />
    </HomeWrapper>
  );
};

export default VenterCrisisSafeScreen;
