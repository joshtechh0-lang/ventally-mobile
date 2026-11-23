import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, GlassModal } from '../../components';
import { fontFamilies } from '../../utils/fontFamilies';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import {
    homeIcon,
    creditCard,
    sessionStartedIcon,
    moduleIcon,
    lockIcon,
    backIcon,
    trashIcon,
    english1,
    languageIcon,
    userIcon,
    walletIcon,
    planIcon,
    sessionsIcon,
    termsIcon,
    termsOfUse,
    info,
    logout,
    star,
} from '../../assets/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../store/store';

const ProfileScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { user, isVenter } = useSelector((state: RootState) => state.user)
    console.log("user", { user, isVenter });
    const dispatch = useDispatch<AppDispatch>();
    // Mock role - in real app, get this from redux/context
    const userRole = user?.role || user?.userType;

    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleLogoutConfirm = () => {
        setIsLogoutModalVisible(true);
    };

    const handleLogout = async () => {
        setIsLogoutModalVisible(false);
        await dispatch(logoutAction());
        (navigation as any).reset({
            index: 0,
            routes: [{ name: routes.auth, params: { screen: routes.logIn } }],
        });
    };

    const handleDeleteAccount = () => {
        navigation.navigate(routes.deleteAccount as never);
    };

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            // paddingHorizontal: wp(5),
            paddingTop: hp(2),
        },
        deleteBtn: {
            color: theme.error || '#FF4D4D',
        },
        item: {
            paddingVertical: hp(3),
        }
    });

    return (
        <HomeWrapper key={langKey}>
            <ScreenHeader
                onBackPress={handleBack}
                title={t('Navigation.tabs.profile') || "Profile"}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Role indicator */}
                <View style={{
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isVenter ? 'rgba(139,92,246,0.12)' : 'rgba(99,179,237,0.12)',
                    borderRadius: hp(1.5),
                    padding: hp(1.5),
                    marginBottom: hp(2),
                    borderWidth: 1,
                    borderColor: isVenter ? 'rgba(139,92,246,0.25)' : 'rgba(99,179,237,0.25)',
                }}>
                    <View style={{
                        width: hp(5), height: hp(5),
                        borderRadius: hp(1.2),
                        backgroundColor: isVenter ? 'rgba(139,92,246,0.2)' : 'rgba(99,179,237,0.2)',
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: hp(1.5),
                    }}>
                        <Text style={{ fontSize: hp(2.2) }}>{isVenter ? '💬' : '🎧'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.3), fontFamily: fontFamilies.medium, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Your Role
                        </Text>
                        <Text style={{ color: '#fff', fontSize: hp(1.8), fontFamily: fontFamilies.semiBold, marginTop: 2 }}>
                            {isVenter ? 'Venter' : 'Support Guide (Listener)'}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, marginTop: 2 }}>
                            {isVenter
                                ? 'You connect with Support Guides for sessions.'
                                : 'Venters are matched with you for support.'}
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: isVenter ? 'rgba(139,92,246,0.25)' : 'rgba(99,179,237,0.25)',
                        borderRadius: 20, paddingHorizontal: hp(1.2), paddingVertical: hp(0.5),
                    }}>
                        <Text style={{
                            color: isVenter ? '#a78bfa' : '#63b3ed',
                            fontSize: hp(1.2), fontFamily: fontFamilies.bold,
                            textTransform: 'uppercase', letterSpacing: 1,
                        }}>
                            {isVenter ? 'Venter' : 'Listener'}
                        </Text>
                    </View>
                </View>

                <SettingsContainer style={{ width: '90%', alignSelf: 'center' }}>
                    <SettingsItem
                        type='info'
                        style={styles.item}
                        title={t('Profile.personalInfo') || "Profile"}
                        leftIcon={userIcon}
                        onPress={() => navigation.navigate(routes.editProfile as never)}
                    />
                    <SettingsItem
                        type='info'
                        style={styles.item}
                        title={t('VenterSettings.options.language.title') || "Language"}
                        leftIcon={languageIcon}
                        onPress={() => (navigation as any).navigate(routes.languageSelection, { isFromSettings: true })}
                    />
                    {/* {isVenter && <SettingsItem
                        type='info'
                        style={styles.item}
                        title={t('Navigation.tabs.paymentMethod')}
                        leftIcon={walletIcon}
                        onPress={() => navigation.navigate(routes.paymentMethods as any, { isProfileView: true })}
                    />} */}
                    {/* Only show Payout for Listeners */}
                    {!isVenter && (
                        <SettingsItem
                            type='info'
                            style={styles.item}
                            title={t('Profile.payout') || "Payout"}
                            leftIcon={walletIcon}
                            onPress={() => navigation.navigate(routes.payoutSettings as never)}
                        />
                    )}

                    <SettingsItem
                        type='info'
                        style={styles.item}
                        title={t('Profile.referFriend') || "Refer a Friend 🎁"}
                        leftIcon={star}
                        onPress={() => navigation.navigate(routes.referral as never)}
                    />
                    <SettingsItem
                        type='info'

                        style={styles.item}
                        title={t('Profile.yourSessions') || "Your Sessions"}
                        leftIcon={sessionsIcon}
                        onPress={() => navigation.navigate(routes.sessionsHistory as never)}
                    />
                    <SettingsItem
                        type='info'

                        style={styles.item}
                        title={t('Profile.terms') || "Terms of Use"}
                        leftIcon={termsOfUse}
                        onPress={() => (navigation as any).navigate(routes.termsOfUse)}
                    />
                    <SettingsItem
                        type='info'

                        style={styles.item}
                        title={t('Profile.privacy') || "Privacy Policy"}
                        leftIcon={info}
                        onPress={() => (navigation as any).navigate(routes.privacyPolicy)}
                    />
                    <SettingsItem
                        type='info'

                        style={styles.item}
                        title={t('Profile.logout') || "Logout"}
                        leftIcon={logout}
                        onPress={handleLogoutConfirm}
                    />
                    <SettingsItem
                        type='info'

                        style={styles.item}
                        title={t('Profile.deleteAccount') || "Delete account"}
                        leftIcon={trashIcon}
                        leftIconStyle={{ tintColor: theme.red }}
                        onPress={handleDeleteAccount}
                        titleStyle={styles.deleteBtn}
                    />
                </SettingsContainer>
            </ScrollView>

            <GlassModal
                visible={isLogoutModalVisible}
                onClose={() => setIsLogoutModalVisible(false)}
                title={t('Profile.logoutConfirmTitle')}
                message={t('Profile.logoutConfirmMessage')}
                primaryButtonText={t('Profile.logoutConfirmTitle')}
                secondaryButtonText={t('Common.cancel')}
                onPrimaryPress={handleLogout}
                onSecondaryPress={() => setIsLogoutModalVisible(false)}
                icon={logout}
            />
        </HomeWrapper>
    );
};

export default ProfileScreen;
