'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import GymCard from '@/components/gym/GymCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
];

const FEATURE_FILTERS = [
  { key: 'pool', icon: '🏊', fa: 'استخر', en: 'Pool', it: 'Piscina' },
  { key: 'sauna', icon: '🧖', fa: 'سونا', en: 'Sauna', it: 'Sauna' },
  { key: 'aerobics', icon: '🏃', fa: 'ایروبیک', en: 'Aerobics', it: 'Aerobica' },
  { key: 'yoga', icon: '🧘', fa: 'یوگا', en: 'Yoga', it: 'Yoga' },
  { key: 'boxing', icon: '🥊', fa: 'بوکس', en: 'Boxing', it: 'Boxe' },
  { key: 'womenOnly', icon: '👩', fa: 'بانوان', en: 'Women Only', it: 'Solo Donne' },
];

type GymWithDistance = IGym & { _id: string; distance?: number };

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState('');
  const [featuredGyms, setFeaturedGyms] = useState<GymWithDistance[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<GymWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = locale === 'fa'
      ? 'خانه | GymFinder'
      : locale === 'it'
      ? 'Home | GymFinder'
      : 'Home | GymFinder';
  }, [locale]);

  useEffect(() => {
    fetchFeatured();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        fetchNearby(coords);
      });
    }
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/gyms?sort=rating&limit=6');
      const data = await res.json();
      setFeaturedGyms(data.gyms || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchNearby = async (coords: { lat: number; lng: number }) => {
    try {
      const res = await fetch(`/api/gyms?lat=${coords.lat}&lng=${coords.lng}&limit=4`);
      const data = await res.json();
      setNearbyGyms(data.gyms || []);
    } catch {
      // ignore
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeFilter) params.set('feature', activeFilter);
    window.location.href = `/gyms?${params.toString()}`;
  };

  const STATS = [
    { value: '۵۰۰+', label: locale === 'fa' ? 'باشگاه' : locale === 'it' ? 'Palestre' : 'Gyms' },
    { value: '۱۰۰+', label: locale === 'fa' ? 'شهر' : locale === 'it' ? 'Città' : 'Cities' },
    { value: '۵۰۰۰+', label: locale === 'fa' ? 'عضو' : locale === 'it' ? 'Membri' : 'Members' },
    { value: '۴.۸★', label: locale === 'fa' ? 'میانگین امتیاز' : locale === 'it' ? 'Valutazione' : 'Avg Rating' },
  ];

  return (
    <div className="min-h-screen bg-dark-900" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background slider */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === heroIdx ? 1 : 0 }}
          >
            <Image src={img} alt="gym" fill className="object-cover" unoptimized priority={idx === 0} />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900/70 via-dark-900/50 to-dark-900" />
          </div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">
              {locale === 'fa' ? '۵۰۰+ باشگاه در سراسر ایران' : locale === 'it' ? '500+ palestre in tutta l\'Iran' : '500+ gyms across Iran'}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            {locale === 'fa' ? (
              <>بهترین <span className="gradient-text">باشگاه</span> رو<br />پیدا کن</>
            ) : locale === 'it' ? (
              <>Trova la Tua<br /><span className="gradient-text">Palestra</span> Perfetta</>
            ) : (
              <>Find Your<br /><span className="gradient-text">Perfect Gym</span></>
            )}
          </h1>

          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            {locale === 'fa'
              ? 'قیمت، امکانات، نظرات و موقعیت باشگاه‌های نزدیکت رو یه‌جا ببین'
              : locale === 'it'
              ? 'Prezzi, servizi, recensioni e posizione in un\'unica app'
              : 'Compare prices, amenities, reviews and locations all in one place'}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="input-field pr-10 text-base h-14"
              />
            </div>
            <button type="submit" className="btn-primary h-14 px-8 text-base whitespace-nowrap">
              {t('search')}
            </button>
          </form>

          {/* Feature quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {FEATURE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
                className={`feature-badge text-sm cursor-pointer ${activeFilter === f.key ? 'active' : ''}`}
              >
                {f.icon} {f[locale as keyof typeof f] || f.en}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Gyms */}
      {nearbyGyms.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{t('closeToYou')}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {locale === 'fa' ? 'باشگاه‌های نزدیک موقعیت شما' : locale === 'it' ? 'Palestre vicino a te' : 'Gyms near your location'}
                </p>
              </div>
              <Link href="/map" className="btn-secondary text-sm py-2">
                🗺️ {t('viewOnMap')}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyGyms.map((gym) => (
                <GymCard key={gym._id.toString()} gym={gym} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Gyms */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('featuredGyms')}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {locale === 'fa' ? 'بهترین باشگاه‌ها بر اساس امتیاز کاربران' : locale === 'it' ? 'Le migliori palestre per valutazione' : 'Top gyms by user rating'}
              </p>
            </div>
            <Link href="/gyms" className="text-emerald-400 text-sm hover:text-emerald-300">
              {t('viewAll')} →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                    <div className="skeleton h-4 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredGyms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGyms.map((gym) => (
                <GymCard key={gym._id.toString()} gym={gym} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🏋️</p>
              <p>{t('noGyms')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {locale === 'fa' ? 'صاحب باشگاه هستید؟' : locale === 'it' ? 'Sei un proprietario di palestra?' : 'Do you own a gym?'}
            </h2>
            <p className="text-gray-300 mb-8">
              {locale === 'fa'
                ? 'باشگاهتون رو ثبت کنید و به هزاران کاربر معرفی بشید'
                : locale === 'it'
                ? 'Registra la tua palestra e raggiunge migliaia di utenti'
                : 'Register your gym and reach thousands of users'}
            </p>
            <Link href="/auth/register" className="btn-primary text-base px-10 py-4">
              {locale === 'fa' ? 'همین الان شروع کن' : locale === 'it' ? 'Inizia Ora' : 'Get Started'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
