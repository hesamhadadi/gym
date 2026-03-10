'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Locale } from '@/i18n/translations';

export default function Navbar() {
  const { t, locale, setLocale, dir } = useLanguage();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user as { role?: string } | undefined;

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg gradient-text">GymFinder</span>
          </Link>

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
              {t('home')}
            </Link>
            <Link href="/gyms" className="text-gray-300 hover:text-white transition-colors text-sm">
              {t('gyms')}
            </Link>
            <Link href="/map" className="text-gray-300 hover:text-white transition-colors text-sm">
              {t('map')}
            </Link>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
                <span>{languages.find((l) => l.code === locale)?.flag}</span>
                <span>{locale.toUpperCase()}</span>
                <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-8 right-0 bg-dark-700 border border-white/10 rounded-xl shadow-2xl py-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${
                      locale === lang.code ? 'text-orange-400' : 'text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth */}
            {session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-xs">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-300 max-w-20 truncate">{session.user?.name}</span>
                </button>
                <div className="absolute top-10 right-0 bg-dark-700 border border-white/10 rounded-xl shadow-2xl py-1 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-orange-400 hover:bg-white/5">
                      🛡️ {t('adminPanel')}
                    </Link>
                  )}
                  {user?.role === 'gym_owner' && (
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-orange-400 hover:bg-white/5">
                      🏋️ {t('gymOwnerPanel')}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                  >
                    🚪 {t('logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white">
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/5 px-4 py-4 space-y-3">
          <Link href="/" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>{t('home')}</Link>
          <Link href="/gyms" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>{t('gyms')}</Link>
          <Link href="/map" className="block text-gray-300 py-2" onClick={() => setMenuOpen(false)}>{t('map')}</Link>
          <div className="flex gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLocale(lang.code); setMenuOpen(false); }}
                className={`text-sm px-2 py-1 rounded ${locale === lang.code ? 'text-orange-400' : 'text-gray-400'}`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
          {session ? (
            <button onClick={() => signOut()} className="text-red-400 text-sm">{t('logout')}</button>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login" className="text-gray-300 text-sm" onClick={() => setMenuOpen(false)}>{t('login')}</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-1.5 px-4" onClick={() => setMenuOpen(false)}>{t('register')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
