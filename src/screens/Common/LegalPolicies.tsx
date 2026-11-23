import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader } from '../../components';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import { headphoneIcon, secureIcon, heartEmpty, termsIcon } from '../../assets/icons';

const LegalPolicies = () => {
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

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Legal.title') || "Legal & Policies"}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <SettingsContainer>
                    <SettingsItem
                        leftIcon={termsIcon}
                        title={t('Legal.termsOfUse')}
                        onPress={() => {
                            (navigation as any).navigate(routes.auth, {
                                screen: routes.termsAndConditions,
                                params: {
                                    title: t('Legal.termsOfUse'),
                                    readOnly: true
                                }
                            });
                        }}
                    />
                    <SettingsItem
                        leftIcon={secureIcon}
                        title={t('Legal.privacyPolicy')}
                        onPress={() => {
                            (navigation as any).navigate(
                                routes.privacyPolicy
                            )
                        }}
                    />
                    <SettingsItem
                        leftIcon={heartEmpty}
                        title={t('Legal.safetyPolicy')}
                        onPress={() => {
                            (navigation as any).navigate(routes.safetyPolicy as never);
                        }}
                    />
                    <SettingsItem
                        leftIcon={headphoneIcon}
                        title={t('Legal.listenerGuidelines')}
                        onPress={() => {
                            (navigation as any).navigate(routes.auth, {
                                screen: routes.listenerCodeOfConduct,
                                params: {
                                    from: "settings",
                                    title: t('Legal.listenerGuidelines')
                                }
                            } as never);
                        }}
                    />
                </SettingsContainer>
            </ScrollView>
        </HomeWrapper>
    );
};

export default LegalPolicies;
