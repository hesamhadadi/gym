'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLanguage } from '@/i18n/LanguageContext';

export default function RegisterPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = locale === 'fa'
      ? 'ثبت‌نام | GymFinder'
      : locale === 'it'
      ? 'Registrati | GymFinder'
      : 'Register | GymFinder';
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        toast.success(locale === 'fa' ? 'ثبت‌نام موفق!' : 'Registered successfully!');
        router.push('/auth/login');
      } else {
        const err = await res.json();
        toast.error(err.error || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl gradient-text">GymFinder</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('register')}</h1>
          <p className="text-gray-400 mt-2">
            {locale === 'fa' ? 'حساب کاربری بسازید' : locale === 'it' ? 'Crea il tuo account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 border border-white/5 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? '...' : t('register')}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {t('haveAccount')}{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
              {t('login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
