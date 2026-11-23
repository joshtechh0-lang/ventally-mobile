import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute , useFocusEffect } from '@react-navigation/native';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import AuthStepsHeader from '../../components/AuthStepsHeader';
import { routes } from '../../navigation/routes';
import { toastError, toastSuccess } from '../../utils/toast';
import { chatIcon } from '../../assets/icons';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import apiInstance from '../../api/apiInstance';
import { Loader } from '../../components/Loader';
import SettingsContainer from '../../components/shared/SettingsContainer';
import { ENABLE_ADMIN_FLOW } from '../../config/featureFlags';

const CreateNewPassword = () => {
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = (route.params as any)?.email;
  // const phone = (route.params as any)?.phone;
  const code = (route.params as any)?.code;

  useEffect(() => {
    if (__DEV__) {
      // Auto-fill passwords for development
      setNewPassword('');
      setConfirmPassword('');
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

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

    if (!newPassword || !confirmPassword) {
      toastError({ text: 'Please fill all fields', theme });
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

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (newPasswordError) setNewPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      // API call to update password
      // await apiInstance.post('auth/reset-password', {
      //   email: email || undefined,
      //   phone: phone || undefined,
      //   code,
      //   new_password: newPassword
      // });
      const response = await apiInstance.post('auth/reset-password', {
        email: email,
        otp: code,
        newPassword: newPassword
      });
      console.log('response', response);
      toastSuccess({ text: 'Password updated successfully', theme });

      const fromSettings = (route.params as any)?.fromSettings;
      const role = (route.params as any)?.role;

      (navigation as any).navigate(routes.resetSuccessful, {
        fromSettings,
        role
      });
    } catch (error) {
      toastError({ text: (error as any)?.error, theme });
      // For development, still navigate
    } finally {
      setLoading(false);
    }
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
      // justifyContent: 'center',
      marginTop: hp(5),
      paddingBottom: hp(4),
    },
    contentContainer: {
      alignItems: 'center',
      paddingHorizontal: wp(2),
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
      marginTop: hp(2),
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
  });

  return (
    <AuthWrapper key={langKey}>
      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader
          handleBack={handleBack}
          title=""
          glassyTitle={false}
        />

        <KeyboardAwareScrollView
          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={styles.scrollContent}
        >

          <View style={styles.contentContainer}>
            <TouchableOpacity
              style={styles.iconContainer}
              onLongPress={() => {
                if (__DEV__ && ENABLE_ADMIN_FLOW) {
                  navigation.navigate(routes.adminLogin as never);
                }
              }}
            >
              <Image
                source={chatIcon}
                style={styles.appIcon}
              />
            </TouchableOpacity>
            <Text style={styles.title}>{t('CreateNewPassword.title')}</Text>
            <SettingsContainer>

              <>
                <View style={styles.inputContainer}>
                  <PasswordInput
                    title={t('CreateNewPassword.newPassword')}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    placeholder={t('CreateNewPassword.newPassword')}
                    // showHint={!newPasswordError}
                    hintText={t('CreateNewPassword.passwordHint', { defaultValue: 'Min 8 chars, upper, lower, number, special character' })}
                    // error={newPasswordError}
                    titleStyle={{ fontSize: hp(1.8) }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <PasswordInput
                    title={t('CreateNewPassword.confirmPassword')}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder={t('CreateNewPassword.confirmPassword')}
                    showHint={false}
                    // error={confirmPasswordError}
                    titleStyle={{ fontSize: hp(1.8) }}
                  />
                </View>
              </>
            </SettingsContainer>

            <View style={styles.buttonContainer}>
              <Button
                title={t('CreateNewPassword.update')}
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
    </AuthWrapper>
  );
};

export default CreateNewPassword;