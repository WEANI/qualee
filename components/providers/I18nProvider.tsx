'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be fully initialized
    const checkReady = () => {
      if (i18n.isInitialized) {
        // Detect and apply user's preferred language after hydration
        const savedLang = typeof window !== 'undefined'
          ? localStorage.getItem('i18nextLng')
          : null;

        if (savedLang && i18n.language !== savedLang) {
          i18n.changeLanguage(savedLang);
        }

        setIsReady(true);
      } else {
        // If not initialized yet, wait a bit
        setTimeout(checkReady, 10);
      }
    };

    checkReady();
  }, []);

  // Always render with I18nextProvider to ensure consistent structure
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
