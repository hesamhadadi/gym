'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import GymCard from '@/components/gym/GymCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';

const FEATURES = [
  { key: 'shower', icon: '🚿' },
  { key: 'pool', icon: '🏊' },
  { key: 'aerobics', icon: '🏃' },
  { key: 'sauna', icon: '🧖' },
  { key: 'parking', icon: '🅿️' },
  { key: 'personalTrainer', icon: '💪' },
  { key: 'yoga', icon: '🧘' },
  { key: 'spinning', icon: '🚴' },
  { key: 'boxing', icon: '🥊' },
  { key: 'womenOnly', icon: '👩' },
];

type GymWithDistance = IGym & { _id: string; distance?: number };

export default function GymsPage() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  const [gyms, setGyms] = useState<GymWithDistance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeFeature, setActiveFeature] = useState<string | null>(searchParams.get('feature'));
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeFeature) params.set('feature', activeFeature);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/gyms?${params.toString()}`);
      const data = await res.json();
      setGyms(data.gyms || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, activeFeature, sort, page]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGyms();
  };

  return (
    <div className="min-h-screen bg-dark-900" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('allGyms')}</h1>
            <p className="text-gray-400">
              {total} {locale === 'fa' ? 'باشگاه یافت شد' : locale === 'it' ? 'palestre trovate' : 'gyms found'}
            </p>
          </div>

          {/* Search + Filter Bar */}
          <div className="bg-dark-800 rounded-2xl p-4 mb-8 border border-white/5">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="input-field pr-10"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field w-40"
              >
                <option value="rating">{t('topRated')}</option>
                <option value="newest">{t('newest')}</option>
              </select>
              <button type="submit" className="btn-primary px-6">
                {t('search')}
              </button>
            </form>

            {/* Feature Filters */}
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setActiveFeature(activeFeature === f.key ? null : f.key); setPage(1); }}
                  className={`feature-badge text-sm ${activeFeature === f.key ? 'active' : ''}`}
                >
                  {f.icon} {t(f.key as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : gyms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gyms.map((gym) => (
                  <GymCard key={gym._id.toString()} gym={gym} />
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary px-4 py-2 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <span className="flex items-center px-4 text-gray-400 text-sm">
                    {page} / {Math.ceil(total / 12)}
                  </span>
                  <button
                    disabled={page >= Math.ceil(total / 12)}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary px-4 py-2 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 text-gray-500">
              <p className="text-6xl mb-4">🏋️</p>
              <p className="text-lg">{t('noGyms')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
