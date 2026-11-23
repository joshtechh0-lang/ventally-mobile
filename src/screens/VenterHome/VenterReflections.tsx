import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import VenterReflectionCard from '../../components/shared/VenterReflectionCard';
import { routes } from '../../navigation/routes';
import { Button } from '../../components';
import { useReflections } from '../../api/apiHooks/useReflections';
import { ReflectionEntry } from '../../types/apiPayloadsTypes';
import EmptyState from '../../components/shared/EmptyState';

const VenterReflections = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { theme } = useTheme();

  const { getReflectionHistory, getTodayReflection } = useReflections();

  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [todayReflection, setTodayReflection] = useState<ReflectionEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const fetchReflections = async (isRefresh = false, isLoadMore = false) => {
    if (isLoadMore && (!hasMore || loadingMore)) return;

    if (isRefresh) {
      setRefreshing(true);
    } else if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentOffset = isRefresh ? 0 : offset;
      const res = await getReflectionHistory(LIMIT, currentOffset);

      if (isRefresh) {
        // Fetch today's reflection as well
        const todayRes = await getTodayReflection().catch(() => null);
        if (todayRes?.saved && todayRes.reflection) {
          setTodayReflection(todayRes.reflection);
        } else {
          setTodayReflection(null);
        }
      }

      if (res?.reflections) {
        if (isRefresh) {
          setReflections(res.reflections);
          setOffset(res.reflections.length);
        } else {
          setReflections(prev => [...prev, ...res.reflections]);
          setOffset(prev => prev + res.reflections.length);
        }
        setHasMore(res.reflections.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error fetching reflections:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReflections(true);
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddReflection = () => {
    if (todayReflection) {
      // @ts-ignore
      navigation.navigate(routes.venterReflectionDetail, {
        reflection: todayReflection,
      });
    } else {
      // @ts-ignore
      navigation.navigate(routes.venterAddReflection);
    }
  };

  const handleReflectionPress = (reflection: ReflectionEntry) => {
    // @ts-ignore
    navigation.navigate(routes.venterReflectionDetail, {
      reflection: reflection,
    });
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    addButton: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(2),
      borderRadius: hp(3),
      marginBottom: hp(3),
      alignItems: 'center',
    },
    addButtonText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
    },
    sectionTitle: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2),
      color: theme.white,
      marginVertical: hp(2),
    },
    listContent: {
      paddingBottom: hp(3),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: hp(10),
    },
    emptyText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white60,
      textAlign: 'center',
    },
  });

  return (
    <HomeWrapper key={langKey}>
      <ScreenHeader
        title={t('VenterHome.yourReflections')}
        onBackPress={handleBack}
      />

      <View style={styles.content}>
        {/* Add Reflection Button */}
        <Button
          title={t('VenterHome.addReflection')}
          onPress={handleAddReflection}
          buttonStyle={{}}
          titleStyle={{}}
          disabled={false}
          iconStyle={{}}
        />

        {/* Recent Reflections */}
        <Text style={styles.sectionTitle}>{t('VenterHome.recentReflections')}</Text>

        {loading && reflections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={theme.white} />
          </View>
        ) : (
          <FlatList
            data={reflections}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <VenterReflectionCard
                date={new Date(item.reflection_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                text={item.reflection_text}
                onPress={() => handleReflectionPress(item)}
              />
            )}
            onEndReached={() => fetchReflections(false, true)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: hp(2) }}>
                  <ActivityIndicator size="small" color={theme.white} />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchReflections(true)}
                tintColor={theme.white}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>

                <EmptyState
                  title={t('VenterHome.noReflections')}
                  description={t('VenterHome.noReflectionsDescription')}
                />
              </View>

            }
          />
        )}
      </View>
    </HomeWrapper>
  );
};

export default VenterReflections;
