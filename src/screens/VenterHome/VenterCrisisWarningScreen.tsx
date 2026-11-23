import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import Button from '../../components/Button';
import GlassModal from '../../components/shared/GlassModal';
import { tickIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { endChatSession, endCall } from '../../store/slices/callSlice';
import { useChat } from '../../api';
import socketService from '../../sockets';

const VenterCrisisWarningScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { endConversation } = useChat();
  const [understood, setUnderstood] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const activeConversationId = useSelector((state: RootState) => state.call.activeConversationId);
  const isChatActive = useSelector((state: RootState) => state.call.isChatActive);
  const isCallActive = useSelector((state: RootState) => state.call.isActive);
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    disclaimerBlock: {
      alignItems: 'center',
      marginBottom: hp(5),
    },
    disclaimerLine: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.5),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(3.2),
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(5),
      alignSelf: 'stretch',
    },
    checkbox: {
      width: hp(3),
      height: hp(3),
      // borderRadius: hp(0.6),
      borderWidth: 2,
      borderColor: theme.magenda,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    checkboxChecked: {
      backgroundColor: theme.magenda,
      borderColor: theme.magenda,
    },
    checkmark: {
      tintColor: theme.white,
      height: hp(1.8),
      width: hp(1.8),
      resizeMode: 'contain',
    },
    acknowledgmentText: {
      flex: 1,
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      lineHeight: hp(2.8),
    },
    buttonContainer: {
      position: 'absolute',
      bottom: hp(4),
      left: wp(5),
      right: wp(5),
    },
  });
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        subscription.remove();
    }, [])
  );
  const handleBack = () => {
    navigation.goBack()
    // if (isVenter) {
    //   (navigation as any).replace(routes.venterHomeTab, {
    //     screen: routes.venterCall,
    //   });
    // } else {
    //   (navigation as any).replace(routes.listenerHomeTab, {
    //     screen: routes.listenerRequests,
    //   });
    // }
  };

  const handleAgreeContinue = async () => {
    if (isChatActive && activeConversationId) {
      try {
        await endConversation(activeConversationId);
      } catch (e) {
        console.log('[Crisis] End conversation error (non-blocking):', e);
      }
      dispatch(endChatSession());
    }
    if (isCallActive) {
      dispatch(endCall());
    }
    setShowEmergencyModal(true);
  };

  const handleContact988 = () => {
    setShowEmergencyModal(false);
    (navigation as any).navigate(routes.venterCrisisDisclaimer);

  };

  return (
    <HomeWrapper>
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <View style={styles.disclaimerBlock}>
          <Text style={styles.disclaimerLine}>
            {t('CrisisWarning.titleLine1')}
          </Text>
          <Text style={styles.disclaimerLine}>
            {t('CrisisWarning.titleLine2')}
          </Text>
          <Text style={styles.disclaimerLine}>
            {t('CrisisWarning.titleLine3')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setUnderstood(!understood)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
            {understood && (
              <Image source={tickIcon} style={styles.checkmark} />
            )}
          </View>
          <Text style={styles.acknowledgmentText}>
            {t('CrisisWarning.acknowledgment')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('CrisisWarning.agreeContinue')}
          onPress={handleAgreeContinue}
          buttonStyle={{}}
          titleStyle={{}}
          disabled={!understood}
          glassStyles={{
            width: '100%',
            backgroundColor: theme.black + '30',
            borderWidth: 0,
          }}
          leftIcon={undefined}
          iconStyle={{}}
        />
      </View>

      <GlassModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        showIcon={false}
        title={t('CrisisWarning.emergencyProtocolTitle')}
        message={t('CrisisWarning.emergencyProtocolMessage')}
        primaryButtonText={t('CrisisWarning.continue')}
        onPrimaryPress={handleContact988}
        secondaryButtonText=""
        bottomAttachedBtn={true}
        dismissOnOverlayPress={false}
      />
    </HomeWrapper>
  );
};

export default VenterCrisisWarningScreen;
