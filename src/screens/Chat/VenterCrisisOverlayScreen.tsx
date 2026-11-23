import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import HomeWrapper from '../../wrapper/HomeWrapper';
import GlassModal from '../../components/shared/GlassModal';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { resetRootToVenterHome } from './VenterActiveCallScreen';

const VenterCrisisOverlayScreen = () => {
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleVenterCrisis988 = async (mode: 'call' | 'text') => {
    try {
      await Linking.openURL(mode === 'call' ? 'tel:988' : 'sms:988');
    } catch { /* ignore */ }
    setTimeout(() => {
      (navigation as any).navigate(routes.venterHomeTab);
    }, 500);
  };

  const handleVenterCrisisImSafe = () => {
    resetRootToVenterHome();
  };

  const styles = StyleSheet.create({
    overlayTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    overlayBody: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + 'B0',
      textAlign: 'center',
      lineHeight: hp(2.8),
      marginBottom: hp(3.5),
    },
    overlayBtn988: {
      width: '100%',
      paddingVertical: hp(1.8),
      borderRadius: hp(2),
      backgroundColor: theme.magenda,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: wp(2),
      marginBottom: hp(1.5),
    },
    overlayBtn988Text: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
    },
    overlayBtnText988: {
      width: '100%',
      paddingVertical: hp(1.8),
      borderRadius: hp(2),
      borderWidth: 1,
      borderColor: theme.white + '30',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: wp(2),
      marginBottom: hp(1.5),
    },
    overlayBtnTextLabel: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2),
      color: theme.white,
    },
    overlaySafeBtn: {
      paddingVertical: hp(1.2),
    },
    overlaySafeBtnText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '60',
      textAlign: 'center',
    },
  });

  return (
    <HomeWrapper>
      <GlassModal visible={true} showButtons={false}>
        <>
          <Text style={styles.overlayTitle}>
            {t('Crisis.venterOverlayTitle', 'Ventally is not a crisis service.')}
          </Text>
          <Text style={styles.overlayBody}>
            {t('Crisis.venterOverlayMessage', 'If you are thinking about self harm, suicide, or feel unsafe, please contact 988 or emergency services now.')}
          </Text>

          <TouchableOpacity
            style={styles.overlayBtn988}
            onPress={() => void handleVenterCrisis988('call')}
            activeOpacity={0.85}
          >
            <Text style={styles.overlayBtn988Text}>{t('Crisis.call988Now', 'CALL 988 NOW')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.overlayBtnText988}
            onPress={() => void handleVenterCrisis988('text')}
            activeOpacity={0.85}
          >
            <Text style={styles.overlayBtnTextLabel}>{t('Crisis.text988', 'TEXT 988')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.overlaySafeBtn}
            onPress={handleVenterCrisisImSafe}
            activeOpacity={0.7}
          >
            <Text style={styles.overlaySafeBtnText}>
              {t('Crisis.imSafeReturn', "I'm Safe - Return to Ventally")}
            </Text>
          </TouchableOpacity>
        </>
      </GlassModal>
    </HomeWrapper>
  );
};

export default VenterCrisisOverlayScreen;
