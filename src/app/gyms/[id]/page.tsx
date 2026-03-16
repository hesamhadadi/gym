'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';
import { Locale } from '@/i18n/translations';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false });

const FEATURE_ICONS: Record<string, string> = {
  shower: '🚿', pool: '🏊', aerobics: '🏃', sauna: '🧖',
  parking: '🅿️', locker: '🔒', personalTrainer: '💪', yoga: '🧘',
  spinning: '🚴', boxing: '🥊', supplements: '💊', wifi: '📶',
  cafe: '☕', womenOnly: '👩', open24h: '🕐',
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="text-2xl">
          <span className={s <= value ? 'text-emerald-400' : 'text-gray-600'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function GymDetailPage() {
  const { id } = useParams();
  const { t, locale } = useLanguage();
  const { data: session } = useSession();
  const loc = locale as Locale;

  const [gym, setGym] = useState<IGym & { _id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/gyms/${id}`)
      .then((r) => r.json())
      .then((d) => { setGym(d.gym); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error(t('loginRequired')); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/gyms/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewText }),
      });
      if (res.ok) {
        toast.success(t('reviewSubmitted'));
        setReviewText('');
        // Refresh gym data
        const fresh = await fetch(`/api/gyms/${id}`);
        const data = await fresh.json();
        setGym(data.gym);
      } else {
        const err = await res.json();
        toast.error(err.error || t('error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <p>{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-4xl mb-4">🏋️</p>
            <p className="text-gray-400">{locale === 'fa' ? 'باشگاه یافت نشد' : 'Gym not found'}</p>
            <Link href="/gyms" className="btn-primary mt-4 inline-block">{t('back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const name = gym.name[loc] || gym.name.fa;
  const description = gym.description[loc] || gym.description.fa;
  const address = gym.location.address[loc] || gym.location.address.fa;
  const city = gym.location.city[loc] || gym.location.city.fa;
  const allImages = [gym.coverImage, ...(gym.images || [])].filter(Boolean);
  const activeFeatures = Object.entries(gym.features).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-dark-900" dir={loc === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="pt-16">
        {/* Image Gallery */}
        <div className="relative h-72 md:h-96 lg:h-[500px] overflow-hidden">
          <Image
            src={allImages[activeImg] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80'}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-emerald-500 w-6' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Mini gallery */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {allImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-emerald-500' : 'border-white/20'}`}
                >
                  <Image src={img} alt="" width={48} height={48} className="object-cover w-full h-full" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {gym.isVerified && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
                          ✓ {t('verified')}
                        </span>
                      )}
                      {gym.features.womenOnly && (
                        <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-0.5 rounded-full border border-pink-500/30">
                          👩 {t('womenOnly')}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-black text-white">{name}</h1>
                    <p className="text-gray-400 mt-1">📍 {address}, {city}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black gradient-text">{gym.averageRating.toFixed(1)}</div>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= Math.round(gym.averageRating) ? 'text-emerald-400' : 'text-gray-600'}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs">{gym.totalReviews} {t('reviews')}</p>
                  </div>
                </div>
                <p className="text-gray-300 mt-4 leading-relaxed">{description}</p>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">🏅 {t('features')}</h2>
                <div className="flex flex-wrap gap-2">
                  {activeFeatures.map(([key]) => (
                    <span key={key} className="feature-badge active">
                      {FEATURE_ICONS[key]} {t(key as Parameters<typeof t>[0])}
                    </span>
                  ))}
                </div>
              </div>

              {/* Packages */}
              {gym.packages.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">💳 {t('packages')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gym.packages.map((pkg, i) => (
                      <div
                        key={i}
                        className={`bg-dark-800 rounded-2xl p-5 border transition-all hover:border-emerald-500/40 ${
                          i === 0 ? 'border-emerald-500/30' : 'border-white/5'
                        }`}
                      >
                        {i === 0 && (
                          <div className="text-emerald-400 text-xs font-bold mb-2">⭐ {locale === 'fa' ? 'محبوب‌ترین' : 'Most Popular'}</div>
                        )}
                        <div className="font-bold text-white text-lg">
                          {pkg.name[loc] || pkg.name.fa}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {pkg.duration} {t('month')}
                        </div>
                        {pkg.description && (
                          <p className="text-gray-400 text-sm mt-2">
                            {pkg.description[loc] || pkg.description.fa}
                          </p>
                        )}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <span className="text-2xl font-black gradient-text">
                            {pkg.price.toLocaleString('fa-IR')}
                          </span>
                          <span className="text-gray-400 text-sm mr-1"> {t('currency')} / {t('month')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">🗺️ {t('map')}</h2>
                <div className="h-64 rounded-2xl overflow-hidden">
                  <Map
                    gyms={[gym]}
                    locale={loc}
                    center={[gym.location.coordinates.lat, gym.location.coordinates.lng]}
                    zoom={15}
                  />
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-bold text-white mb-6">💬 {t('reviews')} ({gym.totalReviews})</h2>

                {/* Write review */}
                <div className="bg-dark-800 rounded-2xl p-5 mb-6 border border-white/5">
                  <h3 className="font-semibold text-white mb-4">{t('writeReview')}</h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <StarPicker value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder={t('yourReview')}
                      rows={3}
                      className="input-field resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitting ? '...' : t('submit')}
                    </button>
                  </form>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {gym.reviews.slice().reverse().map((review, i) => (
                    <div key={i} className="bg-dark-800 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-xs">
                              {review.userName?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-white text-sm">{review.userName}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-sm ${s <= review.rating ? 'text-emerald-400' : 'text-gray-600'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 sticky top-20">
                <h3 className="font-bold text-white text-lg mb-4">📞 {t('contact')}</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${gym.contact.phone}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-gray-400 text-xs">{t('phone')}</p>
                      <p className="text-white font-medium" dir="ltr">{gym.contact.phone}</p>
                    </div>
                  </a>

                  {gym.contact.email && (
                    <a
                      href={`mailto:${gym.contact.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xl">📧</span>
                      <div>
                        <p className="text-gray-400 text-xs">{t('email')}</p>
                        <p className="text-white font-medium text-sm">{gym.contact.email}</p>
                      </div>
                    </a>
                  )}

                  {gym.contact.instagram && (
                    <a
                      href={`https://instagram.com/${gym.contact.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xl">📸</span>
                      <div>
                        <p className="text-gray-400 text-xs">{t('instagram')}</p>
                        <p className="text-emerald-400 font-medium text-sm">@{gym.contact.instagram}</p>
                      </div>
                    </a>
                  )}

                  {gym.contact.telegram && (
                    <a
                      href={`https://t.me/${gym.contact.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xl">✈️</span>
                      <div>
                        <p className="text-gray-400 text-xs">{t('telegram')}</p>
                        <p className="text-blue-400 font-medium text-sm">@{gym.contact.telegram}</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Working Hours */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="font-semibold text-white mb-2 text-sm">🕐 {t('workingHours')}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('weekdays')}</span>
                      <span className="text-white" dir="ltr">{gym.workingHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('weekends')}</span>
                      <span className="text-white" dir="ltr">{gym.workingHours.weekends}</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary w-full mt-4">
                  📞 {locale === 'fa' ? 'تماس با باشگاه' : locale === 'it' ? 'Contatta la palestra' : 'Contact Gym'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
