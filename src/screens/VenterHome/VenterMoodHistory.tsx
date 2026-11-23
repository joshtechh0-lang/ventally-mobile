import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import GlassView from '../../components/GlassWrapper';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import { useMood } from '../../api/apiHooks/useMood';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import EmptyState from '../../components/shared/EmptyState';

type MoodItem = {
  id: string;
  dateLabel: string;
  mood: string;
  note: string;
  time: string;
  category: string;
  fullData: any;
};

const VenterMoodHistory = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { getMoodHistory } = useMood();

  const [items, setItems] = useState<MoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  const fetchMoodHistory = async (newOffset: number, isRefresh: boolean) => {
    try {
      const response = await getMoodHistory(LIMIT, newOffset);

      if (response?.moods) {
        const mappedItems: MoodItem[] = response.moods.map((mood) => ({
          id: mood.id,
          dateLabel: formatDate(mood.logged_date || mood.created_at),
          mood: mood.mood_type,
          note: mood.notes,
          time: formatTime(mood.created_at),
          category: mood.category,
          fullData: mood,
        }));

        if (isRefresh) {
          setItems(mappedItems);
        } else {
          setItems((prev) => [...prev, ...mappedItems]);
        }

        setOffset(newOffset + LIMIT);

        if (response.pagination) {
          setHasMore(response.pagination.has_more);
        } else {
          setHasMore(mappedItems.length === LIMIT);
        }
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
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
    fetchMoodHistory(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchMoodHistory(offset, false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMoodHistory(0, true);
    }, [])
  );

  const handleBack = () => navigation.goBack();

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    card: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      backgroundColor: theme.black + '10',
      marginBottom: hp(1.5),
    },
    date: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
      marginBottom: hp(0.6),
    },
    mood: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(0.6),
    },
    note: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + "cc",
      lineHeight: hp(2.1),
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader title={t('VenterMoodHistory.title')} onBackPress={handleBack} />
      {/* <ScrollView  showsVerticalScrollIndicator={false}> */}

      <FlatList
        data={items}
        style={styles.content}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              (navigation as any).navigate(routes.venterMoodDetails, { item: item });
            }}
          >
            <GlassView bordered radius={hp(1.8)} glassStyles={styles.card}>
              <Text style={styles.date}>{item.dateLabel}</Text>
              <Text style={styles.mood}>{item.mood}</Text>
              <Text style={styles.note}>{item.note}</Text>
            </GlassView>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => {
          return loading ? null : (
            <EmptyState
              title={t('VenterMoodHistory.noMoods')}
              description={t('VenterMoodHistory.noMoodsDescription')}
            />
          )
        }}
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
      {/* </ScrollView> */}
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

export default VenterMoodHistory;
