'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/i18n/LanguageContext';
import { IGym } from '@/models/Gym';
import { Locale } from '@/i18n/translations';

type Tab = 'dashboard' | 'gyms' | 'users' | 'settings' | 'addGym' | 'addOwner';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  gymId?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const loc = locale as Locale;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [gyms, setGyms] = useState<(IGym & { _id: string })[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ gyms: 0, users: 0, reviews: 0 });
  const [defaultLang, setDefaultLang] = useState<Locale>('fa');

  // Add gym form
  const [gymForm, setGymForm] = useState({
    nameFa: '', nameEn: '', nameIt: '',
    descFa: '', descEn: '', descIt: '',
    addressFa: '', addressEn: '', addressIt: '',
    cityFa: '', cityEn: '', cityIt: '',
    lat: '', lng: '',
    phone: '', email: '', instagram: '', telegram: '',
    weekdays: '06:00 - 22:00', weekends: '08:00 - 20:00',
    ownerId: '',
    images: '',
    features: {
      shower: false, pool: false, aerobics: false, sauna: false,
      parking: false, locker: false, personalTrainer: false, yoga: false,
      spinning: false, boxing: false, supplements: false, wifi: false,
      cafe: false, womenOnly: false, open24h: false,
    },
  });

  // Add owner form
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', password: '' });

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated' && user?.role !== 'admin') router.push('/');
  }, [status, user, router]);

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'admin') {
      fetchAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchAll = async () => {
    const [gymsRes, usersRes] = await Promise.all([
      fetch('/api/gyms?limit=100'),
      fetch('/api/users'),
    ]);
    const gymsData = await gymsRes.json();
    const usersData = await usersRes.json();
    setGyms(gymsData.gyms || []);
    setUsers(usersData.users || []);
    const totalReviews = (gymsData.gyms || []).reduce(
      (sum: number, g: IGym) => sum + g.totalReviews,
      0
    );
    setStats({
      gyms: gymsData.total || 0,
      users: (usersData.users || []).length,
      reviews: totalReviews,
    });
  };

  const deleteGym = async (id: string) => {
    if (!confirm(locale === 'fa' ? 'مطمئن هستید؟' : 'Are you sure?')) return;
    await fetch(`/api/gyms/${id}`, { method: 'DELETE' });
    toast.success(locale === 'fa' ? 'باشگاه حذف شد' : 'Gym deleted');
    fetchAll();
  };

  const toggleActive = async (gym: IGym & { _id: string }) => {
    await fetch(`/api/gyms/${gym._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !gym.isActive }),
    });
    fetchAll();
  };

  const toggleVerified = async (gym: IGym & { _id: string }) => {
    await fetch(`/api/gyms/${gym._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: !gym.isVerified }),
    });
    fetchAll();
  };

  const addGym = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = gymForm.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: { fa: gymForm.nameFa, en: gymForm.nameEn, it: gymForm.nameIt },
      description: { fa: gymForm.descFa, en: gymForm.descEn, it: gymForm.descIt },
      location: {
        address: { fa: gymForm.addressFa, en: gymForm.addressEn, it: gymForm.addressIt },
        city: { fa: gymForm.cityFa, en: gymForm.cityEn, it: gymForm.cityIt },
        coordinates: { lat: parseFloat(gymForm.lat), lng: parseFloat(gymForm.lng) },
      },
      contact: {
        phone: gymForm.phone, email: gymForm.email,
        instagram: gymForm.instagram, telegram: gymForm.telegram,
      },
      workingHours: { weekdays: gymForm.weekdays, weekends: gymForm.weekends },
      ownerId: gymForm.ownerId || undefined,
      images,
      coverImage: images[0] || '',
      features: gymForm.features,
      packages: [],
    };

    const res = await fetch('/api/gyms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(t('gymAdded'));
      setTab('gyms');
      fetchAll();
    } else {
      const err = await res.json();
      toast.error(err.error || t('error'));
    }
  };

  const addOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ownerForm, role: 'gym_owner' }),
    });
    if (res.ok) {
      toast.success(locale === 'fa' ? 'صاحب باشگاه ثبت شد' : 'Gym owner registered');
      setOwnerForm({ name: '', email: '', password: '' });
      fetchAll();
    } else {
      const err = await res.json();
      toast.error(err.error || t('error'));
    }
  };

  const saveSettings = async () => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultLanguage: defaultLang }),
    });
    if (res.ok) {
      setLocale(defaultLang);
      toast.success(t('save') + '!');
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="text-gray-400 animate-spin text-4xl">⚙️</div></div>;
  }

  const FEATURES_LIST = [
    'shower', 'pool', 'aerobics', 'sauna', 'parking', 'locker',
    'personalTrainer', 'yoga', 'spinning', 'boxing', 'supplements',
    'wifi', 'cafe', 'womenOnly', 'open24h',
  ];

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: locale === 'fa' ? 'داشبورد' : 'Dashboard', icon: '📊' },
    { key: 'gyms', label: t('gyms'), icon: '🏋️' },
    { key: 'users', label: t('users'), icon: '👥' },
    { key: 'addGym', label: t('addGym'), icon: '➕' },
    { key: 'addOwner', label: locale === 'fa' ? 'ثبت صاحب باشگاه' : 'Add Gym Owner', icon: '👤' },
    { key: 'settings', label: t('settings'), icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-dark-900" dir={loc === 'fa' ? 'rtl' : 'ltr'}>
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-dark-800 border-r border-white/5 pt-6 fixed top-16 overflow-y-auto">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-emerald-400 text-xs font-bold">A</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{session?.user?.name}</p>
                <p className="text-emerald-400 text-xs">Admin</p>
              </div>
            </div>
          </div>
          <nav className="space-y-1 px-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  tab === t.key
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 mr-64 p-8">
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">📊 {locale === 'fa' ? 'داشبورد' : 'Dashboard'}</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: t('totalGyms'), value: stats.gyms, icon: '🏋️', color: 'orange' },
                  { label: t('totalUsers'), value: stats.users, icon: '👥', color: 'blue' },
                  { label: t('totalReviews'), value: stats.reviews, icon: '⭐', color: 'yellow' },
                ].map((stat, i) => (
                  <div key={i} className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                    <div className="text-4xl mb-3">{stat.icon}</div>
                    <div className="text-3xl font-black gradient-text">{stat.value}</div>
                    <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-bold text-white mb-4">
                {locale === 'fa' ? 'آخرین باشگاه‌ها' : 'Recent Gyms'}
              </h2>
              <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">{locale === 'fa' ? 'نام' : 'Name'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">{locale === 'fa' ? 'شهر' : 'City'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">{locale === 'fa' ? 'امتیاز' : 'Rating'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm font-medium">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gyms.slice(0, 5).map((gym) => (
                      <tr key={gym._id.toString()} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 text-white text-sm">{gym.name[loc] || gym.name.fa}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{gym.location.city[loc] || gym.location.city.fa}</td>
                        <td className="px-4 py-3 text-emerald-400 text-sm">⭐ {gym.averageRating}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${gym.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {gym.isActive ? t('active') : t('inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gyms Tab */}
          {tab === 'gyms' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">🏋️ {t('gyms')}</h1>
                <button onClick={() => setTab('addGym')} className="btn-primary py-2 px-4">
                  ➕ {t('addGym')}
                </button>
              </div>
              <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{locale === 'fa' ? 'نام' : 'Name'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{locale === 'fa' ? 'شهر' : 'City'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{locale === 'fa' ? 'امتیاز' : 'Rating'}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{t('verified')}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{locale === 'fa' ? 'عملیات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gyms.map((gym) => (
                      <tr key={gym._id.toString()} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 text-white text-sm">{gym.name[loc] || gym.name.fa}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{gym.location.city[loc] || gym.location.city.fa}</td>
                        <td className="px-4 py-3 text-emerald-400 text-sm">⭐ {gym.averageRating}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleVerified(gym)} className={`text-xs px-2 py-1 rounded-full ${gym.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {gym.isVerified ? '✓ تأیید' : '○ تأیید نشده'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleActive(gym)} className={`text-xs px-2 py-1 rounded-full ${gym.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {gym.isActive ? t('active') : t('inactive')}
                            </button>
                            <Link href={`/gyms/${gym._id}`} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1">
                              👁️
                            </Link>
                            <button onClick={() => deleteGym(gym._id.toString())} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">👥 {t('users')}</h1>
              <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{t('name')}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{t('email')}</th>
                      <th className="px-4 py-3 text-right text-gray-400 text-sm">{locale === 'fa' ? 'نقش' : 'Role'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 text-white text-sm">{u.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm" dir="ltr">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                            u.role === 'gym_owner' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Gym */}
          {tab === 'addGym' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">➕ {t('addGym')}</h1>
              <form onSubmit={addGym} className="space-y-6 max-w-3xl">
                {/* Names */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">{locale === 'fa' ? 'نام باشگاه' : 'Gym Name'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">فارسی</label>
                      <input required value={gymForm.nameFa} onChange={e => setGymForm(f => ({...f, nameFa: e.target.value}))} className="input-field text-sm" placeholder="نام فارسی" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">English</label>
                      <input required value={gymForm.nameEn} onChange={e => setGymForm(f => ({...f, nameEn: e.target.value}))} className="input-field text-sm" placeholder="English name" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Italiano</label>
                      <input required value={gymForm.nameIt} onChange={e => setGymForm(f => ({...f, nameIt: e.target.value}))} className="input-field text-sm" placeholder="Nome italiano" />
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">{locale === 'fa' ? 'توضیحات' : 'Description'}</h3>
                  <div className="space-y-3">
                    <textarea required value={gymForm.descFa} onChange={e => setGymForm(f => ({...f, descFa: e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="توضیحات فارسی" />
                    <textarea required value={gymForm.descEn} onChange={e => setGymForm(f => ({...f, descEn: e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="English description" />
                    <textarea required value={gymForm.descIt} onChange={e => setGymForm(f => ({...f, descIt: e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="Descrizione italiano" />
                  </div>
                </div>

                {/* Location */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">📍 {locale === 'fa' ? 'موقعیت' : 'Location'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">{locale === 'fa' ? 'آدرس فارسی' : 'Address FA'}</label>
                      <input required value={gymForm.addressFa} onChange={e => setGymForm(f => ({...f, addressFa: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Address EN</label>
                      <input required value={gymForm.addressEn} onChange={e => setGymForm(f => ({...f, addressEn: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Indirizzo IT</label>
                      <input required value={gymForm.addressIt} onChange={e => setGymForm(f => ({...f, addressIt: e.target.value}))} className="input-field text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">{locale === 'fa' ? 'شهر فارسی' : 'City FA'}</label>
                      <input required value={gymForm.cityFa} onChange={e => setGymForm(f => ({...f, cityFa: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">City EN</label>
                      <input required value={gymForm.cityEn} onChange={e => setGymForm(f => ({...f, cityEn: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Città IT</label>
                      <input required value={gymForm.cityIt} onChange={e => setGymForm(f => ({...f, cityIt: e.target.value}))} className="input-field text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Latitude</label>
                      <input required type="number" step="any" value={gymForm.lat} onChange={e => setGymForm(f => ({...f, lat: e.target.value}))} className="input-field text-sm" placeholder="35.6892" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Longitude</label>
                      <input required type="number" step="any" value={gymForm.lng} onChange={e => setGymForm(f => ({...f, lng: e.target.value}))} className="input-field text-sm" placeholder="51.389" />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">📞 {t('contact')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">{t('phone')}</label>
                      <input required value={gymForm.phone} onChange={e => setGymForm(f => ({...f, phone: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">{t('email')}</label>
                      <input type="email" value={gymForm.email} onChange={e => setGymForm(f => ({...f, email: e.target.value}))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Instagram</label>
                      <input value={gymForm.instagram} onChange={e => setGymForm(f => ({...f, instagram: e.target.value}))} className="input-field text-sm" placeholder="username" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Telegram</label>
                      <input value={gymForm.telegram} onChange={e => setGymForm(f => ({...f, telegram: e.target.value}))} className="input-field text-sm" placeholder="username" />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">🏅 {t('features')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {FEATURES_LIST.map((feat) => (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => setGymForm(f => ({ ...f, features: { ...f.features, [feat]: !f.features[feat as keyof typeof f.features] } }))}
                        className={`feature-badge text-sm ${gymForm.features[feat as keyof typeof gymForm.features] ? 'active' : ''}`}
                      >
                        {t(feat as Parameters<typeof t>[0])}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Owner */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">👤 {locale === 'fa' ? 'صاحب باشگاه' : 'Gym Owner'}</h3>
                  <select value={gymForm.ownerId} onChange={e => setGymForm(f => ({...f, ownerId: e.target.value}))} className="input-field text-sm">
                    <option value="">{locale === 'fa' ? 'انتخاب صاحب باشگاه' : 'Select owner'}</option>
                    {users.filter(u => u.role === 'gym_owner').map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {/* Images */}
                <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-4">🖼️ {t('gallery')}</h3>
                  <textarea value={gymForm.images} onChange={e => setGymForm(f => ({...f, images: e.target.value}))} className="input-field text-sm resize-none" rows={4} placeholder={locale === 'fa' ? 'هر خط یک URL عکس' : 'One image URL per line'} />
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg">
                  ➕ {t('addGym')}
                </button>
              </form>
            </div>
          )}

          {/* Add Owner */}
          {tab === 'addOwner' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">👤 {locale === 'fa' ? 'ثبت صاحب باشگاه' : 'Register Gym Owner'}</h1>
              <form onSubmit={addOwner} className="bg-dark-800 rounded-2xl p-6 border border-white/5 space-y-4 max-w-md">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('name')}</label>
                  <input required value={ownerForm.name} onChange={e => setOwnerForm(f => ({...f, name: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('email')}</label>
                  <input required type="email" value={ownerForm.email} onChange={e => setOwnerForm(f => ({...f, email: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('password')}</label>
                  <input required type="password" value={ownerForm.password} onChange={e => setOwnerForm(f => ({...f, password: e.target.value}))} className="input-field" minLength={6} />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  👤 {locale === 'fa' ? 'ثبت صاحب باشگاه' : 'Register Owner'}
                </button>
              </form>
            </div>
          )}

          {/* Settings */}
          {tab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">⚙️ {t('settings')}</h1>
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 max-w-md space-y-6">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">{t('defaultLanguage')}</label>
                  <select value={defaultLang} onChange={e => setDefaultLang(e.target.value as Locale)} className="input-field">
                    <option value="fa">🇮🇷 فارسی</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="it">🇮🇹 Italiano</option>
                  </select>
                </div>
                <button onClick={saveSettings} className="btn-primary w-full py-3">
                  💾 {t('save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
