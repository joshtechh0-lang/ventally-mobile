import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import GlassView from '../../components/GlassWrapper';
import { routes } from '../../navigation/routes';
import { termsIcon, secureIcon, heart, heartEmpty, headphoneIcon } from '../../assets/icons'; // Assuming icons exist or generic
import SettingsItem from '../../components/shared/SettingsItem';
import SettingsContainer from '../../components/shared/SettingsContainer';

const ListenerLegalPolicies = () => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const navigation = useNavigation();

    const policies = [
        { title: t('Legal.termsOfUse') || "Terms of Use", route: routes.termsOfUse, icon: termsIcon },
        { title: t('Legal.privacyPolicy') || "Privacy Policy", route: routes.privacyPolicy, icon: secureIcon },
        { title: t('Legal.liabilityWaiver') || "Ventally Listener Liability Waiver", route: routes.listenerLiabilityWaiver, icon: secureIcon },
        { title: t('Legal.paymentTerms') || "Ventally Payment Terms Acknowledgment", route: routes.paymentTermsAcknowledgment, icon: secureIcon },
        { title: t('Legal.listenerAgreement') || "Ventally Listener Agreement", route: routes.listenerAgreement, icon: secureIcon },
        { title: t('Legal.nda') || "Ventally Listener Non-Disclosure Agreement (nda)", route: routes.listenerNDA, icon: secureIcon },
        { title: t('Legal.codeOfConduct') || "Ventally Listener Code of Conduct", route: routes.listenerCodeOfConduct, icon: secureIcon },
        { title: t('Legal.safetyPolicy') || "Safety Policy", route: routes.safetyPolicy, icon: heartEmpty },
        { title: t('Legal.listenerGuidelines') || "Listener Guidelines", route: routes.listenerGuidelines, icon: headphoneIcon },
    ];

    const handlePress = (route: string) => {
        if (route === routes.listenerGuidelines) {
            (navigation as any).navigate(routes.auth, {
                screen: routes.listenerCodeOfConduct,
                params: {
                    from: "settings",
                    title: t('Legal.listenerGuidelines')
                }
            } as never);
        } else if (route === routes.safetyPolicy) {
            (navigation as any).navigate(routes.safetyPolicy as never);
        } else if (route === routes.privacyPolicy) {
            (navigation as any).navigate(
                routes.privacyPolicy
            )
            // (navigation as any).navigate(routes.privacyPolicy as never);
        } else if (route === routes.termsOfUse) {
            (navigation as any).navigate(routes.auth, {
                screen: routes.termsAndConditions,
                params: {
                    title: t('Legal.termsOfUse'),
                    readOnly: true
                }
            });
            // (navigation as any).navigate(routes.termsOfUse as never);
        } else {
            (navigation as any).navigate(routes.auth as never, { screen: route, params: { from: "settings" } } as never);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: hp(2),
            paddingHorizontal: wp(4),
            marginBottom: hp(1.5),
            borderRadius: hp(1.5),
            backgroundColor: theme.white + "10",
        },
        itemLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(3),
            flex: 1,
        },
        icon: {
            width: hp(2.5),
            height: hp(2.5),
            tintColor: theme.white,
            resizeMode: 'contain',
        },
        itemText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.7), // Within 1.6 - 2 range
            color: theme.white,
            flex: 1,
        },
        arrow: {
            width: hp(1.5),
            height: hp(1.5),
            tintColor: theme.white + "60",
            transform: [{ rotate: '180deg' }]
        }
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                title={t('Settings.legal') || "Legal & Policies"}
                onBackPress={() => navigation.goBack()}
                showBackButton
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(5) }}>
                <SettingsContainer>

                    {policies.map((policy, index) => (
                        <SettingsItem
                            leftIcon={policy.icon}
                            style={{
                                paddingVertical: hp(2)
                            }}
                            title={policy.title}
                            onPress={() => handlePress(policy.route)}
                        />
                        // <TouchableOpacity
                        //     key={index}
                        //     activeOpacity={0.7}
                        //     onPress={() => handlePress(policy.route)}
                        // >
                        //     <GlassView bordered glassStyles={styles.item}>
                        //         <View style={styles.itemLeft}>
                        //             {/* Using a generic icon for all, or specific if available. Terms icon seems appropriate */}
                        //             {index < 2 ? <Image source={termsIcon} style={styles.icon} /> : <Image source={shieldIcon || termsIcon} style={styles.icon} />}
                        //             <Text style={styles.itemText} numberOfLines={2}>{policy.title}</Text>
                        //         </View>
                        //         <Image source={chevronIcon} style={styles.arrow} />
                        //     </GlassView>
                        // </TouchableOpacity>
                    ))}
                </SettingsContainer>

            </ScrollView>
        </HomeWrapper >
    );
};

export default ListenerLegalPolicies;
