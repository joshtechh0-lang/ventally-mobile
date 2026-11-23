import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useSelector, useDispatch } from 'react-redux';
import { hp, wp } from '../../utils/size';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { ScreenHeader, Loader } from '../../components';
import SettingsContainer from '../../components/shared/SettingsContainer';
import SettingsItem from '../../components/shared/SettingsItem';
import { routes } from '../../navigation/routes';
import { RootState } from '../../store';
import { chevronIcon } from '../../assets/icons';
import { fontFamilies } from '../../utils/fontFamilies';
import { setUser, updateUser } from '../../store/slices/userSlice';
import apiInstance from '../../api/apiInstance';

const EditProfileScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [loading, setLoading] = useState(false);

    // Fetch profile from API each time the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
        }, [])
    );

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await apiInstance.get('auth/profile');
            const data = res?.data;
            if (data) {
                const { user: userInfo, preferences, wallet } = data;
                dispatch(updateUser({
                    name: userInfo?.displayName || userInfo?.firstName || '',
                    email: userInfo?.email || '',
                    image: userInfo?.profilePictureUrl || '',
                    role: userInfo?.userType || '',
                    balance: wallet?.balanceCurrency ?? wallet?.balanceMinutes ?? 0,
                    gender: preferences?.genderIdentity || '',
                    ageGroup: preferences?.ageGroup || '',
                    culturalBackground: preferences?.culturalBackground || '',
                    ethnicity: preferences?.ethnicity || '',
                    lgbtqIdentity: preferences?.lgbtqIdentity || '',
                    faithOrBelief: preferences?.faithOrBelief || '',
                    specialTopics: preferences?.specialTopics || [],
                }));
                dispatch(updateUser(userInfo))
            }
        } catch (error) {
            console.log('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigation.goBack();

    const items = [
        {
            title: t('EditProfile.gender'),
            route: routes.genderIdentity,
            params: { edit: true },
            value: user?.gender || '',
        },
        {
            title: t('EditProfile.culturalBackground'),
            route: routes.racialIdentity,
            params: { edit: true },
            value: user?.culturalBackground || '',
        },
        {
            title: t('EditProfile.ethnicity'),
            route: routes.ethnicity,
            params: { edit: true },
            value: user?.ethnicity || '',
        },
        {
            title: t('EditProfile.ageGroup'),
            route: routes.ageGroup,
            params: { edit: true },
            value: user?.ageGroup || '',
        },
        {
            title: t('EditProfile.lgbtq'),
            route: routes.lgbtqIdentity,
            params: { edit: true },
            value: user?.lgbtqIdentity || '',
        },
        {
            title: t('EditProfile.faith'),
            route: routes.faithOrBelief,
            params: { edit: true },
            value: user?.faithOrBelief || '',
        },
        // {
        //     title: t('EditProfile.specialTopics'),
        //     route: routes.specialTopics,
        //     params: { edit: true },
        //     value: user?.specialTopics?.join(', ') || '',
        // },
    ];

    const styles = StyleSheet.create({
        content: {
            flex: 1,
        },
        item: {
            paddingVertical: hp(1),
            marginBottom: hp(1),
        },
        value: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.6),
            color: theme.white + "cc",
            marginRight: wp(2),
        },
        chevron: {
            width: hp(2),
            height: hp(2),
            tintColor: theme.white + "cc",
        },
        valueContainer: {
            flexDirection: 'row', alignItems: 'center', justifyContent: "space-between",
            // marginBottom: hp(2),
        }
    });

    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader
                title={t('EditProfile.title')}
                onBackPress={handleBack}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* <View style={{ paddingHorizontal: wp(5), paddingBottom: hp(2), marginTop: hp(1) }}>
                    <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(2.2), color: theme.white, marginBottom: hp(0.5) }}>
                        {t('EditProfile.optionalQuestionsTitle')}
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.medium, fontSize: hp(1.6), color: theme.white + 'cc', marginBottom: hp(2) }}>
                        {t('EditProfile.optionalQuestionsSubtitle')}
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.6), color: theme.white + '99', marginBottom: hp(2) }}>
                        {t('EditProfile.optionalQuestionsBody1')}
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.6), color: theme.white + '99', marginBottom: hp(2) }}>
                        {t('EditProfile.optionalQuestionsBody2')}
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.normal, fontSize: hp(1.4), color: theme.white + '66' }}>
                        {t('EditProfile.optionalQuestionsFooter')}
                    </Text>
                </View> */}

                <SettingsContainer style={{ width: '90%', alignSelf: 'center' }}>
                    {items.map((item, index) => (
                        <View style={styles.item}>

                            <SettingsItem
                                style={{ paddingVertical: hp(1) }}
                                type='info'
                                key={index}
                                title={item.title}
                                value={item.value}
                                onPress={() => (navigation.navigate as any)(item.route, item.params)}
                            />
                            <Pressable
                                onPress={() => (navigation.navigate as any)(item.route, item.params)}
                                style={styles.valueContainer}>
                                <Text style={styles.value}>{typeof item?.value === 'string' ? item.value : ''}</Text>

                                <Image source={chevronIcon} style={[styles.chevron, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />

                            </Pressable>
                        </View>

                    ))}
                    <View style={styles.item}>

                        <SettingsItem
                            type='info'
                            title={t('EditProfile.specialTopics')}
                            value={user?.specialTopics?.length ? `${user.specialTopics.length} selected` : ''}
                            onPress={() => (navigation.navigate as any)(routes.specialTopics, { edit: true })}
                        />
                        <Pressable
                            onPress={() => (navigation.navigate as any)(routes.specialTopics, { edit: true })}
                            style={styles.valueContainer}
                        >                        <Text style={styles.value}>{user?.specialTopics?.length ? `${user.specialTopics.length} selected` : ''}</Text>

                            <Image source={chevronIcon} style={[styles.chevron, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />

                        </Pressable>
                    </View>
                </SettingsContainer>
            </ScrollView>
        </HomeWrapper>
    );
};

export default EditProfileScreen;
