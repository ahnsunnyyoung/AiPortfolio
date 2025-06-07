import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, languages, type Language, type Translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect language from IP geolocation
  useEffect(() => {
    const detectLanguage = async () => {
      try {
        // Check if user has a saved preference first
        const saved = localStorage.getItem('language');
        if (saved && Object.keys(languages).includes(saved)) {
          setLanguage(saved as Language);
          setIsInitialized(true);
          return;
        }

        // Detect location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code?.toLowerCase();

        // Map country codes to supported languages
        const countryToLanguage: Record<string, Language> = {
          'kr': 'ko', // South Korea
          'de': 'de', // Germany
          'at': 'de', // Austria
          'ch': 'de', // Switzerland (German-speaking regions)
          'nl': 'nl', // Netherlands
          'be': 'nl', // Belgium (Dutch-speaking regions)
        };

        const detectedLanguage = countryToLanguage[countryCode] || 'en';
        setLanguage(detectedLanguage);
        localStorage.setItem('language', detectedLanguage);
      } catch (error) {
        console.log('Failed to detect location, using English as default');
        setLanguage('en');
        localStorage.setItem('language', 'en');
      } finally {
        setIsInitialized(true);
      }
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('language', language);
    }
  }, [language, isInitialized]);

  const value = {
    language,
    setLanguage,
    t: translations[language] || translations.en,
    availableLanguages: languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}