import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp, WINDOW_HEIGHT } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import Button from '../../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps } from '../../utils/keyboard';
import { routes } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { setIsVenter, setUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import apiInstance, { ApiResponse } from '../../api/apiInstance';
import { setTokens } from '../../api/apiInstance';
import { useRoles } from '../../api/apiHooks/useRoles';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';
import { Input } from '../../components';

const NicknameScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { accountTypeChanging } = (route.params as any) || {};
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const { updateAvailableRoles, switchRole } = useRoles();

    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setLoading(false);
        }, [])
    );

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = async () => {
        if (nickname.trim().length < 3) {
            toastError({ text: t('Nickname.minimumLengthError', { defaultValue: 'Nickname must be at least 3 characters long' }), theme });
            return;
        };

        setLoading(true);
        try {
            // Update profile on backend
            const response = await apiInstance.put('auth/profile', {
                displayName: nickname.trim(),
            }) as unknown as ApiResponse;

            if (response.success) {
                // Update local state
                if (user) {
                    dispatch(setUser({ ...user, displayName: nickname.trim() }));
                }

                // Account-change path: add venter role, switch to venter,
                // then land directly on the venter home — no subscription step.
                if (accountTypeChanging) {
                    try {
                        await updateAvailableRoles({ rolesToAdd: ['venter'], rolesToRemove: [] });
                        const switchRes = await switchRole({ targetRole: 'venter' });

                        if (switchRes?.tokens?.accessToken && switchRes?.tokens?.refreshToken) {
                            await setTokens(
                                switchRes.tokens.accessToken,
                                switchRes.tokens.refreshToken,
                            );
                        }
                        if (switchRes?.user) {
                            dispatch(setUser(switchRes.user as any));
                        }
                        dispatch(setIsVenter(true));

                        (navigation as any).reset({
                            index: 0,
                            routes: [{ name: routes.venterHomeTab }],
                        });
                    } catch (err: any) {
                        console.log('account-change error', err);
                        toastError({
                            text: err?.error || err?.message || 'Failed to switch account',
                            theme,
                        });
                    }
                    return;
                }

                // First-time signup path — unchanged.
                navigation.navigate(routes.optionalQuestions as never);
            } else {
                toastError({ text: response.error || 'Failed to save nickname', theme });
            }
        } catch (error: any) {
            console.log('error', error);
            toastError({ text: error?.error || 'Failed to save nickname', theme });
            // Fallback for dev or if API fails but we want to proceed

        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        content: {
            flexGrow: 1,
            paddingHorizontal: wp(5),
        },
        container: {
            flex: 1,
            justifyContent: "center",
            paddingTop: hp(3),
        },
        textInput: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(2.2),
            color: theme.white,
            textAlign: "center",
            lineHeight: hp(3.2),
        },
        buttonContainer: {
            paddingHorizontal: wp(5),
            paddingBottom: hp(5),
        },
    });

    return (
        <HomeWrapper key={langKey}>
            <Loader isVisible={loading} />
            <ScreenHeader
                title={t('Nickname.title')}
                onBackPress={handleBack}
            />

            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={styles.content}
            >
                <View style={styles.container}>
                    <Input
                        inputStyle={styles.textInput}
                        inputContainerStyle={{
                            borderBottomWidth: 0
                        }}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder={t('Nickname.placeholder')}
                        isPlaceholderVisible
                        placeholderTextColor={theme.white + "cc"}
                        multiline={false}
                        autoFocus
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title={t('Nickname.save')}
                        onPress={handleSave}
                        disabled={loading}
                    />
                </View>
            </KeyboardAwareScrollView>
        </HomeWrapper>
    );
};

export default NicknameScreen;
