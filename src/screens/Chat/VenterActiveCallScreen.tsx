import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, useColorScheme, BackHandler, TouchableOpacity, Linking } from 'react-native';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch, useStore } from 'react-redux';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { getGlassColors } from '../../utils/glassColors';
import { routes } from '../../navigation/routes';
import { callIcon, microphoneIcon, muted, x, speakerIcon } from '../../assets/icons';
import { endCall as endCallAction, sessionStarted, setMuted, setCrisisEnded } from '../../store/slices/callSlice';
import type { RootState } from '../../store/store';
import { Button, ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import socketService from '../../sockets';
import { apiInstance } from '../../api';
import { navigationRef } from '../../navigation';

/** Clears root stack to venter tabs with Home tab at index 0 (drops ChatStack / call screens). */
export function resetRootToVenterHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: routes.venterHomeTab,
          state: {
            routes: [{ name: routes.venterHome }],
            index: 0,
          },
        },
      ],
    })
  );
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VenterActiveCallScreen = ({ route }: any) => {
  const { showAcceptRejectBtns = false, callerName, call } = route.params || {};
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const isDark = useColorScheme() === 'dark';

  const { isActive, startTime, isMuted } = useSelector((state: RootState) => state.call);
  const crisisEnded = useSelector((state: RootState) => state.call.crisisEnded);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showVenterCrisisOverlay, setShowVenterCrisisOverlay] = useState(false);
  const [walletMinutes, setWalletMinutes] = useState<number | null>(null);
  const [showLowMinutesWarning, setShowLowMinutesWarning] = useState(false);
  const [lowMinutesDismissed, setLowMinutesDismissed] = useState(false);
  const hasEndedRef = useRef(false);
  const crisisSignalledRef = useRef(false);
  const leaveAndNavigateRef = useRef<() => void>(() => { });

  const {
    joinChannel,
    leaveChannel,
    toggleMute,
    setSpeakerphoneEnabled,
    isJoined,
    isConnecting: agoraConnecting,
    remoteUid,
  } = useAgora({
    onJoinChannelSuccess: (channel, uid) => {
      console.log('[VenterActiveCall] Joined channel', channel, 'uid', uid);
      dispatch(sessionStarted());
    },
    onUserOffline: (uid) => {
      console.log('[VenterActiveCall] Remote user left:', uid);
      // We no longer navigate onUserOffline to avoid race conditions with backend socket events.
      // Navigation is strictly handled by the 'call:ended' and 'session:ended' socket listeners.
    },
  });

  const channelName = call?.channelName;
  const callToken = call?.token;

  // ── Join Agora channel on mount ──
  useEffect(() => {
    if (!callToken || !channelName) return;
    console.log('[VenterActiveCall] Initiating call:', channelName, 'token:', callToken, 'uid:', call?.uid ?? 0);
    joinChannel({
      token: callToken,
      channelName: channelName,
      uid: call?.uid ?? 0,
    });
  }, []);

  // ── Join Socket Room ──
  useEffect(() => {
    if (call?.id) {
      console.log('[VenterActiveCall] emit call:joined', { callId: call.id });
      socketService.emit('call:joined', { callId: call.id });
    }
  }, [call?.id]);

  // ── Reset stale crisisEnded flag on mount ──
  useEffect(() => {
    dispatch(setCrisisEnded(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Watch crisisEnded — set by useGlobalSessionEvents when listener triggers crisis ──
  useEffect(() => {
    if (crisisEnded) {
      console.log('[VenterActiveCall] crisisEnded flag set → navigating to crisis overlay');
      hasEndedRef.current = true; // block onUserOffline from navigating to rating
      leaveChannel();
      (navigation as any).replace(routes.venterCrisisOverlay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crisisEnded]);



  // ── Timer ──
  useEffect(() => {
    if (!isActive || startTime == null) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // ── Fetch wallet balance + show low-minutes warning ──
  useEffect(() => {
    apiInstance.get('wallet/balance').then((res: any) => {
      const mins = res?.data?.balance?.minutes ?? res?.data?.minutes ?? null;
      if (mins !== null) setWalletMinutes(Math.floor(Number(mins)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (lowMinutesDismissed || walletMinutes === null) return;
    if (walletMinutes < 2) setShowLowMinutesWarning(true);
  }, [walletMinutes, lowMinutesDismissed]);

  // ── Leave Agora + navigate to feedback ──
  const leaveAndNavigate = useCallback(() => {
    leaveChannel();
    dispatch(endCallAction());
    (navigation as any).replace(routes.chatSessionFeedback, { type: 'call', data: call ?? null });
  }, [leaveChannel, dispatch, navigation, call]);

  leaveAndNavigateRef.current = leaveAndNavigate;

  // ── End call: tell backend, leave Agora, navigate ──
  const handleEndCallConfirmed = async () => {
    setShowEndSessionModal(false);
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    if (call?.id) {
      try {
        await apiInstance.post(`calls/${call.id}/end`);
      } catch (err) {
        console.log('[VenterActiveCall] End call API error (non-blocking):', err);
      }
    }

    leaveAndNavigate();
  };

  // ── Back press ──
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleBack = () => {
    leaveChannel();
    (navigation as any).navigate(routes.venterHomeTab, {
      screen: routes.venterCall,
    });
  };

  // ── Mute ──
  const handleMute = () => {
    const newMuted = !isMuted;
    dispatch(setMuted(newMuted));
    toggleMute(newMuted);
  };

  const handleSpeakerToggle = () => {
    const next = !isSpeakerOn;
    setSpeakerphoneEnabled(next);
    setIsSpeakerOn(next);
  };

  // ── Crisis ──
  const handleCrisis = () => {
    setShowVenterCrisisOverlay(true);
  };

  // ── Venter 988 actions ──
  const handleVenterCrisis988 = async (mode: 'call' | 'text') => {
    setShowVenterCrisisOverlay(false);
    const callState = (store.getState() as RootState).call;
    if (callState.isActive) {
      if (!hasEndedRef.current) {
        hasEndedRef.current = true;
        leaveChannel();
        dispatch(endCallAction());
        try {
          if (call?.id) await apiInstance.post(`calls/${call.id}/end`);
        } catch { /* ignore */ }
      }
    }
    try {
      await Linking.openURL(mode === 'call' ? 'tel:988' : 'sms:988');
    } catch { /* ignore */ }
    setTimeout(() => {
      resetRootToVenterHome();
    }, 500);
  };

  const handleVenterCrisisImSafe = () => {
    setShowVenterCrisisOverlay(false);
    const callState = (store.getState() as RootState).call;
    // If call already ended by listener crisis, go home at root index 0 + first tab
    if (!callState.isActive) {
      resetRootToVenterHome();
    }
    // else stay on call
  };

  // ── UI state ──
  const isConnecting = agoraConnecting;
  const statusText = isConnecting
    ? t('ActiveCall.connecting')
    : isActive
      ? formatDuration(elapsedMs)
      : t('ActiveCall.connecting');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
    },
    center: {
      width: '100%',
      borderBottomWidth: hp(0.2),
      borderBottomColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    phoneIconWrap: {
      width: hp(8.5),
      height: hp(8.5),
      borderRadius: hp(14),
      justifyContent: 'center',
      marginBottom: hp(2),
    },
    phoneIcon: {
      width: hp(4.5),
      height: hp(4.5),
      alignSelf: 'center',
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    status: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + '90',
      marginBottom: hp(1.5),
    },
    bottomCard: {
      backgroundColor: theme.white + '10',
      position: 'absolute',
      left: wp(5),
      right: wp(5),
      bottom: hp(6),
      borderRadius: 24,
      paddingVertical: hp(3.5),
      paddingHorizontal: wp(4),
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: hp(2),
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    controlButtonWrap: {
      alignItems: 'center',
      flex: 1,
      minWidth: wp(20),
    },
    controlButtonGlass: {
      width: hp(7),
      height: hp(7),
      borderRadius: hp(7),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white + '20',
    },
    controlLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.5),
      color: theme.white,
      marginTop: hp(0.8),
    },
    crisisButtonWrap: {
      alignItems: 'center',
      alignSelf: 'center',
    },
    crisisButtonGlass: {
      width: hp(7),
      height: hp(7),
      borderRadius: hp(999),
      backgroundColor: theme.red,
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonIcon: {
      width: hp(3),
      height: hp(3),
      resizeMode: 'contain',
      tintColor: theme.white,
      alignSelf: 'center',
    },
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
      <ScreenHeader title="" onBackPress={handleBack} showBackButton />
      <View style={styles.container}>
        <View style={styles.center}>
          <GlassView opacity={0.07} glassStyles={styles.phoneIconWrap}>
            <Image source={callIcon} style={styles.phoneIcon} resizeMode="contain" />
          </GlassView>
          <Text
            style={[
              styles.title,
              { marginBottom: !isConnecting && !isActive ? hp(1) : hp(0.5) },
            ]}
          >
            {!isConnecting && !isActive
              ? t('ActiveCall.incoming')
              : t('ActiveCall.outgoingCall')}
          </Text>
          <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white + '90', marginBottom: !isConnecting && !isActive ? hp(2) : hp(1) }}>
            {t('ActiveCall.subtitle')}
          </Text>
          {!isConnecting && isActive && <Text style={styles.status}>{statusText}</Text>}
          {!isConnecting && isActive && (
            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: theme.white + '50', marginTop: hp(0.5), marginBottom: hp(1) }}>
              $0.69/min · voice
            </Text>
          )}
        </View>

        {/* Low-minutes warning */}
        {showLowMinutesWarning && !lowMinutesDismissed && (
          <View style={{ backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 0.5, borderColor: 'rgba(245,158,11,0.4)', borderRadius: hp(2), padding: hp(2), marginBottom: hp(1.5), alignItems: 'center' }}>
            <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: '#FCD34D', marginBottom: hp(0.5) }}>⚠️ Less than 2 minutes remaining</Text>
            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: theme.white + '60', marginBottom: hp(1.5), textAlign: 'center' }}>Your wallet is running low. Add funds to keep going.</Text>
            <View style={{ flexDirection: 'row', gap: wp(2), width: '100%' }}>
              <TouchableOpacity
                onPress={() => { setLowMinutesDismissed(true); setShowLowMinutesWarning(false); }}
                style={{ flex: 1, paddingVertical: hp(1), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.5), color: theme.white }}>Keep talking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowEndSessionModal(true)}
                style={{ flex: 1, paddingVertical: hp(1), backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(245,158,11,0.4)', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.5), color: '#FCD34D' }}>Wrap up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <GlassView bordered glassStyles={styles.bottomCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlButtonWrap}>
              <Button
                borderedGlassButton
                title=""
                onPress={handleMute}
                glassStyles={styles.controlButtonGlass}
                buttonStyle={{}}
                titleStyle={{}}
                leftIcon={isMuted ? muted : microphoneIcon}
                iconStyle={styles.controlButtonIcon}
                disabled={false}
              />
              <Text style={styles.controlLabel}>
                {isMuted ? t('ActiveCall.muted') : t('ActiveCall.mute')}
              </Text>
            </View>
            <View style={styles.controlButtonWrap}>
              <Button
                borderedGlassButton
                title=""
                onPress={handleSpeakerToggle}
                glassStyles={{
                  ...styles.controlButtonGlass,
                  backgroundColor: isSpeakerOn ? theme.magenda : theme.white + '20',
                }}
                buttonStyle={{}}
                titleStyle={{}}
                leftIcon={speakerIcon}
                iconStyle={styles.controlButtonIcon}
                disabled={false}
              />
              <Text style={styles.controlLabel}>
                {!isSpeakerOn ? t('ActiveCall.speakerOn') : t('ActiveCall.speakerOff')}
              </Text>
            </View>
            <View style={styles.controlButtonWrap}>
              <Button
                borderedGlassButton
                title=""
                onPress={() => setShowEndSessionModal(true)}
                glassStyles={styles.controlButtonGlass}
                buttonStyle={{}}
                titleStyle={{}}
                leftIcon={x}
                iconStyle={{ width: hp(3), height: hp(3) }}
                disabled={false}
              />
              <Text style={styles.controlLabel}>{t('ActiveCall.end')}</Text>
            </View>
          </View>

          <View style={styles.crisisButtonWrap}>
            <Button
              borderedGlassButton
              title=""
              onPress={handleCrisis}
              glassStyles={styles.crisisButtonGlass}
              buttonStyle={{}}
              titleStyle={{}}
              leftIcon={x}
              iconStyle={{ transform: [{ rotate: '45deg' }] }}
              disabled={false}
            />
            <Text style={styles.controlLabel}>{t('ActiveCall.crisis')}</Text>
          </View>
        </GlassView>

        {/* End Session Modal */}
        <GlassModal
          visible={showEndSessionModal}
          onClose={() => setShowEndSessionModal(false)}
          showIcon={false}
          title={t('VenterChat.endSessionTitle')}
          message={t('VenterChat.endSessionMessage')}
          showButtons
          primaryButtonText={t('VenterChat.endSessionYes')}
          secondaryButtonText={t('VenterChat.endSessionNo')}
          onPrimaryPress={handleEndCallConfirmed}
          onSecondaryPress={() => setShowEndSessionModal(false)}
          dismissOnOverlayPress={false}
          dismissOnBackPress
        />

      </View>
      {showVenterCrisisOverlay && (
        <GlassModal visible={showVenterCrisisOverlay} showButtons={false} >
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
      )}
    </HomeWrapper>
  );
};

export default VenterActiveCallScreen;
