import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import PermissionRequest from '../../components/PermissionRequest';
import { routes } from '../../navigation/routes';
import { requestMicrophonePermission, checkMicrophonePermission } from '../../utils/permissions';
import { hp } from '../../utils/size';
import { useTheme } from '../../theme';
import { microphoneIcon } from '../../assets/icons';

const MicrophoneRequestScreen = () => {
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
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const granted = await requestMicrophonePermission();
      if (granted) {
        navigation.navigate(routes.speakerRequest as never);
      } else {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.error('Permission request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
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
        icon={microphoneIcon as any}
        title={t('MicrophoneRequest.title')}
        description={t('MicrophoneRequest.description')}
        buttonText={permissionDenied ? t('MicrophoneRequest.openSettings', 'Open Settings') : t('MicrophoneRequest.buttonText')}
        onAllow={permissionDenied ? handleOpenSettings : handleAllow}
        privacyText={t('MicrophoneRequest.privacyText')}
      />
    </AuthWrapper>
  );
};

export default MicrophoneRequestScreen;
