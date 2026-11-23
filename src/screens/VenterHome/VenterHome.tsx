import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, FlatList, ActivityIndicator, BackHandler , Linking } from 'react-native';
import { useAvailability } from '../../api/apiHooks/useAvailability';
import socketService from '../../sockets';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { hp, WINDOW_WIDTH, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassWrapper from '../../components/GlassWrapper';
import Button from '../../components/Button';
import { chatIcon, microphoneIcon, happyIcon, neutralIcon, sadIcon, axiousIcon, logoWithText, settingIcon, notification, backIcon, callIcon, chatMessages, chevronIcon, madIcon } from '../../assets/icons';
import HomeWrapper from '../../wrapper/HomeWrapper';
import GlassView from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import WalkthroughModal, { WalkthroughStep } from '../../components/shared/WalkthroughModal';
import { routes } from '../../navigation/routes';
import MoodChart from '../../components/shared/MoodChart';
import HomeHeader from '../../components/shared/HomeHeader';
import { useMood } from '../../api/apiHooks/useMood';
import { useReflections } from '../../api/apiHooks/useReflections';
import EmptyState from '../../components/shared/EmptyState';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setReturnToSession, setSessionType } from '../../store/slices/callSlice';
import { SESSION_COST } from '../../constants/payment';
import { useWallet } from '../../api/apiHooks/useWallet';
import { toastError } from '../../utils/toast';

const VenterHome = () => {
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
  const { getAvailableListeners } = useAvailability();
  const [listenerCount, setListenerCount] = React.useState<number>(0);

  const fetchListenerCount = React.useCallback(() => {
    getAvailableListeners().then(res => {
      setListenerCount(res?.count ?? res?.listeners?.length ?? 0);
    }).catch(() => setListenerCount(0));
  }, [getAvailableListeners]);

  React.useEffect(() => {
    fetchListenerCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchListenerCount, 30000);
    // Also refresh when socket emits listener availability change
    socketService.on('listener:online', fetchListenerCount);
    socketService.on('listener:offline', fetchListenerCount);
    socketService.on('availability:changed', fetchListenerCount);
    return () => {
      clearInterval(interval);
      socketService.off('listener:online', fetchListenerCount);
      socketService.off('listener:offline', fetchListenerCount);
      socketService.off('availability:changed', fetchListenerCount);
    };
  }, [fetchListenerCount]);
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.user)
  const { getTodayMood, getMoodStats } = useMood();
  const { getTodayReflection, getReflectionHistory } = useReflections();

  const [reflection, setReflection] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loadingMood, setLoadingMood] = useState(false);
  const [todayMood, setTodayMood] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [happyDays, setHappyDays] = useState(0);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [showNoPaymentMethodModal, setShowNoPaymentMethodModal] = useState(false);
  const [showVenterWalkthrough, setShowVenterWalkthrough] = useState(false);
  const [walletMinutes, setWalletMinutes] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const dispatch = useDispatch()
  const { getSubscription, getBalance } = useWallet();

  // Check balance + subscription on mount
  useEffect(() => {
    getBalance().then((res: any) => {
      const balanceData = res?.data?.balance ?? res?.balance ?? {};
      const minutes = balanceData?.minutes ?? 0;
      setWalletMinutes(minutes);
      setWalletBalance(balanceData);
      if (minutes < 5 && (balanceData?.currency ?? 0) <= 0 && !balanceData?.hasPaymentMethod) {
        // only show low balance modal if no other funding path exists
      }
    }).catch(() => {});
    getSubscription().then((res: any) => {
      const sub = res?.data?.subscription ?? res?.subscription ?? null;
      setActiveSubscription(sub);
    }).catch(() => {});
  }, []);
  const [loadingStartCall, setLoadingStartCall] = useState(false);
  const [loadingStartChat, setLoadingStartChat] = useState(false);

  // Show first-use walkthrough once
  useEffect(() => {
    AsyncStorage.getItem('venter_walkthrough_seen').then(val => {
      if (!val) setShowVenterWalkthrough(true);
    }).catch(() => {});
  }, []);

  const handleVenterWalkthroughDone = async () => {
    setShowVenterWalkthrough(false);
    try { await AsyncStorage.setItem('venter_walkthrough_seen', '1'); } catch {}
  };

  const VENTER_WALKTHROUGH_STEPS: WalkthroughStep[] = [
    {
      emoji: '👋',
      title: 'Welcome to Ventally',
      body: 'This is your safe space. Talk or chat with a real, trained Support Guide whenever you need it — anonymously and privately.',
    },
    {
      emoji: '🎙️',
      title: 'Start a session',
      body: 'Tap "Start Voice" for a live call or "Start Chat" for a text session. You\'ll be matched with an available Support Guide in seconds.',
    },
    {
      emoji: '💳',
      title: 'Pay as you go — or subscribe',
      body: 'You\'re only billed for the time you use. Upgrade to a Member plan for unlimited monthly minutes with rollover.',
    },
    {
      emoji: '👛',
      title: 'Your Wallet',
      body: 'Top up your balance anytime. Referral credits and ad rewards show up here too.',
    },
    {
      emoji: '🌱',
      title: 'Track your journey',
      body: 'Log your mood, add reflections, and watch your wellness trends over time — all in one place.',
    },
  ];

  const moodOptions = [
    { id: 'happy', icon: happyIcon, label: t('VenterHome.moods.happy') },
    { id: 'neutral', icon: neutralIcon, label: t('VenterHome.moods.neutral') },
    { id: 'sad', icon: sadIcon, label: t('VenterHome.moods.sad') },
    { id: 'anxious', icon: axiousIcon, label: t('VenterHome.moods.anxious') },
    { id: 'mad', icon: madIcon, label: t('VenterHome.moods.mad') },
  ];

  // Fetch today's mood and stats on focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoadingMood(true);
        try {
          // Parallel fetch for today's mood and stats
          const daysInMonth = new Date().getDate();
          const [moodRes, statsRes] = await Promise.all([
            getTodayMood().catch(err => {
              console.log('Error fetching today mood:', err);
              return null;
            }),
            getMoodStats(daysInMonth).catch(err => {
              console.log('Error fetching mood stats:', err);
              return null;
            })
          ]);

          if (moodRes?.mood) {
            setTodayMood(moodRes.mood);
          } else {
            setTodayMood(null);
          }

          if (statsRes?.mood_distribution) {
            console.log("statsRes", statsRes);
            // Define all mood types in order
            const allMoods = ['happy', 'neutral', 'sad', 'anxious', 'mad'];

            // key map for chart
            const moodMap: Record<string, number> = {};
            statsRes.mood_distribution.forEach((d: any) => {
              if (d.mood_type) {
                moodMap[d.mood_type.toLowerCase()] = parseInt(d.count, 10);
              }
            });

            // Map mood distribution to chart data ensuring all moods exist
            const mappedChartData = allMoods.map(mood => ({
              value: moodMap[mood] || 0,
              label: t(`VenterHome.moods.${mood}`, mood)
            }));

            setChartData(mappedChartData);
            setHappyDays(moodMap['happy'] || 0);
          }

          if (statsRes?.streaks) {
            setStreaks(statsRes.streaks);
          }

          // Fetch today's reflection
          const [reflectionRes, historyRes] = await Promise.all([
            getTodayReflection().catch(err => {
              console.log('Error fetching today reflection:', err);
              return null;
            }),
            getReflectionHistory(3, 0).catch(err => {
              console.log('Error fetching reflection history:', err);
              return null;
            })
          ]);

          if (reflectionRes?.saved && reflectionRes.reflection) {
            console.log("reflectionRes", reflectionRes);
            const todayCheck = new Date(reflectionRes?.reflection?.updated_at)?.toLocaleDateString()
            console.log("todayCheck", todayCheck);
            if (todayCheck === new Date().toLocaleDateString()) {
              setReflection(reflectionRes.reflection);
            } else {
              setReflection(null);
            }
          } else {
            setReflection(null);
          }

          if (historyRes?.reflections) {
            setReflections(historyRes.reflections);
          } else {
            setReflections([]);
          }

        } catch (error: any) {
          console.log('Error fetching home data:', error);
          setTodayMood(null);
        } finally {
          setLoadingMood(false);
        }
      };

      fetchData();
    }, [])
  );
  console.log("user", user);

  useEffect(() => {
    if (todayMood) {
      const todayCheck = new Date(todayMood?.updated_at)?.toLocaleDateString()
      if (todayCheck === new Date().toLocaleDateString()) {
        const moodType = todayMood.mood_type?.toLowerCase();
        setSelectedMood(moodType || null);
      } else {
        setSelectedMood(null);
      }
    } else {
      setSelectedMood(null);
    }
  }, [todayMood]);
const getPaymentMode = (sub: any, wallet: any): 'member' | 'ad' | 'payg' => {
  if (sub?.status === 'active') return 'member';
  if ((wallet?.ad_minutes ?? 0) > 0) return 'ad';
  return 'payg';
};

const handleCall = async () => {
    try {
        const walletRes = await getBalance();
        const freshWallet = walletRes?.data?.balance ?? walletRes?.balance ?? {};
        const walletMinutes = freshWallet?.minutes ?? 0;
        const currency = freshWallet?.currency ?? 0;
        const hasPaymentMethod = freshWallet?.hasPaymentMethod ?? false;
        // Voice: need payment method saved OR wallet balance
        if (walletMinutes > 0 || currency > 0 || hasPaymentMethod) {
            dispatch(setSessionType('call'));
            (navigation as any).navigate(routes.chatStack, {
              screen: routes.findingListener,
              params: { paymentMode: getPaymentMode(activeSubscription, freshWallet), walletBalance: freshWallet, subscription: activeSubscription },
            });
        } else { setShowLowBalanceModal(true); }
    } catch { setShowLowBalanceModal(true); }
};

const handleChat = async () => {
    try {
        const walletRes = await getBalance();
        const freshWallet = walletRes?.data?.balance ?? walletRes?.balance ?? {};
        const walletMinutes = freshWallet?.minutes ?? 0;
        // Chat: need wallet minutes
        if (walletMinutes > 0) {
            dispatch(setSessionType('chat'));
            (navigation as any).navigate(routes.chatStack, {
              screen: routes.findingListener,
              params: { paymentMode: getPaymentMode(activeSubscription, freshWallet), walletBalance: freshWallet, subscription: activeSubscription },
            });
        } else { setShowLowBalanceModal(true); }
    } catch { setShowLowBalanceModal(true); }
};

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Navigate to mood log screen with edit mode if mood already exists
    if (todayMood) {
      // @ts-ignore
      navigation.navigate(routes.venterInternal, {
        screen: routes.venterMoodLog,
        params: {
          editMode: true,
          selectedMood: moodId,
          item: {
            mood: todayMood.mood_type,
            note: todayMood.notes,
            categories: todayMood.category ? [todayMood.category.toLowerCase()] : [],
          },
        }
      });

    } else {
      // @ts-ignore
      navigation.navigate(routes.venterInternal, {
        screen: routes.venterMoodLog,
        params: {
          selectedMood: moodId,
        }
      });
    }
  };

  const styles = StyleSheet.create({
    content: {
      width: "100%"
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(5), // Extra padding for bottom tab navigation
    },
    greeting: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(.5),
    },
    subtitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white + "90",
      marginBottom: hp(2),
    },
    reflectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: hp(4.5),
      paddingLeft: wp(5),
      paddingRight: wp(2)
    },
    reflectionText: {

      fontSize: hp(1.8),
      fontFamily: fontFamilies.normal,
      color: theme.white,
    },
    reflectionPlaceholder: {
      color: theme.white60,
    },
    sendButton: {

      width: hp(3),
      height: hp(3),
      borderRadius: hp(2),
      backgroundColor: theme.black + "10",
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: "contain"
    },
    ventSection: {
      marginBottom: hp(3),

    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.8),
      color: theme.white,
      marginBottom: hp(1.5),

    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    seeAllText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white60,
    },
    ventButtons: {
      flex: 1,

      flexDirection: 'row',
      gap: wp(4),
    },
    ventButton: {
      flex: 1,
      borderRadius: hp(1.5),
      backgroundColor: theme.black + "20",
    },
    moodSection: {
      marginBottom: hp(3),
    },
    moodGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(1.5),
    },
    moodItem: {

      flex: 1,
      // height: hp(7),
      paddingVertical: hp(2.5),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: hp(.1),
      borderColor: theme.white60,
      borderRadius: hp(1.8),
    },
    moodItemSelected: {
      backgroundColor: '#D1F2E2',
      borderColor: '#D1F2E2',
    },
    moodEmoji: {
      width: hp(3),
      height: hp(3),
      marginBottom: hp(0.5),
    },
    moodLabel: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white,
      textAlign: 'center',
    },
    moodIcon: {
      width: hp(2),
      height: hp(2),
      resizeMode: "contain",
      tintColor: theme.white,
      transform: [{ rotate: '180deg' }]
    },
    // Reflections Section Styles
    reflectionsSection: {
      marginBottom: hp(3),
    },
    reflectionCard: {
      marginBottom: hp(2),

    },
    reflectionListItem: {
      width: wp(80),
      marginRight: wp(4),
    },
    reflectionCardContent: {
      padding: wp(4),
      borderRadius: hp(1.8),
      backgroundColor: theme.black + "30",

    },
    reflectionCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reflectionTextContainer: {
      flex: 1,
      paddingRight: wp(3),
    },
    reflectionCardText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white,
      lineHeight: hp(2.2),
      marginBottom: hp(0.5),
    },
    reflectionDate: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white + "cc",
    },
    reflectionArrow: {
      width: hp(3),
      height: hp(3),
      tintColor: theme.white,
      resizeMode: "contain",
      transform: [{ rotate: '-90deg' }],
    },
    streakCard: {
      marginBottom: hp(2),
    },
    streakCardContent: {
      padding: wp(4),
      borderRadius: hp(1.8),
      backgroundColor: theme.black + "30",
    },
    streakCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    streakTextContainer: {
      // flex: 1,
    },
    streakMoodLabel: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white + "cc",
      marginBottom: hp(0.5),
    },
    streakText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.7),
      color: theme.white,
    },
    streakMoodIcon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: "contain"
    },
    // Chart Section Styles
    chartSection: {
      marginBottom: hp(2),
    },
    chartContainer: {
      width: '100%',
    },
  });

  return (
    <HomeWrapper>
      {/* Header */}
      <HomeHeader
        leftIcon={logoWithText}
        rightIcon={notification}
        onRightPress={() => {
          (navigation as any).navigate(routes.notifications);
        }}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


        {/* Greeting */}

        {/* Reflection Input */}
        {/* <GlassWrapper opacity={0.04} style={{ marginBottom: hp(3) }} >
          <TouchableOpacity onPress={() => {
            if (reflection) {
              // @ts-ignore - nested navigation params
              navigation.navigate(routes.venterInternal, {
                screen: routes.venterReflectionDetail,
                params: { reflection: reflection }
              });
            } else {
              // @ts-ignore - nested navigation params
              navigation.navigate(routes.venterInternal, {
                screen: routes.venterAddReflection,
              });
            }
          }} style={styles.reflectionContainer}>
            <Text style={[styles.reflectionText, !reflection && styles.reflectionPlaceholder]} numberOfLines={1}>
              {reflection ? reflection.reflection_text : t("VenterHome.reflectionPlaceholder")}
            </Text>
            <View style={styles.sendButton}>
              <Image source={backIcon} style={styles.moodIcon} />
            </View>
          </TouchableOpacity>
        </GlassWrapper> */}
        <Button
          title={t('VenterHome.yourReflection')}
          onPress={() => {
            if (reflection) {
              // @ts-ignore - nested navigation params
              navigation.navigate(routes.venterInternal, {
                screen: routes.venterReflectionDetail,
                params: { reflection: reflection }
              });
            } else {
              // @ts-ignore - nested navigation params
              navigation.navigate(routes.venterInternal, {
                screen: routes.venterAddReflection,
              });
            }
          }}
          glassStyles={{
            marginBottom: hp(2)
          }}
          titleStyle={{}}
          disabled={false}
          iconStyle={{}}
        />
        {/* Start a Session — 3 states */}
        <View style={styles.ventSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(1.5) }}>
            <Text style={styles.sectionTitle}>Start a session</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1.5), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(3), paddingHorizontal: wp(3), paddingVertical: hp(0.6) }}>
              <View style={{ width: hp(0.9), height: hp(0.9), borderRadius: hp(0.5), backgroundColor: '#4ade80' }} />
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>24/7</Text>
            </View>
          </View>

          {/* SUBSCRIBER state */}
          {activeSubscription?.status === 'active' ? (() => {
            const memberMins = walletBalance?.member_minutes ?? walletMinutes ?? 0;
            const rolloverMins = walletBalance?.rollover_minutes ?? 0;
            const totalMins = Math.floor(memberMins + rolloverMins);
            return (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(2), padding: hp(1.8), marginBottom: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: hp(2.5) }}>⏱</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: hp(1.9), fontFamily: fontFamilies.bold }}>
                      {totalMins} minutes available
                    </Text>
                    {rolloverMins > 0 ? (
                      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, marginTop: hp(0.3) }}>
                        {memberMins} new this month + {rolloverMins} rolled over
                      </Text>
                    ) : (
                      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, marginTop: hp(0.3) }}>
                        Member minutes · 🔄 unused roll over
                      </Text>
                    )}
                    {totalMins === 0 && (
                      <Text style={{ color: 'rgba(255,180,50,0.85)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, marginTop: hp(0.3) }}>
                        Refills next month · pay-as-you-go available
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.ventButtons}>
                  <Button title="Start voice" onPress={handleCall} glassStyles={styles.ventButton} leftIcon={callIcon} borderedGlassButton disabled={loadingStartCall || loadingStartChat} loading={loadingStartCall} />
                  <Button title="Start chat" onPress={handleChat} glassStyles={styles.ventButton} leftIcon={chatMessages} borderedGlassButton disabled={loadingStartCall || loadingStartChat} loading={loadingStartChat} />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: hp(1.3), fontFamily: fontFamilies.normal, textAlign: 'center', marginTop: hp(0.8) }}>Uses your member minutes</Text>
              </View>
            );
          })() : (walletBalance?.currency ?? 0) > 0 || walletBalance?.hasPaymentMethod ? (
            /* PAYG state */
            <View>
              <View style={styles.ventButtons}>
                <TouchableOpacity onPress={handleCall} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: hp(2), padding: hp(1.8), alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <Text style={{ fontSize: hp(2.4) }}>📞</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: hp(1.6), fontFamily: fontFamilies.semiBold, marginTop: hp(0.5) }}>Start voice</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>$0.69/min</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChat} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: hp(2), padding: hp(1.8), alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <Text style={{ fontSize: hp(2.4) }}>💬</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: hp(1.6), fontFamily: fontFamilies.semiBold, marginTop: hp(0.5) }}>Start chat</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>$0.39/min</Text>
                </TouchableOpacity>
              </View>
              {(walletBalance?.ad_minutes ?? 0) > 0 && (
                <TouchableOpacity onPress={handleCall} style={{ marginTop: hp(1.5), flexDirection: 'row', alignItems: 'center', gap: wp(3), backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: hp(2), padding: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(76,175,80,0.25)' }}>
                  <Text style={{ fontSize: hp(2) }}>🎁</Text>
                  <View>
                    <Text style={{ color: '#4CAF50', fontSize: hp(1.6), fontFamily: fontFamilies.semiBold }}>Use your reward</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>{walletBalance.ad_minutes} free minutes earned</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* AD USER state */
            <View>
              {/* Try for free banner */}
              <TouchableOpacity
                onPress={() => (navigation as any).navigate(routes.venterInternal, { screen: routes.venterWatchAds })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: hp(2), padding: hp(1.8), marginBottom: hp(1.5), borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <View style={{ width: hp(5), height: hp(5), borderRadius: hp(1.5), backgroundColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: hp(2.2) }}>▶</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: hp(1.7), fontFamily: fontFamilies.semiBold }}>Try 5 minutes free</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>Watch 3 ads to unlock</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: hp(2) }}>›</Text>
              </TouchableOpacity>
              <View style={styles.ventButtons}>
                <TouchableOpacity onPress={handleCall} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(2), padding: hp(1.5), alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Text style={{ fontSize: hp(2) }}>📞</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: hp(1.5), fontFamily: fontFamilies.semiBold, marginTop: hp(0.4) }}>Start voice</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>$0.69/min</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChat} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: hp(2), padding: hp(1.5), alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Text style={{ fontSize: hp(2) }}>💬</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: hp(1.5), fontFamily: fontFamilies.semiBold, marginTop: hp(0.4) }}>Start chat</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>$0.39/min</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Guided first action for new users — shown above Mood Check In */}
        {!selectedMood && reflections.length === 0 && (
          <View style={{ backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: hp(2), padding: hp(2), marginBottom: hp(2), borderWidth: 0.5, borderColor: 'rgba(167,139,250,0.3)' }}>
            <Text style={{ color: theme.white, fontSize: hp(1.8), fontFamily: fontFamilies.semiBold, marginBottom: hp(0.5) }}>
              {t('VenterHome.guidedFirstAction')}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: hp(1.5), fontFamily: fontFamilies.normal, marginBottom: hp(1) }}>
              {t('VenterHome.startTracking')}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
              {t('VenterHome.reflectionPromptDesc')}
            </Text>
          </View>
        )}

        {/* Mood Check In */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>{t('VenterHome.moodCheckIn')}</Text>
          <View style={styles.moodGrid}>
            {moodOptions.map((mood) => {
              const getMoodStyles = (moodId: string) => {
                if (selectedMood !== moodId) return {};
                switch (moodId) {
                  case 'happy': return { bg: theme.moodHappyBG, text: theme.moodHappyText };
                  case 'neutral': return { bg: theme.moodNeutralBG, text: theme.moodNeutralText };
                  case 'sad': return { bg: theme.moodSadBG, text: theme.moodSadText };
                  case 'anxious': return { bg: theme.moodAnxiousBG, text: theme.moodAnxiousText };
                  case 'mad': return { bg: theme.moodMadBG, text: theme.moodMadText };
                  default: return { bg: '#D1F2E2', text: theme.green };
                }
              };

              const moodStyles = getMoodStyles(mood.id);
              const isSelected = selectedMood === mood.id;

              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodItem,
                    isSelected && {
                      backgroundColor: moodStyles.bg,
                      borderColor: moodStyles.bg,
                    },
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <View style={{ padding: hp(0.3), alignItems: 'center' }}>
                    <Image
                      source={mood.icon}
                      style={[
                        styles.moodEmoji,
                        isSelected && { tintColor: moodStyles.text },
                      ]}
                    />
                    <Text
                      style={[
                        styles.moodLabel,
                        isSelected && { color: moodStyles.text },
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reflections Section */}
        <View style={styles.reflectionsSection}>
          {reflections.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { marginBottom: hp(.5) }]}>{t('VenterHome.reflections')}</Text>
              </View>
              <FlatList
                horizontal
                data={reflections}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: hp(1) }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.reflectionCard, styles.reflectionListItem]}
                    onPress={() =>
                      // @ts-ignore - navigating to nested stack screen
                      navigation.navigate(routes.venterInternal, {
                        screen: routes.venterReflectionDetail,
                        params: { reflection: item }
                      })
                    }>
                    <GlassWrapper bordered glassStyles={styles.reflectionCardContent}>
                      <View style={styles.reflectionCardHeader}>
                        <View style={styles.reflectionTextContainer}>
                          <Text numberOfLines={2} style={styles.reflectionCardText}>{item.reflection_text}</Text>
                          <Text style={styles.reflectionDate}>{new Date(item.reflection_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
                        </View>
                        <Image source={chevronIcon} style={styles.reflectionArrow} />
                      </View>
                    </GlassWrapper>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* Your Wallet card */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate(routes.venterWallet)}
            activeOpacity={0.75}
          >
            <GlassWrapper bordered style={styles.streakCardContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hp(1) }}>
                <Text style={[styles.streakMoodLabel, { marginBottom: 0 }]}>Your Wallet</Text>
                <Text style={{ color: theme.primary, fontSize: hp(1.4), fontFamily: fontFamilies.medium }}>View →</Text>
              </View>
              {activeSubscription?.status === 'active' ? (() => {
                const memberMins = walletBalance?.member_minutes ?? walletMinutes ?? 0;
                const rolloverMins = walletBalance?.rollover_minutes ?? 0;
                const total = Math.floor(memberMins + rolloverMins);
                return (
                  <View>
                    <Text style={{ color: theme.white, fontSize: hp(1.7), fontFamily: fontFamilies.normal, marginBottom: hp(0.3) }}>
                      {'⏱ '}<Text style={{ fontFamily: fontFamilies.semiBold }}>{total}</Text>{' member minutes'}
                    </Text>
                    {rolloverMins > 0 && (
                      <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, marginLeft: wp(4) }}>
                        🔄 {rolloverMins} rolled over from last month
                      </Text>
                    )}
                    {(walletBalance?.referral_credits ?? 0) > 0 && (
                      <Text style={{ color: theme.white, fontSize: hp(1.6), fontFamily: fontFamilies.normal, marginTop: hp(0.4) }}>
                        {'🎁 '}<Text style={{ fontFamily: fontFamilies.semiBold }}>${Number(walletBalance.referral_credits).toFixed(2)}</Text>{' referral credits'}
                      </Text>
                    )}
                  </View>
                );
              })() : (walletBalance?.currency ?? 0) > 0 ? (
                <View>
                  <Text style={{ color: theme.white, fontSize: hp(1.7), fontFamily: fontFamilies.normal }}>
                    {'💳 '}<Text style={{ fontFamily: fontFamilies.semiBold }}>${Number(walletBalance.currency).toFixed(2)}</Text>{' available'}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: hp(1.6), fontFamily: fontFamilies.normal, flex: 1 }}>
                    No funds · add to start a session
                  </Text>
                  <TouchableOpacity
                    onPress={e => { (navigation as any).navigate(routes.venterAddFunds); }}
                    style={{ backgroundColor: theme.primary, borderRadius: hp(1.2), paddingHorizontal: wp(3), paddingVertical: hp(0.8) }}
                  >
                    <Text style={{ color: theme.white, fontSize: hp(1.5), fontFamily: fontFamilies.semiBold }}>Add funds</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassWrapper>
          </TouchableOpacity>
        </View>

        {/* Mood Chart Section */}
        <View style={styles.chartSection}>
          <MoodChart
            title={t('VenterHome.moodOverTime')}
            data={chartData}
            maxValue={chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.value), 5) : 5}
            containerStyle={styles.chartContainer}
          />
        </View>
      </ScrollView>
      <WalkthroughModal
        visible={showVenterWalkthrough}
        steps={VENTER_WALKTHROUGH_STEPS}
        onDone={handleVenterWalkthroughDone}
      />
      <GlassModal
        visible={showNoPaymentMethodModal}
        onClose={() => setShowNoPaymentMethodModal(false)}
        showIcon={false}
        title="Payment Method Required"
        message="You need a saved payment method to start a voice session. Add a card to continue."
        showButtons
        primaryButtonText="Add Card"
        secondaryButtonText="Later"
        onPrimaryPress={() => {
            setShowNoPaymentMethodModal(false);
            (navigation as any).navigate(routes.venterInternal, { screen: routes.addPaymentMethod });
        }}
        dismissOnOverlayPress
        dismissOnBackPress
      />
      <GlassModal
        visible={showLowBalanceModal}
        onClose={() => setShowLowBalanceModal(false)}
        showIcon={false}
        title="Low Wallet"
        message="Your wallet is running low. Add funds to keep going."
        showButtons
        primaryButtonText="Top Up"
        secondaryButtonText="Later"
        onPrimaryPress={() => {
            setShowLowBalanceModal(false);
            (navigation as any).navigate(routes.venterInternal, { screen: routes.venterUpgradePlan });
        }}
        dismissOnOverlayPress
        dismissOnBackPress
      />
    </HomeWrapper>
  );
};

export default VenterHome;