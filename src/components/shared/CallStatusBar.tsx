import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
  Image,
} from 'react-native';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { getGlassColors } from '../../utils/glassColors';
import { routes } from '../../navigation/routes';
import { endCall as endCallAction, setJustAccepted } from '../../store/slices/callSlice';
import { endCallAndNavigate } from '../../utils/endCallFlow';
import socketService from '../../sockets';
import type { RootState } from '../../store/store';
import GlassView from '../GlassWrapper';
import GlassModal from './GlassModal';
import { x } from '../../assets/icons';
import { useCalls } from '../../api';

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

interface CallStatusBarProps {
  navigationRef: NavigationContainerRefWithCurrent<any>;
}

const CallStatusBar: React.FC<CallStatusBarProps> = ({ navigationRef }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isVenter } = useSelector((state: RootState) => state.user)
  const { isConnecting, isActive, startTime, sessionId, justAccepted } = useSelector(
    (state: RootState) => state.call
  );
  const { endCall: endCallApi } = useCalls();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

  // Listen to navigation state changes
  useEffect(() => {
    const getRouteName = () => {
      if (!navigationRef.isReady()) return undefined;
      const state = navigationRef.getRootState();
      if (!state) return undefined;
      const route = state.routes[state.index];
      // Handle nested navigators
      if (route.state) {
        const nestedState = route.state as any;
        const nestedRoute = nestedState.routes[nestedState.index];
        return nestedRoute?.name;
      }
      return route.name;
    };

    // Set initial route
    setCurrentRouteName(getRouteName());

    // Subscribe to state changes
    const unsubscribe = navigationRef.addListener('state', () => {
      setCurrentRouteName(getRouteName());
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (!isActive || startTime == null) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Clear the justAccepted flag once route confirms we've arrived at activeCall,
  // and as a safety net, auto-clear after 4s in case navigation didn't land there for some other reason.
  useEffect(() => {
    if (!justAccepted) return;
    if (currentRouteName === routes.activeCall) {
      dispatch(setJustAccepted(false));
      return;
    }
    const timeout = setTimeout(() => dispatch(setJustAccepted(false)), 4000);
    return () => clearTimeout(timeout);
  }, [justAccepted, currentRouteName, dispatch]);

  const handleBarPress = () => {
    if (navigationRef.isReady()) {
      (navigationRef as any).navigate(routes.chatStack, { screen: routes.activeCall });
    }
  };

  const handleCrisis = () => {
    if (isVenter) {
      dispatch(endCallAction());
      if (navigationRef.isReady()) {
        (navigationRef as any).navigate(routes.venterInternal, {
          screen: routes.venterCrisisWarning,
        });
      }
    } else {
      if (navigationRef.isReady()) {
        (navigationRef as any).navigate(routes.chatStack, {
          screen: routes.activeCall,
          params: { openCrisisModal: true }
        });
      }
    }
  };

  const handleEndCall = () => {
    setShowEndSessionModal(true);
  };

  const handleEndSessionNo = () => setShowEndSessionModal(false);

  // Listen for call:ended from backend so both sides navigate to feedback
  useEffect(() => {
    if (!isActive && !isConnecting) return;
    const handleCallEnded = () => {
      endCallAndNavigate({
        sessionId,
        isVenter,
        navigationRef,
        dispatch,
        endCallAction,
        endCallApi,
      });
    };
    socketService.on('call:ended', handleCallEnded);
    socketService.on('session:ended', handleCallEnded);
    return () => {
      socketService.off('call:ended', handleCallEnded);
      socketService.off('session:ended', handleCallEnded);
    };
  }, [isActive, isConnecting, sessionId, isVenter]);

  // Listen for call:ended from backend so both sides navigate
  useEffect(() => {
    if (!isActive && !isConnecting) return;
    const handleCallEnded = () => {
      endCallAndNavigate({
        sessionId,
        isVenter,
        navigationRef,
        dispatch,
        endCallAction,
        endCallApi,
      });
    };
    socketService.on('call:ended', handleCallEnded);
    socketService.on('session:ended', handleCallEnded);
    return () => {
      socketService.off('call:ended', handleCallEnded);
      socketService.off('session:ended', handleCallEnded);
    };
  }, [isActive, isConnecting, sessionId, isVenter]);
  const handleEndSessionYes = async () => {
    setShowEndSessionModal(false);
    await endCallAndNavigate({
      sessionId,
      isVenter,
      navigationRef,
      dispatch,
      endCallAction,
      endCallApi,
    });
  };

  // Don't show if no active call or if on ActiveCallScreen, or if we just accepted and are still navigating there
  const shouldShow = (isConnecting || isActive) && currentRouteName !== routes.activeCall && currentRouteName !== routes.listenerCrisisEscalation && !justAccepted;

  if (!shouldShow) return null;

  const statusText = isConnecting
    ? t('ActiveCall.connecting')
    : isActive
      ? formatDuration(elapsedMs)
      : '';

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      // paddingTop: Platform.OS === 'ios' ? insets.top : hp(1),
      paddingBottom: hp(1),
      // paddingHorizontal: wp(5),
      zIndex: 9999,
      elevation: 10,
    },
    innerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
    },
    crisisButton: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.9),
      borderRadius: hp(3),
      backgroundColor: theme.red,
    },
    crisisText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.6),
      color: theme.white + "95",
    },
    statusArea: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: wp(2),
    },
    statusText: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
    },
    statusSubtext: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + '90',
    },
    closeButton: {
      width: hp(4),
      height: hp(4),
      borderRadius: hp(2),
      backgroundColor: theme.white + "30",
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
  });

  return (
    <>
      <View style={[styles.container, {
        paddingTop: insets.top
      }]}>
        <GlassView bordered radius={0} glassStyles={{
          backgroundColor: theme.black + "15",

        }}>
          <View style={styles.innerContainer}>


            <Pressable style={styles.crisisButton} onPress={handleCrisis}>
              <Text style={styles.crisisText}>{t('ActiveCall.crisis')}</Text>
            </Pressable>

            <Pressable style={styles.statusArea} onPress={handleBarPress}>
              <Text style={styles.statusText}>{statusText}</Text>
              <Text style={styles.statusSubtext}>
                {isConnecting ? '' : t('ActiveCall.tapToReturn')}
              </Text>
            </Pressable>

            <Pressable style={styles.closeButton} onPress={handleEndCall}>
              <Image source={x} style={{ width: hp(2), height: hp(2), tintColor: theme.white }} />
            </Pressable>
          </View>

        </GlassView>
      </View>

      <GlassModal
        visible={showEndSessionModal}
        onClose={handleEndSessionNo}
        showIcon={false}
        title={t('VenterChat.endSessionTitle')}
        message={t('VenterChat.endSessionMessage')}
        showButtons
        primaryButtonText={t('VenterChat.endSessionYes')}
        secondaryButtonText={t('VenterChat.endSessionNo')}
        onPrimaryPress={handleEndSessionYes}
        onSecondaryPress={handleEndSessionNo}
        dismissOnOverlayPress={false}
        dismissOnBackPress
      />
    </>
  );
};

export default CallStatusBar;
