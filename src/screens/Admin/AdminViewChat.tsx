import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ChatHeader from '../../components/shared/ChatHeader';
import GlassWrapper from '../../components/GlassWrapper';

interface Message {
    id: string;
    text: string;
    isOutgoing: boolean;
    timestamp?: string;
    sender?: string;
}

const AdminViewChat = ({ route }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { sessionId, chatType } = route.params;
    useEffect(() => {
        if (sessionId) {
            console?.log('---_-__-__-_--__>', sessionId)
        }
    }, [])

    const messages: Message[] = [
        { id: '1', text: 'Hi Justin how are you?', isOutgoing: true, sender: 'User 1', timestamp: 'SAT AT 12:34 PM' },
        { id: '2', text: "Hello Moni I'm fine", isOutgoing: false, sender: 'User 2', timestamp: 'SAT AT 12:34 PM' },
        { id: '3', text: 'I need one help please?', isOutgoing: true, sender: 'User 1', timestamp: 'SAT AT 12:34 PM' },
        { id: '4', text: 'Yes! Please let me know how can I help you', isOutgoing: false, sender: 'User 2', timestamp: 'SAT AT 12:35 PM' },
        { id: '5', text: 'How I can use Ventally?', isOutgoing: true, sender: 'User 1', timestamp: 'SAT AT 12:35 PM' },
    ];

    const styles = StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
            paddingBottom: hp(5),
        },
        messageContainer: {
            marginBottom: hp(2.5),
            flexDirection: 'row',
            justifyContent: 'flex-start',
        },
        messageContainerOutgoing: {
            justifyContent: 'flex-end',
        },
        title: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(3),
            textAlign: 'center',
        },
        senderText: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(1.4),
            color: theme.white60,
            marginBottom: hp(0.5),
        },
        senderTextRight: {
            textAlign: 'right',
        },
        emailText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.2),
            color: theme.white60,
            marginBottom: hp(1),
        },
        messageBubble: {
            maxWidth: wp(70),
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.2),
        },
        messageText: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.8),
            color: theme.white,
            lineHeight: hp(2.4),
        },
        timestamp: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.2),
            color: theme.white60,
            marginTop: hp(0.5),
        },
    });

    return (
        <HomeWrapper>
            <ChatHeader
                title={chatType === 'call' ? t('Admin.crisisManagement.crisisCall') : chatType === 'chat' ? t('Admin.crisisManagement.crisisChat') : t('Admin.moderation.chat.title')}
                subtitle="Safe & Anonymous"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageContainer,
                            msg.isOutgoing && styles.messageContainerOutgoing,
                        ]}
                    >
                        <View style={{ flex: 1, alignItems: msg.isOutgoing ? 'flex-end' : 'flex-start' }}>
                            <Text style={[styles.senderText, msg.isOutgoing && styles.senderTextRight]}>
                                {msg.sender || (msg.isOutgoing ? 'User 1' : 'User 2')}
                            </Text>
                            <Text style={styles.emailText}>abc@gmail.com</Text>
                            <GlassWrapper
                                opacity={msg.isOutgoing ? 0.09 : 0.015}
                                radius={hp(1.5)}
                                style={styles.messageBubble}
                            >
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </GlassWrapper>
                            {msg.timestamp && (
                                <Text style={styles.timestamp}>{msg.timestamp}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </HomeWrapper>
    );
};

export default AdminViewChat;
