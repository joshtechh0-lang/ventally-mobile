import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Linking } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { endChatSession, setIsReporting, setCrisisEnded } from '../../store/slices/callSlice';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ChatHeader from '../../components/shared/ChatHeader';
import GlassWrapper from '../../components/GlassWrapper';
import GlassModal from '../../components/shared/GlassModal';
import { chatIcon, logoWithText, sendIcon } from '../../assets/icons';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { Input } from '../../components';
import { routes } from '../../navigation/routes';
import socketService from '../../sockets';
import { RootState } from '../../store';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useChat, apiInstance } from '../../api';
import { getMessaging } from '@react-native-firebase/messaging';
import { formatDateDayTime } from '../../utils/date';
import { useWallet } from '../../api/apiHooks/useWallet';

interface Message {
  messageId: string;
  id?: string;
  content: string;
  isOutgoing: boolean;
  timestamp?: string;
}

const ChatScreen = ({ route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const [message, setMessage] = useState('');
  const isReporting = useRef(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  // Listener crisis modals
  const [showListenerCrisisModal, setShowListenerCrisisModal] = useState(false);
  const [showCrisisActivated, setShowCrisisActivated] = useState(false);
  // Venter crisis overlay (self-crisis or listener-triggered)
  const [showVenterCrisisOverlay, setShowVenterCrisisOverlay] = useState(false);
  // Ad-minutes heads-up
  const { getBalance } = useWallet();
  const [adMinutes, setAdMinutes] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [showAdWarning, setShowAdWarning] = useState(false);
  const adWarningShown = useRef(false);
  const { endConversation, getMessages } = useChat();
  const { sessionId, headerRight, chat: routeChat, chatId } = route.params ?? {};
  const socket = socketService;
  const user = useSelector((state: RootState) => state.user.user);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const crisisEnded = useSelector((state: RootState) => state.call.crisisEnded);
  const reduxActiveChat = useSelector((state: RootState) => state.call.isChatActive);
  const isChatActive = chatId?.status === 'active' || reduxActiveChat;
  const reduxChatData = useSelector((state: RootState) => state.call.chatData);
  const reduxConversationId = useSelector((state: RootState) => state.call.activeConversationId);

  const chat = routeChat ?? reduxChatData;
  const conversationId = chatId?.status === 'active' ? chatId?.id : chat?.conversation?.id ? chat?.conversation?.id : reduxConversationId;

  const [messages, setMessages] = useState<any[]>([]);

  // ── Reset stale crisisEnded flag on mount ──
  useEffect(() => {
    dispatch(setCrisisEnded(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch ad_minutes for venter to show heads-up ──
  useEffect(() => {
    if (!isVenter) return;
    getBalance().then((res: any) => {
      const bal = res?.data?.balance ?? res?.balance ?? {};
      const adMins = bal?.ad_minutes ?? 0;
      setAdMinutes(adMins);
    }).catch(() => {});
  }, [isVenter]);

  // ── Check elapsed time vs ad_minutes; warn at ≤ 2 min remaining ──
  useEffect(() => {
    if (!isVenter || adMinutes <= 0 || adWarningShown.current) return;
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - sessionStartTime) / 1000;
      const remainingSeconds = (adMinutes * 60) - elapsedSeconds;
      if (remainingSeconds <= 120 && !adWarningShown.current) {
        adWarningShown.current = true;
        setShowAdWarning(true);
        clearInterval(interval);
      }
    }, 10000); // check every 10 sec
    return () => clearInterval(interval);
  }, [isVenter, adMinutes, sessionStartTime]);

  // ── Watch crisisEnded — set by useGlobalSessionEvents when listener triggers crisis ──
  useEffect(() => {
    if (crisisEnded) {
      setShowVenterCrisisOverlay(true);
    }
  }, [crisisEnded]);

  useEffect(() => {
    if (chatId?.id) {
      getChatDetails(chatId?.id);
    }
  }, [chatId]);

  useEffect(() => {
    if (conversationId) {
      console.log('[Chat] Joining room:', conversationId);
      socket.emit("chat:join", { conversationId });
    }
  }, [conversationId]);

  useEffect(() => {
    socket.on("chat:joined", (data) => {
      console.log("Joined chat room:", data);
      if (data?.status === 'ended') {
        dispatch(endChatSession());
        if (user?.userType === 'venter') {
          (navigation as any).replace(routes.chatSessionFeedback, { data: chat, type: 'chat' });
        } else {
          (navigation as any).replace(routes.listenerSessionFeedback);
        }
        return;
      }
      setMessages(data?.initialHistory?.messages)
    });

    socket.on("chat:message", (data) => {
      console?.log('----->>>>>>>>>Messages', messages)
      console.log("Received message:====>>>>", data);
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m?.messageId === data?.messageId);
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    });

    socket.on("chat:ended", (data) => {
      console.log("Chat ended:", data);
      // If isChatActive is already false the session was already ended by crisis or report handler —
      // skip to avoid navigating to feedback while the crisis overlay is showing.
      const storeState = (store.getState() as RootState).call;
      if (!storeState.isChatActive) return;

      dispatch(endChatSession());

      if (isReporting.current) return;

      if (user?.userType === 'venter') {
        (navigation as any).replace(routes.chatSessionFeedback, { data: chat, type: 'chat' });
      } else {
        (navigation as any).replace(routes.listenerSessionFeedback);
      }
    });

    return () => {
      socket.off("chat:joined");
      socket.off("chat:message");
      socket.off("chat:ended");
    }
  }, []);

  const styles = StyleSheet.create({
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(5),
      paddingTop: hp(1),
    },
    messageContainer: {
      marginBottom: hp(1.5),
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    messageContainerOutgoing: {
      justifyContent: 'flex-end',
    },
    messageBubble: {
      maxWidth: wp(70),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.2),
    },
    messageBubbleOutgoing: {
      backgroundColor: theme.white + '30',
    },
    messageBubbleIncoming: {
      backgroundColor: theme.white + '',
    },
    messageText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      lineHeight: hp(2.8),
    },
    timestamp: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.1),
      color: theme.white + "90",
      marginTop: hp(0.5),
      marginLeft: wp(1),
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      gap: wp(3),
      backgroundColor: 'transparent',
    },
    inputWrapperGlass: {
      flex: 1,
      borderRadius: hp(2.5),
    },
    input: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white,
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.2),
      borderRadius: hp(2.5),
      minHeight: hp(5),
      maxHeight: hp(12),
    },
    sendButton: {
      width: hp(5),
      height: hp(5),
      borderRadius: hp(2.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendIcon: {
      width: hp(2.5),
      height: hp(2.5),
      tintColor: theme.white,
      resizeMode: 'contain',
      alignSelf: "center"
    },
    // Venter crisis overlay
    overlayBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(6),
      zIndex: 100,
    },
    overlayCard: {
      width: '100%',
      backgroundColor: theme.white + '12',
      borderRadius: hp(3),
      borderWidth: 1,
      borderColor: theme.white + '15',
      padding: hp(3.5),
      alignItems: 'center',
    },
    overlayIconWrap: {
      width: hp(8),
      height: hp(8),
      borderRadius: hp(4),
      backgroundColor: theme.primary + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(3),
    },
    overlayTitle: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },
    overlayBody: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.8),
      color: theme.white + 'B0',
      textAlign: 'center',
      lineHeight: hp(2.8),
      marginBottom: hp(3.5),
    },
    overlayBtn988: {
      width: '100%',
      paddingVertical: hp(1.8),
      borderRadius: hp(2),
         backgroundColor: theme.magenda,

      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(1.5),
    },
    overlayBtn988Text: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2),
      color: theme.white,
    },
    overlayBtnText988: {
      width: '100%',
      paddingVertical: hp(1.8),
      borderRadius: hp(2),
      borderWidth: 1,
      borderColor: theme.white + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(1.5),
    },
    overlayBtnTextLabel: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2),
      color: theme.white,
    },
    overlaySafeBtn: {
      paddingVertical: hp(1.2),
    },
    overlaySafeBtnText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.6),
      color: theme.white + '60',
      textAlign: 'center',
    },
  });

  const getChatDetails = async (conversationId: string) => {
    try {
      const response = await getMessages(conversationId);
      console?.log('--------------------------->>ChatDetails', JSON?.stringify(response?.messages, null, 2));
      setMessages(response?.messages);
    } catch (error) {
      console?.log('---------_-_------___---------_>', error)
      throw error;
    }
  };

  const handleSend = () => {
    if (message.trim() && conversationId) {
      socket.emit("chat:message", {
        conversationId,
        content: message,
      });
      setMessages((prev) => [...prev, { messageId: Date.now().toString(), content: message, isOutgoing: true, timestamp: new Date().toISOString(), deliveredAt: new Date().toISOString(), sender: { isMe: true } }]);
      setMessage('');
    }
  };

  // ── Crisis button pressed ──
  const handleCrisisPress = () => {
    if (isVenter) {
      // Venter self-crisis: show 988 overlay
      setShowVenterCrisisOverlay(true);
    } else {
      // Listener crisis: show "Is venter in crisis?" confirmation
      setShowListenerCrisisModal(true);
    }
  };

  // ── Listener confirms crisis ──
  const handleListenerCrisisConfirm = () => {
    console.log('[ChatScreen][listener] crisis confirmed, emitting session:crisis_end', { conversationId });
    setShowListenerCrisisModal(false);
    // For chat: dispatch immediately so global session:ended handler exits early
    dispatch(endChatSession());
    socketService.emit('session:crisis_end', { conversationId });
    setShowCrisisActivated(true);
  };

  // ── Listener dismisses "Crisis Activated" ──
  const handleCrisisActivatedDismiss = () => {
    setShowCrisisActivated(false);
    (navigation as any).navigate(routes.listenerHomeTab);
  };

  // ── Venter 988 actions ──
  const handleVenterCrisis988 = async (mode: 'call' | 'text') => {
    setShowVenterCrisisOverlay(false);
    // If crisis was triggered by listener, chat already ended — skip emit + REST
    if (!crisisEnded) {
      dispatch(endChatSession());
      try {
        socketService.emit('chat:end', { conversationId });
        if (conversationId) await apiInstance.post(`conversations/${conversationId}/end`);
      } catch { /* ignore */ }
    }
    try {
      await Linking.openURL(mode === 'call' ? 'tel:988' : 'sms:988');
    } catch { /* ignore */ }
    setTimeout(() => {
      (navigation as any).navigate(routes.venterHomeTab);
    }, 500);
  };

  const handleVenterCrisisImSafe = () => {
    setShowVenterCrisisOverlay(false);
    if (crisisEnded) {
      // Chat ended by listener — go home
      (navigation as any).navigate(routes.venterHomeTab);
    }
    // else stay in chat
  };

  const handleOptionsPress = () => {
    console.log('Options menu pressed');
  };

  const handleReportPress = async () => {
    isReporting.current = true;
    dispatch(setIsReporting(true));
    if (conversationId) {
      try {
        await endConversation(conversationId);
      } catch (error) {
        console.error('End chat error during report:', error);
      }
    }
    (navigation as any).replace(routes.chatReport, { data: chat || chatId, type: 'chat' });
  };

  const handleEndChatPress = () => {
    setShowEndSessionModal(true);
  };

  const handleEndSessionNo = () => setShowEndSessionModal(false);
  const handleEndSessionYes = async () => {
    setShowEndSessionModal(false);
    if (!conversationId) {
      dispatch(endChatSession());
      return;
    }
    try {
      // Call API first — backend emits chat:ended to both users
      await endConversation(conversationId);
    } catch (error) {
      console.error('End chat error:', error);
      // Even on error, clear local state
      dispatch(endChatSession());
    }
  };

  const getName = () => {
    if (user?.userType == 'venter') {
      return chat ? chat?.listener?.anonymousName : chatId?.otherParticipant?.anonymousName
    } else {
      return chat?.conversation?.venter?.anonymousName ? chat?.conversation?.venter?.anonymousName : chatId?.otherParticipant?.anonymousName
    }
  }

  return (
    <HomeWrapper hideStatusBarPadding={true}>
      {/* Header at top */}
      <ChatHeader
        title={getName()}
        subtitle={t('VenterChat.subtitle')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showCrisisButton={!!conversationId && isChatActive}
        crisisButtonText={t('VenterChat.crisisButton')}
        onCrisisPress={handleCrisisPress}
        showOptionsMenu={!!conversationId}
        onOptionsPress={handleOptionsPress}
        onReportPress={handleReportPress}
        onEndChatPress={isChatActive ? handleEndChatPress : undefined}
      />

      {/* Keyboard avoiding view with messages and input */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Messages scrollview */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.messageId || msg.id}
              style={[
                styles.messageContainer,
                msg?.sender?.isMe && styles.messageContainerOutgoing,
              ]}
            >
              <View>
                <GlassWrapper
                  opacity={msg?.sender?.isMe ? 0.09 : 0.015}
                  radius={hp(1.5)}
                  style={{
                    ...styles.messageBubble,
                  }}
                >
                  {!msg?.sender?.isMe && <Text style={[styles.timestamp, { marginLeft: 0, fontSize: hp(1.3), }]}>{msg?.sender?.anonymousName}</Text>}
                  <Text style={styles.messageText}>{msg.content}</Text>
                </GlassWrapper>
                {msg.deliveredAt && (
                  <Text style={[styles.timestamp, { marginLeft: !msg?.sender?.isMe ? 0 : 'auto' }]}>{formatDateDayTime(msg.deliveredAt)}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Ad-minutes warning banner */}
        {showAdWarning && isVenter && adMinutes > 0 && (
          <View style={{ backgroundColor: 'rgba(255,160,0,0.12)', borderTopWidth: 0.5, borderTopColor: 'rgba(255,160,0,0.4)', paddingHorizontal: wp(4), paddingVertical: hp(1.2), flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
            <Text style={{ fontSize: hp(1.8) }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,200,80,1)', fontFamily: fontFamilies.semiBold, fontSize: hp(1.5) }}>About 2 minutes of free time remaining</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontFamily: fontFamilies.normal, fontSize: hp(1.3) }}>Your ad reward is almost used up. Add funds to keep going.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAdWarning(false)}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.8), fontFamily: fontFamilies.normal }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input — only shown when the session is still active */}
        {conversationId && isChatActive && <View style={styles.inputContainer}>
          <GlassWrapper style={styles.inputWrapperGlass}>
            <Input
              inputStyle={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={t('VenterChat.inputPlaceholder')}
              placeholderTextColor={theme.white60}
              multiline
              maxLength={500}
            />
          </GlassWrapper>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <GlassWrapper opacity={0.03} style={styles.sendButton} >
              <Image source={sendIcon} style={styles.sendIcon} />
            </GlassWrapper>
          </TouchableOpacity>
        </View>}
      </KeyboardAvoidingView>

      {/* End Session Modal */}
      <GlassModal
        visible={showEndSessionModal}
        onClose={handleEndSessionNo}
        showIcon={false}
        title={t('VenterChat.endSessionTitle')}
        message={t('VenterChat.endSessionMessage')}
        showButtons={true}
        primaryButtonText={t('VenterChat.endSessionYes')}
        secondaryButtonText={t('VenterChat.endSessionNo')}
        onPrimaryPress={handleEndSessionYes}
        onSecondaryPress={handleEndSessionNo}
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
      />

      {/* Listener crisis — Step 1: "Is The Venter In Crisis?" */}
      <GlassModal
        visible={showListenerCrisisModal}
        onClose={() => setShowListenerCrisisModal(false)}
        title={t('ListenerCrisis.confirmTitle', 'Is The Venter In Crisis?')}
        message={t('ListenerCrisis.confirmMessage', 'If the venter mentions self-harm, suicide, or immediate danger, you must escalate immediately. Failure to report safety risks may result in suspension or permanent removal from Ventally.')}
        showButtons={true}
        primaryButtonText={t('Common.yes', 'Yes')}
        secondaryButtonText={t('Common.no', 'No')}
        onPrimaryPress={handleListenerCrisisConfirm}
        onSecondaryPress={() => setShowListenerCrisisModal(false)}
        dismissOnOverlayPress={false}
        dismissOnBackPress={true}
      />

      {/* Listener crisis — Step 2: "Crisis Support Activated" */}
      <GlassModal
        visible={showCrisisActivated}
        onClose={handleCrisisActivatedDismiss}
        title={t('ListenerCrisis.activatedTitle', 'Crisis Support Activated')}
        message={t('ListenerCrisis.activatedMessage', 'The venter is being connected to 988 crisis support now.')}
        showButtons={true}
        primaryButtonText={t('ListenerCrisis.okay', 'Okay')}
        onPrimaryPress={handleCrisisActivatedDismiss}
        dismissOnOverlayPress={false}
        dismissOnBackPress={false}
        bottomAttachedBtn
      />

      {/* Venter crisis overlay — self-crisis or listener-triggered */}
      {showVenterCrisisOverlay && (
        <GlassModal visible={showVenterCrisisOverlay} showButtons={false}  >
          < >
          
            <Text style={styles.overlayTitle}>
              {t('Crisis.venterOverlayTitle', 'Ventally is not a crisis service.')}
            </Text>
            <Text style={styles.overlayBody}>
              {t('Crisis.venterOverlayMessage', 'If you are thinking about self harm, suicide, or feel unsafe, please contact 988 or emergency services now.')}
            </Text>

            <TouchableOpacity
              style={styles.overlayBtn988}
              onPress={() => void handleVenterCrisis988('call')}
              activeOpacity={0.85}
            >
              <Text style={styles.overlayBtn988Text}>{t('Crisis.call988Now', 'CALL 988 NOW')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overlayBtnText988}
              onPress={() => void handleVenterCrisis988('text')}
              activeOpacity={0.85}
            >
              <Text style={styles.overlayBtnTextLabel}>{t('Crisis.text988', 'TEXT 988')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.overlaySafeBtn}
              onPress={handleVenterCrisisImSafe}
              activeOpacity={0.7}
            >
              <Text style={styles.overlaySafeBtnText}>
                {t('Crisis.imSafeReturn', "I'm Safe - Return to Ventally")}
              </Text>
            </TouchableOpacity>
          </>
        </GlassModal>
      )}
    </HomeWrapper>
  );
};

export default ChatScreen;
