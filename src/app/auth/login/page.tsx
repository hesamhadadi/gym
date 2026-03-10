'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LoginPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(locale === 'fa' ? 'ایمیل یا رمز عبور اشتباه است' : 'Invalid email or password');
      } else {
        toast.success(locale === 'fa' ? 'خوش آمدید!' : 'Welcome!');
        router.push('/');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl gradient-text">GymFinder</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('login')}</h1>
          <p className="text-gray-400 mt-2">
            {locale === 'fa' ? 'به حساب خود وارد شوید' : locale === 'it' ? 'Accedi al tuo account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 border border-white/5 space-y-5">
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
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? '...' : t('login')}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-orange-400 hover:text-orange-300">
              {t('register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
