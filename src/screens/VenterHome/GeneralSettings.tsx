import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { ScreenHeader } from '../../components';
import { routes } from '../../navigation/routes';
import { bgIcon, feedbackIcon } from '../../assets/icons';

const GeneralSettings = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNavigate = (route: string) => {
        navigation.navigate(route as never);
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        title: {
            fontFamily: fontFamilies.bold,
            fontSize: hp(2.5),
            color: theme.white,
            textAlign: 'center',
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('GeneralSettings.title') || "General Settings"}
            />
            <View style={styles.content}>
                <SettingsContainer>
                    <SettingsItem
                        leftIcon={bgIcon}
                        title={t('GeneralSettings.changeBackground') || "Change Background"}
                        onPress={() => handleNavigate(routes.venterChangeBackground)}
                    />
                    <SettingsItem
                        leftIcon={feedbackIcon}
                        title={t('GeneralSettings.submitFeedback') || "Submit Feedback"}
                        onPress={() => handleNavigate(routes.venterSubmitFeedback)}
                    />
                </SettingsContainer>
            </View>
        </HomeWrapper>
    );
};

export default GeneralSettings;
