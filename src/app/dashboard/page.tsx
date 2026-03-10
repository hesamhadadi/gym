'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym, IGymPackage } from '@/models/Gym';
import { Locale } from '@/i18n/translations';

type Tab = 'overview' | 'packages' | 'reviews' | 'editInfo';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const loc = locale as Locale;

  const [tab, setTab] = useState<Tab>('overview');
  const [gym, setGym] = useState<IGym & { _id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Package form
  const [pkgForm, setPkgForm] = useState({
    nameFa: '', nameEn: '', nameIt: '',
    descFa: '', descEn: '', descIt: '',
    duration: 1, price: 0,
  });

  const user = session?.user as { role?: string; gymId?: string } | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && user?.role !== 'gym_owner') router.push('/');
  }, [status, user, router]);

  useEffect(() => {
    if (status === 'authenticated' && user?.gymId) {
      fetch(`/api/gyms/${user.gymId}`)
        .then(r => r.json())
        .then(d => { setGym(d.gym); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const addPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    const newPkg: IGymPackage = {
      name: { fa: pkgForm.nameFa, en: pkgForm.nameEn, it: pkgForm.nameIt },
      description: { fa: pkgForm.descFa, en: pkgForm.descEn, it: pkgForm.descIt },
      duration: pkgForm.duration,
      price: pkgForm.price,
      currency: 'IRR',
    };

    const updatedPackages = [...(gym.packages || []), newPkg];
    const res = await fetch(`/api/gyms/${gym._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages: updatedPackages }),
    });

    if (res.ok) {
      toast.success(locale === 'fa' ? 'پکیج اضافه شد' : 'Package added');
      const data = await res.json();
      setGym(data.gym);
      setPkgForm({ nameFa: '', nameEn: '', nameIt: '', descFa: '', descEn: '', descIt: '', duration: 1, price: 0 });
    } else {
      toast.error(t('error'));
    }
  };

  const deletePackage = async (idx: number) => {
    if (!gym) return;
    const updated = gym.packages.filter((_, i) => i !== idx);
    const res = await fetch(`/api/gyms/${gym._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages: updated }),
    });
    if (res.ok) {
      const data = await res.json();
      setGym(data.gym);
      toast.success(locale === 'fa' ? 'پکیج حذف شد' : 'Package deleted');
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: locale === 'fa' ? 'نمای کلی' : 'Overview', icon: '📊' },
    { key: 'packages', label: t('packages'), icon: '💳' },
    { key: 'reviews', label: t('reviews'), icon: '⭐' },
    { key: 'editInfo', label: locale === 'fa' ? 'ویرایش اطلاعات' : 'Edit Info', icon: '✏️' },
  ];

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="text-4xl animate-spin">⚙️</div></div>;
  }

  return (
    <div className="min-h-screen bg-dark-900" dir={loc === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <div className="w-56 min-h-screen bg-dark-800 border-r border-white/5 pt-6 fixed top-16 overflow-y-auto">
          <div className="px-4 mb-6">
            <p className="text-white font-bold text-sm">{session?.user?.name}</p>
            <p className="text-orange-400 text-xs mt-0.5">
              {locale === 'fa' ? 'صاحب باشگاه' : 'Gym Owner'}
            </p>
          </div>
          <nav className="space-y-1 px-2">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  tab === tabItem.key
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tabItem.icon}</span>
                <span>{tabItem.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 mr-56 p-8">
          {!gym ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🏋️</p>
              <p>{locale === 'fa' ? 'هنوز باشگاهی به حساب شما اختصاص نیافته' : 'No gym assigned to your account yet'}</p>
              <p className="text-sm mt-2">{locale === 'fa' ? 'با مدیر سایت تماس بگیرید' : 'Please contact the admin'}</p>
            </div>
          ) : (
            <>
              {/* Overview */}
              {tab === 'overview' && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">
                    📊 {gym.name[loc] || gym.name.fa}
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                      <p className="text-4xl mb-3">⭐</p>
                      <p className="text-3xl font-black gradient-text">{gym.averageRating.toFixed(1)}</p>
                      <p className="text-gray-400 text-sm mt-1">{locale === 'fa' ? 'میانگین امتیاز' : 'Avg Rating'}</p>
                    </div>
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                      <p className="text-4xl mb-3">💬</p>
                      <p className="text-3xl font-black gradient-text">{gym.totalReviews}</p>
                      <p className="text-gray-400 text-sm mt-1">{t('reviews')}</p>
                    </div>
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                      <p className="text-4xl mb-3">💳</p>
                      <p className="text-3xl font-black gradient-text">{gym.packages.length}</p>
                      <p className="text-gray-400 text-sm mt-1">{t('packages')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-3">📞 {t('contact')}</h3>
                      <p className="text-gray-300 text-sm" dir="ltr">{gym.contact.phone}</p>
                      {gym.contact.email && <p className="text-gray-300 text-sm mt-1">{gym.contact.email}</p>}
                    </div>
                    <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-3">🕐 {t('workingHours')}</h3>
                      <p className="text-gray-300 text-sm" dir="ltr">{gym.workingHours.weekdays}</p>
                      <p className="text-gray-300 text-sm mt-1" dir="ltr">{gym.workingHours.weekends}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Packages */}
              {tab === 'packages' && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">💳 {t('packages')}</h1>

                  {/* Package List */}
                  {gym.packages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {gym.packages.map((pkg, i) => (
                        <div key={i} className="bg-dark-800 rounded-2xl p-5 border border-white/5 relative">
                          <button
                            onClick={() => deletePackage(i)}
                            className="absolute top-3 left-3 text-red-400 hover:text-red-300 text-sm"
                          >
                            🗑️
                          </button>
                          <p className="font-bold text-white">{pkg.name[loc] || pkg.name.fa}</p>
                          <p className="text-gray-400 text-sm">{pkg.duration} {t('month')}</p>
                          <p className="text-2xl font-black gradient-text mt-2">
                            {pkg.price.toLocaleString('fa-IR')} {t('currency')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Package Form */}
                  <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                    <h3 className="font-bold text-white mb-4">➕ {t('addPackage')}</h3>
                    <form onSubmit={addPackage} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">نام فارسی</label>
                          <input required value={pkgForm.nameFa} onChange={e => setPkgForm(f => ({...f, nameFa: e.target.value}))} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">English Name</label>
                          <input required value={pkgForm.nameEn} onChange={e => setPkgForm(f => ({...f, nameEn: e.target.value}))} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Nome IT</label>
                          <input required value={pkgForm.nameIt} onChange={e => setPkgForm(f => ({...f, nameIt: e.target.value}))} className="input-field text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">{t('price')} ({t('currency')})</label>
                          <input required type="number" value={pkgForm.price} onChange={e => setPkgForm(f => ({...f, price: parseInt(e.target.value)}))} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">{locale === 'fa' ? 'مدت (ماه)' : 'Duration (months)'}</label>
                          <input required type="number" min={1} value={pkgForm.duration} onChange={e => setPkgForm(f => ({...f, duration: parseInt(e.target.value)}))} className="input-field text-sm" />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary">
                        ➕ {t('addPackage')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {tab === 'reviews' && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">⭐ {t('reviews')}</h1>
                  {gym.reviews.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <p className="text-5xl mb-4">💬</p>
                      <p>{locale === 'fa' ? 'هنوز نظری ثبت نشده' : 'No reviews yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {gym.reviews.slice().reverse().map((review, i) => (
                        <div key={i} className="bg-dark-800 rounded-xl p-5 border border-white/5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                <span className="text-orange-400 font-bold text-sm">
                                  {review.userName?.[0]?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <p className="font-medium text-white">{review.userName}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={s <= review.rating ? 'text-orange-400' : 'text-gray-600'}>★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{review.comment}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(review.createdAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Edit Info */}
              {tab === 'editInfo' && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">✏️ {locale === 'fa' ? 'ویرایش اطلاعات' : 'Edit Info'}</h1>
                  <EditGymInfo gym={gym} onUpdate={setGym} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EditGymInfo({
  gym,
  onUpdate,
}: {
  gym: IGym & { _id: string };
  onUpdate: (g: IGym & { _id: string }) => void;
}) {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    phone: gym.contact.phone,
    email: gym.contact.email || '',
    instagram: gym.contact.instagram || '',
    telegram: gym.contact.telegram || '',
    weekdays: gym.workingHours.weekdays,
    weekends: gym.workingHours.weekends,
    descFa: gym.description.fa,
    descEn: gym.description.en,
    descIt: gym.description.it,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/gyms/${gym._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact: { phone: form.phone, email: form.email, instagram: form.instagram, telegram: form.telegram },
        workingHours: { weekdays: form.weekdays, weekends: form.weekends },
        description: { fa: form.descFa, en: form.descEn, it: form.descIt },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data.gym);
      toast.success(t('gymUpdated'));
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="font-bold text-white">📞 {t('contact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'phone', label: t('phone') },
            { key: 'email', label: t('email') },
            { key: 'instagram', label: 'Instagram' },
            { key: 'telegram', label: 'Telegram' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-gray-400 text-xs mb-1 block">{f.label}</label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                className="input-field text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 space-y-3">
        <h3 className="font-bold text-white">🕐 {t('workingHours')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">{t('weekdays')}</label>
            <input value={form.weekdays} onChange={e => setForm(f => ({...f, weekdays: e.target.value}))} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">{t('weekends')}</label>
            <input value={form.weekends} onChange={e => setForm(f => ({...f, weekends: e.target.value}))} className="input-field text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 space-y-3">
        <h3 className="font-bold text-white">{locale === 'fa' ? 'توضیحات' : 'Description'}</h3>
        <textarea value={form.descFa} onChange={e => setForm(f => ({...f, descFa: e.target.value}))} className="input-field resize-none text-sm" rows={2} placeholder="فارسی" />
        <textarea value={form.descEn} onChange={e => setForm(f => ({...f, descEn: e.target.value}))} className="input-field resize-none text-sm" rows={2} placeholder="English" />
        <textarea value={form.descIt} onChange={e => setForm(f => ({...f, descIt: e.target.value}))} className="input-field resize-none text-sm" rows={2} placeholder="Italiano" />
      </div>

      <button type="submit" className="btn-primary py-3 px-8">
        💾 {t('save')}
      </button>
    </form>
  );
}
