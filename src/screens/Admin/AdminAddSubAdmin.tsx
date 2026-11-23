import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import HomeWrapper from '../../wrapper/HomeWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import GlassView from '../../components/GlassWrapper';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import { GlassModal } from '../../components';
import { tickIcon } from '../../assets/icons';

import { useAdmin } from '../../api/apiHooks/useAdmin';
import { Loader } from '../../components/Loader';
import { toastError } from '../../utils/toast';

const AdminAddSubAdmin = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { t } = useTranslationWithUpdate();
    const navigation = useNavigation();
    const { createSubAdmin } = useAdmin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({
        view: false,
        edit: false,
        delete: false,
        suspend: false,
        accessAdminPanel: false,
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                handleSuccessClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const togglePermission = (key: string) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof prev]
        }));
    };

    const validatePassword = (pwd: string): { isValid: boolean; error: string } => {
        if (!pwd || pwd.trim().length === 0 || pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
            return {
                isValid: false, error: t("Common.passwordValidationError")
            };
        }
        return { isValid: true, error: '' };
    };

    const handleCreate = async () => {
        setPasswordError('');
        const passwordValidation = validatePassword(password);
        if (!email.trim()) {
            toastError({ text: t('Common.emailRequired') });
            return;
        }

        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.error);
            return;
        }
        if (!hasPermissionSelected) {
            toastError({ text: t('Common.permissionsRequired') });
            return;
        }

        setLoading(true);
        try {
            await createSubAdmin({
                email,
                password,
                permissions,
            });
            setShowSuccess(true);
        } catch (error: any) {
            console.error('Error creating sub admin:', error);
            toastError({ text: error?.message || t('Common.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        navigation.goBack();
    };

    const hasPermissionSelected = Object.values(permissions).some(value => value);
    const isFormValid = email.trim() !== '' && password.trim() !== '' && hasPermissionSelected;

    return (
        <HomeWrapper>
            <ScreenHeader
                title={t('Admin.addSubAdmin.title')}
                onBackPress={() => navigation.goBack()}
            />
            <KeyboardAwareScrollView
                {...getKeyboardAwareScrollViewProps()}
                contentContainerStyle={[styles.container, getKeyboardAwareContentStyle()]}
                showsVerticalScrollIndicator={false}
            >
                <Input
                    title={t('Admin.addSubAdmin.email')}
                    placeholder={t('Admin.addSubAdmin.emailPlaceholder')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    inputContainerStyle={styles.inputWrapper}
                />

                <View style={styles.spacer} />

                <PasswordInput
                    title={t('Admin.addSubAdmin.password')}
                    placeholder={t('Admin.addSubAdmin.passwordPlaceholder')}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                    }}
                    error={passwordError}
                    inputContainerStyle={[styles.inputWrapper, {
                        marginBottom: hp(2)
                    }]}
                />

                <GlassView glassStyles={styles.permissionsCard}>
                    <Text style={styles.sectionTitle}>{t('Admin.subAdminProfile.permissions')}</Text>

                    {Object.entries(permissions).map(([key, value]) => (
                        <View key={key} style={styles.permissionRow}>
                            <Text style={styles.permissionText}>
                                {t(`Admin.permissions.${key}`)}
                            </Text>
                            <Switch
                                value={value}
                                onValueChange={() => togglePermission(key)}
                                trackColor={{ false: theme.white20, true: '#3E3E6A' }}
                                thumbColor={theme.white}
                                ios_backgroundColor={theme.white20}
                            />
                        </View>
                    ))}
                </GlassView>
                <View style={{ flex: 1 }} />
                <View style={styles.footer}>
                    <Button
                        title={t('Admin.addSubAdmin.create')}
                        onPress={handleCreate}
                        glassStyles={styles.createButton}
                        buttonStyle={{}}
                        titleStyle={{}}
                    // disabled={!isFormValid}
                    />
                </View>
            </KeyboardAwareScrollView>

            <GlassModal
                icon={tickIcon}
                iconBorder={false}
                visible={showSuccess}
                onClose={handleSuccessClose}
                title={t('Admin.success.adminCreated')}
                message={t('Admin.success.adminCreatedMessage')}
                showButtons={false}
            />
            <Loader isVisible={loading} />
        </HomeWrapper>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingBottom: hp(15),
        flexGrow: 1
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: theme.white20,
        borderRadius: hp(999),
        paddingHorizontal: wp(3)
    },
    formCard: {
        padding: wp(6),
        borderRadius: hp(2.5),
        marginBottom: hp(3),
    },
    spacer: {
        height: hp(2),
    },
    permissionsCard: {
        padding: wp(6),
        borderRadius: hp(4),
        marginBottom: hp(3),
        backgroundColor: theme.black + "10",
    },
    sectionTitle: {
        fontFamily: fontFamilies.medium,
        fontSize: hp(2.2),
        color: theme.white,
        textAlign: 'center',
        marginBottom: hp(3),
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    permissionText: {
        fontFamily: fontFamilies.normal,
        fontSize: hp(1.8),
        color: theme.white,
    },
    footer: {
        // paddingHorizontal: wp(5),
        // paddingBottom: hp(5),
    },
    createButton: {
        width: '100%',
    },
});

export default AdminAddSubAdmin;
