import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { routes } from '../routes';

// Import internal screens
import ReferralScreen from '../../screens/Common/ReferralScreen';
import VerifyPassScreen from '../../screens/Common/VerifyPassScreen';
import AffiliateScreen from '../../screens/Common/AffiliateScreen';
import VenterMoodLog from '../../screens/VenterHome/VenterMoodLog';
import VenterReflectionDetail from '../../screens/VenterHome/VenterReflectionDetail';
import VenterAddReflection from '../../screens/VenterHome/VenterAddReflection';
import VenterReflections from '../../screens/VenterHome/VenterReflections';
import VenterCrisisWarningScreen from '../../screens/VenterHome/VenterCrisisWarningScreen';
import VenterCrisisSafeScreen from '../../screens/VenterHome/VenterCrisisSafeScreen';
import VenterCrisisDisclaimerScreen from '../../screens/VenterHome/VenterCrisisDisclaimerScreen';
import VenterCrisisImmediateHelpScreen from '../../screens/VenterHome/VenterCrisisImmediateHelpScreen';
import VenterCrisis988Screen from '../../screens/VenterHome/VenterCrisis988Screen';
import VenterPaymentCheckScreen from '../../screens/VenterHome/VenterPaymentCheckScreen';
import VenterNoCreditScreen from '../../screens/VenterHome/VenterNoCreditScreen';
import VenterAddCreditScreen from '../../screens/VenterHome/VenterAddCreditScreen';
// VenterMySubscriptionScreen removed - PAYG model
import PaymentMethodsScreen from '../../screens/AuthScreens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../../screens/AuthScreens/AddPaymentMethodScreen';
import ChoosePlanScreen from '../../screens/AuthScreens/ChoosePlanScreen';
import SubscriptionDetailsScreen from '../../screens/AuthScreens/SubscriptionDetailsScreen';
import GeneralSettings from '../../screens/VenterHome/GeneralSettings';
import ChangeBackground from '../../screens/VenterHome/ChangeBackground';
import SubmitFeedback from '../../screens/VenterHome/SubmitFeedback';
import NotificationsSettings from '../../screens/VenterHome/NotificationsSettings';
import ChangeAccountType from '../../screens/VenterHome/ChangeAccountType';
import VenterMoods from '../../screens/VenterHome/VenterMoods';
import VenterMonthlyMood from '../../screens/VenterHome/VenterMonthlyMood';
import VenterMoodHistory from '../../screens/VenterHome/VenterMoodHistory';
import VenterMoodDetails from '../../screens/VenterHome/VenterMoodDetails';
import VenterRecoveryDashboard from '../../screens/VenterHome/VenterRecoveryDashboard';
import VenterLogProgress from '../../screens/VenterHome/VenterLogProgress';
import VenterRecoveryCalendar from '../../screens/VenterHome/VenterRecoveryCalendar';
import VenterRecoveryDetails from '../../screens/VenterHome/VenterRecoveryDetails';
import VenterEditRecoveryLog from '../../screens/VenterHome/VenterEditRecoveryLog';
import VenterJourneyDashboard from '../../screens/VenterHome/VenterJourneyDashboard';
import VenterMoodTrends from '../../screens/VenterHome/VenterMoodTrends';
import VenterMoodVariation from '../../screens/VenterHome/VenterMoodVariation';
// VenterUpgradePlan removed - PAYG model
import VenterAddFunds from '../../screens/VenterHome/VenterAddFunds';
import VenterWatchAdsScreen from '../../screens/VenterHome/VenterWatchAdsScreen';
import VenterProgressSummary from '../../screens/VenterHome/VenterProgressSummary';

const Stack = createStackNavigator();

const VenterInternalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={routes.venterMoodLog}
    >
      <Stack.Screen
        name={routes.venterMoodLog}
        component={VenterMoodLog}
      />
      <Stack.Screen
        name={routes.venterMoods}
        component={VenterMoods}
      />
      <Stack.Screen
        name={routes.venterMonthlyMood}
        component={VenterMonthlyMood}
      />
      <Stack.Screen
        name={routes.venterMoodHistory}
        component={VenterMoodHistory}
      />
      <Stack.Screen
        name={routes.venterMoodDetails}
        component={VenterMoodDetails}
      />
      <Stack.Screen
        name={routes.venterReflectionDetail}
        component={VenterReflectionDetail}
      />
      <Stack.Screen
        name={routes.venterAddReflection}
        component={VenterAddReflection}
      />
      <Stack.Screen
        name={routes.venterReflections}
        component={VenterReflections}
      />
      <Stack.Screen
        name={routes.venterCrisisWarning}
        component={VenterCrisisWarningScreen}
      />
      <Stack.Screen
        name={routes.venterCrisisSafe}
        component={VenterCrisisSafeScreen}
      />
      <Stack.Screen
        name={routes.venterCrisisDisclaimer}
        component={VenterCrisisDisclaimerScreen}
      />
      <Stack.Screen
        name={routes.venterCrisisImmediateHelp}
        component={VenterCrisisImmediateHelpScreen}
      />
      <Stack.Screen
        name={routes.venterCrisis988Support}
        component={VenterCrisis988Screen}
      />
      <Stack.Screen
        name={routes.venterPaymentCheck}
        component={VenterPaymentCheckScreen}
      />
      <Stack.Screen
        name={routes.venterNoCredit}
        component={VenterNoCreditScreen}
      />
      <Stack.Screen
        name={routes.venterAddCredit}
        component={VenterAddCreditScreen}
      />
      <Stack.Screen
        name={routes.venterMySubscription}
        component={VenterAddFunds}
      />
      <Stack.Screen
        name={routes.choosePlan}
        component={ChoosePlanScreen}
      />
      <Stack.Screen
        name={routes.venterGeneralSettings}
        component={GeneralSettings}
      />
      <Stack.Screen
        name={routes.venterChangeBackground}
        component={ChangeBackground}
      />
      <Stack.Screen
        name={routes.venterSubmitFeedback}
        component={SubmitFeedback}
      />
      <Stack.Screen
        name={routes.venterNotifications}
        component={NotificationsSettings}
      />
      <Stack.Screen
        name={routes.venterChangeAccountType}
        component={ChangeAccountType}
      />
      <Stack.Screen
        name={routes.venterRecoveryDashboard}
        component={VenterRecoveryDashboard}
      />
      <Stack.Screen
        name={routes.venterLogProgress}
        component={VenterLogProgress}
      />
      <Stack.Screen
        name={routes.venterRecoveryCalendar}
        component={VenterRecoveryCalendar}
      />
      <Stack.Screen
        name={routes.venterRecoveryDetails}
        component={VenterRecoveryDetails}
      />
      <Stack.Screen
        name={routes.venterEditRecoveryLog}
        component={VenterEditRecoveryLog}
      />
      <Stack.Screen
        name={routes.venterJourneyDashboard}
        component={VenterJourneyDashboard}
      />
      <Stack.Screen
        name={routes.venterMoodTrends}
        component={VenterMoodTrends}
      />
      <Stack.Screen
        name={routes.venterMoodVariation}
        component={VenterMoodVariation}
      />
      <Stack.Screen
        name={routes.venterProgressSummary}
        component={VenterProgressSummary}
      />
    <Stack.Screen
        name={routes.venterUpgradePlan}
        component={VenterAddFunds}
   />
   <Stack.Screen name={routes.venterWatchAds} component={VenterWatchAdsScreen} />
   <Stack.Screen name={routes.referral} component={ReferralScreen} />
   <Stack.Screen name={routes.verifyPass} component={VerifyPassScreen} />
   <Stack.Screen name={routes.affiliate} component={AffiliateScreen} />
   </Stack.Navigator>
  );
};

export default VenterInternalStack;
