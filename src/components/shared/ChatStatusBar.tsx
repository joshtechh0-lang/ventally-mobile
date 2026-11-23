import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
} from 'react-native';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { routes } from '../../navigation/routes';
import { endChatSession } from '../../store/slices/callSlice';
import type { RootState } from '../../store/store';
import GlassView from '../GlassWrapper';
import GlassModal from './GlassModal';
import { x, chatSingleIcon } from '../../assets/icons';
import socketService from '../../sockets';
import { useChat } from '../../api';

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

interface ChatStatusBarProps {
    navigationRef: NavigationContainerRefWithCurrent<any>;
}

const ChatStatusBar: React.FC<ChatStatusBarProps> = ({ navigationRef }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const { isVenter } = useSelector((state: RootState) => state.user);
    const { isChatActive, chatStartTime, chatData, isActive: isCallActive } = useSelector(
        (state: RootState) => state.call
    );
    const { endConversation } = useChat();


    const [lastMessage, setLastMessage] = useState<string>('');
    const [senderName, setSenderName] = useState<string>('');
    const [showEndSessionModal, setShowEndSessionModal] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

    // Track current route so we can hide the bar on the ChatScreen
    useEffect(() => {
        const getRouteName = () => {
            if (!navigationRef.isReady()) return undefined;
            const state = navigationRef.getRootState();
            if (!state) return undefined;
            const route = state.routes[state.index];
            if (route.state) {
                const nestedState = route.state as any;
                const nestedRoute = nestedState.routes[nestedState.index];
                return nestedRoute?.name;
            }
            return route.name;
        };

        setCurrentRouteName(getRouteName());

        const unsubscribe = navigationRef.addListener('state', () => {
            setCurrentRouteName(getRouteName());
        });

        return unsubscribe;
    }, [navigationRef]);

    // Listen for incoming messages and show a preview
    useEffect(() => {
        if (!isChatActive) return;
        const socket = socketService;
        const handleMessage = (data: any) => {
            if (data?.content) {
                setLastMessage(data.content);
                const name = data?.sender?.isMe ? 'Me' : data?.sender?.anonymousName;
                setSenderName(name || '');
            }
        };
        socket.on('chat:message', handleMessage);
        return () => {
            socket.off('chat:message', handleMessage);
        };
    }, [isChatActive]);

    const handleBarPress = () => {
        if (navigationRef.isReady()) {
            // Pass the stored chatData so ChatScreen can read route.params.chat without crashing
            (navigationRef as any).navigate(routes.chatStack, {
                screen: routes.chat,
                params: { chat: chatData },
            });
        }
    };

    const handleEndChat = () => {
        setShowEndSessionModal(true);
    };

    const handleEndSessionNo = () => setShowEndSessionModal(false);

    const navigateAfterEnd = () => {
        if (navigationRef.isReady()) {
            if (isVenter) {
                (navigationRef as any).navigate(routes.chatSessionFeedback, { data: chatData, type: 'chat' });
            } else {
                (navigationRef as any).navigate(routes.listenerSessionFeedback);
            }
        }
    };


    const handleEndSessionYes = async () => {
        setShowEndSessionModal(false);
        const conversationId = chatData?.conversation?.id;
        if (!conversationId) {
            // Fallback: just clear state and navigate
            dispatch(endChatSession());
            navigateAfterEnd();
            return;
        }
        try {
            setIsEnding(true);
            // Call API first — backend emits chat:ended to both users
            await endConversation(conversationId);
        } catch (err) {
            console.error('End conversation error:', err);
            // On error, clear local state manually
            dispatch(endChatSession());
            navigateAfterEnd();
        } finally {
            setIsEnding(false);
        }
    };

    // Subscribe to chat:ended so navigation fires even when user is NOT on ChatScreen
    useEffect(() => {
        if (!isChatActive) return;
        const socket = socketService;
        const handleChatEnded = () => {
            dispatch(endChatSession());
            navigateAfterEnd();
        };
        socket.on('chat:ended', handleChatEnded);
        return () => {
            socket.off('chat:ended', handleChatEnded);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatActive, isVenter]);

    // Hide on ChatScreen, hide if a call is currently active, hide for venter (venter uses bottom tab dot)
    const shouldShow =
        isChatActive &&
        !isVenter &&
        !isCallActive &&
        currentRouteName !== routes.chat;

    if (!shouldShow) return null;

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingBottom: hp(1),
            zIndex: 9999,
            elevation: 10,
        },
        innerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: hp(1),
            paddingHorizontal: wp(4),
        },
        labelButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(2),
            paddingHorizontal: wp(3),
            paddingVertical: hp(0.9),
            borderRadius: hp(3),
            backgroundColor: theme.white + '20',
        },
        labelIcon: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white,
            resizeMode: 'contain',
        },
        labelText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.6),
            color: theme.white + '95',
        },
        statusArea: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: wp(2),
        },
        statusText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.8),
            color: theme.white,
        },
        statusSubtext: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.4),
            color: theme.white + '90',
        },
        closeButton: {
            width: hp(4),
            height: hp(4),
            borderRadius: hp(2),
            backgroundColor: theme.white + '30',
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <GlassView bordered radius={0} glassStyles={{ backgroundColor: theme.black + '15' }}>
                    <View style={styles.innerContainer}>
                        {/* Left: messaging label */}
                        <View style={styles.labelButton}>
                            <Image source={chatSingleIcon} style={styles.labelIcon} />
                            <Text style={styles.labelText}>{t('ChatStatusBar.messaging')}</Text>
                        </View>

                        {/* Center: tap to return */}
                        <Pressable style={styles.statusArea} onPress={handleBarPress}>
                            <Text style={styles.statusText} numberOfLines={1}>
                                {lastMessage ? `${senderName ? `${senderName}: ` : ''}${lastMessage}` : t('ChatStatusBar.tapToReturn', { defaultValue: 'Tap to return' })}
                            </Text>
                        </Pressable>

                        {/* Right: end button */}
                        <Pressable style={styles.closeButton} onPress={handleEndChat}>
                            <Image source={x} style={{ width: hp(2), height: hp(2), tintColor: theme.white }} />
                        </Pressable>
                    </View>
                </GlassView>
            </View>

            <GlassModal
                visible={showEndSessionModal}
                onClose={handleEndSessionNo}
                showIcon={false}
                title={t('VenterChat.endSessionTitle')}
                message={t('VenterChat.endSessionMessage')}
                showButtons
                primaryButtonText={t('VenterChat.endSessionYes')}
                secondaryButtonText={t('VenterChat.endSessionNo')}
                onPrimaryPress={handleEndSessionYes}
                onSecondaryPress={handleEndSessionNo}
                dismissOnOverlayPress={false}
                dismissOnBackPress
            />
        </>
    );
};

export default ChatStatusBar;
