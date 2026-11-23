import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import VenterCallEntry from '../../components/shared/VenterCallEntry';
import { callIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { useCalls } from '../../api/apiHooks/useCalls';
import { Call } from '../../types/apiPayloadsTypes';
import { toastError } from '../../utils/toast';
import { Loader } from '../../components';
import EmptyState from '../../components/shared/EmptyState';

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

const VenterAllCallsScreen = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const navigation = useNavigation();

  const { getCalls } = useCalls();
  const [items, setItems] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  useFocusEffect(
    useCallback(() => {
      fetchCalls(0, true);
    }, [])
  );

  const fetchCalls = async (newOffset: number, isRefresh: boolean) => {
    if (isRefresh) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // @ts-ignore
      const response = await getCalls(undefined, null,);

      if (response?.calls) {
        if (isRefresh) {
          setItems(response.calls);
        } else {
          setItems(prev => [...prev, ...response.calls]);
        }

        if ((response as any).pagination) {
          setHasMore((response as any).pagination.has_more);
          setOffset(newOffset + LIMIT);
        } else {
          // Fallback if pagination info isn't returned
          setHasMore(response.calls.length === LIMIT);
          setOffset(newOffset + LIMIT);
        }
      }
    } catch (error: any) {
      console.error('Error fetching calls:', error);
      toastError({ text: t('Common.errors.fetchingData') });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCalls(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading && items.length > 0) {
      fetchCalls(offset, false);
    }
  };

  const styles = StyleSheet.create({
    content: {
      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(16),
    },
    callsList: {
      marginTop: hp(1),
    },
  });

  const handleCallPress = (callId: string) => {
    (navigation as any).navigate(routes.chatStack, {
      screen: routes.chat,
      params: { chatId: callId },
    });
  };

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title={t('VenterCall.allCallsTitle')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <VenterCallEntry
            key={item.id}
            name={item.otherParticipant?.anonymousName || 'Anonymous'}
            lastCall={t('VenterCall.callEntry.lastCall')}
            // @ts-ignore
            timeAgo={formatTimeAgo(item.createdAt)}
            icon={callIcon}
            onPress={() => null}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (loadingMore ? <ActivityIndicator size="small" color={theme.primary} /> : null)}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={t('VenterCall.noRecentCalls')}
              description={t('VenterCall.noRecentCallsDescription')}
            />
          ) : null
        }
      />
      <Loader isVisible={loading && !refreshing} />
    </HomeWrapper>
  );
};

export default VenterAllCallsScreen;
