import {
  createStackNavigator,
} from "@react-navigation/stack";
import React from 'react'
import { routes } from './routes';
import Splash from '../screens/AuthScreens/Splash';
import OnBoarding from '../screens/AuthScreens/OnBoarding';
import SignUp from '../screens/AuthScreens/SignUp';
import LogIn from '../screens/AuthScreens/LogIn';
import MicrophoneRequestScreen from '../screens/AuthScreens/MicrophoneRequestScreen';
import SpeakerRequestScreen from '../screens/AuthScreens/SpeakerRequestScreen';
import BiometricEnableScreen from '../screens/AuthScreens/BiometricEnableScreen';
import LanguageSelectionScreen from '../screens/AuthScreens/LanguageSelectionScreen';
import TermsAndConditionsScreen from '../screens/AuthScreens/TermsAndConditionsScreen';
import OptionalQuestionsScreen from '../screens/AuthScreens/OptionalQuestionsScreen';
import GenderIdentityScreen from '../screens/AuthScreens/GenderIdentityScreen';
import RacialIdentityScreen from '../screens/AuthScreens/RacialIdentityScreen';
import EthnicityScreen from '../screens/AuthScreens/EthnicityScreen';
import AgeGroupScreen from '../screens/AuthScreens/AgeGroupScreen';
import LGBTQIdentityScreen from '../screens/AuthScreens/LGBTQIdentityScreen';
import SpecialTopicsScreen from '../screens/AuthScreens/SpecialTopicsScreen';
import FaithOrBeliefScreen from '../screens/AuthScreens/FaithOrBeliefScreen';
import ChoosePlanScreen from '../screens/AuthScreens/ChoosePlanScreen';
import VenterAddFunds from '../screens/VenterHome/VenterAddFunds';
import BasicPlanDetailsScreen from '../screens/AuthScreens/BasicPlanDetailsScreen';
import PaymentMethodsScreen from '../screens/AuthScreens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/AuthScreens/AddPaymentMethodScreen';
import PaymentMethodSavedScreen from '../screens/AuthScreens/PaymentMethodSavedScreen';
import SubscriptionSuccessScreen from '../screens/AuthScreens/SubscriptionSuccessScreen';
import SubscriptionDetailsScreen from '../screens/AuthScreens/SubscriptionDetailsScreen';
// Listener screens
import ListenerTraining from '../screens/AuthScreens/Listener/ListenerTraining';
import ListenerWhatToExpect from '../screens/AuthScreens/ListenerWhatToExpect';
import ListenerTermsAndConditions from '../screens/AuthScreens/Listener/ListenerTermsAndConditions';
import ListenerLiabilityWaiver from '../screens/AuthScreens/Listener/ListenerLiabilityWaiver';
import ListenerAgreement from '../screens/AuthScreens/Listener/ListenerAgreement';
import PaymentTermsAcknowledgment from '../screens/AuthScreens/Listener/PaymentTermsAcknowledgment';
import ListenerNDA from '../screens/AuthScreens/Listener/ListenerNDA';
import ListenerCodeOfConduct from '../screens/AuthScreens/Listener/ListenerCodeOfConduct';
import ListenerPhoneNumber from '../screens/AuthScreens/Listener/ListenerPhoneNumber';
import ListenerVerification from '../screens/AuthScreens/Listener/ListenerVerification';
import VerificationInProgress from '../screens/AuthScreens/Listener/VerificationInProgress';
import VerificationVerified from '../screens/AuthScreens/Listener/VerificationVerified';
// Forgot password screens
import ResetPassword from '../screens/AuthScreens/ResetPassword';
import EmailVerification from '../screens/AuthScreens/EmailVerification';
import PhoneVerification from '../screens/AuthScreens/PhoneVerification';
import CreateNewPassword from '../screens/AuthScreens/CreateNewPassword';
import ResetSuccessful from '../screens/AuthScreens/ResetSuccessful';
// Admin screens
import AdminLogin from '../screens/AuthScreens/AdminAuth/AdminLogin';
import NicknameScreen from '../screens/AuthScreens/NicknameScreen';
import SignUpOTP from "../screens/AuthScreens/SignUpOTP";
import { ENABLE_ADMIN_FLOW } from '../config/featureFlags';

const Auth = createStackNavigator();
const AuthStack = () => {

  return (
    <Auth.Navigator screenOptions={{ headerShown: false }} initialRouteName={routes?.splash}>
      <Auth.Screen
        name={routes?.splash}
        component={Splash} />
      <Auth.Screen
        name={routes?.onBoarding}
        component={OnBoarding} />
      <Auth.Screen
        name={routes?.signUp}
        component={SignUp} />
      <Auth.Screen
        name={routes?.logIn}
        component={LogIn} />
      <Auth.Screen
        name={routes?.microphoneRequest}
        component={MicrophoneRequestScreen} />
      <Auth.Screen
        name={routes?.speakerRequest}
        component={SpeakerRequestScreen} />
      <Auth.Screen
        name={routes?.signUpOTP}
        component={SignUpOTP} />
      <Auth.Screen
        name={routes?.nickname}
        component={NicknameScreen} />
      <Auth.Screen
        name={routes?.biometricEnable}
        component={BiometricEnableScreen} />
      <Auth.Screen
        name={routes?.languageSelection}
        component={LanguageSelectionScreen} />
      <Auth.Screen
        name={routes?.termsAndConditions}
        component={TermsAndConditionsScreen} />
      <Auth.Screen
        name={routes?.optionalQuestions}
        component={OptionalQuestionsScreen} />
      <Auth.Screen
        name={routes?.genderIdentity}
        component={GenderIdentityScreen} />
      <Auth.Screen
        name={routes?.racialIdentity}
        component={RacialIdentityScreen} />
      <Auth.Screen
        name={routes?.ethnicity}
        component={EthnicityScreen} />
      <Auth.Screen
        name={routes?.ageGroup}
        component={AgeGroupScreen} />
      <Auth.Screen
        name={routes?.lgbtqIdentity}
        component={LGBTQIdentityScreen} />
      <Auth.Screen
        name={routes?.specialTopics}
        component={SpecialTopicsScreen} />
      <Auth.Screen
        name={routes?.faithOrBelief}
        component={FaithOrBeliefScreen} />
      <Auth.Screen
        name={routes?.choosePlan}
        component={VenterAddFunds} />
      <Auth.Screen
        name={routes?.basicPlanDetails}
        component={BasicPlanDetailsScreen} />
      <Auth.Screen
        name={routes?.paymentMethods}
        component={PaymentMethodsScreen} />
      <Auth.Screen
        name={routes?.addPaymentMethod}
        component={AddPaymentMethodScreen} />
      <Auth.Screen
        name={routes?.paymentMethodSaved}
        component={PaymentMethodSavedScreen} />
      <Auth.Screen
        name={routes?.subscriptionSuccess}
        component={SubscriptionSuccessScreen} />
      <Auth.Screen
        name={routes?.subscriptionDetails}
        component={SubscriptionDetailsScreen} />
      {/* Listener screens */}
      <Auth.Screen
        name={routes?.listenerWhatToExpect}
          component={ListenerWhatToExpect}
        />
        <Auth.Screen
          name={routes?.listenerTraining}
        component={ListenerTraining} />
      <Auth.Screen
        name={routes?.listenerTermsAndConditions}
        component={ListenerTermsAndConditions} />
      <Auth.Screen
        name={routes?.listenerLiabilityWaiver}
        component={ListenerLiabilityWaiver} />
      <Auth.Screen
        name={routes?.listenerAgreement}
        component={ListenerAgreement} />
      <Auth.Screen
        name={routes?.paymentTermsAcknowledgment}
        component={PaymentTermsAcknowledgment} />
      <Auth.Screen
        name={routes?.listenerNDA}
        component={ListenerNDA} />
      <Auth.Screen
        name={routes?.listenerCodeOfConduct}
        component={ListenerCodeOfConduct} />
      <Auth.Screen
        name={routes?.listenerPhoneNumber}
        component={ListenerPhoneNumber} />
      <Auth.Screen
        name={routes?.listenerVerification}
        component={ListenerVerification} />
      <Auth.Screen
        name={routes?.verificationInProgress}
        component={VerificationInProgress} />
      <Auth.Screen
        name={routes?.verificationVerified}
        component={VerificationVerified} />
      {/* Forgot password screens */}
      <Auth.Screen
        name={routes?.resetPassword}
        component={ResetPassword} />
      <Auth.Screen
        name={routes?.emailVerification}
        component={EmailVerification} />
      <Auth.Screen
        name={routes?.phoneVerification}
        component={PhoneVerification} />
      <Auth.Screen
        name={routes?.createNewPassword}
        component={CreateNewPassword} />
      <Auth.Screen
        name={routes?.resetSuccessful}
        component={ResetSuccessful} />
      {ENABLE_ADMIN_FLOW ? (
        <Auth.Screen name={routes?.adminLogin} component={AdminLogin} />
      ) : null}
    </Auth.Navigator>

  )
}

export default AuthStack