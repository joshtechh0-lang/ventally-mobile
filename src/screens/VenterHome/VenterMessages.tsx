import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch, useSelector } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import HomeHeader from '../../components/shared/HomeHeader';
import VenterMessagesStartChatCard from '../../components/shared/VenterMessagesStartChatCard';
import VenterMessagesChatEntry from '../../components/shared/VenterMessagesChatEntry';
import { logoWithText, notification, chatMessages, chevronIcon, chatSingleIcon } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../navigation/routes';
import { Button } from '../../components';
import { setSessionType, setReturnToSession } from '../../store/slices/callSlice';
import type { RootState } from '../../store/store';
import { SESSION_COST } from '../../constants/payment';
import { useChat } from '../../api/apiHooks/useChat';
import { Loader } from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import type { Conversation, SubscriptionResponse } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';
import EmptyState from '../../components/shared/EmptyState';
import { useWallet } from '../../api';

interface ChatEntry {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: number;
}

const VenterMessages = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => { setLangKey(i18n.language); }, [i18n.language]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { getConversations } = useChat();
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const balance = useSelector((state: RootState) => state.user.user.balance ?? 0);
  const { getSubscription, getBalance } = useWallet();

  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);

  const fetchRecentChats = async () => {
    setLoading(true);
    try {
      const response = await getConversations('active', 5, 0);
      if (response?.conversations) {
        console.log("response====>>>>>", response);
        setRecentChats(response.conversations);
      }
      const response1: SubscriptionResponse = await getSubscription();
      console.log("profile res Wallet", response);
      setWalletDetails(response1)
    } catch (error) {
      console.error('Error fetching recent chats:', error);
      toastError({ text: t('Common.errors.fetchingData') });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentChats();
    }, [])
  );

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInMins < 1) return t('Common.time.justNow');
    if (diffInMins < 60) return t('VenterMessages.chatEntry.minutesAgo', { minutes: diffInMins });

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return t('VenterMessages.chatEntry.hoursAgo', { hours: diffInHours });

    return date.toLocaleDateString();
  };

  const styles = StyleSheet.create({
    content: {
      marginTop: hp(4),

      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(16), // Extra padding for bottom tab navigation
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
    recentChatsList: {
      marginBottom: hp(1),
    },
  });

  const handleStartChat = async () => {
    if (loadingStart) return;
    dispatch(setSessionType('chat'));
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

      const remainingMessages = freshSub?.remainingMessages ?? 0;
      const currency = freshWallet?.currency ?? 0;
        const walletMinutes = freshWallet?.minutes ?? 0;

      if (remainingMessages > 0) {
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
      toastError({ text: t('Common.errors.fetchingData') });
    } finally {
      setLoadingStart(false);
    }
  };

  const handleChatPress = (chatId: any) => {
    // Navigate to chat detail screen
    // @ts-ignore - nested navigation params
    navigation.navigate(routes.chatStack, {
      screen: routes.chat,
      params: { chatId: chatId },
    });
  };

  const handleViewAll = () => {
    // Navigate to all chats screen
    // @ts-ignore - nested navigation params
    navigation.navigate(routes.chatStack, {
      screen: routes.recentChats,
    });
  };

  const { isChatActive, chatData } = useSelector((state: RootState) => state.call);

  return (
    <HomeWrapper>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Start a Chat Card */}
        <VenterMessagesStartChatCard
          title={t('VenterMessages.startChat.title')}
          subtitle={t('VenterMessages.startChat.subtitle')}
          icon={chatSingleIcon}
          onPress={handleStartChat}
          loading={loadingStart}
        />
        <View style={styles.separator} />
        {/* Recent Chat Section */}
        <Text style={styles.sectionTitle}>{t('VenterMessages.recentChat')}</Text>
        <FlatList
          data={recentChats}
          renderItem={({ item }) => (
            <VenterMessagesChatEntry
              key={item.id}
              name={item.otherParticipant?.anonymousName || 'Anonymous'}
              // @ts-ignore
              lastMessage={item?.lastMessage}
              timeAgo={formatTimeAgo(item?.lastMessage?.createdAt || item.updatedAt || item.createdAt)}
              icon={chatSingleIcon}
              onPress={() => handleChatPress(item)}
              isActive={item?.status === 'active'}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.recentChatsList}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                title={t('VenterMessages.noChats')}
                description={t('VenterMessages.noChatsDescription')}
              />
            ) : null
          }
        />


        {/* View All Button */}
        {recentChats.length !== 0 && <Button
          title={t('VenterMessages.viewAll')}
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

export default VenterMessages;
