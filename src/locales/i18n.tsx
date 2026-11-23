import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import pt from './pt.json';
import fr from './fr.json';
import es from './es.json';

const LANGUAGE_KEY = 'user_language';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  fr: { translation: fr },
  es: { translation: es },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang) {
        callback(savedLang);
        return;
      }
    } catch {}
    const locales = RNLocalize.getLocales();
    callback(locales[0]?.languageCode || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {}
  },
};

i18n
  // @ts-ignore
  .use(languageDetector as any)
  .use(initReactI18next)
  // @ts-ignore
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
