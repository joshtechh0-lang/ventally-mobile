import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';

const AdminSecurity = () => {
    const { theme } = useTheme();
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
    });

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.security.title')}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsContainer>
                    <SettingsItem
                        title={t('Admin.security.enableBiometrics')}
                        type="toggle"
                        value={isBiometricsEnabled}
                        onValueChange={setIsBiometricsEnabled}
                    />
                    <SettingsItem
                        title={t('Admin.security.resetPassword')}
                        onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminResetPassword })}
                    />
                    <SettingsItem
                        title={t('Admin.security.changeEmailPhone')}
                        onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminChangeEmailPhone })}
                    />
                    <SettingsItem
                        title={t('Admin.security.twoFactorAuth')}
                        type="toggle"
                        value={isTwoFactorEnabled}
                        onValueChange={setIsTwoFactorEnabled}
                    />
                </SettingsContainer>
            </ScrollView>
        </HomeWrapper>
    );
};

export default AdminSecurity;
