import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { routes } from '../routes';

// Import screens (adjust paths as needed)
import ListenerActiveCall from '../../screens/ListenerHome/ListenerActiveCall';
import ListenerSessionFeedback from '../../screens/ListenerHome/ListenerSessionFeedback';
import ListenerSessionRating from '../../screens/ListenerHome/ListenerSessionRating';
import PayoutMethodScreen from '../../screens/ListenerHome/PayoutMethodScreen';
import LinkBankAccountScreen from '../../screens/ListenerHome/LinkBankAccountScreen';
import ListenerLegalPolicies from '../../screens/ListenerHome/ListenerLegalPolicies';
import LegalDocViewer from '../../screens/Common/LegalDocViewer'; // Or specific screens mapping to it
import ListenerChangeAccountType from '../../screens/ListenerHome/ListenerChangeAccountType';
import ListenerCrisisEscalation from '../../screens/ListenerHome/ListenerCrisisEscalation';
import ReferralScreen from '../../screens/Common/ReferralScreen';
import AffiliateScreen from '../../screens/Common/AffiliateScreen';

const Stack = createStackNavigator();

const ListenerInternalStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName={routes.payoutMethod} // Just as default, usually navigated to
        >
            <Stack.Screen name={routes.listenerActiveCall} component={ListenerActiveCall} />
            <Stack.Screen name={routes.listenerCrisisEscalation} component={ListenerCrisisEscalation} />
            <Stack.Screen name={routes.listenerSessionFeedback} component={ListenerSessionFeedback} />
            <Stack.Screen name={routes.listenerSessionRating} component={ListenerSessionRating} />
            <Stack.Screen name={routes.payoutMethod} component={PayoutMethodScreen} />
            <Stack.Screen name={routes.linkBankAccount} component={LinkBankAccountScreen} />
            <Stack.Screen name={routes.listenerLegalPolicies} component={ListenerLegalPolicies} />
            <Stack.Screen name={routes.listenerChangeAccountType} component={ListenerChangeAccountType} />
            <Stack.Screen name={routes.referral} component={ReferralScreen} />
            <Stack.Screen name={routes.affiliate} component={AffiliateScreen} />

            {/* Legal Pages Mapped to Viewer with params */}
            <Stack.Screen name={routes.termsOfUse} component={LegalDocViewer} initialParams={{ defaultTitle: 'Terms of Use' }} />
            {/* <Stack.Screen name={routes.privacyPolicy} component={LegalDocViewer} initialParams={{ defaultTitle: 'Privacy Policy' }} /> */}
            <Stack.Screen name={routes.listenerLiabilityWaiver} component={LegalDocViewer} initialParams={{ defaultTitle: 'Listener Liability Waiver' }} />
            <Stack.Screen name={routes.paymentTermsAcknowledgment} component={LegalDocViewer} initialParams={{ defaultTitle: 'Payment Terms' }} />
            <Stack.Screen name={routes.listenerAgreement} component={LegalDocViewer} initialParams={{ defaultTitle: 'Listener Agreement' }} />
            <Stack.Screen name={routes.listenerNDA} component={LegalDocViewer} initialParams={{ defaultTitle: 'Non-Disclosure Agreement' }} />
            <Stack.Screen name={routes.listenerCodeOfConduct} component={LegalDocViewer} initialParams={{ defaultTitle: 'Code of Conduct' }} />
            <Stack.Screen name={routes.listenerGuidelines} component={LegalDocViewer} initialParams={{ defaultTitle: 'Listener Guidelines' }} />
            {/* ListenerIncomingCall should be here optionally if not in root, but user put it in root earlier. 
          Actually user wanted Internal stack for "other than bottom bar screens". 
          ListenerIncomingCall is full screen, usually better in Root. 
          But Payout/LinkBank are internal navigation from Wallet tab.
      */}
        </Stack.Navigator>
    );
};

export default ListenerInternalStack;
