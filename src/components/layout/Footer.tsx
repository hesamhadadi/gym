'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const { t, locale } = useLanguage();

  return (
    <footer className="border-t border-white/5 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg gradient-text">GymFinder</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {locale === 'fa'
                ? 'جیم‌فایندر بهترین پلتفرم برای پیدا کردن باشگاه ورزشی مناسب شماست. قیمت‌ها، امکانات و نظرات کاربران رو مقایسه کنید.'
                : locale === 'it'
                ? 'GymFinder è la migliore piattaforma per trovare la palestra perfetta. Confronta prezzi, servizi e recensioni.'
                : 'GymFinder is the best platform to find your perfect gym. Compare prices, amenities, and user reviews all in one place.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {locale === 'fa' ? 'لینک‌های سریع' : locale === 'it' ? 'Link Rapidi' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 text-sm hover:text-emerald-400 transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/gyms" className="text-gray-400 text-sm hover:text-emerald-400 transition-colors">
                  {t('gyms')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-gray-400 text-sm hover:text-emerald-400 transition-colors">
                  {t('map')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {locale === 'fa' ? 'حساب کاربری' : locale === 'it' ? 'Account' : 'Account'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-gray-400 text-sm hover:text-emerald-400 transition-colors">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 text-sm hover:text-emerald-400 transition-colors">
                  {t('register')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {locale === 'fa' ? '© ۱۴۰۳ جیم فایندر - تمام حقوق محفوظ است' : '© 2024 GymFinder - All rights reserved'}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">
              {locale === 'fa' ? 'ساخته شده با ❤️' : locale === 'it' ? 'Fatto con ❤️' : 'Made with ❤️'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
