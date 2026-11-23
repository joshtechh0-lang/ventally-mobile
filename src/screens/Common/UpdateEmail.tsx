import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { Input, Button } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';
import GlassWrapper from '../../components/GlassWrapper';
import { toastSuccess } from '../../utils/toast';
import GlassView from '../../components/GlassWrapper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';

const UpdateEmail = () => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const navigation = useNavigation();

    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const handleSendOTP = () => {
        // Mock navigate to OTP - logic would depend on the backend integration
        // For now, we follow the common pattern
        toastSuccess({ text: "OTP sent to your email" });
    };

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: wp(5),
            paddingTop: hp(5),
            paddingBottom: hp(10),
        },
        card: {
            width: '100%',
            overflow: 'hidden',
        },
        cardContent: {
            padding: hp(3),
            alignItems: 'center',
        },
        cardTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        cardSubtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            textAlign: 'center',
            marginBottom: hp(3),
        },
        inputGroup: {
            width: '100%',
            marginBottom: hp(2),
        },
        divider: {
            height: 1,
            backgroundColor: theme.white + '20',
            width: '100%',
        },
        footerButton: {
            // paddingVertical: hp(2.5),
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputWrapper: {
            width: '100%',
            paddingHorizontal: wp(4),
            paddingVertical: hp(0.2),
            marginBottom: hp(2.2),
            backgroundColor: theme.black + '10',
        },

    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={() => navigation.goBack()}
                title=""
            />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.container, getKeyboardAwareContentStyle()]}
                showsVerticalScrollIndicator={false}
            >
                <GlassWrapper bordered style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{t('UpdateEmail.title')}</Text>
                        <Text style={styles.cardSubtitle}>{t('UpdateEmail.subtitle')}</Text>

                        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>

                            <Input
                                isPlaceholderVisible

                                placeholder={t('UpdateEmail.currentEmail')}
                                value={currentEmail}
                                onChangeText={setCurrentEmail}
                                inputContainerStyle={{
                                    borderBottomWidth: 0,

                                }}
                            />
                        </GlassView>
                        <GlassView bordered radius={hp(999)} glassStyles={styles.inputWrapper}>

                            <Input
                                isPlaceholderVisible
                                placeholder={t('UpdateEmail.newEmail')}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                inputContainerStyle={{
                                    borderBottomWidth: 0,

                                }}
                            />
                        </GlassView>
                    </View>

                </GlassWrapper>

                <View style={{ marginTop: hp(4) }}>
                    <Button
                        title={t('UpdateEmail.sendOTP')}
                        onPress={handleSendOTP}
                        disabled={!currentEmail || !newEmail}
                        glassStyles={styles.footerButton}
                    />
                </View>
            </KeyboardAwareScrollView>
        </HomeWrapper>
    );
};

export default UpdateEmail;
