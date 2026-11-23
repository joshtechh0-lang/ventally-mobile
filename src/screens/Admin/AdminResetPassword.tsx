import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { PasswordInput, Button } from '../../components';
import { routes } from '../../navigation/routes';

const AdminResetPassword = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdate = () => {
        // Mock success navigation
        (navigation as any).navigate(routes.adminInternal, {
            screen: routes.adminSecuritySuccess,
            params: {
                type: 'password',
                title: t('Admin.security.success.passwordReset'),
                subtitle: t('Admin.security.success.passwordSubtitle')
            }
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(4),
        },
        inputGroup: {
            marginBottom: hp(3),
        },
        footer: {
            paddingTop: hp(4),
        }
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.security.resetPasswordScreen.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <PasswordInput
                        title={t('Admin.security.resetPasswordScreen.oldPassword')}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="••••••••"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <PasswordInput
                        title={t('Admin.security.resetPasswordScreen.newPassword')}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="••••••••"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <PasswordInput
                        title={t('Admin.security.resetPasswordScreen.confirmPassword')}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                    />
                </View>

                <View style={styles.footer}>
                    <Button
                        title={t('Admin.security.resetPasswordScreen.button')}
                        onPress={handleUpdate}
                        buttonStyle={{}}
                        titleStyle={{}}
                        disabled={!oldPassword || !newPassword || newPassword !== confirmPassword}
                        glassStyles={{}}
                    />
                </View>
            </View>
        </HomeWrapper>
    );
};

export default AdminResetPassword;
