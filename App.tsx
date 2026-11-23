import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store/store";
import { MainNavigator } from "./src/navigation";
import { LogBox } from "react-native";
import i18n from "./src/locales/i18n";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import iapService from './src/services/iapService';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

LogBox.ignoreAllLogs();

function onBeforeLift() {
  const state = store.getState();
  const preferredLanguage = state?.app?.preferredLanguage;
  if (preferredLanguage) {
    i18n.changeLanguage(preferredLanguage);
  }
}

const STRIPE_PUBLISHABLE_KEY = "pk_live_51RbvtNBxyJXvp7xfj6OKeZIBbHgdX1v5UNyGTx7mpRKXCn2CxLjttoKStNzwM1Eu1704QnclvmUPvkWP4fxi2uPP00KiZhCAvV";

// Inner component that re-renders when language changes
function AppContent() {
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    // Initialise Google Mobile Ads SDK
    mobileAds()
      .initialize()
      .then(() => console.log('[AdMob] SDK initialised'))
      .catch(e => console.warn('[AdMob] Init error', e));

    // Initialize IAP on iOS
    if (Platform.OS === 'ios') {
      iapService.initialize();
      iapService.setupListeners(
        (purchase) => console.log('[IAP] Purchase success:', purchase.productId),
        (error) => console.error('[IAP] Purchase error:', error.message)
      );
    }
    return () => {
      if (Platform.OS === 'ios') iapService.destroy();
    };
  }, []);

  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      setCurrentLang(lang);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MainNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.ventally">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={onBeforeLift}>
          <AppContent />
        </PersistGate>
      </Provider>
    </StripeProvider>
  );
}

export default App;
