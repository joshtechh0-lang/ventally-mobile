import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, BackHandler , Pressable, Alert} from 'react-native';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeHeader from '../../components/shared/HomeHeader';
import GlassWrapper from '../../components/GlassWrapper';
import { logoWithText, notification, chevronIcon, callIcon, messagesIcon } from '../../assets/icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { routes } from '../../navigation/routes';
import { useAvailability } from '../../api/apiHooks/useAvailability';
import apiInstance from '../../api/apiInstance';
import { useEarnings } from '../../api/apiHooks/useEarnings';
import { toastError } from '../../utils/toast';
import { Loader } from '../../components';
import type { EarningsSummaryResponse } from '../../types/apiPayloadsTypes';
import SettingsContainer from '../../components/shared/SettingsContainer';
import EmptyState from '../../components/shared/EmptyState';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setListenerAvailabilityPreference } from '../../store/slices/listenerSlice';
import socketService from '../../sockets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalkthroughModal, { WalkthroughStep } from '../../components/shared/WalkthroughModal';

interface RequestItem {
  id: string;
  type: 'call' | 'message';
  title: string;
  timeAgo: string;
  roomName?: string;
}

/**
 * Parse `availability/status` payloads: nested `data`, `status` as object with `isOnline`,
 * `status` as string, or top-level `isOnline`.
 */
function extractIsOnlineFromStatusPayload(res: unknown): boolean | null {
  if (res == null || typeof res !== 'object') return null;
  const root = res as Record<string, any>;
  const payload =
    root.data != null && typeof root.data === 'object' && !Array.isArray(root.data)
      ? root.data
      : root;
  if (typeof payload.isOnline === 'boolean') return payload.isOnline;
  const status = payload.status;
  if (status && typeof status === 'object' && typeof status.isOnline === 'boolean') {
    return status.isOnline;
  }
  if (typeof status === 'string') {
    const s = status.toLowerCase();
    if (s === 'online' || s === 'available' || s === 'active') return true;
    if (s === 'offline' || s === 'unavailable' || s === 'inactive') return false;
  }
  if (typeof payload.availability === 'string') {
    const a = payload.availability.toLowerCase();
    if (a === 'online' || a === 'available') return true;
    if (a === 'offline' || a === 'unavailable') return false;
  }
  return null;
}

const ListenerHome = () => {
  // Add hardware back press listener to exit app
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       if (navigation.isFocused()) {
  //         BackHandler.exitApp();
  //         return true;
  //       }
  //       return false;
  //     };

  //     const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //     return () => subscription.remove();
  //   }, [])
  // );

  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getStatus, goOnline, goOffline, sendHeartbeat } = useAvailability();
  const { getEarningsSummary } = useEarnings();
  const [isAvailable, setIsAvailable] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummaryResponse | null>(null);
  const requests = useSelector((state: RootState) => state.listener.requests);
  const user = useSelector((state: RootState) => state.user.user);
  const [verificationStatus, setVerificationStatus] = React.useState<string | null>(
    (user as any)?.verificationDocumentStatus ?? null
  );

  React.useEffect(() => {
    apiInstance.get('auth/profile').then((res: any) => {
      const status = res?.data?.user?.verificationDocumentStatus ?? res?.data?.user?.verificationStatus;
      if (status) setVerificationStatus(status);
    }).catch(() => {});
  }, []);

  const isPendingVerification = verificationStatus === 'pending' || (user as any)?.status === 'pending';
  // duplicate removed
  // duplicate removed
  const availabilityPreference = useSelector(
    (state: RootState) => state.listener.listenerAvailabilityPreference ?? null
  );
  const hasActiveSession = useSelector((state: RootState) => {
    const callState = state.call;
    const sessionState = state.session;
    return Boolean(
      callState.isActive ||
      callState.isConnecting ||
      callState.isChatActive ||
      callState.sessionType === 'chat' ||
      sessionState.sessionType === 'chat' ||
      callState.activeConversationId ||
      sessionState.sessionId
    );
  });
  const [loading, setLoading] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [bankStatus, setBankStatus] = useState<'not_connected' | 'pending' | 'enabled'>('not_connected');
  const [showListenerWalkthrough, setShowListenerWalkthrough] = useState(false);

  // Show first-use walkthrough once
  React.useEffect(() => {
    AsyncStorage.getItem('listener_walkthrough_seen').then(val => {
      if (!val) setShowListenerWalkthrough(true);
    }).catch(() => {});
  }, []);

  const handleListenerWalkthroughDone = async () => {
    setShowListenerWalkthrough(false);
    try { await AsyncStorage.setItem('listener_walkthrough_seen', '1'); } catch {}
  };

  const LISTENER_WALKTHROUGH_STEPS: WalkthroughStep[] = [
    {
      emoji: '🎧',
      title: 'Welcome, Support Guide',
      body: 'You\'re here to make a real difference. When venters reach out, you\'ll receive a request to accept or decline — no pressure.',
    },
    {
      emoji: '🟢',
      title: 'Go online to receive requests',
      body: 'Toggle "Available" to let venters know you\'re ready. Toggle it off whenever you need a break — your time is yours.',
    },
    {
      emoji: '📲',
      title: 'Incoming requests',
      body: 'When a venter needs support, you\'ll see a request here. Tap it to accept and start the session. Calls and chats both show up.',
    },
    {
      emoji: '💰',
      title: 'Your earnings',
      body: 'You earn per minute for every session. Connect your bank account to receive payouts directly to your account.',
    },
    {
      emoji: '🌟',
      title: 'You\'re all set',
      body: 'Toggle online, wait for a request, and start supporting. Thank you for being here — your presence matters.',
    },
  ];

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await getEarningsSummary();
      if (res) {
        setEarningsSummary(res);
      }
    } catch (error) {
      console.log('Error fetching earnings:', error);
    }
  }, [getEarningsSummary]);

  // On focus: resync API from Redux preference (was online → offline, brief delay, online; was offline → offline only); then align switch from GET status.

  // Send heartbeat every 60 seconds to keep listener in Redis
  React.useEffect(() => {
    if (!isAvailable) return;
    const interval = setInterval(async () => {
      try {
        await sendHeartbeat();
      } catch (e) {
        console.log('[Heartbeat] failed:', e);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAvailable, sendHeartbeat]);

  // Does not use full-screen loading — avoids flicker and matches toggle-only loader.
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      const hydrateSwitchFromServer = async () => {
        const res = await getStatus();
        if (cancelled || res == null) return;
        const online = extractIsOnlineFromStatusPayload(res);
        if (online !== null) {
          setIsAvailable(online);
        } else if (availabilityPreference === false) {
          setIsAvailable(false);
        } else if (availabilityPreference === true) {
          setIsAvailable(true);
        }
      };

      const run = async () => {
        try {
          if (!hasActiveSession) {
            if (availabilityPreference === true) {
              await goOffline();
              if (cancelled) return;
              await new Promise<void>(resolve => setTimeout(resolve, 280));
              if (cancelled) return;
              await goOnline();
            } else if (availabilityPreference === false) {
              await goOffline();
            }
          }

          if (cancelled) return;
          await hydrateSwitchFromServer();
        } catch (error) {
          console.log('Error syncing availability on focus:', error);
          if (!cancelled) {
            try {
              await hydrateSwitchFromServer();
            } catch {
              /* ignore */
            }
          }
        }

        if (!cancelled) {
          fetchEarnings();
          // Check bank account status so the "Complete Profile" banner reflects reality
          apiInstance.get('earnings/bank-account/status')
            .then((res: any) => {
              if (cancelled) return;
              const s = res?.data?.status;
              if (s?.payoutEnabled) {
                setBankConnected(true);
                setBankStatus('enabled');
              } else if (s?.stripeAccountStatus && s.stripeAccountStatus !== 'not_connected') {
                setBankStatus('pending');
              }
            })
            .catch(() => {});
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }, [availabilityPreference, hasActiveSession, goOffline, goOnline, getStatus, fetchEarnings])
  );

  console.log("earnings:", earningsSummary);

  const handleAvailable = async () => {
    if (isPendingVerification) {
      toastError({ text: 'Application is under review. You cannot toggle availability until approved.' });
      return;
    }
    setLoading(true)
    try {
      if (isAvailable) {
        const res = await goOffline();
        if (res) {
          setIsAvailable(false);
          dispatch(setListenerAvailabilityPreference(false));
        }
      } else {
        const res = await goOnline();
        if (res) {
          setIsAvailable(true);
          dispatch(setListenerAvailabilityPreference(true));
        }
      }
    } catch (err: any) {
      toastError({ text: err?.message || 'Failed to update availability' });
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    content: {
      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(16),
    },
    availableContainer: {
      marginBottom: hp(2),
    },
    availableContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
    },
    availableText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
    },
    earningsContainer: {
      marginBottom: hp(3),
    },
    earningsContent: {
      paddingVertical: hp(3),
      paddingHorizontal: wp(4),
      alignItems: 'center',
      justifyContent: 'center',
    },
    earningsAmount: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(3.5),
      color: theme.white,
      marginBottom: hp(0.5),
    },
    earningsLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '90',
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginBottom: hp(1.5),
    },
    requestsList: {
      gap: hp(1),
    },
    requestItem: {
      borderBottomColor: theme.white20,
      borderBottomWidth: hp(.1),
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    requestContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    requestLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    requestIconContainer: {
      width: hp(4),
      height: hp(4),
      borderRadius: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
      backgroundColor: theme.white + '10',
    },
    requestIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    requestTextContainer: {
      flex: 1,
    },
    requestType: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(0.3),
    },
    requestTime: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + "90",
    },
    requestArrow: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
      transform: [{ rotate: '-90deg' }],
    },
    emptyRequestsText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '60',
      textAlign: 'center',
      paddingVertical: hp(3),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <Loader isVisible={loading} />
      <HomeHeader
        // leftIcon={null}
        rightIcon={notification}
        onRightPress={() => {
          (navigation as any).navigate(routes.notifications)
        }}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification pending banner */}
        {isPendingVerification && (
          <View style={{ backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: hp(1.5), padding: hp(1.5), marginBottom: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(251,191,36,0.3)' }}>
            <Text style={{ color: theme.white, fontSize: hp(1.6), fontFamily: fontFamilies.semiBold, marginBottom: hp(0.5) }}>
              {t('ListenerHome.verificationPendingTitle')}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
            {t('ListenerHome.verificationPendingDesc')}
            </Text>
          </View>
        )}

        {/* Availability tooltip for new listeners */}
        {!isAvailable && requests.length === 0 && (
          <View style={{ backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: hp(1.5), padding: hp(1.5), marginBottom: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(167,139,250,0.3)' }}>
            <Text style={{ color: theme.white, fontSize: hp(1.5), fontFamily: fontFamilies.semiBold, marginBottom: hp(0.5) }}>
              {t('ListenerHome.availabilityTip')}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
              {t('ListenerHome.availabilityTipDesc')}
            </Text>
          </View>
        )}

        {/* Available Toggle - hidden when pending */}
        {!isPendingVerification && <View style={styles.availableContainer}>
          <GlassWrapper bordered>
            <View style={styles.availableContent}>
              <Text style={styles.availableText}>{t('Listener.home.available')}</Text>
              <Switch
                value={isAvailable}
                onValueChange={() => handleAvailable()}
                trackColor={{ false: theme.white + '20', true: theme.magenda }}
                thumbColor={theme.white}
                ios_backgroundColor={theme.white + '20'}
              />
            </View>
          </GlassWrapper>
        </View>}

        {/* Profile completion indicator */}
        {bankStatus !== 'enabled' && (
          <Pressable
            onPress={() => bankStatus !== 'pending' && (navigation as any).navigate(routes.payoutMethod)}
            style={{
              backgroundColor: bankStatus === 'pending' ? 'rgba(96,165,250,0.08)' : 'rgba(251,191,36,0.08)',
              borderRadius: hp(1.5), padding: hp(1.5), marginBottom: hp(1.5),
              borderWidth: 0.5,
              borderColor: bankStatus === 'pending' ? 'rgba(96,165,250,0.2)' : 'rgba(251,191,36,0.2)',
              flexDirection: 'row', alignItems: 'center', gap: wp(3)
            }}
          >
            <Text style={{ fontSize: hp(2.5) }}>{bankStatus === 'pending' ? '🕐' : '⚡'}</Text>
            <View style={{ flex: 1 }}>
              {bankStatus === 'pending' ? (
                <>
                  <Text style={{ color: theme.white, fontSize: hp(1.5), fontFamily: fontFamilies.semiBold }}>Payout setup in review</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>Your bank is connected — Stripe is reviewing your account. This usually takes 1–2 business days.</Text>
                </>
              ) : (
                <>
                  <Text style={{ color: theme.white, fontSize: hp(1.5), fontFamily: fontFamilies.semiBold }}>{t('ListenerHome.profileCompleteTitle')}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{t('ListenerHome.profileCompleteDesc')}</Text>
                </>
              )}
            </View>
          </Pressable>
        )}

        {/* Earnings Card */}
        <View style={styles.earningsContainer}>
          <GlassWrapper bordered>
            <View style={styles.earningsContent}>
              <Text style={styles.earningsAmount}>
                {earningsSummary?.availableBalance || '0.00'}
              </Text>
              <Text style={styles.earningsLabel}>{t('Listener.home.earningsThisMonth')}</Text>
            </View>
          </GlassWrapper>
        </View>

        {/* Payout rate info */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(1.8), padding: hp(1.8), marginBottom: hp(2), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ fontFamily: fontFamilies.semiBold, fontSize: hp(1.3), color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: hp(1) }}>
            Your payout rate
          </Text>
          <View style={{ flexDirection: 'row', gap: wp(5), marginBottom: hp(1) }}>
            <View>
              <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(1.9), color: theme.white }}>~$0.15<Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: 'rgba(255,255,255,0.5)' }}>/min</Text></Text>
              <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.45)', marginTop: hp(0.2) }}>Ad-funded sessions</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View>
              <Text style={{ fontFamily: fontFamilies.bold, fontSize: hp(1.9), color: theme.white }}>~$0.20<Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: 'rgba(255,255,255,0.5)' }}>/min</Text></Text>
              <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.45)', marginTop: hp(0.2) }}>Paid sessions</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.3), color: 'rgba(255,255,255,0.3)' }}>🔒 Your rate is locked in at the start of each session</Text>
        </View>

        {/* Incoming Requests Section - hidden when pending */}
                {!isPendingVerification && (
                <View>
          <Text style={styles.sectionTitle}>{t('Listener.home.incomingRequests')}</Text>
          {requests.length === 0 ? (

            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(2), padding: hp(2.5), marginTop: hp(1) }}>
              <Text style={{ color: theme.white, fontFamily: fontFamilies.semiBold, fontSize: hp(1.8), marginBottom: hp(1) }}>
                {t('ListenerHome.approvedTitle')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: fontFamilies.normal, fontSize: hp(1.5), marginBottom: hp(0.5) }}>
                {t('ListenerHome.approvedStep1')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: fontFamilies.normal, fontSize: hp(1.5), marginBottom: hp(0.5) }}>
                {t('ListenerHome.approvedStep2')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: fontFamilies.normal, fontSize: hp(1.5), marginBottom: hp(1) }}>
                {t('ListenerHome.approvedStep3')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontFamily: fontFamilies.normal, fontSize: hp(1.4) }}>
                {t('ListenerHome.firstSessionTip')}
              </Text>
            </View>
          ) : (
            <SettingsContainer  >
              {requests.map((item, index) => {
                const icon = item.type === 'call' ? callIcon : messagesIcon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.requestItem, {
                      borderBottomWidth: index === requests.length - 1 ? 0 : hp(.1),
                    }]}
                    onPress={() => {
                      //@ts-ignore
                      (navigation as any).navigate(routes.listenerHomeTab, {
                        screen: routes.listenerRequests,
                      });
                    }}
                  >
                    <View style={styles.requestContent}>
                      <View style={styles.requestLeft}>

                        <View style={styles.requestTextContainer}>
                          <Text style={styles.requestType}>
                            {item.type === 'call'
                              ? t('Listener.home.callSession')
                              : t('Listener.home.chatSession')}
                          </Text>
                          <Text style={styles.requestTime}>{item.title}</Text>
                        </View>
                      </View>
                      <Image source={chevronIcon} style={styles.requestArrow} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </SettingsContainer>
          )}
        </View>
                )}
      {/* Refer & Earn / Affiliate quick links */}
      <View style={{ flexDirection: 'row', gap: wp(3), marginHorizontal: wp(5), marginBottom: hp(2), marginTop: hp(0.5) }}>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate(routes.referral)}
          style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: hp(1.5), padding: hp(1.5), flexDirection: 'row', alignItems: 'center', gap: wp(2) }}
        >
          <Text style={{ fontSize: hp(2) }}>🎁</Text>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: hp(1.4), fontFamily: fontFamilies.medium }}>Refer & Earn</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.2), fontFamily: fontFamilies.normal }}>Give $5, get $5</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate(routes.affiliate)}
          style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: hp(1.5), padding: hp(1.5), flexDirection: 'row', alignItems: 'center', gap: wp(2) }}
        >
          <Text style={{ fontSize: hp(2) }}>🌐</Text>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: hp(1.4), fontFamily: fontFamilies.medium }}>Affiliate</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.2), fontFamily: fontFamilies.normal }}>$3 per referral</Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>
      <WalkthroughModal
        visible={showListenerWalkthrough}
        steps={LISTENER_WALKTHROUGH_STEPS}
        onDone={handleListenerWalkthroughDone}
      />
    </HomeWrapper>
  );
};

export default ListenerHome;
