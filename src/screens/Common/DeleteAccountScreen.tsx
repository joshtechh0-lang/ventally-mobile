import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import { GlassModal, Loader, ScreenHeader } from '../../components';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import GlassView from '../../components/GlassWrapper';
import { info, reportIcon, tickIcon, tiktokIcon } from '../../assets/icons';
import { toastError } from '../../utils/toast';
import { useAuth } from '../../api';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/userSlice';
import { routes } from '../../navigation/routes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';

const DeleteAccountScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
    const { deleteAccount } = useAuth();
    const dispatch = useDispatch();

    const [password, setPassword] = useState('');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleBack = () => navigation.goBack();

    const handleDelete = () => {
        if (!password) {
            toastError({ text: t('DeleteAccount.passwordRequired') })
            return;
        }
        setShowConfirmDelete(true);
    };

    const confirmDeleteAction = async () => {
        setLoading(true);
        setShowConfirmDelete(false);
        try {
            const res = await deleteAccount({ password });
        // Clear local storage on success
        try { const AsyncStorage = require('@react-native-async-storage/async-storage').default; await AsyncStorage.clear(); } catch {}
            if (res) {
                setShowConfirmDelete(false);
                setShowDeleteSuccess(true);
            }
        } catch (err: any) {
            const errorMsg = err?.error || err?.message || t('DeleteAccount.errorOccurred');
            toastError({ text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handlePostDelete = async () => {
        await dispatch(logout() as any);
        (navigation as any).reset({
            index: 0,
            routes: [{ name: routes.auth }],
        });
    };

    // Auto-navigate after 3 seconds when delete success modal is shown
    useEffect(() => {
        if (showDeleteSuccess) {
            const timer = setTimeout(() => {
                handlePostDelete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showDeleteSuccess]);

    const styles = StyleSheet.create({
        content: {
            flex: 1,
            paddingHorizontal: wp(5),
            paddingTop: hp(4),
        },
        warningRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp(2),
        },
        warningIcon: {
            width: hp(2.2),
            height: hp(2.2),
            tintColor: theme.error,
            resizeMode: "contain",
            marginRight: wp(2),
        },
        warningText: {
            fontFamily: fontFamilies.semiBold,
            fontSize: hp(1.8),
            color: theme.error,
        },
        description: {
            fontFamily: fontFamilies.normal,
            fontSize: hp(1.6),
            color: theme.white,
            lineHeight: hp(2.4),
            marginBottom: hp(4),
        },
        inputLabel: {
            fontFamily: fontFamilies.medium,
            fontSize: hp(1.8),
            color: theme.white,
            marginBottom: hp(1),
        },
        inputContainer: {
            marginBottom: hp(1.5),
        },
        buttonContainer: {
            marginTop: 'auto',
            marginBottom: hp(4),
        }
    });

    return (
        <HomeWrapper>
            <Loader isVisible={loading} />
            <ScreenHeader title={t('DeleteAccount.title')} onBackPress={handleBack} />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={getKeyboardAwareContentStyle()}
            >
                <View style={styles.content}>
                    <GlassView radius={hp(2.5)} glassStyles={{ padding: wp(5), marginBottom: hp(2) }}>
                        <View style={styles.warningRow}>
                            <Image source={info} style={styles.warningIcon} resizeMode="contain" />
                            <Text style={styles.warningText}>{t('DeleteAccount.warning')}</Text>
                        </View>

                        <Text style={styles.description}>
                            {t('DeleteAccount.description')}
                        </Text>

                        <PasswordInput
                            title={t('DeleteAccount.password')}
                            placeholder={t('DeleteAccount.password')}
                            value={password}
                            onChangeText={setPassword}
                            containerStyle={styles.inputContainer}
                            titleStyle={styles.inputLabel}
                        />
                    </GlassView>

                    <View style={styles.buttonContainer}>
                        <Button
                            title={t('DeleteAccount.button')}
                            onPress={handleDelete}
                            disabled={false}
                            glassStyles={{ backgroundColor: theme.black + '40' }}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <GlassModal
                title={t('DeleteAccount.title')}
                message={t('DeleteAccount.confirmDelete')}
                primaryButtonText={t('Common.yes')}
                secondaryButtonText={t('Common.no')}
                visible={showConfirmDelete}
                onPrimaryPress={confirmDeleteAction}
                onSecondaryPress={() => setShowConfirmDelete(false)}
                onClose={() => setShowConfirmDelete(false)}
            />

            <GlassModal
                icon={tickIcon}
                showButtons={false}
                iconContainerStyle={{
                    borderWidth: hp(.3),
                    borderColor: theme.white,
                }}
                title={t('DeleteAccount.deleted')}
                visible={showDeleteSuccess}
                onClose={handlePostDelete}
            />
        </HomeWrapper>
    );
};

export default DeleteAccountScreen;
