import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en_common from '../locales/en/translations/common.json';
import es_common from '../locales/es/translations/common.json';

// Define supported languages and their translation resources
const resources = {
  en: {
    common: en_common
  },
  es: {
    common: es_common
  },
  // We can add more languages here as they become available
  fr: {
    common: {} // Empty for now, to be filled later
  },
  de: {
    common: {} // Empty for now, to be filled later
  },
  zh: {
    common: {} // Empty for now, to be filled later
  },
  hi: {
    common: {} // Empty for now, to be filled later
  }
};

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize configuration
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: process.env.NODE_ENV === 'development', // Enable debug in development mode
    
    // Common namespaces across all loaded languages
    ns: ['common'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache language detection result in localStorage
      caches: ['localStorage'],
      // Name of localStorage key
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;