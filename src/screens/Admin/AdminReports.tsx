import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import HomeHeader from '../../components/shared/HomeHeader';
import GlassView from '../../components/GlassWrapper';
import SwipeableTabs from '../../components/SwipeableTabs';
import Input from '../../components/Input';
import { logoWithText, notification, searchIcon } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { ScreenHeader } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { AdminReport } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const AdminReports = () => {
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { getReports } = useAdmin();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(t('Admin.moderation.pending'));
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchReports = useCallback(async (isRefresh = false, isLoadMore = false, isManualRefresh = false) => {
    if (loading || loadingMore || refreshing) return;

    if (isManualRefresh) {
      setRefreshing(true);
    } else if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const currentOffset = isRefresh ? 0 : offset;
      const status = activeTab === t('Admin.moderation.pending') ? 'pending' : 'resolved';

      const response = await getReports(status, LIMIT, currentOffset);

      if (response?.reports) {
        if (isRefresh) {
          setReports(response.reports);
          setOffset(LIMIT);
        } else {
          setReports(prev => [...prev, ...response.reports]);
          setOffset(prev => prev + LIMIT);
        }
        setTotal(response.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toastError({ text: error?.message || t('Common.error') });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [offset, activeTab, loading, loadingMore, getReports, t]);

  useEffect(() => {
    fetchReports(true);
  }, [activeTab]);

  const isFirstSearch = useRef(true);
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchReports(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    fetchReports(true, false, true);
  };

  const handleLoadMore = () => {
    if (reports.length < total && !loadingMore) {
      fetchReports(false, true);
    }
  };

  const filteredReports = reports.filter(report =>
    report.id.toLowerCase().includes(search.toLowerCase()) ||
    report.reported_email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderReportCard = ({ item }: { item: AdminReport }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => (navigation as any).navigate(routes.adminInternal, {
        screen: routes.adminReportDetail,
        params: { report: item }
      })}
    >
      <GlassView bordered glassStyles={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.idText}>{t('Admin.moderation.reportId', { id: item.id.substring(0, 8) })}</Text>
          <View style={styles.issueBadge}>
            <Text style={styles.issueText}>{item.reason}</Text>
          </View>
        </View>
        <Text style={styles.infoText}>{t('Admin.moderation.reportedTo', { email: item.reported_email })}</Text>
        <Text style={[styles.infoText, {
          marginBottom: hp(1)
        }]}>{t('Admin.moderation.reportedBy', { email: item.reporter_email })}</Text>
        {item.status === 'resolved' && (
          <Text style={styles.infoText}>{t('Admin.moderation.result', { result: item.status })}</Text>
        )}
        <Text style={styles.dateText}>{formatDate(item?.created_at)}</Text>
      </GlassView>
    </TouchableOpacity>
  );

  const renderContent = (tab: string) => {
    return (
      <FlatList
        data={filteredReports}
        renderItem={renderReportCard}
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
      <View style={styles.container}>
        <Text style={styles.title}>{t('Admin.moderation.title')}</Text>

        <GlassView glassStyles={styles.searchWrapper}>
          <Input
            placeholderTextColor={theme.white60}
            placeholder={t('Admin.moderation.searchPlaceholder')}
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
          tabs={[t('Admin.moderation.pending'), t('Admin.moderation.resolved')]}
          renderContent={renderContent}
          onTabChange={(tab) => setActiveTab(tab)}
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
    marginTop: hp(4),
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: hp(2.2),
    color: theme.white,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  searchWrapper: {
    borderRadius: hp(3),
    paddingHorizontal: wp(4),
    height: hp(5.5),
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  searchInputContainer: {
    borderBottomWidth: 0,
    height: hp(5),
  },
  searchInput: {
    fontSize: hp(1.8),
    color: theme.white,
  },
  listContent: {
    paddingBottom: hp(15),
  },
  card: {
    padding: wp(4),
    borderRadius: hp(2.5),
    marginBottom: hp(1.5),
    backgroundColor: theme.white + '08',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  idText: {
    fontFamily: fontFamilies.bold,
    fontSize: hp(1.8),
    color: theme.white,
  },
  issueBadge: {
    backgroundColor: theme.white + '15',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: hp(2),
  },
  issueText: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(1.2),
    color: theme.white,
  },
  infoText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white + "cc",
    marginBottom: hp(0.3),
  },
  dateText: {
    position: 'absolute',
    top: "90%",
    right: wp(2),
    fontFamily: fontFamilies.normal,
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
});

export default AdminReports;
