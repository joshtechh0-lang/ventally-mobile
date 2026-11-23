import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import VenterMessagesChatEntry from '../../components/shared/VenterMessagesChatEntry';
import { chatSingleIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useChat } from '../../api/apiHooks/useChat';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import EmptyState from '../../components/shared/EmptyState';
import { toastError } from '../../utils/toast';
import type { Conversation } from '../../types/apiPayloadsTypes';
import { ActivityIndicator } from 'react-native';

interface ChatEntry {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: number;
}

const RecentChatsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const navigation = useNavigation();
  const { getConversations } = useChat();

  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchChats = async (newOffset: number, isRefresh: boolean) => {
    try {
      const response = await getConversations('active', LIMIT, newOffset);
      console.log('response======>>>>>', response);
      if (response?.conversations) {
        if (isRefresh) {
          setItems(response.conversations);
        } else {
          setItems((prev) => [...prev, ...response.conversations]);
        }

        setOffset(newOffset + LIMIT);

        if (response.pagination) {
          setHasMore(response.pagination.has_more);
        } else {
          setHasMore(response.conversations.length === LIMIT);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toastError({ text: t('Common.errors.fetchingData') });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setHasMore(true);
    fetchChats(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore && items.length > 0) {
      setLoadingMore(true);
      fetchChats(offset, false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchChats(0, true);
    }, [])
  );

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';

    // If dateStr doesn't contain timezone info, assume it's UTC and append 'Z'
    const utcDateStr = (dateStr.includes('Z') || dateStr.includes('+'))
      ? dateStr
      : `${dateStr.replace(' ', 'T')}${dateStr.includes('T') ? '' : ''}Z`;

    // new Date(utcDateStr) will correctly parse UTC and internal representation will be local-aware
    const date = new Date(utcDateStr.replace('ZZ', 'Z')); // Safety check for double Z
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
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    chatsList: {
      flex: 1,
    },
  });

  const handleChatPress = (chatId: any) => {
    // Navigate to chat detail screen
    // @ts-ignore - nested navigation params
    navigation.navigate(routes.chatStack, {
      screen: routes.chat,
      params: { chatId: chatId },
    });
  };

  return (
    <HomeWrapper>
      <ScreenHeader
        title={t('VenterChat.recentChats.title')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        style={styles.content}
        renderItem={({ item }: { item: Conversation }) => (
          <VenterMessagesChatEntry
            key={item.id}
            name={item.otherParticipant?.anonymousName || 'Anonymous'}
            lastMessage={item.lastMessage?.content || t('VenterMessages.chatEntry.noMessages')}
            timeAgo={formatTimeAgo(item.lastMessage?.createdAt || item.updatedAt || item.createdAt)}
            icon={chatSingleIcon}
            onPress={() => handleChatPress(item)}
            isActive={item?.status === 'active'}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          loading ? null : (
            <EmptyState
              title={t('VenterChat.recentChats.noChats')}
              description={t('VenterChat.recentChats.noChatsDescription')}
            />
          )
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={{ paddingVertical: hp(2), alignItems: 'center' }}>
              <ActivityIndicator color={theme.white} />
            </View>
          ) : <View style={{ height: hp(3) }} />
        )}
      />
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

export default RecentChatsScreen;

