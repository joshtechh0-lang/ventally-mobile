import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout, setIsVenter, setUser } from '../../store/slices/userSlice';
import { ENABLE_ADMIN_FLOW } from '../../config/featureFlags';
import { AppDispatch } from '../../store/store';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import { chatIcon, tickIcon } from '../../assets/icons';
import apiInstance, { ApiResponse, setTokens } from '../../api/apiInstance';
import { getKeyboardAwareScrollViewProps } from '../../utils/keyboard';
import { toastError, toastSuccess } from '../../utils/toast';
import { routes } from '../../navigation/routes';
import { Dropdown } from '../../components';
import { Loader } from '../../components/Loader';
import appleAuth from "@invertase/react-native-apple-authentication";
import { jwtDecode } from 'jwt-decode';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import BiometricAuth from '../../hooks/Biometrics';
import biometricApi from '../../api/biometricApi';
import { getBiometricEmail, getDeviceId, isBiometricLoginSetup } from '../../utils/deviceInfo';
import { fingerprintIcon } from '../../assets/icons';
import SettingsContainer from '../../components/shared/SettingsContainer';
import { useListenerNavigation } from '../../hooks/useListenerNavigation';
import { useVenterNavigation } from '../../hooks/useVenterNavigation';

const LogIn = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { t, i18n } = useTranslationWithUpdate();
  const [langKey, setLangKey] = React.useState(i18n.language);
  React.useEffect(() => {
    const handler = () => setLangKey(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);
  const { navigateListener } = useListenerNavigation();
  const { navigateVenter } = useVenterNavigation();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState('');

  const [usageError, setUsageError] = useState('');
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false);

  const usageOptions = [
    { label: t('SignUp.usageOptions.wantToListen'), value: 'listener' },
    { label: t('SignUp.usageOptions.wantToVent'), value: 'venter' },
  ];

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '881570925381-hd7mu5p1oh85l63u26htofmkiejt4ipa.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    });
  }, []);

  useEffect(() => {
    if (__DEV__) {
      setEmailOrPhone("mahmoodraj75@gmail.com");
      setPassword("Hello@123");
      // setEmailOrPhone("admin");
      // setPassword("admin");
      setRememberMe(true);
      setSelectedUsage('venter'); // Set default to venter for testing
    }
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const isSetup = await isBiometricLoginSetup();
    setIsBiometricRegistered(isSetup);
  };

  const handleUsageChange = (value: string) => {
    setSelectedUsage(value);
    if (usageError) {
      setUsageError('');
    }
  };

  const styles = StyleSheet.create({
    scrollContent: {
      width: '100%',
      flexGrow: 1,
      paddingVertical: hp(4),
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: '100%',
      // paddingHorizontal: wp(6),
      alignItems: 'center',
      paddingBottom: hp(5),
    },
    iconContainer: {
      padding: hp(.8),
      borderRadius: hp(2),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      marginBottom: hp(.5),
      marginTop: hp(2),
    },
    appIcon: {
      height: hp(5),
      width: hp(5),
      borderRadius: hp(1.25),
      resizeMode: "contain"
    },
    title: {
      fontFamily: fontFamilies.bold,
      fontSize: hp(2.2),
      marginBottom: hp(3),
      color: theme.white,
    },
    inputContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '100%',
      marginTop: hp(1),
      marginBottom: hp(4.5),
    },
    rememberMeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: hp(2),
      height: hp(2),
      borderRadius: hp(0.5),
      borderWidth: 2,
      borderColor: theme.white + '40',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    checkboxChecked: {
      backgroundColor: theme.magenda,
      borderColor: theme.magenda,
    },
    checkmark: {
      width: hp(1.4),
      height: hp(1.4),
      resizeMode: "contain",
      tintColor: theme.white,
    },
    rememberMeText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
    },
    forgotPasswordText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.6),
      color: theme.white,
      textDecorationLine: 'underline',
    },
    buttonContainer: {
      width: '100%',
      marginBottom: hp(2),
    },
    signUpLinkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    signUpText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,
    },
    signUpLink: {
      fontFamily: fontFamilies.semiBold,
      fontSize: hp(1.5),
      textDecorationLine: 'underline',
      color: theme.white,
    },
    continueWithText: {
      fontFamily: fontFamilies.medium,
      fontSize: hp(1.3),
      marginBottom: hp(1.5),
      color: theme.white,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      gap: wp(4),
      justifyContent: 'center',
      marginBottom: hp(3),
    },
    errorText: {
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      marginTop: hp(0.5),
      marginLeft: wp(2.5),
      color: theme.error,
    },
  });

  // Helper to detect if input looks like email
  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim());
  };

  // Validate phone number (10–15 digits, optional +)
  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleaned);
  };

  // Validate email or phone
  const validateEmailOrPhone = (input: string): { isValid: boolean; error: string } => {
    if (!input || input.trim().length === 0) {
      return { isValid: false, error: 'Email is required' };
    }
    const trimmed = input.trim();
    if (isEmail(trimmed)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    } else {
      if (!isValidPhoneNumber(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    }
    return { isValid: true, error: '' };
  };

  // Strong password validation
  const validatePassword = (pwd: string): { isValid: boolean; error: string } => {
    if (!pwd || pwd.trim().length === 0) {
      return { isValid: false, error: 'Password is required' };
    }
    if (pwd.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(pwd)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(pwd)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }
    return { isValid: true, error: '' };
  };

  const handleEmailOrPhoneChange = (text: string) => {
    setEmailOrPhone(text);
    if (emailOrPhoneError) setEmailOrPhoneError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleLogIn = async () => {
    // if (emailOrPhone === "admin" && password === "admin") {
    //   await setTokens("bchbsdc8r8437", "nbsnbdhvscgsvgvc");
    //   dispatch(setUser({
    //     name: "Admin",
    //     email: "admin@gmail.com",
    //     userType: "admin",
    //     image: "",

    //   }))
    //   navigation.navigate(routes.adminHomeTab as never);

    //   return;
    // }
    setEmailOrPhoneError('');
    setPasswordError('');

    const emailOrPhoneValidation = validateEmailOrPhone(emailOrPhone);
    if (!emailOrPhoneValidation.isValid) {
      setEmailOrPhoneError(emailOrPhoneValidation.error);
      toastError({ text: emailOrPhoneValidation.error });
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      toastError({ text: passwordValidation.error });
      return;
    }




    setLoading(true);
    try {
      const response: ApiResponse = await apiInstance.post(
        'auth/login',
        { email: emailOrPhone?.trim(), password: password?.trim() }
      );

      if (response.success) {

        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.access_token && response.data?.refresh_token) {
          await setTokens(response.data.access_token, response.data.refresh_token);
        } else if (response.data?.tokens) {
          await setTokens(response.data.tokens?.accessToken, response.data.tokens?.refreshToken);
        }

        dispatch(setUser(response?.data?.user));

        toastSuccess({ text: 'Logged in successfully' });
        console.log('response?.data?.user====>>>', response?.data);
        // Navigate based on role
        if (response?.data?.user?.userType === 'venter') {
          dispatch(setIsVenter(true));
          navigateVenter(response?.data?.user);
        } else if (response?.data?.user?.userType === 'listener') {
          dispatch(setIsVenter(false));
          navigateListener(response?.data?.user);
        } else if (response?.data?.user?.userType === 'admin') {
          if (!ENABLE_ADMIN_FLOW) {
            await dispatch(logout());
            toastError({ text: t('Errors.adminUnavailableOnMobile') });
            return;
          }
          dispatch(setIsVenter(false));
          navigation.navigate(routes.adminHomeTab as never);
        }
      } else {
        toastError({ text: response.error || 'Invalid credentials', theme });
      }
    } catch (error: any) {
      // dispatch(setUser(userData));
      console.log('error;l;l;l;l', error);
      toastError({ text: error?.error || 'Invalid credentials' });
      // Navigate based on role even on error (for development)
      // if (selectedUsage === 'venter') {
      //   navigation.navigate(routes.venterHomeTab as never);
      // } else {
      //   navigation.navigate(routes.listenerHomeTab as never);
      // }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate(routes.signUp as never);
  };

  const handleForgotPassword = () => {
    navigation.navigate(routes.resetPassword as never);
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login');
  };
  const handleGoogleLogin = async () => {
    // if (!selectedUsage) {
    //   setUsageError(t('SignUp.selectUsage') || 'Please select how you will use the app');
    //   toastError({ text: 'Please select how you will use the app first' });
    //   return;
    // }
    setUsageError('');

    try {
      console.log('handleGoogleLogin');
      await GoogleSignin.hasPlayServices();
      const currentUser = GoogleSignin.getCurrentUser();

      if (currentUser) {
        await GoogleSignin.signOut();
      }
      const userInfo = await GoogleSignin.signIn();
      console.log("Google User Info:", JSON.stringify(userInfo, null, 2));

      // 3. Extract ID Token
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        toastError({ text: 'Failed to get Google ID Token' });
        return;
      }

      setLoading(true);

      // 4. Call Backend API
      const response: ApiResponse = await apiInstance.post('auth/google-login', {
        idToken: idToken,
        userType: 'venter',
      });

      if (response.success) {
        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.access_token && response.data?.refresh_token) {
          await setTokens(response.data.access_token, response.data.refresh_token);
        } else if (response.data?.tokens?.accessToken && response.data?.tokens?.refreshToken) {
          await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        }

        dispatch(setUser(response?.data?.user));

        toastSuccess({ text: 'Logged in successfully with Google' });
        console.log('Google Login Response:', response.data);

        // 6. Navigation based on role
        if (response?.data?.user?.userType === 'venter') {
          dispatch(setIsVenter(true));
          navigateVenter(response?.data?.user);
        } else {
          dispatch(setIsVenter(false));
          // @ts-ignore
          navigation.navigate(routes.listenerHomeTab as never);
        }

      } else {
        console.log('Google Login Response:', response.data);
        toastError({ text: response.error || 'Google login failed', theme });
      }

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        toastError({ text: 'Play services not available' });
      } else {
        console.log('Google Login Error:', error);
        toastError({ text: error?.response?.data?.message || 'Google login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      // 1. Get stored email

      const email = await getBiometricEmail();
      console.log("email for biometric login", email);

      if (!email) {
        toastError({ text: 'Biometric login not set up for any account.' });
        return;
      }

      // 2. Local Biometric Authentication
      const authenticated = await BiometricAuth.authenticate('Authenticate to log in');
      if (!authenticated) {
        setLoading(false);
        return;
      }

      // 3. Create Challenge and Signature
      const challenge = Date.now().toString();
      const signature = await BiometricAuth.createSignature(challenge);

      if (!signature) {
        toastError({ text: 'Failed to create biometric signature.' });
        setLoading(false);
        return;
      }

      // 4. Get Device ID
      const deviceId = await getDeviceId();

      // 5. Call Backend API
      console.log('[LogIn] Logging in with biometrics...');
      const response = await (biometricApi.loginWithBiometric({
        email,
        deviceId,
        challenge,
        signature,
      }) as any);

      if (response.success) {
        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.access_token && response.data?.refresh_token) {
          await setTokens(response.data.access_token, response.data.refresh_token);
        } else if (response.data?.tokens?.accessToken && response.data?.tokens?.refreshToken) {
          await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        }

        dispatch(setUser(response?.data?.user));

        toastSuccess({ text: 'Logged in successfully with biometrics' });

        // Navigation based on role
        if (response?.data?.user?.userType === 'venter') {
          dispatch(setIsVenter(true));
          navigateVenter(response?.data?.user);
        } else if (response?.data?.user?.userType === 'listener') {
          dispatch(setIsVenter(false));
          navigateListener(response?.data?.user);

          // navigation.navigate(routes.listenerHomeTab as never);
        } else if (response?.data?.user?.userType === 'admin') {
          if (!ENABLE_ADMIN_FLOW) {
            await dispatch(logout());
            toastError({ text: t('Errors.adminUnavailableOnMobile') });
            return;
          }
          dispatch(setIsVenter(false));
          (navigation as any).replace(routes.adminHomeTab as never);

        }
      } else {
        toastError({ text: response.error || 'Biometric login failed', theme });
      }
    } catch (error: any) {
      console.error('Biometric Login Error:', error);
      toastError({ text: error?.error || 'Biometric login failed' });
    } finally {
      setLoading(false);
    }
  };

  const callSocialLoginAPI = async (email: string, provider: string, name: string, token: string) => {
  try{
    setLoading(true);
    const payload = {
  "identityToken": token,
  "userType": 'venter',
  "user": {
    "name": name,
    "email": email
  }
};
console.log('payload', payload);
      const response: ApiResponse = await apiInstance.post('auth/apple-login',payload );
      console.log('response++++++>>>', response?.data);
   if (response.success) {
        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.access_token && response.data?.refresh_token) {
          await setTokens(response.data.access_token, response.data.refresh_token);
        } else if (response.data?.tokens?.accessToken && response.data?.tokens?.refreshToken) {
          await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        }

        dispatch(setUser(response?.data?.user));

        toastSuccess({ text: 'Logged in successfully with Google' });
        console.log('Google Login Response:', response.data);

        // 6. Navigation based on role
        if (response?.data?.user?.userType === 'venter') {
          dispatch(setIsVenter(true));
          navigateVenter(response?.data?.user);
        } else {
          dispatch(setIsVenter(false));
          // @ts-ignore
          navigation.navigate(routes.listenerHomeTab as never);
        }

      } else {
        console.log('Apple Login Response:', response.data);
        toastError({ text: response.error || 'Apple login failed', theme });
      }
  } catch (error: any) {
    console.error('Apple Login Error:', error);
    toastError({ text: error?.error || 'Social login failed' });
  } finally {
    setLoading(false);
  }
  };
  const handleAppleLogin = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [
        appleAuth.Scope.FULL_NAME,
        appleAuth.Scope.EMAIL,
        appleAuth.Scope.FULL_NAME,
      ],
    });
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      console?.log(
        "----------AppleToken---__>",
        JSON?.stringify(appleAuthRequestResponse, null, 2)
      );
      // user is authenticated
      //@ts-ignore
      const decodedToken = jwtDecode(appleAuthRequestResponse?.identityToken);
      console?.log("-------------__>", decodedToken); 
      //@ts-ignore
      const email = decodedToken.email || ""; // Handle the absence of email claim
      //@ts-ignore
      const name = decodedToken.name || ""; // Handle the absence of name claim

      callSocialLoginAPI(email, "apple", name , appleAuthRequestResponse?.identityToken as string);
      console.log('email', email);
      console.log('name', name);
    }
  };
  return (
    <AuthWrapper key={langKey}>
      <KeyboardAwareScrollView
        {...getKeyboardAwareScrollViewProps()}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* App Icon */}
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

          {/* Title */}
          <Text style={styles.title}>
            {t('LogIn.title')}
          </Text>
          <SettingsContainer >
            <View style={styles.container}>


              {/* Email or Phone Input */}
              <Input
                containerStyle={[styles.inputContainer, {
                  marginTop: hp(1.5)
                }]}
                title={t('LogIn.emailOrPhone')}
                titleStyle={{ fontSize: hp(1.7) }}
                value={emailOrPhone}
                onChangeText={handleEmailOrPhoneChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                inputContainerStyle={{ marginBottom: hp(1) }}
              // error={emailOrPhoneError}
              />

              {/* Password Input */}
              <PasswordInput
                title={t('LogIn.password')}
                titleStyle={{ fontSize: hp(1.7) }}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder={t('LogIn.password')}
                showHint={false}
                inputContainerStyle={{ width: "100%", marginBottom: hp(1) }}
              // error={passwordError}
              />

              {/* <View style={{ marginBottom: hp(1.5), width: '100%' }}>
            <Dropdown
              titleStyle={{ fontSize: hp(1.7) }}
              title={t('SignUp.howWillYouUse')}
              placeholder={t('SignUp.howWillYouUse')}
              options={usageOptions}
              value={selectedUsage}
              onSelect={handleUsageChange}
              iconStyle={{ tintColor: theme.text }}
            />
            {usageError && (
              <Text style={styles.errorText}>
                {usageError}
              </Text>
            )}
          </View> */}

              {/* Remember Me and Forgot Password */}
              <View style={styles.rememberMeContainer}>
                {/* <TouchableOpacity style={styles.rememberMeLeft} onPress={toggleRememberMe}>
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked
              ]}>
                {rememberMe && (
                  <Image source={tickIcon} style={styles.checkmark} />
                )}
              </View>
              <Text style={styles.rememberMeText}>
                {t('LogIn.rememberMe')}
              </Text>
            </TouchableOpacity> */}

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    {t('LogIn.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Log In Button */}
              {/* <View style={styles.buttonContainer}> */}
              <Button
                title={t('LogIn.logIn')}
                disabled={loading}
                onPress={handleLogIn}
                buttonStyle={{}}
                titleStyle={{}}
                glassStyles={{
                  width: '100%',
                  marginBottom: hp(2)
                }}
                leftIcon={undefined}
                iconStyle={{}}
                borderedGlassButton={false}
              />
              {/* </View> */}

              {/* Don't have account link */}
              <View style={styles.signUpLinkContainer}>
                <Text style={styles.signUpText}>
                  {t('LogIn.dontHaveAccount')}{' '}
                </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>
                    {t('LogIn.signUp')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Or Continue With */}
              <Text style={styles.continueWithText}>
                {t('LogIn.continueWith')}
              </Text>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                {/* <SocialButton icon="f" onPress={handleFacebookLogin} /> */}
                <SocialButton icon="G" onPress={handleGoogleLogin} />
                {Platform.OS === 'ios' && <SocialButton icon="apple" onPress={handleAppleLogin} />}

              </View>

              {/* Admin Access - Development */}

              {isBiometricRegistered && <Text style={styles.continueWithText}>
                {t('LogIn.biometric')}
              </Text>}
              {isBiometricRegistered && (
                <TouchableOpacity
                  style={[
                    styles.iconContainer,
                    {
                      borderRadius: 999,
                      marginTop: hp(2),
                      marginBottom: 0,
                      width: hp(8),
                      height: hp(8),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  ]}
                  onPress={handleBiometricLogin}
                >
                  <Image
                    source={fingerprintIcon}
                    style={{ width: hp(4.5), height: hp(4.5), tintColor: theme.white }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          </SettingsContainer>
        </View>
      </KeyboardAwareScrollView>
      <Loader isVisible={loading} />

    </AuthWrapper>
  );
};

export default LogIn;