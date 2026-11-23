import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Pressable, RefreshControl } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import HomeHeader from '../../components/shared/HomeHeader';
import GlassView from '../../components/GlassWrapper';
import Input from '../../components/Input';
import { logoWithText, notification, searchIcon, chatIcon, planIcon, x, userRequests } from '../../assets/icons';
import { routes } from '../../navigation/routes';
import { ScreenHeader } from '../../components';
import { useAdmin } from '../../api/apiHooks/useAdmin';
import { SubAdmin } from '../../types/apiPayloadsTypes';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';

const AdminSubAdmins = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { t } = useTranslationWithUpdate();
  const navigation = useNavigation();
  const { getSubAdmins } = useAdmin();

  const [search, setSearch] = useState('');
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubAdmins = useCallback(async (isRefresh = false, isManualRefresh = false) => {
    if (loading || refreshing) return;

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await getSubAdmins();
      if (response?.subAdmins) {
        console?.log('/-------___--__>', response?.subAdmins)
        setSubAdmins(response.subAdmins);
      }
    } catch (error: any) {
      console.error('Error fetching sub-admins:', error);
      toastError({ text: error?.message || t('Common.error') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSubAdmins, t]);

  useFocusEffect(
    useCallback(() => {
      fetchSubAdmins();
    }, [])
  );

  const onRefresh = () => {
    fetchSubAdmins(true, true);
  };

  const filteredData = subAdmins.filter(item =>
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const renderSubAdminCard = ({ item }: { item: SubAdmin }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => (navigation as any).navigate(routes.adminInternal, {
        screen: routes.adminSubAdminProfile,
        params: { subAdmin: item }
      })}
    >
      <GlassView bordered glassStyles={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.leftSection}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? theme.primary + '40' : item.status === 'suspended' ? theme.magenda + '40' : theme.white20 }]}>
                  <Text style={styles.statusText}>{t(`Admin.status.${item.status}`)}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                {/* <Text style={styles.idText}>{t('Admin.subAdminProfile.id')}: {item.id}</Text> */}
                <Text style={styles.idText}>{item.userType}</Text>
              </View>

            </View>

          </View>

        </View>
      </GlassView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{t('Admin.subAdmins.emptyState')}</Text>
      <Text style={styles.emptyStateMessage}>{t('Admin.subAdmins.emptyStateMessage')}</Text>
    </View>
  );

  return (
    <HomeWrapper>
      <ScreenHeader
        title={t('Admin.subAdmins.title')}
        showBackButton={false}
        rightComponent={
          <Pressable
            // onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminListenerRequests })} 
            style={styles.headerRight}>
            <GlassView
              style={styles.headerRight}>
              <Image source={userRequests} style={styles.headerIcon} resizeMode="contain" />
            </GlassView>
          </Pressable>
        }
      />
      <View style={styles.container}>
        <GlassView glassStyles={styles.searchWrapper}>
          <Input
            placeholderTextColor={theme.white60}
            placeholder={t('Admin.subAdmins.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
            inputStyle={styles.searchInput}
            noTitle
            rightIcon={searchIcon}
            inputContainerStyle={{ borderBottomWidth: 0 }}
          />
        </GlassView>

        <FlatList
          data={filteredData}
          renderItem={renderSubAdminCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.white}
            />
          }
        />

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate(routes.adminInternal, {
            screen: routes.adminAddSubAdmin
          })}
        >
          <GlassView glassStyles={styles.fabGlass}>
            <Image source={x} style={styles.fabIcon} />
          </GlassView>
        </TouchableOpacity>
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
    marginBottom: hp(2),
    borderRadius: hp(2.5),
    paddingHorizontal: wp(2),
  },
  searchInput: {
    paddingRight: wp(8),
    fontSize: hp(1.8),
    color: theme.white,
  },
  listContainer: {
    paddingBottom: hp(12),
  },
  card: {
    padding: wp(4),
    borderRadius: hp(2),
    marginBottom: hp(1.5),
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    flex: 1,
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
    width: hp(2.5),
    height: hp(2.5),
    tintColor: theme.white,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  avatarContainer: {
    padding: hp(0.5),
    borderRadius: 999,
  },
  avatar: {
    width: hp(4),
    height: hp(4),
  },
  email: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(2),
    color: theme.white,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  statusBadge: {
    backgroundColor: theme.white + '20',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: hp(2),
  },
  statusText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.2),
    color: theme.white,
  },
  idText: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white + 'cc',
    marginTop: hp(0.3),
  },
  permissionsBadge: {
    backgroundColor: theme.white20,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: hp(1),
  },
  permissionsText: {
    fontFamily: fontFamilies.medium,
    fontSize: hp(1.4),
    color: theme.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
    paddingHorizontal: wp(10),
  },
  emptyStateTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: hp(2.2),
    color: theme.white,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontFamily: fontFamilies.normal,
    fontSize: hp(1.6),
    color: theme.white60,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: hp(7),
    right: wp(5),
    width: hp(5),
    height: hp(5),
    borderRadius: hp(3.5),
  },
  fabGlass: {
    width: '100%',
    height: '100%',
    borderRadius: hp(999),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white + "10"
  },
  fabIcon: {
    width: hp(3),
    height: hp(3),
    resizeMode: 'contain',
    tintColor: theme.white,
    transform: [{ rotate: '45deg' }],
    alignSelf: "center"
  },
});

export default AdminSubAdmins;
