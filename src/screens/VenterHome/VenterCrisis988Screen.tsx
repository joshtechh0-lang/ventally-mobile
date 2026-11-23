import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Linking, AppState } from 'react-native';
import { useNavigation, CommonActions , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import Button from '../../components/Button';
import { routes } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { GlassModal } from '../../components';
import { useChat } from '../../api';
import { endChatSession, endCall } from '../../store/slices/callSlice';

const VenterCrisis988Screen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const { isVenter } = useSelector((state: RootState) => state.user)
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const waitingForReturn = useRef(false);
  const activeConversationId = useSelector((state: RootState) => state.call.activeConversationId);
  const isChatActive = useSelector((state: RootState) => state.call.isChatActive);
  const isCallActive = useSelector((state: RootState) => state.call.isActive);
  const { endConversation } = useChat();
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && waitingForReturn.current) {
        waitingForReturn.current = false;
        setShowSessionEndedModal(true);
        setTimeout(() => {
          setShowSessionEndedModal(false);
          handleNavigate();
        }, 3000);
      }
    });
    return () => subscription.remove();
  }, []);

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    circle: {
      width: hp(17),
      height: hp(17),
      borderRadius: hp(9),
      backgroundColor: theme.white + '25',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(4),
    },
    numberText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(5),
      color: theme.white,
    },
    titleBlock: {
      alignItems: 'center',
      marginBottom: hp(2),
    },
    titleLine: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.3),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(3.2),
    },
    subtext: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + '90',
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(5),
    },
    buttonsColumn: {
      width: '100%',
      gap: hp(1.5),
      alignSelf : 'flex-end',
    },
    buttonWrapper: {
      width: '100%',
    },
  });

  const handleBack = () => { 
    (navigation as any).goBack();
  };
  const handleNavigate = () => {
    if(isVenter){
      (navigation as any).dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.venterHomeTab }],
          }),
        );
  } else {
      (navigation as any).dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.listenerHomeTab }],
          }),
        );
  }
  }
  const handleContact988 = () => {
    waitingForReturn.current = true;
    handleContinue();
    Linking.openURL('tel:988').catch(() => {
      waitingForReturn.current = false;
    });
  };

  const handleChat988 = () => {
    waitingForReturn.current = true;
    handleContinue();
    Linking.openURL('sms:988').catch(() => {
      waitingForReturn.current = false;
    });
  };

  const handleContinue = async () => {
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
  
  };

  const handleImSafe = () => {
    (navigation as any).dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routes.venterHomeTab,
            state: {
              routes: [{ name: routes.venterCall }],
            },
          },
        ],
      }),
    );
  };

  return (
    <HomeWrapper>
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
       <View style={{flex : 1, justifyContent : 'center', alignItems : 'center'}}>
       <View style={styles.circle}>
          <Text style={styles.numberText}>
            {t('CrisisWarning.support988Number')}
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.titleLine}>
            {t('CrisisWarning.support988TitleLine1')}
          </Text>
          <Text style={styles.titleLine}>
            {t('CrisisWarning.support988TitleLine2')}
          </Text>
        </View>

        <Text style={styles.subtext}>
          {t('CrisisWarning.support988Subtext')}
        </Text>
       </View>

        <View style={styles.buttonsColumn}>
          <View style={styles.buttonWrapper}>
            <Button
              title={t('CrisisWarning.contact988')}
              onPress={handleContact988}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{
                width: '100%',
                backgroundColor: theme.black + '30',
                borderWidth: 0,
              }}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title={t('CrisisWarning.chat988')}
              onPress={handleChat988}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{
                width: '100%',
                backgroundColor: theme.black + '30',
                borderWidth: 0,
              }}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View>
          {/* <View style={styles.buttonWrapper}>
            <Button
              title={t('CrisisWarning.imSafe')}
              onPress={handleImSafe}
              buttonStyle={{}}
              titleStyle={{}}
              disabled={false}
              glassStyles={{
                width: '100%',
                backgroundColor: 'transparent',
              }}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View> */}
        </View>
      </View>
      <GlassModal
                    visible={showSessionEndedModal}
                    onClose={() => { }}
                    title="Session Ended"
                    message="Thanks for being here. You made a difference."
                    showButtons={false}
                    dismissOnOverlayPress={false}
                    dismissOnBackPress={false}
                />
    </HomeWrapper>
  );
};

export default VenterCrisis988Screen;
