'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translations, t as translate } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations.fa) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, defaultLocale = 'fa' }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    let mounted = true;
    const saved = localStorage.getItem('locale') as Locale | null;

    if (saved && ['fa', 'en', 'it'].includes(saved)) {
      setLocaleState(saved);
      return;
    }

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const serverLocale = data?.settings?.defaultLanguage as Locale | undefined;
        if (mounted && serverLocale && ['fa', 'en', 'it'].includes(serverLocale)) {
          setLocaleState(serverLocale);
        }
      })
      .catch(() => {
        // keep fallback locale when settings are unavailable
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: keyof typeof translations.fa) => translate(key, locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir: locale === 'fa' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
