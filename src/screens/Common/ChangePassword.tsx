import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import { chatIcon, tickIcon } from '../../assets/icons';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import apiInstance from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import { GlassModal } from '../../components';
import SettingsContainer from '../../components/shared/SettingsContainer';
import { useCredentialsChange } from '../../api/apiHooks/useCredentialsChange';
import { logout as logoutThunk } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';

const ChangePassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const dispatch = useDispatch<AppDispatch>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { changePassword } = useCredentialsChange();

  useEffect(() => {
    if (__DEV__) {
      // Auto-fill passwords for development
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        handleCloseSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validateStrongPassword = (pwd: string): string | null => {
    if (!pwd || pwd.trim().length === 0) return 'Password is required';
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const validatePassword = () => {
    setNewPasswordError('');
    setConfirmPasswordError('');
    setOldPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      toastError({ text: 'Please fill all fields', theme });
      if (!oldPassword) setOldPasswordError('Old password is required');
      if (!newPassword) setNewPasswordError('Password is required');
      if (!confirmPassword) setConfirmPasswordError('Confirm password is required');
      return false;
    }

    const strongError = validateStrongPassword(newPassword);
    if (strongError) {
      setNewPasswordError(strongError);
      toastError({ text: strongError, theme });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      toastError({ text: 'Passwords do not match', theme });
      return false;
    }

    return true;
  };

  const handleOldPasswordChange = (text: string) => {
    setOldPassword(text);
    if (oldPasswordError) setOldPasswordError('');
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (newPasswordError) setNewPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleUpdatePassword = async () => {
    if (validatePassword()) {
      setLoading(true);
      try {
        const response = await changePassword({
          currentPassword: oldPassword,
          newPassword: newPassword
        });
        if (response?.message) {
          setShowSuccess(true);
          // Auto logout after a brief delay so user sees success message or 
          // handle closing of modal to trigger logout
        }
      } catch (error: any) {
        console.log("-jbscbsjhc====", error);

        let errorMsg = error?.response?.data?.error || error?.message || 'Failed to update password';
        if (error?.response?.status === 401) {
          errorMsg = 'invalid old password';
        }
        toastError({
          text: errorMsg,
          theme
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    dispatch(logoutThunk());
  };

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),

    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: hp(4),
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      marginTop: hp(2)
      // paddingHorizontal: wp(2),
    },
    title: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(2.2),
      color: theme.white,
      textAlign: 'center',
      marginBottom: hp(4),
    },
    inputContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    buttonContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    iconContainer: {
      padding: hp(1.2),
      borderRadius: hp(2),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      marginBottom: hp(1.5),
    },
    appIcon: {
      height: hp(6),
      width: hp(6),
      borderRadius: hp(1.25),
    },
    forgotPasswordContainer: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: hp(1),
    },
    forgotPasswordText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      textDecorationLine: 'underline',
    },
  });
  const { user } = useSelector((state: RootState) => state.user);

  const handleForgotPassword = () => {
    (navigation as any).navigate(routes.auth, {
      screen: routes.resetPassword,
      params: { fromSettings: true, role: user.role }
    });
  };
  return (
    <AuthWrapper>
      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader
          handleBack={handleBack}
          title={t('ChangePassword.title')}
          glassyTitle={false}
        />

        <KeyboardAwareScrollView
          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={getKeyboardAwareContentStyle()}
        >


          <View style={styles.contentContainer}>
            <SettingsContainer style={{ height: "auto" }}>

              <>

                <View style={styles.inputContainer}>
                  <PasswordInput
                    title={t('ChangePassword.oldPassword')}
                    value={oldPassword}
                    onChangeText={handleOldPasswordChange}
                    placeholder={t('ChangePassword.oldPassword')}
                    // showHint={!newPasswordError}
                    hintText={t('ChangePassword.passwordHint', { defaultValue: 'Min 8 chars, upper, lower, number, special character' })}
                    // error={oldPasswordError}
                    titleStyle={{ fontSize: hp(1.8) }}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <PasswordInput
                    title={t('ChangePassword.newPassword')}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    placeholder={t('ChangePassword.newPassword')}
                    // showHint={!newPasswordError}
                    hintText={t('ChangePassword.passwordHint', { defaultValue: 'Min 8 chars, upper, lower, number, special character' })}
                    // error={newPasswordError}
                    titleStyle={{ fontSize: hp(1.8) }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <PasswordInput
                    title={t('ChangePassword.confirmPassword')}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder={t('ChangePassword.confirmPassword')}
                    showHint={false}
                    // error={confirmPasswordError}
                    titleStyle={{ fontSize: hp(1.8) }}
                  />
                </View>
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    {t('LogIn.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </>
            </SettingsContainer>
            <View style={{ flex: 1 }} />

            <View style={styles.buttonContainer}>
              <Button
                title={t('ChangePassword.update')}
                onPress={handleUpdatePassword}
                disabled={loading}
                buttonStyle={{
                  width: '100%',

                }}
                titleStyle={{
                  fontSize: hp(1.6),
                }}
                glassStyles={{
                  width: '100%',
                }}
                leftIcon={null}
                iconStyle={null}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>


      </View>
      <Loader isVisible={loading} />
      <GlassModal
        icon={tickIcon}
        iconBorder={false}
        showButtons={false}
        visible={showSuccess}
        onClose={handleCloseSuccess}
        title={t("ChangePassword.resetSuccessTitle")}
        message={t("ChangePassword.resetSuccessMessage")}
      />

    </AuthWrapper>
  );
};

export default ChangePassword;