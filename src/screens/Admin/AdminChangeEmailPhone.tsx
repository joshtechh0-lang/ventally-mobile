import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { Input, Button } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import { routes } from '../../navigation/routes';

const AdminChangeEmailPhone = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();

    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const handleSendOTP = () => {
        // Mock navigate to OTP
        (navigation as any).navigate(routes.adminInternal, {
            screen: routes.adminVerifyOTP,
            params: {
                type: 'email',
                value: newEmail
            }
        });
    };

    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: wp(5),
            paddingTop: hp(4),
            paddingBottom: hp(10),
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.5),
            color: theme.white,
            marginBottom: hp(1),
            textAlign: 'center',
        },
        subtitle: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white60,
            marginBottom: hp(4),
            textAlign: 'center',
        },
        inputGroup: {
            width: '100%',
            marginBottom: hp(2),
        },
        footer: {
            width: '100%',
            paddingTop: hp(4),
        }
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title="" // Header title is handled by the screen content in the reference image
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.container, getKeyboardAwareContentStyle()]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t('Admin.security.changeEmail.title')}</Text>
                <Text style={styles.subtitle}>{t('Admin.security.changeEmail.subtitle')}</Text>

                <View style={styles.inputGroup}>
                    <Input
                        title={t('Admin.security.changeEmail.currentEmail')}
                        value={currentEmail}
                        onChangeText={setCurrentEmail}
                        placeholder="admin@example.com"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Input
                        title={t('Admin.security.changeEmail.newEmail')}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="newemail@example.com"
                    />
                </View>

                <View style={styles.footer}>
                    <Button
                        title={t('Admin.security.changeEmail.button')}
                        onPress={handleSendOTP}
                        buttonStyle={{}}
                        titleStyle={{}}
                        disabled={!currentEmail || !newEmail}
                        glassStyles={{}}
                    />
                </View>
            </KeyboardAwareScrollView>
        </HomeWrapper>
    );
};

export default AdminChangeEmailPhone;
