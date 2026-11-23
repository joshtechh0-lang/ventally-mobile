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
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useChat } from '../../api';
import { endChatSession, endCall } from '../../store/slices/callSlice';

const VenterCrisisDisclaimerScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const activeConversationId = useSelector((state: RootState) => state.call.activeConversationId);
  const isChatActive = useSelector((state: RootState) => state.call.isChatActive);
  const isCallActive = useSelector((state: RootState) => state.call.isActive);
  const { endConversation } = useChat();
  const dispatch = useDispatch();
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleBlock: {
      alignItems: 'center',
      marginBottom: hp(4),
    },
    titleLine: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      lineHeight: hp(3.2),
    },
    bodyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + '90',
      textAlign: 'center',
      lineHeight: hp(2.6),
      marginBottom: hp(6),
    },
    body988: {
      fontFamily: fontFamilies.bold,
      color: theme.white,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: hp(4),
      left: wp(5),
      right: wp(5),
    },
  });

  const handleBack = () => {
    (navigation as any).goBack();
  };

  const handleContinue = async () => {
    if (isChatActive && activeConversationId) {

      (navigation as any).navigate(routes.needMoreSupportCrisis);

      
      // try {
      //   await endConversation(activeConversationId);
        
      // } catch (e) {
      //   console.log('[Crisis] End conversation error (non-blocking):', e);
      // }
      // dispatch(endChatSession());
    }
    if (isCallActive) {
      // dispatch(endCall());
      (navigation as any).navigate(routes.needMoreSupportCrisis);
    }
  
  };

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title=""
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.titleLine}>
            {t('CrisisWarning.notCrisisTitleLine1')}
          </Text>
          <Text style={styles.titleLine}>
            {t('CrisisWarning.notCrisisTitleLine2')}
          </Text>
        </View>

        <Text style={styles.bodyText}>
          {t('CrisisWarning.notCrisisBody')}
          <Text style={styles.body988}> {t('CrisisWarning.notCrisis988')}</Text>
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
            backgroundColor: theme.black + '30',
            borderWidth: 0,
          }}
          leftIcon={undefined}
          iconStyle={{}}
        />
      </View>
    </HomeWrapper>
  );
};

export default VenterCrisisDisclaimerScreen;
