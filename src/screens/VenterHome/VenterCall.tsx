import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch, useSelector } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import HomeHeader from '../../components/shared/HomeHeader';
import VenterCallStartCard from '../../components/shared/VenterCallStartCard';
import VenterCallEntry from '../../components/shared/VenterCallEntry';
import { logoWithText, notification, callIcon } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../navigation/routes';
import { Button, GlassModal, Loader } from '../../components';
import { useCalls } from '../../api/apiHooks/useCalls';
import { Call, SubscriptionResponse } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';
import { setSessionType, setReturnToSession } from '../../store/slices/callSlice';
import { SESSION_COST } from '../../constants/payment';
import type { RootState } from '../../store/store';
import EmptyState from '../../components/shared/EmptyState';
import FindingListenerScreen from '../Chat/FindingListenerScreen';
import { apiInstance, ApiResponse, useWallet } from '../../api';

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} d ago`;
};

const VenterCall = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getSubscription, getBalance } = useWallet();
  // const balance = useSelector((state: RootState) => state.user.user.balance ?? 0);

  const { getCalls } = useCalls();
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [showFindingListenerModal, setShowFindingListenerModal] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchRecentCalls();
    }, [])
  );

  const fetchRecentCalls = async () => {
    setLoading(true);
    try {
      // Fetch 3 recent calls
      // @ts-ignore
      const response = await getCalls(null, 3, 0);
      if (response?.calls) {
        setRecentCalls(response.calls);
      }
      const response1: SubscriptionResponse = await getSubscription();
      console.log("profile res Wallet", response);
      setWalletDetails(response1)

    } catch (error: any) {
      console.error('Error fetching recent calls:', error);
      toastError({ text: error?.message || error?.error });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    content: {
      marginTop: hp(4),
      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(16),
    },
    separator: {
      height: 1,
      backgroundColor: theme.white + '30',
      marginTop: hp(2.5),
    },
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2),
      color: theme.white,
      marginVertical: hp(1.5),
    },
    recentCallsList: {
      marginBottom: hp(1),
    },
  });

  const handleStartCall = async () => {
    if (loadingStart) return;
    dispatch(setSessionType('call'));
    setLoadingStart(true);
    try {
      const [subRes, walletRes] = await Promise.allSettled([
        getSubscription(),
        getBalance(),
      ]);

      const freshSub =
        subRes.status === 'fulfilled' ? subRes.value?.subscription : null;
      const freshWallet =
        walletRes.status === 'fulfilled' ? walletRes.value?.balance : null;

      const remainingMinutes = freshSub?.remainingMinutes ?? 0;
      const currency = freshWallet?.currency ?? 0;
      const walletMinutes = freshWallet?.minutes ?? 0;

      if (remainingMinutes > 0) {
        (navigation as any).navigate(routes.chatStack, {
          screen: routes.findingListener,
        });
    } else if (walletMinutes > 0 || currency > 0) {
        (navigation as any).navigate(routes.chatStack, {
          screen: routes.findingListener,
        });
      } else {
        dispatch(setReturnToSession(true));
        if (freshSub && freshSub.id) {
            (navigation as any).navigate(routes.venterInternal, { screen: routes.venterAddFunds });
        } else {
            (navigation as any).navigate(routes.venterInternal, { screen: routes.venterUpgradePlan });
        }
      }
    } catch (error: any) {
      toastError({ text: error?.message || error?.error || t('Common.errors.fetchingData') });
    } finally {
      setLoadingStart(false);
    }
  };

  const handleCallPress = (callId: string) => {
    (navigation as any).navigate(routes.chatStack, {
      screen: routes.chat,
      params: { chatId: callId },
    });
  };

  const handleViewAll = () => {
    (navigation as any).navigate(routes.venterAllCalls);
  };

  return (
    <HomeWrapper key={langKey}>


      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Start a Call Card */}
        <VenterCallStartCard
          title={t('VenterCall.startCallCard.title')}
          subtitle={t('VenterCall.startCallCard.subtitle')}
          icon={callIcon}
          onPress={handleStartCall}
          loading={loadingStart}
        />

        <View style={styles.separator} />

        {/* Recent Calls Section */}
        <Text style={styles.sectionTitle}>{t('VenterCall.recentCall')}</Text>
        <FlatList
          data={recentCalls}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <VenterCallEntry
              key={item.id}
              name={item.otherParticipant?.anonymousName || 'Anonymous'}
              lastCall={t('VenterCall.callEntry.lastCall')} // You might want to update this based on call status or duration
              // @ts-ignore
              timeAgo={formatTimeAgo(item.createdAt)}
              icon={callIcon}
              onPress={() => null}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.recentCallsList}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title={t('VenterCall.noRecentCalls')}
                description={t('VenterCall.noRecentCallsDescription')}
              />
            ) : null
          }
        />

        {/* View All Button */}
        {recentCalls.length > 0 && <Button
          title={t('VenterCall.viewAll')}
          onPress={handleViewAll}
          buttonStyle={{}}
          glassStyles={{}}
          titleStyle={{}}
          disabled={false}
          leftIcon={undefined}
          iconStyle={{}}
        />}
      </ScrollView>
      <Loader isVisible={loading} />

    </HomeWrapper>
  );
};

export default VenterCall;
