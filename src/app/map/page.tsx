'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import GymCard from '@/components/gym/GymCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';
import { Locale } from '@/i18n/translations';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false });

type GymWithDistance = IGym & { _id: string; distance?: number };

export default function MapPage() {
  const { t, locale } = useLanguage();
  const loc = locale as Locale;
  const [gyms, setGyms] = useState<GymWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<[number, number]>([35.6892, 51.389]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  const fetchGyms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');
      const res = await fetch(`/api/gyms?${params.toString()}`);
      const data = await res.json();
      setGyms(data.gyms || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchGyms();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [fetchGyms]);

  const selectedGym = gyms.find((g) => g._id.toString() === selectedGymId);

  return (
    <div className="min-h-screen bg-dark-900" dir={loc === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="pt-16 h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-dark-800 border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGyms()}
            placeholder={t('searchPlaceholder')}
            className="input-field flex-1 py-2"
          />
          <button onClick={fetchGyms} className="btn-primary py-2 px-4">
            🔍
          </button>
          <div className="flex bg-dark-700 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'map' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              🗺️ {t('mapView')}
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              📋 {t('listView')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className={`${view === 'list' ? 'hidden lg:block' : 'flex-1'} lg:flex-1 relative`}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-3 animate-spin">⚙️</div>
                  <p>{t('loading')}</p>
                </div>
              </div>
            ) : (
              <Map
                gyms={gyms}
                locale={loc}
                center={userCoords}
                zoom={12}
                onGymClick={setSelectedGymId}
              />
            )}
          </div>

          {/* Sidebar List */}
          <div className={`${view === 'map' ? 'hidden lg:flex' : 'flex-1 lg:flex'} w-full lg:w-80 xl:w-96 flex-col bg-dark-800 border-l border-white/5 overflow-hidden`}>
            <div className="p-3 border-b border-white/5">
              <p className="text-gray-400 text-sm">
                {gyms.length} {loc === 'fa' ? 'باشگاه' : loc === 'it' ? 'palestre' : 'gyms'}
              </p>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-3">
              {gyms.map((gym) => (
                <div
                  key={gym._id.toString()}
                  className={`cursor-pointer transition-all rounded-xl ${selectedGymId === gym._id.toString() ? 'ring-2 ring-emerald-500' : ''}`}
                  onClick={() => setSelectedGymId(gym._id.toString())}
                >
                  <GymCard gym={gym} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
