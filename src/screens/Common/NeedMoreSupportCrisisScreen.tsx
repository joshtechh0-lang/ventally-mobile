import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { CommonActions, useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import GlassWrapper from '../../components/GlassWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { happyIcon, callIcon, chevronIcon } from '../../assets/icons';
import { GlassModal } from '../../components';
import { routes } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { endCall, endChatSession } from '../../store/slices/callSlice';
import { apiInstance, useChat } from '../../api';

const NeedMoreSupportCrisisScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();
    const { leaveChannel } = useAgora();
    const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
    const { isVenter } = useSelector((state: RootState) => state.user)
    const callId = useSelector((state: RootState) => state.session.sessionId);
    const isCallActive = useSelector((state: RootState) => state.call.isActive);
    const isChatActive = useSelector((state: RootState) => state.call.isChatActive);
    const activeConversationId = useSelector((state: RootState) => state.call.activeConversationId);
    const { endConversation } = useChat();
    const dispatch = useDispatch();

    const handleImSafe = () => {
        navigation?.goBack();
        navigation?.goBack();
        // console.log("click im safe" , isVenter);
        // setShowSessionEndedModal(true);
        // setTimeout(() => {
        //     setShowSessionEndedModal(false);
        //     if(isVenter){
        //         (navigation as any).dispatch(
        //             CommonActions.reset({
        //               index: 0,
        //               routes: [{ name: routes.venterHomeTab }],
        //             }),
        //           );
        //     } else {
        //         (navigation as any).dispatch(
        //             CommonActions.reset({
        //               index: 0,
        //               routes: [{ name: routes.listenerHomeTab }],
        //             }),
        //           );
        //     }
        // }, 2000);
    };

    const handleEmergencySupport = async () => {
        if (isCallActive && callId) {
            try {
                await apiInstance.post(`calls/${callId}/end`);
            } catch (err) {
                console.log('[Crisis] End call API error (non-blocking):', err);
            }
                  dispatch(endCall());
        }
        if (isChatActive && activeConversationId) {
            try {
                await endConversation(activeConversationId);
            } catch (err) {
                console.log('[Crisis] End conversation error (non-blocking):', err);
            }
            dispatch(endChatSession());
        }
        (navigation as any).navigate(routes.venterInternal, {
            screen: routes.venterCrisis988Support,
        });
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(6),
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.5),
            color: theme.white,
            textAlign: 'center',
            marginBottom: hp(8),
        },
        buttonContainer: {
            width: '100%',
            gap: hp(2),
        },
        buttonWrapper: {
            borderRadius: hp(2),
            overflow: 'hidden',
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: hp(2.5),
            paddingHorizontal: wp(5),
        },
        icon: {
            width: hp(3),
            height: hp(3),
            tintColor: theme.white,
            resizeMode: 'contain',
            marginRight: wp(4),
        },
        buttonText: {
            flex: 1,
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.8),
            color: theme.white,
        },
        chevron: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: 'contain',

            transform: [{ rotate: '270deg' }],
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title=""
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <View style={styles.content}>
                <Text style={styles.title}>
                    {t('NeedMoreSupport.title')}
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleEmergencySupport} activeOpacity={0.8}>
                        <GlassWrapper radius={12} bordered={true} glassStyles={styles.buttonWrapper}>
                            <View style={styles.actionButton}>
                                <Image source={callIcon} style={styles.icon} />
                                <Text style={styles.buttonText}>
                                    {t('NeedMoreSupport.emergencySupport')} (988)
                                </Text>
                            </View>
                        </GlassWrapper>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleImSafe} activeOpacity={0.8}>
                        <GlassWrapper radius={12} bordered={true} glassStyles={styles.buttonWrapper}>
                            <View style={styles.actionButton}>
                                <Image source={happyIcon} style={styles.icon} />
                                <Text style={styles.buttonText}>
                                    {t('NeedMoreSupport.imSafe')}
                                </Text>
                                <Image source={chevronIcon} style={styles.chevron} />
                            </View>
                        </GlassWrapper>
                    </TouchableOpacity>
                </View>
            </View>
        </HomeWrapper>
    );
};

export default NeedMoreSupportCrisisScreen;
