import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { routes } from '../../navigation/routes';
import GlassView from '../../components/GlassWrapper';
import SwipeableTabs from '../../components/SwipeableTabs';
import Input from '../../components/Input';
import { chatSingleIcon, searchIcon, userRequests } from '../../assets/icons';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminUserListItem } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';

const UserCard = ({ email, id, stats, accountType, createdAt }: AdminUserListItem) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();

  const isBoth = accountType === 'both';

  return (
    <TouchableOpacity onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminUserDetail, params: { userId: id } })}>
      <GlassView bordered glassStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.email} numberOfLines={1}>{email}</Text>
          {isBoth && (
            <View style={styles.bothBadge}>
              <Text style={styles.bothText}>{t('Admin.users.card.both')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.idText}>ID: {id}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>{t('Admin.users.card.sessions')}: <Text style={styles.statValue}>{stats?.totalSessions || 0}</Text></Text>
          <Text style={styles.statLabel}>{t('Admin.users.card.minutes')}: <Text style={styles.statValue}>{stats?.totalMinutes || 0}</Text></Text>
        </View>
      </GlassView>
    </TouchableOpacity>
  );
};

const AdminUsers = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { t } = useTranslationWithUpdate();
  const { adminListUsers } = useAdmin();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(t('Admin.users.tabs.venters'));
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;
  // Use a ref to avoid stale closure issues with offset inside useCallback
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchUsers = useCallback(async (isRefresh = false, isLoadMore = false, isManualRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManualRefresh) {
      setRefreshing(true);
    } else if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentOffset = isRefresh ? 0 : offsetRef.current;
      const role: 'venter' | 'listener' | 'both' = activeTab === t('Admin.users.tabs.venters') ? 'venter' : 'listener';

      const response = await adminListUsers(search, role, LIMIT, currentOffset);

      if (response?.users) {
        if (isRefresh) {
          setUsers(response.users);
          offsetRef.current = LIMIT;
        } else {
          setUsers(prev => [...prev, ...response.users]);
          offsetRef.current = currentOffset + LIMIT;
        }
        setTotal(response.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toastError({ text: error?.message || t('Common.error') });
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab, search, adminListUsers, t]);

  useEffect(() => {
    fetchUsers(true);
  }, [activeTab]);

  const isFirstSearch = useRef(true);
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchUsers(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    fetchUsers(true, false, true);
  };

  const handleLoadMore = () => {
    if (users.length < total && !loadingMore && !isFetchingRef.current) {
      fetchUsers(false, true);
    }
  };

  const renderContent = (tab: string) => {
    return (
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserCard {...item} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.white}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={theme.white} style={{ marginVertical: hp(2) }} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('Common.noData')}</Text>
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <HomeWrapper>
      <ScreenHeader
        showBackButton={false}
        title={t('Admin.users.title')}
        rightComponent={
          <Pressable onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminListenerRequests })} style={styles.headerRight}>
            <GlassView style={styles.headerRight}>
              <Image source={userRequests} style={styles.headerIcon} resizeMode="contain" />
            </GlassView>
          </Pressable>
        }
      />
      <View style={styles.container}>
        <GlassView glassStyles={styles.searchWrapper}>
          <Input
            placeholderTextColor={theme.white60}
            placeholder={t('Admin.users.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            noTitle
            rightIcon={searchIcon}
            inputContainerStyle={{ borderBottomWidth: 0 }}
          />
        </GlassView>

        <SwipeableTabs
          tabs={[t('Admin.users.tabs.venters'), t('Admin.users.tabs.listeners')]}
          renderContent={renderContent}
          onTabChange={(tab) => setActiveTab(tab)}
          paddingHorizontal={wp(5)}
        />
      </View>
      <Loader isVisible={loading} />
    </HomeWrapper>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  searchWrapper: {
    borderRadius: hp(3),
    paddingHorizontal: wp(4),
    height: hp(5.5),
    justifyContent: 'center',
    marginBottom: hp(3),
    backgroundColor: theme.black + '02',
  },
  searchInputContainer: {
    borderBottomWidth: 0,
    height: hp(5),
  },
  searchInput: {
    paddingRight: wp(8),
    fontSize: hp(1.8),
    color: theme.white,
  },
  searchIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: theme.white60,
  },
  tabsWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp(12),
  },
  card: {
    padding: wp(4),
    borderRadius: hp(2),
    marginBottom: hp(1.5),
    backgroundColor: theme.black + '20',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  email: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(2),
    color: theme.white,
  },
  idText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white + "cc",
    marginBottom: hp(1),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(4),
  },
  statLabel: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.4),
    color: theme.white + "cc",
  },
  statValue: {
    color: theme.white80,
  },
  bothBadge: {
    backgroundColor: theme.white20,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: hp(1),
  },
  bothText: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(1.4),
    color: theme.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(20),
  },
  emptyText: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(1.8),
    color: theme.white60,
  },
  headerRight: {
    paddingRight: wp(1),
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(2.25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: hp(4.5),
    height: hp(4.5),
    borderRadius: hp(2.25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: hp(2),
    height: hp(2),
    tintColor: theme.white,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  redDot: {
    position: 'absolute',
    top: hp(0.8),
    right: wp(2.5),
    width: hp(0.8),
    height: hp(0.8),
    borderRadius: hp(0.4),
    backgroundColor: theme.magenda,
  }
});

export default AdminUsers;
