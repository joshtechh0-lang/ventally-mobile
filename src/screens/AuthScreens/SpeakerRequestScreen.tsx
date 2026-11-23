import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import PermissionRequest from '../../components/PermissionRequest';
import { routes } from '../../navigation/routes';
import { useTheme } from '../../theme';
import { speakerIcon } from '../../assets/icons';

const SpeakerRequestScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        navigation.navigate(routes.biometricEnable as never);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Speaker setup error:', error);
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <AuthWrapper key={langKey}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.white} />
        </View>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <PermissionRequest
        icon={speakerIcon as any}
        title={t('SpeakerRequest.title')}
        description={t('SpeakerRequest.description')}
        buttonText={t('SpeakerRequest.buttonText')}
        onAllow={handleAllow}
        privacyText={t('SpeakerRequest.privacyText')}
      />
    </AuthWrapper>
  );
};

export default SpeakerRequestScreen;
