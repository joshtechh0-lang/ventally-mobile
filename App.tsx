import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store/store";
import { MainNavigator } from "./src/navigation";
import { LogBox, Platform } from "react-native";
import i18n from "./src/locales/i18n";

LogBox.ignoreAllLogs();

function onBeforeLift() {
  const state = store.getState();
  const preferredLanguage = state?.app?.preferredLanguage;
  if (preferredLanguage) {
    i18n.changeLanguage(preferredLanguage);
  }
}

const STRIPE_PUBLISHABLE_KEY = "pk_live_51RbvtNBxyJXvp7xfj6OKeZIBbHgdX1v5UNyGTx7mpRKXCn2CxLjttoKStNzwM1Eu1704QnclvmUPvkWP4fxi2uPP00KiZhCAvV";

function AppContent() {
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    // Initialise Google Mobile Ads SDK (Android native module excluded — skip on Android)
    if (Platform.OS !== 'android') {
      import('react-native-google-mobile-ads').then(({ default: mobileAds }) => {
        mobileAds()
          .initialize()
          .then(() => console.log('[AdMob] SDK initialised'))
          .catch((e: any) => console.warn('[AdMob] Init error', e));
      }).catch((e: any) => console.warn('[AdMob] import error', e));
    }

    // Initialize IAP on iOS only
    if (Platform.OS === 'ios') {
      import('./src/services/iapService').then(({ default: iapService }) => {
        iapService.initialize();
        iapService.setupListeners(
          (purchase: any) => console.log('[IAP] Purchase success:', purchase.productId),
          (error: any) => console.error('[IAP] Purchase error:', error.message)
        );
      });
    }
    return () => {
      if (Platform.OS === 'ios') {
        import('./src/services/iapService').then(({ default: iapService }) => {
          iapService.destroy();
        });
      }
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
  if (Platform.OS === 'android') {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={onBeforeLift}>
          <AppContent />
        </PersistGate>
      </Provider>
    );
  }

  const { StripeProvider } = require('@stripe/stripe-react-native');
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
