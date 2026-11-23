import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthWrapper from '../../../wrapper/AuthWrapper';
import { hp, wp } from '../../../utils/size';
import { fontFamilies } from '../../../utils/fontFamilies';
import { useTheme } from '../../../theme';
import { useTranslationWithUpdate } from '../../../hooks/useTranslationWithUpdate';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/slices/userSlice';
import { AppDispatch } from '../../../store/store';
import Input from '../../../components/Input';
import PasswordInput from '../../../components/PasswordInput';
import Button from '../../../components/Button';
import AuthStepsHeader from '../../../components/AuthStepsHeader';
import apiInstance, { ApiResponse } from '../../../api/apiInstance';
import { toastError, toastSuccess } from '../../../utils/toast';
import { routes } from '../../../navigation/routes';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../../utils/keyboard';

const AdminLogin = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { t } = useTranslationWithUpdate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      setEmail("admin@gmail.com");
      setPassword("admin");
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: hp(8), // Extra padding for keyboard
    },
    contentContainer: {
      marginTop:hp(3),
      alignItems: 'center',
      paddingHorizontal: wp(2),
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.5),
      marginBottom: hp(4),
      color: theme.white,
      textAlign: 'center',
    },
    inputContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    forgotPasswordContainer: {
      width: '100%',
      alignItems: 'flex-start',
      marginTop: hp(1),
      marginBottom: hp(4),
    },
    forgotPasswordText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.4),
      color: theme.white,
      textDecorationLine: 'underline',
    },
    buttonContainer: {
      width: '100%',
      marginBottom: hp(3),
    },
    securityText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.2),
      color: theme.white + '80',
      textAlign: 'center',
      marginTop: hp(2),
    },
    input:{
      borderWidth:1,
      borderRadius:999,
      borderColor:theme.white20
    }
  });

  const handleAdminLogin = async () => {
    if (!email || !password) {
      toastError({ text: 'Please fill all fields', theme });
      return;
    }

    // Validate admin email format
    if (email !== 'admin@gmail.com' || password !== 'admin') {
      toastError({ text: 'Invalid admin credentials', theme });
      return;
    }

    // Save admin user data to Redux for development
    const adminUserData = {
      name: 'Admin',
      email: email,
      role: 'admin' as 'listener' | 'venter' | 'admin',
      image: '',
    };

    dispatch(setUser(adminUserData as any));

    if (__DEV__) {
      toastSuccess({ text: 'Admin logged in successfully', theme });
      // Navigate to admin dashboard
      navigation.navigate(routes.adminHomeTab as never);
      return;
    }

    setLoading(true);
    try {
      const response: ApiResponse = await apiInstance.post('admin/login', {
        email: email,
        password: password,
      });

      if (response.success) {
        // Save admin user data to Redux
        const adminDataFromAPI = {
          ...adminUserData,
          name: response.data?.name || 'Admin',
        };
        dispatch(setUser(adminDataFromAPI as any));
        toastSuccess({ text: 'Admin logged in successfully', theme });
        navigation.navigate(routes.adminHomeTab as never);
      } else {
        toastError({ text: response.error || 'Invalid admin credentials', theme });
      }
    } catch (error) {
      // For development, still save user and navigate
      dispatch(setUser(adminUserData as any));
      navigation.navigate(routes.adminHomeTab as never);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate(routes.resetPassword as never);
  };

  return (
    <AuthWrapper>
      <View style={styles.container}>
        {/* Header */}
        <AuthStepsHeader 
          handleBack={handleBack}
          title={t('AdminLogin.title')}
          glassyTitle={false}
          
        />

        <KeyboardAwareScrollView
          {...getKeyboardAwareScrollViewProps()}
          contentContainerStyle={getKeyboardAwareContentStyle()}
        >
          <View style={styles.contentContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Input
                title={t('AdminLogin.enterEmail')}
                placeholder="admin@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                inputContainerStyle={styles.input}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <PasswordInput
                title={t('AdminLogin.enterPassword')}
                placeholder="admin"
                value={password}
                onChangeText={setPassword}
                showHint={false}
                inputContainerStyle={styles.input}

              />
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  {t('AdminLogin.forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={t('AdminLogin.login')}
                disabled={loading}
                onPress={handleAdminLogin}
                buttonStyle={{
                  width: '100%',
                 }}
                titleStyle={{
                  fontSize: hp(1.4),
                }}
                glassStyles={{
                  width: '100%',
                }}
                leftIcon={null}
                iconStyle={null}
              />
            </View>

            {/* Security Text */}
            <Text style={styles.securityText}>
              {t('AdminLogin.securityText')}
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </AuthWrapper>
  );
};

export default AdminLogin;