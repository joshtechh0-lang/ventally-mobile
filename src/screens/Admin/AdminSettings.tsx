import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useDispatch } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { GlassModal } from '../../components';
import { routes } from '../../navigation/routes';
import { logout } from '../../store/slices/userSlice';
import { logout as logoutIcon } from '../../assets/icons';
import { AppDispatch } from '../../store';

const AdminSettings = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();
  const dispatch = useDispatch<AppDispatch>();
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogOut = async () => {
    setIsLogoutModalVisible(false);
    await dispatch(logout());
    (navigation as any).reset({
      index: 0,
      routes: [{ name: routes.auth }],
    });
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(8),
    },
    title: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(2.2),
      color: theme.white,
      marginBottom: hp(3),
      textAlign: 'center',
    },
    emailText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.2),
      color: theme.white60,
      marginBottom: hp(1),
    },
  });

  return (
    <HomeWrapper>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('Admin.settings.title')}</Text>

        <SettingsContainer>
          <SettingsItem
            title={t('Admin.settings.options.account')}
            type="toggle"
            value={isAccountActive}
            onValueChange={setIsAccountActive}
          />
          <SettingsItem
            title={t('Admin.settings.options.security')}
            onPress={() => (navigation as any).navigate(routes.venterSecurity)}
          />
          <SettingsItem
            title={t('Admin.settings.options.financialStats')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminFinancialStats })}
          />
          <SettingsItem
            title={t('Admin.settings.options.notifications')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.venterNotifications })}
          />
          <SettingsItem
            title={t('Admin.settings.options.paymentHistory')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminPaymentHistory })}
          />
          <SettingsItem
            title={t('Admin.settings.options.crisisConfig')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminCrisisConf })}
          />
          <SettingsItem
            title={t('Admin.settings.options.exportsIntegrations')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminExports })}
          />
          <SettingsItem
            title={t('Admin.settings.options.rolesPermissions')}
            onPress={() => (navigation as any).navigate(routes.adminInternal, { screen: routes.adminRolesPermissions })}
          />

          <SettingsItem
            title={t('Admin.settings.options.logout')}
            onPress={handleLogoutConfirm}
          />
        </SettingsContainer>
      </ScrollView>

      <GlassModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        title={t('Profile.logoutConfirmTitle', { defaultValue: 'Confirm Logout' })}
        message={t('Profile.logoutConfirmMessage', { defaultValue: 'Are you sure you want to log out?' })}
        primaryButtonText={t('Profile.logoutConfirmTitle', { defaultValue: 'Logout' })}
        secondaryButtonText={t('Common.cancel')}
        onPrimaryPress={handleLogOut}
        onSecondaryPress={() => setIsLogoutModalVisible(false)}
        icon={logoutIcon}
      />
    </HomeWrapper>
  );
};

export default AdminSettings;
