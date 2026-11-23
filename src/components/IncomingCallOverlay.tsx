import React, { useEffect, useState } from 'react';
import { Vibration, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { hp } from '../utils/size';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeRequest, clearRequests } from '../store/slices/listenerSlice';
import { navigationRef, dismissedRequestIds } from '../navigation/index';
import { routes } from '../navigation/routes';
import apiInstance from '../api/apiInstance';
import { sessionStarted, chatSessionStarted, setAgoraCallData } from '../store/slices/callSlice';
import { setSessionInfo } from '../store/slices/sessionSlice';
import GlassModal from './shared/GlassModal';
import { callIcon, messagesIcon } from '../assets/icons';
import { stopForegroundSessionLoop } from '../hooks/UseNotifications';

export const IncomingCallOverlay = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state: RootState) => state.listener.requests);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const currentRequest = requests.find(r => r.type === 'call') || requests[0];

  useEffect(() => {
    if (!isVenter && requests.length > 0) {
      setVisible(true);
      // Only start vibration if not already visible (new request)
      Vibration.vibrate([500, 500, 500, 500, 500, 500, 500, 500, 500, 500]);
    } else {
      setVisible(false);
      setMinimized(false);
      Vibration.cancel();
    }
  }, [requests, isVenter]);

  if (!currentRequest) return null;

  const handleAccept = async () => {
    if (!currentRequest) return;
    stopForegroundSessionLoop();
    dismissedRequestIds.add(currentRequest.id);
    try {
      if (currentRequest.type === 'call') {
        const res = await apiInstance.post(`calls/${currentRequest.id}/accept`);
        const callData = res?.data?.call ?? res?.data ?? {};
        dispatch(setAgoraCallData({
          token: callData.token ?? null,
          channelName: callData.channelName ?? null,
          uid: callData.uid ?? callData.agoraUid ?? 2,
          agoraAppId: callData.agoraAppId ?? null,
        }));
        dispatch(removeRequest(currentRequest.id));
        dispatch(sessionStarted({ sessionId: callData.id ?? callData.callId ?? currentRequest.requestId ?? currentRequest.id }));
        dispatch(setSessionInfo({
          sessionId: currentRequest.requestId ?? currentRequest.id ?? null,
          requestId: currentRequest.requestId ?? null,
          venterId: currentRequest.venterId ?? null,
          listenerId: currentRequest.listenerId ?? null,
          sessionType: 'call',
          data: currentRequest,
        }));
        setVisible(false);
        setMinimized(false);
        Vibration.cancel();
        navigationRef.current?.navigate(routes.activeCall as never, {
          call: {
            token: callData.token,
            channelName: callData.channelName,
            roomName: callData.channelName,
            uid: callData.uid ?? callData.agoraUid ?? 2,
            agoraAppId: callData.agoraAppId ?? null,
            id: callData.id ?? callData.callId,
          },
          showAcceptRejectBtns: false,
          callerName: currentRequest.title,
          role: 'listener',
        } as never);
      } else {
        const res = await apiInstance.post(`conversations/${currentRequest.id}/accept`);
        const conversation = res?.data?.conversation ?? res?.data;
        dispatch(removeRequest(currentRequest.id));
        dispatch(chatSessionStarted({ chatData: res?.data, chatStartTime: Date.now() }));
        dispatch(setSessionInfo({
          sessionId: conversation?.id ?? currentRequest.id ?? null,
          requestId: currentRequest.requestId ?? null,
          venterId: conversation?.venterId ?? currentRequest.venterId ?? null,
          listenerId: currentRequest.listenerId ?? null,
          sessionType: 'chat',
          data: conversation,
        }));
        setVisible(false);
        setMinimized(false);
        Vibration.cancel();
        navigationRef.current?.navigate(routes.chatStack as never, {
          screen: routes.chat,
          params: {
            chat: conversation,
            headerRight: () => null,
          },
        } as never);
      }
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleDecline = async () => {
    if (!currentRequest) return;
    stopForegroundSessionLoop();
    dismissedRequestIds.add(currentRequest.id);
    dispatch(removeRequest(currentRequest.id));
    setVisible(false);
    setMinimized(false);
    Vibration.cancel();
    try {
      if (currentRequest.type === 'call') {
        await apiInstance.post(`calls/${currentRequest.id}/decline`);
      } else {
        await apiInstance.post(`conversations/${currentRequest.id}/decline`);
      }
    } catch (_) {
      // Best-effort — overlay is already dismissed locally
    }
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleExpand = () => {
    setMinimized(false);
  };

  const isCall = currentRequest.type === 'call';
  const callerName = currentRequest.title ?? 'Anonymous';
  const ratePerMinute = currentRequest.ratePerMinute;
  const rateDisplay = ratePerMinute
    ? `$${Number(ratePerMinute).toFixed(2)}/min`
    : isCall ? '$0.15–$0.20/min' : '$0.15–$0.20/min';

  // Minimized banner — absolutely positioned, passes touches through except on the banner itself
  if (visible && minimized) {
    return (
      <View style={styles.bannerContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleExpand}
          style={styles.banner}
        >
          <View style={styles.bannerInner}>
            <View style={styles.bannerLeft}>
              <View style={styles.pulsingDot} />
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerLabel}>{isCall ? 'Incoming Call' : 'Incoming Chat'}</Text>
                <Text style={styles.bannerName} numberOfLines={1}>{callerName}</Text>
              </View>
            </View>
            <View style={styles.bannerButtons}>
              <TouchableOpacity
                style={[styles.bannerBtn, styles.bannerDeclineBtn]}
                onPress={handleDecline}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              >
                <Text style={styles.bannerBtnText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bannerBtn, styles.bannerAcceptBtn]}
                onPress={handleAccept}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <Text style={styles.bannerBtnText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Full overlay — GlassModal with minimize button as headerRight and payout rate as children
  return (
    <GlassModal
      visible={visible}
      onClose={handleDecline}
      dismissOnOverlayPress={false}
      icon={isCall ? callIcon : messagesIcon}
      title={isCall ? 'Incoming Voice Session' : 'Incoming Chat Session'}
      subtitle={callerName}
      showButtons={true}
      showVerticalButtons={false}
      primaryButtonText="Accept"
      secondaryButtonText="Decline"
      onPrimaryPress={handleAccept}
      onSecondaryPress={handleDecline}
      headerRight={
        <TouchableOpacity
          onPress={handleMinimize}
          style={styles.minimizeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={styles.minimizeBtnText}>–</Text>
        </TouchableOpacity>
      }
    >
      <View style={{ alignItems: 'center', marginTop: -4, marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(76,175,80,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: 'rgba(76,175,80,0.4)' }}>
          <Text style={{ color: '#4CAF50', fontSize: 13, fontWeight: '600' }}>💰 You earn {rateDisplay}</Text>
        </View>
      </View>
    </GlassModal>
  );
};

const BANNER_HEIGHT = 64;
const BANNER_TOP = Platform.OS === 'ios' ? 50 : 36;

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 20,
    pointerEvents: 'box-none',
  } as any,
  banner: {
    position: 'absolute',
    top: BANNER_TOP,
    left: 12,
    right: 12,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 19, 19, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bannerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bannerName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  bannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDeclineBtn: {
    backgroundColor: 'rgba(244, 67, 54, 0.85)',
  },
  bannerAcceptBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.85)',
  },
  bannerBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  minimizeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  minimizeBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 22,
    marginTop: -1,
  },
});
