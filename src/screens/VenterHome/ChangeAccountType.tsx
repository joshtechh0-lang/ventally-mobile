import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import { fontFamilies } from '../../utils/fontFamilies';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { Button, ScreenHeader, GlassModal } from '../../components';
import GlassWrapper from '../../components/GlassWrapper';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';

import { useRoles } from '../../api/apiHooks/useRoles';
import { setTokens } from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import { toastError, toastSuccess } from '../../utils/toast';
import { setUser, setIsVenter } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';

const ChangeAccountType = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { getUserRoles, switchRole } = useRoles();
    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(true);
    const [switching, setSwitching] = React.useState(false);
    const [rolesConfig, setRolesConfig] = React.useState<{
        availableRoles: string[];
        activeRole: string;
    } | null>(null);
    const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await getUserRoles();
            if (res) {
                setRolesConfig({
                    availableRoles: res.availableRoles,
                    activeRole: res.activeRole,
                });
                console.log("-------------------------------------------------", res);
                // Initialize selected role to the one that is NOT active if only 2 roles exist
                const otherRole = res.availableRoles.find(r => r.toLowerCase() !== res.activeRole.toLowerCase());
                if (res.activeRole == 'venter') {
                    setSelectedRole('listener');
                } else {
                    setSelectedRole('venter');
                }
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            toastError({ text: t('ChangeAccount.failedToFetch') });
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchRole = async () => {
        if (!selectedRole) return;

        // If selection is the active role, do nothing
        if (selectedRole.toLowerCase() === rolesConfig?.activeRole.toLowerCase()) {
            return;
        }

        setSwitching(true);
        try {
            const res = await switchRole({ targetRole: selectedRole });
            if (res) {
                // Update tokens and navigate
                await setTokens(res.tokens.accessToken, res.tokens.refreshToken);
                toastSuccess({ text: res.message || t('ChangeAccount.roleSwitchedSuccess') });

                // Map response user to User slice structure
                const updatedUser = {
                    ...res.user,
                    role: res.user.activeRole?.toLowerCase()
                };

                dispatch(setUser(updatedUser as any));
                dispatch(setIsVenter(selectedRole.toLowerCase() === 'venter'));

                // Reset navigation to the appropriate home tab
                const targetTab = selectedRole.toLowerCase() === 'listener' ? routes.listenerHomeTab : routes.venterHomeTab;
                (navigation as any).reset({
                    index: 0,
                    routes: [{ name: targetTab }],
                });
            }
        } catch (error: any) {
            console.error('Error switching role:', error);
            toastError({ text: error?.message || error?.error || t('ChangeAccount.failedToSwitch') });
        } finally {
            setSwitching(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const allRoles = ['venter', 'listener'];

    const localStyles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            justifyContent: 'center',
            paddingBottom: hp(10), // Adjust to center vertically roughly
        },
        card: {
            width: '100%',
            overflow: 'hidden',
        },
        cardContent: {
            padding: hp(4),
            alignItems: 'center',
        },
        cardTitle: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(2.2),
            color: theme.white,
            marginBottom: hp(2),
            textAlign: 'center',
        },
        cardDescription: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            textAlign: 'center',
            lineHeight: hp(2.4),
        },
        divider: {
            height: 1,
            backgroundColor: theme.white + '20',
            width: '100%',
        },
        nextButton: {
            paddingVertical: hp(1.5),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.white + "10",
        },
        nextButtonText: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.7),
            color: theme.white,
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('ChangeAccount.title')}
            />
            <View style={localStyles.content}>
                {!loading && rolesConfig && (
                    <GlassWrapper bordered style={localStyles.card}>
                        <View style={localStyles.cardContent}>
                            <Text style={localStyles.cardTitle}>
                                {t('ChangeAccount.switchAccountTitle')}
                            </Text>
                            <Text style={localStyles.cardDescription}>
                                {t('ChangeAccount.switchAccountDescription')}
                            </Text>
                        </View>
                        <View style={localStyles.divider} />
                        <TouchableOpacity
                            style={localStyles.nextButton}
                            onPress={() => {
                                if (!selectedRole) return;
                                const isOwned = rolesConfig?.availableRoles.some(r => r.toLowerCase() === selectedRole.toLowerCase());
                                if (isOwned) {
                                    handleSwitchRole();
                                } else {
                                    if (selectedRole.toLowerCase() === 'listener') {
                                        (navigation as any).navigate(routes.auth, {
                                            screen: routes.listenerTraining,
                                            params: { accountTypeChanging: true }
                                        });
                                    } else {
                                        (navigation as any).navigate(routes.auth, {
                                            screen: routes.choosePlan,
                                            params: { accountTypeChanging: true }
                                        });
                                    }
                                }
                            }}
                        >
                            <Text style={localStyles.nextButtonText}>{t('Common.next')}</Text>
                        </TouchableOpacity>
                    </GlassWrapper>
                )}
            </View>
            <Loader isVisible={loading || switching} />
        </HomeWrapper>
    );
};

export default ChangeAccountType;
