import { IncomingCallOverlay } from '../components/IncomingCallOverlay';

import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { ThemeProvider } from "../theme";
import { routes } from "./routes";
import { useSelector, useDispatch } from "react-redux";
import socketService from "../sockets";
import apiInstance, { getAccessToken } from "../api/apiInstance";
import { setRequests, clearRequests } from "../store/slices/listenerSlice";
import type { RequestItem } from "../store/slices/listenerSlice";
import type { RootState } from "../store/store";
import AuthStack from "./AuthStack";
import VenterHomeStack from "./venterStack/VenterHomeStack";
import VenterInternalStack from "./venterStack/VenterInternalStack";
import ChatStack from "./ChatStack";
import ListenerHomeStack from "./listener/ListenerHomeStack";
import ListenerInternalStack from "./listener/ListenerInternalStack";
import AdminHomeStack from "./AdminHomeStack";
import Notifications from "../screens/Notifications/Notifications";
import NotificationDetail from "../screens/Notifications/NotificationDetail";
import VenterAllCallsScreen from "../screens/VenterHome/VenterAllCallsScreen";
import CallStatusBar from "../components/shared/CallStatusBar";
import PersistentCallWebView from "../components/shared/PersistentCallWebView";
import ChatStatusBar from "../components/shared/ChatStatusBar";
// VenterUpgradePlan removed - PAYG model
import VenterAddFunds from "../screens/VenterHome/VenterAddFunds";
import VenterTransactions from "../screens/VenterHome/VenterTransactions";
import useNotifications from "../hooks/UseNotifications";
import LanguageSelectionScreen from '../screens/AuthScreens/LanguageSelectionScreen';
import i18n from '../locales/i18n';
import { OfflineBanner } from '../components/OfflineBanner';
// import * as Clarity from '@microsoft/react-native-clarity';
import { useGlobalSessionEvents } from "../hooks/useGlobalSessionEvents";
import SubscriptionDetailsScreen from '../screens/AuthScreens/SubscriptionDetailsScreen';
import PaymentMethodsScreen from "../screens/AuthScreens/PaymentMethodsScreen";
import AddPaymentMethodScreen from "../screens/AuthScreens/AddPaymentMethodScreen";
import ProfileScreen from "../screens/Common/ProfileScreen";
import ReferralScreen from "../screens/Common/ReferralScreen";
import SessionsHistory from "../screens/Common/SessionsHistory";
import PayoutSettings from "../screens/Common/PayoutSettings";
import SecuritySettings from "../screens/Common/SecuritySettings";
import LegalPolicies from "../screens/Common/LegalPolicies";
import ContactUs from "../screens/Common/ContactUs";
import changePassword from "../screens/Common/ChangePassword";
import QuietHours from "../screens/Common/QuietHours";
import Appeal from "../screens/Common/Appeal";
import TermsOfUse from "../screens/Common/TermsOfUse";
import PrivacyPolicy from "../screens/Common/PrivacyPolicy";
import SafetyPolicy from "../screens/Common/SafetyPolicy";
import ListenerGuidelines from "../screens/Common/ListenerGuidelines";
import DeleteAccountScreen from "../screens/Common/DeleteAccountScreen";
import ChoosePlanScreen from '../screens/AuthScreens/ChoosePlanScreen';
import EditProfileScreen from "../screens/Common/EditProfileScreen";
import NeedMoreSupportCrisisScreen from "../screens/Common/NeedMoreSupportCrisisScreen";
// import UpdateEmail from "../screens/Common/UpdateEmail";
import PasswordChangeOTP from "../screens/Common/PasswordChangeOTP";
import UpdateCredential from "../screens/Common/UpdateCredential";
import CredentialChangeOTP from "../screens/Common/CredentialChangeOTP";
// Identity screens (registered here so EditProfileScreen can navigate to them post-login)
import GenderIdentityScreen from '../screens/AuthScreens/GenderIdentityScreen';
import RacialIdentityScreen from '../screens/AuthScreens/RacialIdentityScreen';
import EthnicityScreen from '../screens/AuthScreens/EthnicityScreen';
import AgeGroupScreen from '../screens/AuthScreens/AgeGroupScreen';
import LGBTQIdentityScreen from '../screens/AuthScreens/LGBTQIdentityScreen';
import SpecialTopicsScreen from '../screens/AuthScreens/SpecialTopicsScreen';
import FaithOrBeliefScreen from '../screens/AuthScreens/FaithOrBeliefScreen';
import CustomToast from "../components/shared/CustomToast";

import ListenerActiveCall from '../screens/ListenerHome/ListenerActiveCall';
import IncomingRequestScreen from '../screens/ListenerHome/IncomingRequestScreen';
import ListenerSessionFeedback from '../screens/ListenerHome/ListenerSessionFeedback';
import ListenerSessionRating from '../screens/ListenerHome/ListenerSessionRating';

import AdminInternalStack from "./AdminInternalStack";
import { ENABLE_ADMIN_FLOW } from "../config/featureFlags";

const MyStack = createStackNavigator();

// Create navigation reference for use outside components
export const navigationRef = createNavigationContainerRef();

// Shared set of request IDs that were explicitly dismissed (declined/cancelled by the listener).
// The pending poll in MainNavigator checks this before re-adding any request to Redux,
// preventing dismissed requests from reappearing every 5 seconds.
export const dismissedRequestIds = new Set<string>();

export const MainNavigator = () => {

  useNotifications();

  // Initialize Microsoft Clarity analytics
  React.useEffect(() => {
    // Clarity.initialize('xfn3np7ej2');
  }, []);
  useGlobalSessionEvents();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const isVenter = useSelector((state: RootState) => state.user.isVenter);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      socketService.disconnect();
      return;
    }

    let cancelled = false;

    const connectWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        if (cancelled) return;
        try {
          const token = await getAccessToken();
          if (!token || cancelled) return;
          await socketService.connect();
          console.log('[Nav] Socket connected on attempt', i + 1);
          return;
        } catch (err) {
          console.warn('[Nav] Socket connect attempt', i + 1, 'failed:', err);
          if (i < retries - 1) {
            await new Promise<void>(r => setTimeout(r, 2000 * (i + 1)));
          }
        }
      }
    };

    connectWithRetry();

    return () => {
      cancelled = true;
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  // Global listener for incoming call/chat requests — always active, not screen-dependent
  useEffect(() => {
    if (!isAuthenticated || isVenter) return; // Only listeners need this

    const handleNewRequest = (data: any) => {
      const newRequest = {
        id: data.requestId ?? data.id,
        type: (data.requestType === 'call' ? 'call' : 'message') as 'call' | 'message',
        title: data.requester?.anonymousName ?? data.anonymousName ?? 'Anonymous',
        requestType: data.requestType ?? null,
        requestId: data.requestId ?? data.id ?? null,
        venterId: data.requester?.id ?? data.venterId ?? null,
        listenerId: data.listenerId ?? null,
        ratePerMinute: data.ratePerMinute ?? null,
      };
      dispatch(setRequests([newRequest]));
    };

    socketService.on('call:request', handleNewRequest);
    socketService.on('chat:request', handleNewRequest);

    return () => {
      socketService.off('call:request', handleNewRequest);
      socketService.off('chat:request', handleNewRequest);
    };
  }, [isAuthenticated, isVenter, dispatch]);

  // ─── Always-on polling guard ─────────────────────────────────────────────────
  // Continuously polls calls/pending so the IncomingCallOverlay is always
  // populated whenever there is an active request, regardless of how the app was
  // opened (cold start, background, foreground, icon tap, notification tap).
  // This is the source-of-truth catch-up for cases where the socket event was
  // missed (e.g. killed-state cold start where socket hasn't reconnected yet).
  const pendingRequestsRef = useRef<RequestItem[]>([]);
  const currentRequestsSelector = useSelector((state: RootState) => state.listener.requests);
  pendingRequestsRef.current = currentRequestsSelector;
  // dismissedRequestIds is the module-level exported Set — shared with IncomingCallOverlay

  useEffect(() => {
    if (!isAuthenticated || isVenter) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await apiInstance.get('calls/pending');
        if (cancelled) return;
        const serverRequests: any[] = res?.data?.requests ?? [];

        // Treat the server as the source of truth:
        // - If server has no pending requests, clear Redux (overlay dismisses).
        // - If server has requests, sync Redux to exactly that set.
        // This handles background/foreground transitions where in-memory
        // dismissedRequestIds may have been cleared.
        if (serverRequests.length === 0) {
          if (pendingRequestsRef.current.length > 0) {
            console.log('[PendingPoll] Server has no pending requests — clearing Redux');
            dispatch(clearRequests());
          }
        } else {
          const normalized: RequestItem[] = serverRequests
            .map((raw: any) => ({
              id: raw.requestId ?? raw.id,
              type: (raw.requestType === 'call' ? 'call' : 'message') as 'call' | 'message',
              title: raw.requester?.anonymousName ?? 'Anonymous',
              requestType: raw.requestType ?? null,
              requestId: raw.requestId ?? raw.id ?? null,
              venterId: raw.requester?.id ?? raw.venterId ?? null,
              listenerId: raw.listenerId ?? null,
              ratePerMinute: raw.ratePerMinute ?? null,
            }))
            // CRITICAL: never re-add a request the listener has already dismissed
            .filter((r) => !dismissedRequestIds.has(r.id));

          if (normalized.length === 0) {
            // All server requests were dismissed locally — clear Redux
            if (pendingRequestsRef.current.length > 0) {
              console.log('[PendingPoll] All server requests dismissed — clearing Redux');
              dispatch(clearRequests());
            }
          } else {
            // Only keep requests the server actually has — drop any that are no
            // longer pending (cancelled/declined on server but not yet cleared locally).
            const serverIds = new Set(normalized.map(r => r.id));
            const existing = pendingRequestsRef.current;
            const stillValid = existing.filter(r => serverIds.has(r.id));
            const toAdd = normalized.filter(r => !existing.some(e => e.id === r.id));
            const synced = [...stillValid, ...toAdd];

            if (synced.length !== existing.length || toAdd.length > 0) {
              console.log('[PendingPoll] Syncing Redux:', synced.length, 'request(s)');
              dispatch(setRequests(synced));
            }
          }
        }
      } catch (err) {
        // Silently ignore — poll will retry on next interval
      }

      if (!cancelled) {
        pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    // Start immediately so cold-start is covered on first mount
    poll();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [isAuthenticated, isVenter, dispatch]);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef} theme={{ dark: true, colors: { primary: '#ffffff', background: '#0B1313', card: '#0B1313', text: '#ffffff', border: '#0B1313', notification: '#ff0000' } }}>
        <View style={{ flex: 1, backgroundColor: '#0B1313' }}>
          <MyStack.Navigator
            initialRouteName={routes.auth}
            screenOptions={{ headerShown: false }}
          >
            <MyStack.Screen name={routes.auth} component={AuthStack} />
            <MyStack.Screen name={routes.venterHomeTab} component={VenterHomeStack} />
            <MyStack.Screen name={routes.venterInternal} component={VenterInternalStack} />
            <MyStack.Screen name={routes.notifications} component={Notifications} />
            <MyStack.Screen name={routes.notificationDetail} component={NotificationDetail} />
            <MyStack.Screen name={routes.venterAllCalls} component={VenterAllCallsScreen} />
            <MyStack.Screen name={routes.chatStack} component={ChatStack} />

            <MyStack.Screen
              name={routes.listenerIncomingRequest}
              component={IncomingRequestScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <MyStack.Screen
              name={routes.listenerActiveCall}
              component={ListenerActiveCall}
              options={{ headerShown: false }}
            />
            <MyStack.Screen
              name={routes.listenerSessionFeedback}
              component={ListenerSessionFeedback}
              options={{ headerShown: false }}
            />
            <MyStack.Screen
              name={routes.listenerSessionRating}
              component={ListenerSessionRating}
              options={{ headerShown: false }}
            />
            <MyStack.Screen name={routes.listenerHomeTab} component={ListenerHomeStack} />
            <MyStack.Screen name={routes.listenerInternal} component={ListenerInternalStack} />
            {ENABLE_ADMIN_FLOW ? <MyStack.Screen name={routes.adminHomeTab} component={AdminHomeStack} /> : null}
            {ENABLE_ADMIN_FLOW ? (
              <MyStack.Screen name={routes.adminInternal} component={AdminInternalStack as any} />
            ) : null}
            <MyStack.Screen name={routes.venterAddFunds} component={VenterAddFunds} />
            <MyStack.Screen name={routes.venterUpgradePlan} component={VenterAddFunds} />
            <MyStack.Screen name={routes.venterTransactions} component={VenterTransactions} />
            <MyStack.Screen name={routes.paymentMethods} component={PaymentMethodsScreen} />
            <MyStack.Screen name={routes.languageSelection} component={LanguageSelectionScreen} />
            <MyStack.Screen name={routes.addPaymentMethod} component={AddPaymentMethodScreen} />
            <MyStack.Screen name={routes.profile} component={ProfileScreen} />
            <MyStack.Screen name={routes.referral} component={ReferralScreen} />
            <MyStack.Screen name={routes.subscriptionDetails} component={SubscriptionDetailsScreen} />
            <MyStack.Screen name={routes.choosePlan} component={ChoosePlanScreen} />
            <MyStack.Screen name={routes.sessionsHistory} component={SessionsHistory} />
            <MyStack.Screen name={routes.payoutSettings} component={PayoutSettings} />
            <MyStack.Screen name={routes.venterSecurity} component={SecuritySettings} />
            <MyStack.Screen name={routes.venterLegalPolicies} component={LegalPolicies} />
            <MyStack.Screen name={routes.changePassword} component={changePassword} />
            <MyStack.Screen name={routes.venterContactUs} component={ContactUs} />
            <MyStack.Screen name={routes.needMoreSupportCrisis} component={NeedMoreSupportCrisisScreen} />
            <MyStack.Screen name={routes.quietHours} component={QuietHours} />
            <MyStack.Screen name={routes.appeal} component={Appeal} />
            <MyStack.Screen name={routes.termsOfUse} component={TermsOfUse} />
            <MyStack.Screen name={routes.privacyPolicy} component={PrivacyPolicy} />
            <MyStack.Screen name={routes.safetyPolicy} component={SafetyPolicy} />
            <MyStack.Screen name={routes.listenerGuidelines} component={ListenerGuidelines} />
            <MyStack.Screen name={routes.deleteAccount} component={DeleteAccountScreen} />
            <MyStack.Screen name={routes.editProfile} component={EditProfileScreen} />
            {/* <MyStack.Screen name={routes.changeEmail} component={UpdateEmail} /> */}
            <MyStack.Screen name={routes.passwordChangeOTP} component={PasswordChangeOTP} />
            <MyStack.Screen name={routes.updateCredential} component={UpdateCredential} />
            <MyStack.Screen name={routes.credentialChangeOTP} component={CredentialChangeOTP} />
            {/* Identity screens — also registered here so EditProfileScreen (post-login) can navigate to them directly */}
            <MyStack.Screen name={routes.genderIdentity} component={GenderIdentityScreen} />
            <MyStack.Screen name={routes.racialIdentity} component={RacialIdentityScreen} />
            <MyStack.Screen name={routes.ethnicity} component={EthnicityScreen} />
            <MyStack.Screen name={routes.ageGroup} component={AgeGroupScreen} />
            <MyStack.Screen name={routes.lgbtqIdentity} component={LGBTQIdentityScreen} />
            <MyStack.Screen name={routes.specialTopics} component={SpecialTopicsScreen} />
            <MyStack.Screen name={routes.faithOrBelief} component={FaithOrBeliefScreen} />
          </MyStack.Navigator>
          <CallStatusBar navigationRef={navigationRef} />
            <PersistentCallWebView navigationRef={navigationRef} />
          <ChatStatusBar navigationRef={navigationRef} />
          <CustomToast />
        </View>
      <IncomingCallOverlay />
    </NavigationContainer>
    </ThemeProvider>
  );
};
