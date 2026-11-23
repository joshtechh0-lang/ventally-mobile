import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import HomeWrapper from '../../wrapper/HomeWrapper';
import PermissionRequest from '../../components/PermissionRequest';
import GlassModal from '../../components/shared/GlassModal';
import { callIcon, sessionStartedIcon, chatSingleIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { startCall, sessionStarted, chatSessionStarted, setAgoraCallData } from '../../store/slices/callSlice';
import { setSessionInfo } from '../../store/slices/sessionSlice';
import { deductBalance } from '../../store/slices/userSlice';
import type { RootState } from '../../store/store';
import apiInstance from '../../api/apiInstance';
import { SESSION_COST } from '../../constants/payment';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import socketService from '../../sockets';
import { toastError } from '../../utils/toast';
import { Button } from '../../components';

const FindingListenerScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslationWithUpdate();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const { theme } = useTheme()
  const sessionType = useSelector((state: RootState) => state.call.sessionType);
  const paymentMode: 'member' | 'ad' | 'payg' = route?.params?.paymentMode ?? 'payg';
  const routeWallet = route?.params?.walletBalance;
  const routeSubscription = route?.params?.subscription;
  const hasNavigated = useRef(false);
  const [listners, setListners] = useState<any>([]);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const usedListenerIds = useRef<string[]>([]);
  const socket = socketService;
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  console.log("listnersChat", listners);
  const handleReturnHome = () => {
    // Notify server to stop broadcasting our request
    if (sessionType) {
      socket.emit("requests:cancel", { type: sessionType });
    }
    navigation.goBack();
  };

  const handleTimerComplete = () => {
    // Timer ran out without finding a match
    setShowTimeoutModal(true);
  };

  const handleRetry = () => {
    setShowTimeoutModal(false);
    // Restart search
    if (sessionType) {
      socket.emit("requests:broadcast", { type: sessionType, paymentMode: 'payg' });
      // Increment key to remount PermissionRequest and reset timer
      setTimerKey(prev => prev + 1);
    }
  };

  const handleCancelSearch = () => {
    setShowTimeoutModal(false);
    handleReturnHome();
  };

  const isCall = sessionType === 'call';
  const isChat = sessionType === 'chat';

  // Eligibility (subscription minutes/messages or wallet balance) is validated
  // by the originating handler in VenterHome/VenterCall/VenterMessages before
  // navigating here. We just emit the broadcast; the server is the final
  // authority via the 'requests:broadcast:insufficient-balance' event below.
  useEffect(() => {
    if (!sessionType) return;
    socket.emit('requests:broadcast', { type: sessionType, paymentMode: 'payg' });
  }, [sessionType]);

  // Fetch online listener count
  useEffect(() => {
    apiInstance.get('availability/listeners')
      .then((res: any) => {
        setOnlineCount(res?.data?.count ?? 0);
      })
      .catch(() => setOnlineCount(0));
  }, []);

  useEffect(() => {
    socket.on("requests:broadcast:insufficient-balance", (data: any) => {
      console.log("chat message blocked:", JSON.stringify(data, null, 2));
      setShowLowBalanceModal(true)
    });
    // Show the timeout modal immediately when server confirms no listeners online,
    // instead of waiting the full 2-minute timer
    socket.on("requests:broadcast:no-listeners", () => {
      setShowTimeoutModal(true);
    });
    return () => {
      socket.off("requests:broadcast:insufficient-balance");
      socket.off("requests:broadcast:no-listeners");
    };
  }, []);




  // useEffect(() => {

  // }, [isCall, isChat])
  useEffect(() => {
    socket.on("call:accepted", (data: any) => {
      console.log("Call accepted:", JSON.stringify(data, null, 2));
      if (hasNavigated.current) return;
      dispatch(sessionStarted({ sessionId: data.id || data.callId }));
      dispatch(setSessionInfo({
        sessionId: data.id || data.callId || null,
        requestId: data.id || data.callId || null,
        venterId: data.venterId || null,
        listenerId: data.listenerId || null,
        sessionType: 'call',
        data,
      }));
      // Balance deduction handled by backend PAYG billing
      hasNavigated.current = true;
      setShowSessionModal(false);
      // Testing only: hardcoded so both users join the same call
      dispatch(setAgoraCallData({
        token: data?.token ?? null,
        channelName: data?.channelName ?? null,
        uid: data?.uid ?? data?.agoraUid ?? 1,
        agoraAppId: data?.agoraAppId ?? null,
      }));
      (navigation as any).replace(routes.activeCall, {
        call: { ...data, token: data?.token, channelName: data?.channelName, roomName: data?.channelName, uid: data?.uid ?? data?.agoraUid ?? 1 },
        role: 'venter',
      });
    });

    socket.on("chat:accepted", (data: any) => {
      console.log("chat accepted:", JSON.stringify(data, null, 2));
      if (hasNavigated.current) return;
      dispatch(chatSessionStarted({ chatData: data, chatStartTime: Date.now() }));
      dispatch(setSessionInfo({
        sessionId: data.conversationId || data.conversation?.id || null,
        requestId: data.conversationId || data.conversation?.id || null,
        venterId: data.conversation?.venterId || null,
        listenerId: data.listenerId || data.listener?.id || null,
        sessionType: 'chat',
        data,
      }));
      // Balance deduction handled by backend PAYG billing
      hasNavigated.current = true;
      setShowSessionModal(false);
      //@ts-ignore
      navigation.replace(routes.chat as never, { chat: data });
    });
    return () => {
      socket.off("call:accepted");
      socket.off("chat:accepted");
    };
  }, []);

  // Call flow: start call state on mount


  // Session started modal + navigate after delay
  useEffect(() => {
    // Prevent re-running if we've already navigated (e.g. endCall() sets sessionType to null)
    if (hasNavigated.current) return;

    return () => {
      // If we are unmounting but haven't successfully started a session
      if (!hasNavigated.current && sessionType) {
        socket.emit("requests:cancel", { type: sessionType });
      }
    };
  }, [navigation, dispatch, sessionType]);

  const handleAddFunds = () => {
   if(Platform.OS === 'ios'){ (navigation as any).navigate(routes.venterInternal, {
      screen: routes.venterMySubscription,
    });}else{
    (navigation as any).dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: routes.venterHomeTab,
            state: {
              routes: [{ name: routes.venterWallet }],
            },
          },
        ],
      }),
    );
  }
  }

  return (
    <HomeWrapper>
      {showLowBalanceModal ?


        <View style={{ flex: 1 }}>
          <PermissionRequest
            icon={isChat ? chatSingleIcon : callIcon}
            title={isChat ? t('VenterFindingListener.chatTitle') : t('VenterFindingListener.title')}
            description={t('VenterPaymentCheck.insufficientMessage')}
            buttonText={t('VenterPaymentCheck.addFunds')}
            onAllow={handleAddFunds}
            privacyText={""}
          />
          <View style={{ justifyContent: "center", alignItems: "center", padding: hp(3) }}>
            <Button
              onPress={handleReturnHome}
              title={t('VenterFindingListener.buttonText')}
              buttonStyle={{}}
              titleStyle={{}}
              glassStyles={{}}
              disabled={false}
              leftIcon={undefined}
              iconStyle={{}}
            />
          </View>


        </View>



        : <View style={{ flex: 1 }}>
          {showSessionModal ?
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: hp(3) }}>
              <GlassView bordered glassStyles={{ width: "100%", backgroundColor: theme.black + "10", padding: hp(2) }}>

                <View style={{
                  justifyContent: "center", alignItems: "center", alignSelf: "center", width: "100%"
                }}>
                  <Image source={sessionStartedIcon} style={{ width: hp(3), height: hp(3), resizeMode: 'contain', alignSelf: 'center', marginBottom: hp(2) }}
                  />
                  <Text style={{
                    color: theme.white,
                    fontSize: hp(2),
                    fontFamily: fontFamilies.medium,
                    marginBottom: hp(1)
                  }}>{t('VenterFindingListener.sessionStarted.title')}</Text>
                  <Text style={{
                    color: theme.white,
                    fontSize: hp(1.6),
                    fontFamily: fontFamilies.normal,
                  }}>
                    {t('VenterFindingListener.sessionStarted.subtitle')}
                  </Text>
                </View>

              </GlassView>
            </View> :
            <View>
              {/* Payment mode pill */}
              <View style={{ alignItems: 'center', paddingTop: hp(2) }}>
                {paymentMode === 'member' && (() => {
                  const memberMins = routeWallet?.member_minutes ?? routeWallet?.minutes ?? 0;
                  const rolloverMins = routeWallet?.rollover_minutes ?? 0;
                  const total = Math.floor(memberMins + rolloverMins);
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), backgroundColor: 'rgba(136,80,255,0.15)', borderRadius: hp(999), paddingHorizontal: wp(4), paddingVertical: hp(0.8), borderWidth: 0.5, borderColor: 'rgba(136,80,255,0.35)' }}>
                      <Text style={{ fontSize: hp(1.5) }}>⏱</Text>
                      <Text style={{ color: 'rgba(170,120,255,1)', fontSize: hp(1.5), fontFamily: fontFamilies.medium }}>Using {total} member minutes</Text>
                    </View>
                  );
                })()}
                {paymentMode === 'ad' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: hp(999), paddingHorizontal: wp(4), paddingVertical: hp(0.8), borderWidth: 0.5, borderColor: 'rgba(76,175,80,0.35)' }}>
                    <Text style={{ fontSize: hp(1.5) }}>🎁</Text>
                    <Text style={{ color: 'rgba(100,220,100,1)', fontSize: hp(1.5), fontFamily: fontFamilies.medium }}>Using your ad reward · {routeWallet?.ad_minutes ?? 0} free minutes</Text>
                  </View>
                )}
                {paymentMode === 'payg' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: hp(999), paddingHorizontal: wp(4), paddingVertical: hp(0.8), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' }}>
                    <Text style={{ fontSize: hp(1.5) }}>💳</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: hp(1.5), fontFamily: fontFamilies.medium }}>{isCall ? '$0.69/min · voice' : '$0.39/min · chat'}</Text>
                  </View>
                )}
              </View>
              <PermissionRequest
                key={`timer-${timerKey}`}
                icon={isChat ? chatSingleIcon : callIcon}
                title={isChat ? t('VenterFindingListener.chatTitle') : t('VenterFindingListener.title')}
                description={t('FindingListener.supportersOnlineWait')}
                buttonText={t('VenterFindingListener.buttonText')}
                onAllow={handleReturnHome}
                showLoading
                timer={120}
                onTimerComplete={handleTimerComplete}
                privacyText={""}
              />
            </View>}

        </View>}

      <GlassModal
        visible={showTimeoutModal}
        onClose={handleCancelSearch}
        showIcon={false}
        title={'No listeners available right now'}
        message={t('FindingListener.noListenersMessage')}
        showButtons={true}
        primaryButtonText={t('Common.retry', { defaultValue: 'Retry' })}
        onPrimaryPress={handleRetry}
        secondaryButtonText={t('Common.cancel', { defaultValue: 'Cancel' })}
        onSecondaryPress={handleCancelSearch}
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
      />
    </HomeWrapper>
  );
};

export default FindingListenerScreen;

