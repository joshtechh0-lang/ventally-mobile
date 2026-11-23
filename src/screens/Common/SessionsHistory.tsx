import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import SwipeableTabs from '../../components/SwipeableTabs';
import { fontFamilies } from '../../utils/fontFamilies';
import { chevronIcon, userIcon, emptyIcon, callIcon, chatMessages, chatSingleIcon } from '../../assets/icons';
import GlassView from '../../components/GlassWrapper';
import EmptyState from '../../components/shared/EmptyState';
import { useCalls } from '../../api/apiHooks/useCalls';
import { useChat } from '../../api/apiHooks/useChat';
import { ActivityIndicator, RefreshControl } from 'react-native';

interface SessionData {
    id: string;
    type: 'call' | 'chat';
    name: string;
    duration: string;
    time: string;
    message?: string; // For chat preview
    avatar?: any;
}

const SessionsHistory = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getCalls } = useCalls();
    const { getConversations } = useChat();

    // State for Sessions
    const [calls, setCalls] = useState<SessionData[]>([]);
    const [chats, setChats] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination state
    const [callOffset, setCallOffset] = useState(0);
    const [chatOffset, setChatOffset] = useState(0);
    const [hasMoreCalls, setHasMoreCalls] = useState(true);
    const [hasMoreChats, setHasMoreChats] = useState(true);
    const LIMIT = 10;

    const handleBack = () => {
        navigation.goBack();
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();

        if (isNaN(date.getTime())) return '';

        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (isYesterday) {
            return 'Yesterday';
        }

        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const fetchCalls = async (isRefresh = false) => {
        if (loading || (!isRefresh && !hasMoreCalls)) return;

        try {
            setLoading(true);
            const offset = isRefresh ? 0 : callOffset;
            const res = await getCalls(LIMIT, offset);

            if (res.success) {
                const mapped: SessionData[] = res.calls.map(c => ({
                    id: c.id,
                    type: 'call',
                    name: c.otherParticipant?.anonymousName || c.listener?.anonymousName || c.venter?.anonymousName || 'Venter Call',
                    duration: `${Math.round((c.durationSeconds || 0) / 60)} min`,
                    time: formatTime(c.createdAt),
                }));

                setCalls(prev => isRefresh ? mapped : [...prev, ...mapped]);
                setCallOffset(offset + mapped.length);
                setHasMoreCalls(mapped.length === LIMIT);
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchChats = async (isRefresh = false) => {
        if (loading || (!isRefresh && !hasMoreChats)) return;

        try {
            setLoading(true);
            const offset = isRefresh ? 0 : chatOffset;
            const res = await getConversations(undefined, LIMIT, offset);

            if (res.conversations) {
                const mapped: SessionData[] = res.conversations.map(c => ({
                    id: c.id,
                    type: 'chat',
                    name: c.otherParticipant?.anonymousName || 'Venter Chat',
                    duration: `${c.durationMinutes || 0} min`,
                    time: formatTime(c.createdAt),
                    message: c.lastMessage?.content
                }));

                setChats(prev => isRefresh ? mapped : [...prev, ...mapped]);
                setChatOffset(offset + mapped.length);
                setHasMoreChats(mapped.length === LIMIT);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchCalls(true);
        fetchChats(true);
    }, []);

    const handleRefresh = (tab: string) => {
        setRefreshing(true);
        if (tab === t('SessionsHistory.call')) {
            fetchCalls(true);
        } else {
            fetchChats(true);
        }
    };

    const handleLoadMore = (tab: string) => {
        if (tab === t('SessionsHistory.call')) {
            fetchCalls();
        } else {
            fetchChats();
        }
    };

    const renderEmptyState = () => (
        <EmptyState
            title="No sessions yet"
            description={t('SessionsHistory.emptyStateDescription')}
            icon={emptyIcon}
            containerStyle={{ marginTop: hp(10) }}
        />
    );

    const renderSessionItem = ({ item }: { item: SessionData }) => (

        <View style={styles.itemContainer}>
            <GlassView style={styles.itemGlass} glassStyles={{
                backgroundColor: theme.black + "20"
            }} opacity={0.02}>
                <View style={styles.itemContent}>
                    {/* Avatar */}
                    <GlassView glassStyles={styles.avatarContainer}>
                        <Image source={item?.type == "call" ? callIcon : chatSingleIcon} style={styles.avatar} />
                    </GlassView>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.topRow}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <View style={styles.bottomRow}>
                            <Text style={styles.details} numberOfLines={1}>
                                {item.duration}
                                {item.message ? `\n${item.message}` : ''}
                            </Text>

                        </View>
                    </View>
                    <View style={styles.chevronContainer}>
                        <Image source={chevronIcon} style={styles.chevron} />
                    </View>
                </View>
            </GlassView>
        </View>
    );


    const renderContent = (tab: string) => {
        const isCallTab = tab === t('SessionsHistory.call');
        const data = isCallTab ? calls : chats;

        if (data.length === 0 && !loading) return renderEmptyState();

        const Footer = () => (
            loading && !refreshing ? (
                <View style={{ paddingVertical: hp(2) }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            ) : null
        );

        return (
            <FlatList
                data={data}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={() => handleLoadMore(tab)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={Footer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => handleRefresh(tab)}
                        tintColor={theme.white}
                    />
                }
            />
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        listContent: {
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
            paddingBottom: hp(5),
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: wp(10),
            marginTop: hp(10),
        },
        emptyIcon: {
            width: hp(8),
            height: hp(8),
            tintColor: theme.white,
            marginBottom: hp(2),
        },
        emptyTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(1),
        },
        emptySubtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
            textAlign: 'center',
            lineHeight: hp(2.4),
        },
        itemContainer: {
            marginBottom: hp(1.5),
            borderRadius: hp(2),
            overflow: 'hidden',
        },
        itemGlass: {
            padding: hp(2),
            // borderRadius: hp(2),
        },
        itemContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatarContainer: {
            width: hp(5),
            height: hp(5),
            borderRadius: hp(2.5),
            borderWidth: 1,
            borderColor: theme.white + "40",
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: wp(3),
        },
        avatar: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: 'contain',
            alignSelf: 'center',
        },
        infoContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        topRow: { // Name and Time
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: hp(0.5),
        },
        name: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.8),
            color: theme.white,
        },
        time: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + "80",
        },
        bottomRow: {

        },
        details: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.5),
            color: theme.white60,
        },
        chevronContainer: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginLeft: wp(2)
        },
        chevron: {
            width: hp(1.8),
            height: hp(1.8),
            tintColor: theme.white60,
            transform: [{ rotate: '-90deg' }],
        }
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Profile.yourSessions') || "Past Sessions"}
            />
            <View style={{ flex: 1 }}>
                <SwipeableTabs
                    tabs={[t('SessionsHistory.call'), t('SessionsHistory.chat')]}
                    renderContent={renderContent}
                    paddingHorizontal={0}
                    initialTab={0}
                />
            </View>
        </HomeWrapper>
    );
};

export default SessionsHistory;
