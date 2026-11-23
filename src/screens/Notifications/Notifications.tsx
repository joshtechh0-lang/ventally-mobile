import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import NotificationCard from '../../components/shared/NotificationCard';
import { routes } from '../../navigation/routes';

import { useNotifications } from '../../api/apiHooks/useNotifications';
import { ActivityIndicator, RefreshControl } from 'react-native';
import EmptyState from '../../components/shared/EmptyState';

const Notifications = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();
  const { getHistory, markAsRead } = useNotifications();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const limit = 20;

  const fetchNotifications = async (newOffset: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (newOffset > 0) setLoadingMore(true);
      else setLoading(true);

      const res = await getHistory(limit, newOffset);
      if (res?.success) {
        const newData = res.data || [];
        setNotifications(prev => isRefresh ? newData : [...prev, ...newData]);
        setOffset(newOffset);
        setHasMore(newData.length === limit);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications(0);
  }, []);

  const handleRefresh = () => {
    fetchNotifications(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore && notifications.length > 0) {
      fetchNotifications(offset + limit);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    try {
      if (!notification.read_at) {
        await markAsRead(notification.id);
        // Optimistically update local state
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
        ));
      }
      (navigation as any).navigate(routes.notificationDetail, { notification });
    } catch (error) {
      console.log('Error marking notification as read:', error);
      // Still navigate even if marking as read fails
      (navigation as any).navigate(routes.notificationDetail, { notification });
    }
  };

  const styles = StyleSheet.create({
    content: {
      width: '100%',
    },
    listContent: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(4),
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title={t('Notifications.title')}
        onBackPress={handleBack}
        showBackButton
      />
      <View style={styles.content}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListFooterComponent={() => (
            loadingMore ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: hp(2) }} />
            ) : null
          )}
          ListEmptyComponent={() => (
            !loading && (
              <EmptyState
                title={t('Notifications.noNotifications')}
                description={t('Notifications.noNotificationsDescription')}
                containerStyle={{ marginTop: hp(10) }}
              />
            )
          )}
          renderItem={({ item }) => (
            <NotificationCard
              title={item?.title === "Incoming call" ? t("Notifications.incomingCall") : item?.title === "New chat request" ? t("Notifications.incomingChat") : item?.title}
              message={item.body}
              time={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              unread={!item.read_at}
              onPress={() => handleNotificationPress(item)}

            />
          )}
        />
      </View>
    </HomeWrapper>
  );
};

export default Notifications;
