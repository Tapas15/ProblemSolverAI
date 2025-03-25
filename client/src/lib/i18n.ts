import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/translations/common.json';
import esCommon from '../locales/es/translations/common.json';

export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'zh', 'hi'];

// Initialize i18next
i18n
  // Detect the user's language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize the i18n configuration
  .init({
    debug: true,
    fallbackLng: ['en'],
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    resources: {
      en: {
        common: enCommon,
      },
      es: {
        common: esCommon,
      },
      // Additional languages can be added here
      // Example:
      // fr: {
      //   common: frCommon,
      // },
    },
    defaultNS: 'common',
  });

export default i18n;