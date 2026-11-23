import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AuthWrapper from '../../wrapper/AuthWrapper';
import { hp, wp } from '../../utils/size';
import { fontFamilies } from '../../utils/fontFamilies';
import { useTheme } from '../../theme';
import { useTranslationWithUpdate } from '../../hooks/useTranslationWithUpdate';
import { useNavigation , useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout, setUser, setUserRole, setIsVenter } from '../../store/slices/userSlice';
import { ENABLE_ADMIN_FLOW } from '../../config/featureFlags';
import { AppDispatch } from '../../store/store';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import { chatIcon } from '../../assets/icons';
import apiInstance, { ApiResponse, setTokens } from '../../api/apiInstance';
import { ActivityIndicator } from 'react-native';
import { toastError, toastSuccess } from '../../utils/toast';
import { routes } from '../../navigation/routes';
import { getKeyboardAwareScrollViewProps, getKeyboardAwareContentStyle } from '../../utils/keyboard';
import { Loader } from '../../components/Loader';
import appleAuth from "@invertase/react-native-apple-authentication";
import { jwtDecode } from 'jwt-decode';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import SettingsContainer from '../../components/shared/SettingsContainer';
import { useListenerNavigation } from '../../hooks/useListenerNavigation';
import { useVenterNavigation } from '../../hooks/useVenterNavigation';
import { useAbandonedSignup } from '../../hooks/useAbandonedSignup';

const SignUp = ({ route }: any) => {
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
  const [nickname, setNickname] = useState('');
  // Auto-fill referral code if passed via navigation params (deep link or in-app navigation)
  const [referralCode, setReferralCode] = useState<string>(() => {
    const param = route?.params?.ref ?? route?.params?.referralCode ?? '';
    return String(param).toUpperCase().slice(0, 8);
  });
  const [selectedUsage, setSelectedUsage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usageError, setUsageError] = useState('');
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  // Abandoned signup tracking — fires when user leaves with email entered but didn't register
  useAbandonedSignup({
    email: emailOrPhone,
    userType: selectedUsage,
    isSubmitted: signupSubmitted,
  });
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
      setEmailOrPhone("m5@yopmail.com")
      setPassword("Hello123@")
      // setSelectedUsage("venter")
    }
  }, [])
  const styles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingVertical: hp(10),

      // justifyContent: "center",
      // alignItems: "center",
    },
    container: {
      width: '100%',
      // paddingHorizontal: wp(6),
      justifyContent: "center",
      alignItems: "center",
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
      marginBottom: hp(1),
    },
    buttonContainer: {
      width: '100%',
      marginTop: hp(2.5),
      marginBottom: hp(1.5),
    },
    loginLinkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    loginText: {
      fontFamily: fontFamilies.normal,
      fontSize: hp(1.5),
      color: theme.white,

    },
    loginLink: {
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
      marginBottom: hp(15)
    },
    errorText: {
      fontSize: hp(1.4),
      fontFamily: fontFamilies.normal,
      marginTop: hp(0.5),
      marginLeft: wp(2.5),
      color: theme.error,
    },
  });

  const usageOptions = [
    { label: `${t('SignUp.usageOptions.wantToVent')} — ${t('SignUp.anonymousSupport', 'Get anonymous support')}`, value: 'venter' },
    { label: `${t('SignUp.usageOptions.wantToListen')} — Earn by supporting others`, value: 'listener' },
  ];

  // Helper function to check if input is an email or phone number
  const isEmail = (input: string): boolean => {
    // Simple email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input.trim());
  };

  // Helper function to validate phone number
  const isValidPhoneNumber = (phone: string): boolean => {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Check if it starts with + and has 10-15 digits, or just has 10-15 digits
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(cleaned);
  };

  // Strong password validation
  const validatePassword = (pwd: string): { isValid: boolean; error: string } => {
    if (!pwd || pwd.trim().length === 0 || pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/\d/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return {
        isValid: false, error: t("Common.passwordValidationError")
      };
    }




    return { isValid: true, error: '' };
  };

  // Validate email or phone
  const validateEmailOrPhone = (input: string): { isValid: boolean; error: string } => {
    if (!input || input.trim().length === 0) {
      return { isValid: false, error: 'Email or phone number is required' };
    }

    const trimmedInput = input.trim();
    const isEmailInput = isEmail(trimmedInput);

    if (isEmailInput) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedInput)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    } else {
      // Phone validation
      if (!isValidPhoneNumber(trimmedInput)) {
        return { isValid: false, error: 'Please enter a valid email or phone number' };
      }
    }

    return { isValid: true, error: '' };
  };

  // Clear errors when user starts typing
  const handleEmailOrPhoneChange = (text: string) => {
    setEmailOrPhone(text);
    if (emailOrPhoneError) {
      setEmailOrPhoneError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleUsageChange = (value: string) => {
    setSelectedUsage(value);
    if (usageError) {
      setUsageError('');
    }
  };

  const handleCreateAccount = async () => {
    //     const userData1 = {
    //       name: emailOrPhone.split('@')[0] || emailOrPhone, // Extract name from email or use phone
    //       email: emailOrPhone,
    //       role: selectedUsage as 'listener' | 'venter',
    //       image: '',
    //     };

    //     dispatch(setUser(userData1));
    //     navigation.navigate(routes.signUpOTP as never);
    // return
    // Clear previous errors
    setEmailOrPhoneError('');
    setPasswordError('');
    setUsageError('');

    // Validate all fields
    const emailOrPhoneValidation = validateEmailOrPhone(emailOrPhone);
    const passwordValidation = validatePassword(password);
    let hasErrors = false;

    if (!emailOrPhoneValidation.isValid) {
      setEmailOrPhoneError(emailOrPhoneValidation.error);
      hasErrors = true;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      hasErrors = true;
    }

    if (!selectedUsage || selectedUsage.trim().length === 0) {
      setUsageError(t('SignUp.selectUsage') || 'Please select how you will use the app');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Save user data to Redux for development
    const userData = {
      name: emailOrPhone.split('@')[0] || emailOrPhone, // Extract name from email or use phone
      email: emailOrPhone,
      role: selectedUsage as 'listener' | 'venter',
      image: '',
    };

    // dispatch(setUser(userData));

    // if (__DEV__) {
    //   toastSuccess({ text: 'Account created successfully', theme });
    //   navigation.navigate(routes.microphoneRequest as never);
    //   return;
    // }

    setLoading(true);
    try {
      // Build request payload based on whether input is email or phone
      const isEmailInput = isEmail(emailOrPhone);
      const requestPayload: any = {
        password: password,
        userType: selectedUsage,
        displayName: nickname.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
      };

      if (isEmailInput) {
        requestPayload.email = emailOrPhone.trim();
      } else {
        requestPayload.phoneNumber = emailOrPhone.trim();
      }

      const response: ApiResponse = await apiInstance.post('auth/register', requestPayload);

      if (response.success) {
        setSignupSubmitted(true); // Suppress abandoned-signup event
        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.access_token && response.data?.refresh_token) {
          await setTokens(response.data.access_token, response.data.refresh_token);
        } else if (response.data?.tokens?.accessToken && response.data?.tokens?.refreshToken) {
          await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        } else {
          toastError({ text: 'Something went wrong', theme });
        }

        dispatch(setUser(response?.data?.user));
        dispatch(setIsVenter(response?.data?.user?.userType === 'venter'))
        console.log('response.data', response.data);
        toastSuccess({ text: 'Account created successfully' });

        // Auto-activate free tier for new Venter users
        if (selectedUsage === 'venter') {
          try {
            await apiInstance.post('payments/activate-free-tier');
          } catch {
            // Silent fail — user can still sign up
          }
        }

        // Apply referral code if provided
        if (referralCode.trim()) {
          try {
            await apiInstance.post('referrals/apply', { referralCode: referralCode.trim() });
          } catch {
            // Silent fail — referral is a bonus
          }
        }

        // Refersion conversion tracking — fire after successful registration (best-effort)
        try {
          const userId = response?.data?.user?.id ?? response?.data?.user?._id ?? '';
          await apiInstance.post('referrals/refersion-conversion', {
            customer_id: userId,
            email: emailOrPhone,
            referral_code: referralCode.trim() || undefined,
          });
        } catch {
          // Silent fail — Refersion is analytics, not critical path
        }

        // @ts-ignore
        navigation.navigate(routes.signUpOTP as never, { email: emailOrPhone });
        // navigation.navigate(routes.microphoneRequest as never);
      } else {
        toastError({ text: response.error || 'Something went wrong', theme });
      }
    } catch (error: any) {
      // For development, still save user and navigate
      console.log('error', error);
      toastError({ text: error?.error || 'Something went wrong', theme });
      // dispatch(setUser(userData));
      // navigation.navigate(routes.microphoneRequest as never);
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



  const handleLogIn = () => {
    // Navigate to login screen
    navigation.navigate(routes.logIn as never);
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login');
  };

  const handleGoogleLogin = async () => {
    // 1. Validate User Type Selection
    if (!selectedUsage) {
      setUsageError(t('SignUp.selectUsage') || 'Please select how you will use the app');
      toastError({ text: 'Please select how you will use the app first' });
      return;
    }
    setUsageError('');

    try {
      console.log('handleGoogleLogin');
      await GoogleSignin.hasPlayServices();
      const currentUser = GoogleSignin.getCurrentUser();

      if (currentUser) {
        await GoogleSignin.signOut();
      }

      // 2. Perform Google Sign In
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
        userType: selectedUsage,
      });

      if (response.data) {
        console.log('Google Login Response data :', {
          tokens: response.data?.tokens,
          user: response.data?.user,
        });

        // Save tokens BEFORE dispatching setUser so the socket can read them
        if (response.data?.tokens) {
          await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        }

        dispatch(setUser(response?.data?.user));
        dispatch(setIsVenter(response?.data?.user?.activeRole === 'venter'));

        toastSuccess({ text: 'Logged in successfully with Google' });
        console.log('Google Login Response:', response);

        // 6. Navigate to onboarding flow (same as normal signup)
        // navigation.navigate(routes.microphoneRequest as never);
        if (response?.data?.user?.userType === 'venter') {
          navigateVenter(response?.data?.user);
        } else if (response?.data?.user?.userType === 'listener') {
          navigateListener(response?.data?.user);

          // navigation.navigate(routes.listenerHomeTab as never);
        } else if (response?.data?.user?.userType === 'admin') {
          if (!ENABLE_ADMIN_FLOW) {
            await dispatch(logout());
            toastError({ text: t('Errors.adminUnavailableOnMobile') });
            return;
          }
          navigation.navigate(routes.adminHomeTab as never);

        }
      } else {
        toastError({ text: response.error || 'Google login failed', theme });
      }

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('User cancelled login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in in progress');
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


  return (
    <AuthWrapper key={langKey}>
      <KeyboardAwareScrollView
        {...getKeyboardAwareScrollViewProps()}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={chatIcon}
              style={styles.appIcon}
            />
          </View>

          {/* Progress bar */}
          <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: hp(1), height: hp(0.5), marginBottom: hp(2) }}>
            <View style={{ width: '33%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: hp(1), height: hp(0.5) }} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t('SignUp.title')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.4), marginBottom: hp(2), textAlign: 'center' }}>
            {t('OnBoarding.joinPeople', '🔒 Join 12,000+ people getting anonymous support')}
          </Text>

        <TouchableOpacity onPress={() => navigation.navigate(routes.logIn as never)} style={{ marginBottom: hp(1.5), alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: hp(1.4), fontFamily: fontFamilies.normal }}>
            {t('SignUp.alreadyHaveAccount')} <Text style={{ color: theme.white, textDecorationLine: 'underline' }}>{t('SignUp.logIn')}</Text>
          </Text>
        </TouchableOpacity>
          {/* Email or Phone Input */}
          {/* <View style={styles.inputContainer}> */}
          <SettingsContainer >
            <View style={styles.container}>


              <Input
                containerStyle={[styles.inputContainer, {
                  marginTop: hp(1.5)
                }]}
                title={t('SignUp.emailOrPhone')}
                titleStyle={{ fontSize: hp(1.7) }}
                placeholder={t('SignUp.emailOrPhone')}
                value={emailOrPhone}
                onChangeText={handleEmailOrPhoneChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                inputContainerStyle={{ marginBottom: hp(1) }}
                error={emailOrPhoneError}
              />
              {/* </View> */}

              {/* Nickname Input */}
              <Input
                containerStyle={[styles.inputContainer, { marginTop: hp(1) }]}
                title={t('SignUp.nickname', 'Nickname')}
                titleStyle={{ fontSize: hp(1.7) }}
                placeholder="e.g. SunflowerMoon"
                value={nickname}
                onChangeText={(text: string) => setNickname(text.slice(0, 20))}
                autoCapitalize="none"
                editable={!loading}
                inputContainerStyle={{ marginBottom: hp(1) }}
              />

              {/* Referral Code Input */}
              <Input
                containerStyle={[styles.inputContainer, { marginTop: hp(1) }]}
                title="Referral Code (optional)"
                titleStyle={{ fontSize: hp(1.7) }}
                placeholder="Enter referral code"
                value={referralCode}
                onChangeText={(text: string) => setReferralCode(text.toUpperCase().slice(0, 8))}
                autoCapitalize="characters"
                editable={!loading}
                inputContainerStyle={{ marginBottom: hp(1) }}
              />

              {/* Password Input */}
              <PasswordInput
                title={t('SignUp.password')}
                titleStyle={{ fontSize: hp(1.7) }}
                placeholder={t('SignUp.password')}
                value={password}
                onChangeText={handlePasswordChange}
                showHint={!passwordError}
                hintText={t('SignUp.passwordHint')}
                inputContainerStyle={{ marginBottom: hp(1) }}
                error={passwordError}
              />

              {/* Usage Dropdown */}
              {/* <View style={styles.inputContainer}> */}
              <View style={styles.inputContainer}>
                <Dropdown
                  title={t('SignUp.howWillYouUse')}
                  titleStyle={{ fontSize: hp(1.7) }}
                  placeholder={""}
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
        {selectedUsage === 'listener' && (
          <View style={{ marginTop: hp(1) }}>
            <View style={{ flexDirection: 'row', gap: wp(3), flexWrap: 'wrap', marginBottom: hp(1) }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>⏱️ ~10 min setup</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>📋 2hr training</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: hp(1.3), fontFamily: fontFamilies.normal }}>✅ 24-48h approval</Text>
            </View>
            <TouchableOpacity onPress={() => (navigation as any).navigate(routes.listenerWhatToExpect)}>
              <Text style={{ color: 'rgba(167,139,250,0.8)', fontSize: hp(1.4), fontFamily: fontFamilies.normal, textDecorationLine: 'underline' }}>
                Learn what to expect →
              </Text>
            </TouchableOpacity>
          </View>
        )}
              </View>
              {/* </View> */}

              {/* Create Account Button */}
              <View style={styles.buttonContainer}>

                <Button
                  title={t('SignUp.createAccount')}
                  disabled={loading}
                  onPress={handleCreateAccount}
                />

              </View>

              {/* Already have account link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>
                  {t('SignUp.alreadyHaveAccount')}{' '}
                </Text>
                <TouchableOpacity onPress={handleLogIn}>
                  <Text style={styles.loginLink}>
                    {t('SignUp.logIn')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Or Continue With */}
              <Text style={styles.continueWithText}>
                {t('SignUp.continueWith')}
              </Text>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                {/* <SocialButton icon="f" onPress={handleFacebookLogin} /> */}
                <SocialButton icon="G" onPress={handleGoogleLogin} />
                {Platform.OS === "ios" && <SocialButton icon="apple" onPress={handleAppleLogin} />}
              </View>
            </View>
          </SettingsContainer>
        </View>
      </KeyboardAwareScrollView>
      <Loader isVisible={loading} />
    </AuthWrapper>
  );
};

export default SignUp;
