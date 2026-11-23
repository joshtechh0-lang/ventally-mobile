import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import { logout } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { Button } from '../../components';
const VenterSettings = ({ navigation }: any) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  // const [isDarkTheme, setIsDarkTheme] = useState(false); // Example state
  const dispatch = useDispatch();
  const handleSettingPress = (title: string, route?: string) => {
    console.log(`${title} pressed`);
    if (route) {
      const directRoutes = [
        routes.profile,
        routes.venterSecurity,
        routes.venterLegalPolicies,
        routes.venterContactUs
      ];

      if (directRoutes.includes(route as any)) {
        // Direct navigation for main stack routes
        navigation.navigate(route);
      } else {
        // Navigate to internal stack and then the specific screen
        navigation.navigate(routes.venterInternal, { screen: route });
      }
    }
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
  });
  const handleLogOut = async () => {
    await dispatch(logout() as any);
    // (navigation as any).navigate(routes.logIn as any);
    (navigation as any).reset({
      index: 0,
      routes: [{ name: routes.auth }],
    });

  };
  return (
    <HomeWrapper key={langKey}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('VenterSettings.title')}</Text>

        <SettingsContainer>

          <SettingsItem
            title={t('VenterSettings.options.generalSettings.title')}
            onPress={() => handleSettingPress('General Settings', routes.venterGeneralSettings)}
          />
          <SettingsItem
            title={t('VenterSettings.options.notifications.title')}
            onPress={() => handleSettingPress('Notifications', routes.venterNotifications)}
          />
          <SettingsItem
            title={t('VenterSettings.options.darkTheme.title', 'Dark Theme')}
            type="toggle"
            value={isDark}
            onValueChange={toggleTheme}
          />
          <SettingsItem
            title={t('VenterSettings.options.changeAccountType.title') || "Change Account Type"}
            onPress={() => handleSettingPress('Change Account Type', routes.venterChangeAccountType)}
          />
          <SettingsItem
            title="Referrals"
            onPress={() => handleSettingPress('Referrals', routes.referral)}
          />
          <SettingsItem
            title="Community Discount"
            onPress={() => handleSettingPress('Community Discount', routes.verifyPass)}
          />
          <SettingsItem
            title={t('Security.title') || "Security"}
            onPress={() => handleSettingPress('Security', routes.venterSecurity)}
          />
          <SettingsItem
            title={t('Legal.title') || "Legal & Policies"}
            onPress={() => handleSettingPress('Legal & Policies', routes.venterLegalPolicies)}
          />
          <SettingsItem
            title={t('Contact.title') || "Contact Us"}
            onPress={() => handleSettingPress('Contact Us', routes.venterContactUs)}
          />
        </SettingsContainer>

      </ScrollView>
    </HomeWrapper>
  );
};

export default VenterSettings;