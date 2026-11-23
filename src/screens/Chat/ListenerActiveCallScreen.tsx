import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, useColorScheme, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch, useStore } from 'react-redux';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { getGlassColors } from '../../utils/glassColors';
import { routes } from '../../navigation/routes';
import { callIcon, microphoneIcon, muted, x, speakerIcon } from '../../assets/icons';
import { endCall as endCallAction, sessionStarted, setMuted, setCrisisEnded, setAgoraCallData } from '../../store/slices/callSlice';
import type { RootState } from '../../store/store';
import { Button, ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import socketService from '../../sockets';
import { apiInstance } from '../../api';

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ListenerActiveCallScreen = ({ route }: any) => {
  const { showAcceptRejectBtns = false, callerName, call } = route.params || {};
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const isDark = useColorScheme() === 'dark';

  const { isActive, startTime, isMuted, agoraCallData } = useSelector((state: RootState) => state.call);
  const crisisEnded = useSelector((state: RootState) => state.call.crisisEnded);
  const sessionInfo = useSelector((state: RootState) => state.session);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(!showAcceptRejectBtns);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [crisisStep, setCrisisStep] = useState(0);
  
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
  } = useAgora({ appId: callAppId || undefined,
    onJoinChannelSuccess: (channel, uid) => {
      console.log('[ListenerActiveCall] Joined channel', channel, 'uid', uid);
      dispatch(sessionStarted());
    },
    onUserOffline: (uid) => {
      console.log('[ListenerActiveCall] Remote user left:', uid);
      // We no longer navigate onUserOffline to avoid race conditions with backend socket events.
      // Navigation is strictly handled by the 'call:ended' and 'session:ended' socket listeners.
    },
  });

  const channelName = call?.channelName ?? agoraCallData?.channelName;
  const callToken = call?.token ?? agoraCallData?.token;
  const callUid = call?.uid ?? agoraCallData?.uid ?? 0;
  const callAppId = call?.agoraAppId ?? agoraCallData?.agoraAppId ?? undefined;

  // ── Join Agora channel on mount or via socket call:ready ──
  useEffect(() => {
    // Try to join immediately if we have params
    if (callToken && channelName) {
      console.log('[ListenerActiveCall] Joining with nav params:', channelName, 'uid:', callUid);
      joinChannel({ token: callToken, channelName, uid: callUid });
    }

    // Also listen for call:ready from backend socket
    const handleCallReady = (data: any) => {
      console.log('[ListenerActiveCall] call:ready received:', data);
      if (data?.token && data?.channelName) {
        dispatch(setAgoraCallData({
          token: data.token,
          channelName: data.channelName,
          uid: data.uid ?? data.agoraUid ?? 2,
          agoraAppId: data.agoraAppId ?? null,
        }));
        joinChannel({
          token: data.token,
          channelName: data.channelName,
          uid: data.uid ?? data.agoraUid ?? 2,
        });
      }
    };

    socketService.on('call:ready', handleCallReady);
    return () => {
      socketService.off('call:ready', handleCallReady);
    };
  }, []);

  // ── Join Socket Room ──
  useEffect(() => {
    if (call?.id) {
      console.log('[ListenerActiveCall] emit call:joined', { callId: call.id });
      socketService.emit('call:joined', { callId: call.id });
    }
  }, [call?.id]);

  // ── Check call status when app comes to foreground ──
  useEffect(() => {
    const { AppState } = require('react-native');
    const subscription = AppState.addEventListener('change', async (state: string) => {
      if (state === 'active' && sessionInfo?.sessionId && !hasEndedRef.current) {
        try {
          const res = await apiInstance.get(`calls/${sessionInfo.sessionId}/status`);
          if (res?.data?.call?.status === 'ended') {
            leaveAndNavigateRef.current();
          }
        } catch { /* ignore */ }
      }
    });
    return () => subscription.remove();
  }, [sessionInfo?.sessionId]);

  // ── Poll call status every 10s as fallback for missed call:ended events ──
  useEffect(() => {
    if (!sessionInfo?.sessionId) return;
    const interval = setInterval(async () => {
      if (hasEndedRef.current) return;
      try {
        const res = await apiInstance.get(`calls/${sessionInfo.sessionId}`);
        if (res?.data?.call?.status === 'ended') {
          leaveAndNavigateRef.current();
        }
      } catch { /* ignore */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [sessionInfo?.sessionId]);

  // ── Reset stale crisisEnded flag on mount ──
  useEffect(() => {
    dispatch(setCrisisEnded(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // ── Timer ──
  useEffect(() => {
    if (!isActive || startTime == null) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // ── Leave Agora + navigate to feedback ──
  const leaveAndNavigate = useCallback(() => {
    leaveChannel();
    dispatch(endCallAction());
    (navigation as any).replace(routes.listenerSessionFeedback);
  }, [leaveChannel, dispatch, navigation, call]);

  leaveAndNavigateRef.current = leaveAndNavigate;

  // ── End call: tell backend, leave Agora, navigate ──
  const handleEndCallConfirmed = async () => {
    setShowEndSessionModal(false);
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    console.log('[ListenerActiveCall] handleEndCallConfirmed', call);
    console.log('[ListenerActiveCall] sessionInfo============>', sessionInfo);
    if (sessionInfo?.sessionId) {
      try {
        await apiInstance.post(`calls/${sessionInfo?.sessionId}/end`);
      } catch (err) {
        console.log('[ListenerActiveCall] End call API error (non-blocking):', err);
      }
    }

    leaveAndNavigate();
  };

  // ── Accept / Decline (incoming call on listener side) ──
  const handleAcceptCall = () => {
    dispatch(sessionStarted());
    setIsCallAccepted(true);
  };

  const handleDeclineCall = () => {
    leaveChannel();
    navigation.goBack();
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
    (navigation as any).navigate(routes.listenerHomeTab, {
      screen: routes.listenerRequests,
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
    setCrisisStep(1);
  };

  // ── Listener confirms crisis ──
  const handleListenerCrisisConfirm = () => {
 
    const callId = sessionInfo?.sessionId;
    console.log('[ListenerActiveCall] handleListenerCrisisConfirm', callId);
    console.log('[ListenerActiveCall] crisis confirmed, emitting session:crisis_end', { callId });
    dispatch(endCallAction());
    hasEndedRef.current = true;
    socketService.emit('session:crisis_end', { callId });
    // Delay leaveChannel so session:ended reaches venter before Agora fires onUserOffline there
    setTimeout(() => leaveChannel(), 2000);
    setCrisisStep(2);
  };

  // ── Listener dismisses "Crisis Activated" ──
  const handleCrisisActivatedDismiss = () => {
    setCrisisStep(0);
    (navigation as any).navigate(routes.listenerHomeTab);
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
            <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: '#4CAF50', opacity: 0.8, marginTop: hp(0.5), marginBottom: hp(0.5) }}>
              💰 Earning per minute
            </Text>
          )}
              </View>

        <GlassView bordered glassStyles={styles.bottomCard}>
          <View style={styles.controlRow}>
            {!isCallAccepted ? (
              <>
                <View style={styles.controlButtonWrap}>
                  <Button
                    borderedGlassButton
                    title=""
                    onPress={handleDeclineCall}
                    glassStyles={{
                      ...styles.controlButtonGlass,
                      backgroundColor: theme.red,
                    }}
                    buttonStyle={{}}
                    titleStyle={{}}
                    leftIcon={callIcon}
                    iconStyle={{
                      ...styles.controlButtonIcon,
                      transform: [{ rotate: '135deg' }],
                    }}
                    disabled={false}
                  />
                  <Text style={styles.controlLabel}>{t('ActiveCall.decline')}</Text>
                </View>
                <View style={styles.controlButtonWrap}>
                  <Button
                    borderedGlassButton
                    title=""
                    onPress={handleAcceptCall}
                    glassStyles={{
                      ...styles.controlButtonGlass,
                      backgroundColor: theme.success,
                    }}
                    buttonStyle={{}}
                    titleStyle={{}}
                    leftIcon={callIcon}
                    iconStyle={styles.controlButtonIcon}
                    disabled={false}
                  />
                  <Text style={styles.controlLabel}>
                    {t('ActiveCall.accept') || 'Accept'}
                  </Text>
                </View>
              </>
            ) : (
              <>
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
              </>
            )}
          </View>

          {isCallAccepted && (
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
          )}
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

        {/* Listener crisis — Step 1: "Is The Venter In Crisis?" */}
        {crisisStep === 1 && (
          <GlassModal
            visible={true}
            title={t('ListenerCrisis.confirmTitle', 'Is The Venter In Crisis?')}
            message={t('ListenerCrisis.confirmMessage', 'If the venter mentions self-harm, suicide, or immediate danger, you must escalate immediately. Failure to report safety risks may result in suspension or permanent removal from Ventally.')}
            primaryButtonText={t('Common.yes', 'Yes')}
            secondaryButtonText={t('Common.no', 'No')}
            onPrimaryPress={handleListenerCrisisConfirm}
            onSecondaryPress={() => setCrisisStep(0)}
            dismissOnOverlayPress={false}
          />
        )}

        {/* Listener crisis — Step 2: "Crisis Support Activated" */}
        {crisisStep === 2 && (
          <GlassModal
            visible={true}
            title={t('ListenerCrisis.activatedTitle', 'Crisis Support Activated')}
            message={t('ListenerCrisis.activatedMessage', 'The venter is being connected to 988 crisis support now.')}
            primaryButtonText={t('ListenerCrisis.okay', 'Okay')}
            onPrimaryPress={handleCrisisActivatedDismiss}
            dismissOnOverlayPress={false}
            bottomAttachedBtn
          />
        )}

      </View>
    </HomeWrapper>
  );
};

export default ListenerActiveCallScreen;
