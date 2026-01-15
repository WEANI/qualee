import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import th from './locales/th.json';
import zh from './locales/zh.json';
import ru from './locales/ru.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
  th: { translation: th },
  zh: { translation: zh },
  ru: { translation: ru },
};

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Initialize i18n
const i18nInstance = i18n.createInstance();

if (isBrowser) {
  // Client-side: use language detector
  i18nInstance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      lng: 'en', // Default language for initial render (prevents hydration mismatch)
      supportedLngs: ['en', 'fr', 'es', 'ar', 'th', 'zh', 'ru'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'querystring', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      react: {
        useSuspense: false,
      },
    });
} else {
  // Server-side: no language detector, use default language
  i18nInstance
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      lng: 'en', // Fixed language for SSR
      supportedLngs: ['en', 'fr', 'es', 'ar', 'th', 'zh', 'ru'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18nInstance;
