'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';
import { Locale } from '@/i18n/translations';

interface GymCardProps {
  gym: IGym & { _id: string; distance?: number };
}

const FEATURE_ICONS: Record<string, string> = {
  shower: '🚿',
  pool: '🏊',
  aerobics: '🏃',
  sauna: '🧖',
  parking: '🅿️',
  locker: '🔒',
  personalTrainer: '💪',
  yoga: '🧘',
  spinning: '🚴',
  boxing: '🥊',
  supplements: '💊',
  wifi: '📶',
  cafe: '☕',
  womenOnly: '👩',
  open24h: '🕐',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function GymCard({ gym }: GymCardProps) {
  const { t, locale } = useLanguage();
  const loc = locale as Locale;

  const gymName = gym.name[loc] || gym.name.fa;
  const gymCity = gym.location.city[loc] || gym.location.city.fa;

  const activeFeatures = Object.entries(gym.features)
    .filter(([, v]) => v)
    .slice(0, 4);

  const minPackagePrice = gym.packages.length > 0
    ? Math.min(...gym.packages.map((p) => p.price))
    : null;

  return (
    <Link href={`/gyms/${gym._id}`}>
      <div className="gym-card bg-dark-800 rounded-2xl overflow-hidden border border-white/5 cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={gym.coverImage || gym.images?.[0] || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80`}
            alt={gymName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            {gym.isVerified && (
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                ✓ {t('verified')}
              </span>
            )}
            {gym.features.womenOnly && (
              <span className="bg-pink-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                👩 {t('womenOnly')}
              </span>
            )}
          </div>

          {/* Distance */}
          {gym.distance !== undefined && (
            <div className="absolute bottom-3 left-3 bg-dark-900/80 text-white text-xs px-2 py-1 rounded-lg">
              📍 {gym.distance.toFixed(1)} km
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{gymName}</h3>
              <p className="text-gray-400 text-sm mt-0.5">📍 {gymCity}</p>
            </div>
            <div className="text-right">
              <StarRating rating={gym.averageRating} />
              <p className="text-gray-400 text-xs mt-0.5">{gym.totalReviews} {t('reviews')}</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeFeatures.map(([key]) => (
              <span key={key} className="feature-badge text-xs">
                {FEATURE_ICONS[key]} {t(key as Parameters<typeof t>[0])}
              </span>
            ))}
            {Object.values(gym.features).filter(Boolean).length > 4 && (
              <span className="text-gray-500 text-xs self-center">
                +{Object.values(gym.features).filter(Boolean).length - 4}
              </span>
            )}
          </div>

          {/* Price */}
          {minPackagePrice && (
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-gray-400 text-sm">{t('monthly')}</span>
              <span className="text-emerald-400 font-bold">
                {minPackagePrice.toLocaleString('fa-IR')} {t('currency')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
