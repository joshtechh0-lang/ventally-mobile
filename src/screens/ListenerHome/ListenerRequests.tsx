import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { callIcon } from '../../assets/icons';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import EmptyState from '../../components/shared/EmptyState';
import { apiInstance } from '../../api';
import socketService from '../../sockets';
import { csLog } from '../../hooks/UseNotifications';

const POLL_INTERVAL_MS = 8000;

interface ReceivedRequest {
  id: string;
  requestId: string;
  requestType: string;
  status: 'requesting' | 'active' | 'ended' | 'declined' | 'cancelled';
  requester: {
    id: string;
    anonymousName: string;
    avatarSeed?: string | null;
  };
  venterId: string;
  listenerId: string;
  ratePerMinute: number | null;
  createdAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  requesting: 'Unanswered',
  ringing: 'Unanswered',
  active: 'In Session',
  ended: 'Completed',
  declined: 'Declined',
  cancelled: 'Missed',
};

const STATUS_COLOR: Record<string, string> = {
  requesting: '#FF9800',   // orange — still pending, not yet active
  ringing: '#FF9800',      // orange
  active: '#2196F3',       // blue
  ended: '#9E9E9E',        // grey
  declined: '#F44336',     // red
  cancelled: '#9E9E9E',    // grey
};

const ListenerRequests = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const navigation = useNavigation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [requests, setRequests] = useState<ReceivedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceived = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      await csLog(`[Activity] fetching calls/received (showLoader=${showLoader})`);
      const res = await apiInstance.get('calls/received');
      const raw: ReceivedRequest[] = res?.data?.requests ?? [];
      await csLog(`[Activity] calls/received OK — ${raw.length} item(s)`);
      setRequests(raw);
    } catch (e: any) {
      await csLog(`[Activity] calls/received ERROR: ${e?.message} | status=${e?.response?.status} | data=${JSON.stringify(e?.response?.data).slice(0, 200)}`);
      // Keep existing list on error
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReceived(true);
      intervalRef.current = setInterval(() => fetchReceived(false), POLL_INTERVAL_MS);

      socketService.on('call:request', () => fetchReceived(false));
      socketService.on('call:accepted', () => fetchReceived(false));
      socketService.on('call:declined', () => fetchReceived(false));
      socketService.on('call:ended', () => fetchReceived(false));

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        socketService.off('call:request', () => fetchReceived(false));
        socketService.off('call:accepted', () => fetchReceived(false));
        socketService.off('call:declined', () => fetchReceived(false));
        socketService.off('call:ended', () => fetchReceived(false));
      };
    }, [fetchReceived])
  );

  const handleRequestPress = useCallback((item: ReceivedRequest) => {
    (navigation as any).navigate(routes.listenerIncomingRequest, {
      requestId: item.requestId,
    });
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    headerTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(3),
    },
    listContent: {
      paddingBottom: hp(10),
    },
    card: {
      marginBottom: hp(2),
      padding: hp(2),
      borderRadius: hp(2),
      backgroundColor: theme.black + '10',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    iconContainer: {
      width: hp(4),
      height: hp(4),
      borderRadius: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    icon: {
      width: hp(2),
      height: hp(2),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    cardTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.8),
      color: theme.white,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.4),
      borderRadius: hp(1),
    },
    statusText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.3),
      color: theme.white,
    },
    rateText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.4),
      color: theme.white + 'AA',
      marginBottom: hp(1),
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: hp(0.5),
    },
    actionButton: {
      width: '60%',
      borderRadius: hp(2.5),
    },
    actionButtonTitle: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderItem = ({ item }: { item: ReceivedRequest }) => {
    const statusColor = STATUS_COLOR[item.status] ?? '#9E9E9E';
    const statusLabel = STATUS_LABEL[item.status] ?? item.status;
    const isActive = item.status === 'active';

    return (
      <GlassView style={styles.card} bordered>
        <View style={styles.cardHeader}>
          <GlassView style={styles.iconContainer}>
            <Image source={callIcon} style={styles.icon} />
          </GlassView>
          <Text style={styles.cardTitle}>
            {item.requester?.anonymousName ?? 'Anonymous'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + 'CC' }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {item.ratePerMinute != null && (
          <Text style={styles.rateText}>
            ${item.ratePerMinute.toFixed(2)}/min
          </Text>
        )}

        {isActive && (
          <View style={styles.actionsRow}>
            <Button
              title="View Request"
              onPress={() => handleRequestPress(item)}
              glassStyles={styles.actionButton}
              titleStyle={styles.actionButtonTitle}
            />
          </View>
        )}
      </GlassView>
    );
  };

  if (loading) {
    return (
      <HomeWrapper key={langKey}>
        <View style={[styles.container, styles.loaderContainer]}>
          <ActivityIndicator color={theme.white} size="large" />
        </View>
      </HomeWrapper>
    );
  }

  return (
    <HomeWrapper key={langKey}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>
          {t('Listener.requests.title') || 'Requests'}
        </Text>

        {requests.length === 0 ? (
          <EmptyState
            title={t('Listener.requests.noRequests') || 'No Requests'}
            description={t('Listener.requests.noRequestsSubtitle') || "We'll notify you when someone needs to chat"}
          />
        ) : (
          <FlatList
            data={requests}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </HomeWrapper>
  );
};

export default ListenerRequests;
