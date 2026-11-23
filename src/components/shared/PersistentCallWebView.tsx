import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import HomeWrapper from '../../wrapper/HomeWrapper';
import WebView from 'react-native-webview';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endCall } from '../../store/slices/callSlice';
import type { RootState } from '../../store/store';
import { routes } from '../../navigation/routes';
import socketService from '../../sockets';
import { useCalls } from '../../api';
import { endCallAndNavigate } from '../../utils/endCallFlow';

const WEB_BASE_URL = 'https://ventally-web-ten.vercel.app';

interface PersistentCallWebViewProps {
  navigationRef: NavigationContainerRefWithCurrent<any>;
}

const PersistentCallWebView: React.FC<PersistentCallWebViewProps> = ({ navigationRef }) => {
  const dispatch = useDispatch();
  const webViewRef = useRef<any>(null);
  const hasEndedRef = useRef(false);
  const [isHiding, setIsHiding] = useState(false);
  const { isConnecting, isActive, agoraCallData, sessionId } = useSelector((state: RootState) => state.call);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const { endCall: endCallApi } = useCalls();
  const [authToken, setAuthToken] = useState('');
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem('accessToken').then(t => { if (t) setAuthToken(t); });
  }, []);

  // Track current route so we know whether to show full-screen or stay hidden
  useEffect(() => {
    const getRouteName = () => {
      if (!navigationRef.isReady()) return undefined;
      const state = navigationRef.getRootState();
      if (!state) return undefined;
      const route = state.routes[state.index];
      if (route.state) {
        const nestedState = route.state as any;
        const nestedRoute = nestedState.routes[nestedState.index];
        return nestedRoute?.name;
      }
      return route.name;
    };
    setCurrentRouteName(getRouteName());
    const unsubscribe = navigationRef.addListener('state', () => {
      setCurrentRouteName(getRouteName());
    });
    return unsubscribe;
  }, [navigationRef]);

  // Reset the "already ended" guard whenever a fresh call starts. sessionId
  // is the reliable signal here — isConnecting may never actually flip true
  // in this app's real call flows (accept/initiate both jump straight to
  // sessionStarted, which sets isActive directly), so relying on it left
  // this guard permanently stuck true after the very first call ever ended.
  useEffect(() => {
    if (sessionId) {
      hasEndedRef.current = false;
      setIsHiding(false);
    }
  }, [sessionId]);

  const handleCallEnd = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setIsHiding(true); // Hide WebView immediately
    await endCallAndNavigate({
      sessionId,
      isVenter,
      navigationRef,
      dispatch,
      endCallAction: endCall,
      endCallApi,
    });
  };

  useEffect(() => {
    const onCallEnded = () => {
      webViewRef.current?.injectJavaScript(
        "window.dispatchEvent(new CustomEvent('ventally:call:ended')); true;"
      );
      handleCallEnd();
    };
    socketService.on('call:ended', onCallEnded);
    socketService.on('session:ended', onCallEnded);
    return () => {
      socketService.off('call:ended', onCallEnded);
      socketService.off('session:ended', onCallEnded);
    };
  }, [isVenter]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'CALL_ENDED') {
            handleCallEnd();
        }
    } catch (e) {}
  };

  // Only mount the WebView at all while a call is actually connecting or active.
  // This keeps Agora/audio alive continuously across navigation, and fully
  // tears down (unmounts) once the call genuinely ends from any path.
  const shouldMount = isConnecting || isActive;
  if (!shouldMount) return null;
  if (isHiding) return null;

  const token = agoraCallData?.token ?? '';
  const channelName = agoraCallData?.channelName ?? '';
  const uid = agoraCallData?.uid ?? 2;
  const appId = agoraCallData?.agoraAppId ?? '25832db4fae5418f977c634900af9904';
  const callUrl = `${WEB_BASE_URL}/standalone-call?token=${encodeURIComponent(token)}&channel=${encodeURIComponent(channelName)}&uid=${uid}&appId=${appId}&authToken=${encodeURIComponent(authToken)}`;

  const isVisible = currentRouteName === routes.activeCall;

  return (
    <View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={isVisible && !isHiding ? styles.visible : styles.hidden}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: callUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grant"
        renderLoading={() => (
          <View style={StyleSheet.absoluteFill}>
            <HomeWrapper>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' }}>Connecting...</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Setting up your session</Text>
              </View>
            </HomeWrapper>
          </View>
        )}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  visible: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 99999,
    elevation: 20,
    backgroundColor: '#1a1a2e',
  },
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    top: -9999,
    left: -9999,
    opacity: 0,
  },
  webview: { flex: 1 },
  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});

export default PersistentCallWebView;
