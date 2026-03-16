'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/i18n/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a2332',
              color: '#f5f5f5',
              border: '1px solid #263449',
              borderRadius: '12px',
              fontFamily: 'Vazirmatn, sans-serif',
            },
          }}
        />
      </LanguageProvider>
    </SessionProvider>
  );
}
