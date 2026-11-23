import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import Button from '../../components/Button';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { apiInstance } from '../../api';
import { removeRequest } from '../../store/slices/listenerSlice';
import { chatSessionStarted, sessionStarted, setJustAccepted, setAgoraCallData } from '../../store/slices/callSlice';
import { setSessionInfo } from '../../store/slices/sessionSlice';
import { toastError } from '../../utils/toast';

/**
 * Dedicated screen shown when the listener taps a session_request notification
 * from the killed state. Fetches calls/pending itself — no overlay, no race
 * conditions with Redux rehydration.
 */
const IncomingRequestScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // requestId is passed when coming from the Activity tab (a specific card tap).
  // requestGroupId is passed from notification taps so we can pin-point the exact
  // call via the backend even if the time window has elapsed.
  const route = useRoute();
  const routeRequestId = (route?.params as any)?.requestId ?? null;
  const routeRequestGroupId = (route?.params as any)?.requestGroupId ?? null;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const tryFetch = async (): Promise<boolean> => {
      try {
        const url = routeRequestGroupId
          ? `calls/pending?requestGroupId=${encodeURIComponent(routeRequestGroupId)}`
          : 'calls/pending';
        const res = await apiInstance.get(url);
        const pending = res?.data?.requests ?? [];
        if (pending.length > 0) {
          const raw = routeRequestId
            ? (pending.find((r: any) => (r.requestId ?? r.id) === routeRequestId) ?? pending[0])
            : pending[0];
          if (!cancelled) {
            setRequest({
              id: raw.requestId ?? raw.id,
              type: raw.requestType === 'call' ? 'call' : 'message',
              title: raw.requester?.anonymousName ?? 'Anonymous',
              requestType: raw.requestType ?? null,
              requestId: raw.requestId ?? raw.id ?? null,
              venterId: raw.requester?.id ?? raw.venterId ?? null,
              listenerId: raw.listenerId ?? null,
              ratePerMinute: raw.ratePerMinute ?? null,
            });
          }
          return true;
        }
        return false;
      } catch (_) {
        return false;
      }
    };

    // Retry up to ~10s to handle cold-start auth/token delays.
    // Only show "expired" after all retries fail.
    const RETRY_DELAYS = [0, 1500, 3000, 5000, 8000, 10000];
    let attempt = 0;

    const runNext = async () => {
      if (cancelled) return;
      const found = await tryFetch();
      if (found) {
        if (!cancelled) setLoading(false);
        return;
      }
      attempt++;
      if (attempt < RETRY_DELAYS.length) {
        setTimeout(runNext, RETRY_DELAYS[attempt]);
      } else {
        if (!cancelled) {
          setExpired(true);
          setLoading(false);
        }
      }
    };

    runNext();

    return () => { cancelled = true; };
  }, [routeRequestId, routeRequestGroupId]);

  const handleAccept = async () => {
    if (!request) return;
    setActioning(true);
    try {
      if (request.type === 'call') {
        const res = await apiInstance.post(`calls/${request.id}/accept`);
        dispatch(removeRequest(request.id));
        dispatch(sessionStarted({ sessionId: request.requestId ?? request.id }));
        dispatch(setSessionInfo({
          sessionId: request.requestId ?? request.id ?? null,
          requestId: request.requestId ?? null,
          venterId: request.venterId ?? null,
          listenerId: request.listenerId ?? null,
          sessionType: 'call',
          data: request,
        }));
        dispatch(setAgoraCallData({
          token: res?.data?.call?.token ?? null,
          channelName: res?.data?.call?.channelName ?? null,
          uid: res?.data?.call?.uid ?? res?.data?.call?.agoraUid ?? 2,
          agoraAppId: res?.data?.call?.agoraAppId ?? null,
        }));
        dispatch(setJustAccepted(true));
        (navigation as any).replace(routes.chatStack, {
          screen: routes.activeCall,
          params: {
            call: {
              token: res?.data?.call?.token,
              channelName: res?.data?.call?.channelName,
              roomName: res?.data?.call?.channelName,
              uid: res?.data?.call?.uid ?? res?.data?.call?.agoraUid ?? 0,
              agoraAppId: res?.data?.call?.agoraAppId ?? null,
            },
            showAcceptRejectBtns: false,
            callerName: request.title,
          },
        });
      } else {
        const res = await apiInstance.post(`conversations/${request.id}/accept`);
        dispatch(chatSessionStarted({ chatData: res?.data, chatStartTime: Date.now() }));
        dispatch(setSessionInfo({
          sessionId: request.requestId ?? request.id ?? null,
          requestId: request.requestId ?? null,
          venterId: request.venterId ?? null,
          listenerId: request.listenerId ?? null,
          sessionType: 'chat',
          data: res?.data,
        }));
        dispatch(removeRequest(request.id));
        (navigation as any).replace(routes.chatStack, {
          screen: routes.chat,
          params: { chat: res?.data, headerRight: () => null },
        });
      }
    } catch (err) {
      toastError({ text: (err as any)?.error ?? (err as any)?.message ?? 'Failed to accept request' });
      setActioning(false);
    }
  };

  const handleDecline = async () => {
    if (!request) return;
    setActioning(true);
    try {
      const endpoint = request.type === 'call'
        ? `calls/${request.id}/decline`
        : `conversations/${request.id}/decline`;
      await apiInstance.post(endpoint);
      dispatch(removeRequest(request.id));
    } catch (_) {}
    goHome();
  };

  const goHome = () => {
    (navigation as any).replace(routes.listenerHomeTab);
  };

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(8),
    },
    card: {
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderRadius: hp(2.5),
      padding: hp(3),
      width: '100%',
      alignItems: 'center',
    },
    emoji: {
      fontSize: hp(5),
      marginBottom: hp(2),
    },
    name: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.4),
      color: theme.white,
      marginBottom: hp(0.5),
      textAlign: 'center',
    },
    type: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.7),
      color: theme.white + '99',
      marginBottom: hp(3),
      textAlign: 'center',
    },
    actions: {
      width: '100%',
      gap: hp(1.5),
    },
    expiredText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white + 'CC',
      textAlign: 'center',
      marginBottom: hp(3),
    },
    expiredSub: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '66',
      textAlign: 'center',
      marginBottom: hp(4),
    },
  });

  return (
    <HomeWrapper>
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.white} />
        ) : expired || !request ? (
          <>
            <Text style={styles.expiredText}>No active requests</Text>
            <Text style={styles.expiredSub}>
              There are no pending session requests right now.
            </Text>
            <Button
              title="Go to Home"
              onPress={goHome}
              glassStyles={{ width: '100%', borderRadius: hp(2.5) }}
            />
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emoji}>
              {request.type === 'call' ? '📞' : '💬'}
            </Text>
            <Text style={styles.name}>{request.title}</Text>
            <Text style={styles.type}>
              {request.type === 'call' ? 'Incoming voice session' : 'Incoming chat session'}
            </Text>
            {/* Payout rate badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(76,175,80,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: 'rgba(76,175,80,0.4)', marginBottom: hp(2.5) }}>
              <Text style={{ color: '#4CAF50', fontSize: hp(1.5), fontFamily: fontFamilies.medium }}>
                💰 You earn {request.ratePerMinute ? `$${Number(request.ratePerMinute).toFixed(2)}/min` : '$0.15–$0.20/min'}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                title={actioning ? 'Accepting…' : 'Accept'}
                onPress={handleAccept}
                disabled={actioning}
                glassStyles={{ borderRadius: hp(2.5) }}
              />
              <Button
                title="Decline"
                onPress={handleDecline}
                disabled={actioning}
                glassStyles={{ borderRadius: hp(2.5) }}
                borderedGlassButton
              />
            </View>
          </View>
        )}
      </View>
    </HomeWrapper>
  );
};

export default IncomingRequestScreen;
