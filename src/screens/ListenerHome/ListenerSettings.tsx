import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { routes } from '../../navigation/routes';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';

const ListenerSettings = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Example state

  const handleSettingPress = (title: string) => {
    console.log(`${title} pressed`);

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

  return (
    <HomeWrapper key={langKey}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('Listener.settings.title')}</Text>

        <SettingsContainer>
          <SettingsItem

            title={t('VenterSettings.options.notifications.title')}
            // onPress={() => handleSettingPress('Notifications')}
            onPress={() => navigation.navigate(routes.venterInternal, { screen: routes.venterNotifications })}
          />
          <SettingsItem
            title={t('VenterSettings.options.darkTheme.title', 'Dark Theme')}
            type="toggle"
            value={isDark}
            onValueChange={toggleTheme}
          />
          <SettingsItem
            title={t('VenterSettings.options.changeAccountType.title', 'Change Account Type')}
            onPress={() => (navigation as any).navigate(routes.listenerInternal, { screen: routes.listenerChangeAccountType })}
          />
          <SettingsItem
            title={t('Security.title', 'Security')}
            onPress={() => navigation.navigate(routes.venterSecurity as any)}
          />
          <SettingsItem
            title={t('Legal.title', 'Legal & Policies')}
            onPress={() => (navigation as any).navigate(routes.listenerInternal, { screen: routes.listenerLegalPolicies })}
          />
          <SettingsItem
            title={t('Contact.title', 'Contact Us')}
            onPress={() => navigation.navigate(routes.venterContactUs)}
          />
        </SettingsContainer>
      </ScrollView>
    </HomeWrapper>
  );
};

export default ListenerSettings;
