import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import deTranslations from './locales/de.json';
import enTranslations from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    lng: 'de', // Default to German
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    resources: {
      de: {
        translation: deTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;