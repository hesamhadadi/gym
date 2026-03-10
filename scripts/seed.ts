import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

function readMongoUriFromEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^MONGODB_URI=(.+)$/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const MONGODB_URI = process.env.MONGODB_URI || readMongoUriFromEnvLocal();

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not found. Set it in environment or .env.local');
}

// Define schemas inline for seed
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  gymId: mongoose.Types.ObjectId,
}, { timestamps: true });

const PackageSchema = new mongoose.Schema({
  name: { fa: String, en: String, it: String },
  duration: Number,
  price: Number,
  currency: { type: String, default: 'IRR' },
  description: { fa: String, en: String, it: String },
});

const ReviewSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  userName: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const GymSchema = new mongoose.Schema({
  name: { fa: String, en: String, it: String },
  description: { fa: String, en: String, it: String },
  ownerId: mongoose.Types.ObjectId,
  images: [String],
  coverImage: String,
  location: {
    address: { fa: String, en: String, it: String },
    city: { fa: String, en: String, it: String },
    coordinates: { lat: Number, lng: Number },
  },
  contact: { phone: String, email: String, website: String, instagram: String, telegram: String },
  features: {
    shower: Boolean, pool: Boolean, aerobics: Boolean, sauna: Boolean,
    parking: Boolean, locker: Boolean, personalTrainer: Boolean, yoga: Boolean,
    spinning: Boolean, boxing: Boolean, supplements: Boolean, wifi: Boolean,
    cafe: Boolean, womenOnly: Boolean, open24h: Boolean,
  },
  workingHours: { weekdays: String, weekends: String },
  packages: [PackageSchema],
  reviews: [ReviewSchema],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Keep seed models loosely typed to avoid ts-node/mongoose generic conflicts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const User: any = mongoose.models.User || mongoose.model('User', UserSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Gym: any = mongoose.models.Gym || mongoose.model('Gym', GymSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Settings: any = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
  defaultLanguage: { type: String, enum: ['fa', 'en', 'it'], default: 'fa' },
  siteName: { type: String, default: 'GymFinder' },
  siteDescription: {
    fa: { type: String, default: 'پیدا کردن بهترین باشگاه های ورزشی نزدیک شما' },
    en: { type: String, default: 'Find the best gyms near you' },
    it: { type: String, default: 'Trova le migliori palestre vicino a te' },
  },
  contactEmail: { type: String, default: 'info@gymfinder.com' },
}, { timestamps: true }));

const GYM_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
  'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&q=80',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=800&q=80',
];

const GYMS_DATA = [
  {
    name: { fa: 'باشگاه قهرمانان', en: 'Champions Gym', it: 'Palestra Campioni' },
    description: {
      fa: 'مجهزترین باشگاه تهران با بهترین مربیان و امکانات کامل. تجربه‌ای متفاوت از ورزش در محیطی لوکس و مدرن.',
      en: 'The most equipped gym in Tehran with the best trainers and full amenities. A different experience in a luxurious modern environment.',
      it: 'La palestra più attrezzata di Tehran con i migliori istruttori. Un\'esperienza unica in un ambiente lussuoso e moderno.',
    },
    city: { fa: 'تهران', en: 'Tehran', it: 'Tehran' },
    address: {
      fa: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
      en: 'Tehran, Valiasr St, No. 120',
      it: 'Tehran, Via Valiasr, N. 120',
    },
    lat: 35.7219, lng: 51.3347,
    phone: '021-88001234',
    email: 'champions@gym.ir',
    instagram: 'champions_gym_ir',
    telegram: 'champions_gym',
    features: { shower: true, pool: true, aerobics: true, sauna: true, parking: true, locker: true, personalTrainer: true, yoga: true, spinning: true, boxing: false, supplements: true, wifi: true, cafe: true, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'پکیج یک ماهه', en: 'Monthly Plan', it: 'Piano Mensile' }, duration: 1, price: 1500000, currency: 'IRR' },
      { name: { fa: 'پکیج سه ماهه', en: '3-Month Plan', it: 'Piano 3 Mesi' }, duration: 3, price: 4000000, currency: 'IRR' },
      { name: { fa: 'پکیج شش ماهه', en: '6-Month Plan', it: 'Piano 6 Mesi' }, duration: 6, price: 7500000, currency: 'IRR' },
    ],
    averageRating: 4.7, totalReviews: 124,
    isVerified: true,
    workingHours: { weekdays: '06:00 - 23:00', weekends: '08:00 - 21:00' },
  },
  {
    name: { fa: 'فیت لایف', en: 'FitLife', it: 'FitLife' },
    description: {
      fa: 'باشگاه مخصوص بانوان با فضایی آرام و مربیان زن. بهترین انتخاب برای خانم‌ها.',
      en: 'Women-only gym with peaceful environment and female trainers. The best choice for ladies.',
      it: 'Palestra solo per donne con ambiente tranquillo e istruttori femminili.',
    },
    city: { fa: 'تهران', en: 'Tehran', it: 'Tehran' },
    address: {
      fa: 'تهران، سعادت‌آباد، خیابان ستاری',
      en: 'Tehran, Saadat Abad, Sattari Ave',
      it: 'Tehran, Saadat Abad, Via Sattari',
    },
    lat: 35.7665, lng: 51.3820,
    phone: '021-22345678',
    instagram: 'fitlife_women',
    telegram: 'fitlife_ir',
    features: { shower: true, pool: false, aerobics: true, sauna: true, parking: true, locker: true, personalTrainer: true, yoga: true, spinning: true, boxing: false, supplements: false, wifi: true, cafe: false, womenOnly: true, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 1200000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 3200000, currency: 'IRR' },
    ],
    averageRating: 4.9, totalReviews: 87,
    isVerified: true,
    workingHours: { weekdays: '07:00 - 21:00', weekends: '09:00 - 19:00' },
  },
  {
    name: { fa: 'باشگاه آریا', en: 'Arya Sports Club', it: 'Club Sportivo Arya' },
    description: {
      fa: 'باشگاه کامل با استخر و امکانات رفاهی عالی در قلب اصفهان.',
      en: 'Complete gym with swimming pool and excellent facilities in the heart of Isfahan.',
      it: 'Palestra completa con piscina e strutture eccellenti nel cuore di Isfahan.',
    },
    city: { fa: 'اصفهان', en: 'Isfahan', it: 'Isfahan' },
    address: {
      fa: 'اصفهان، خیابان چهارباغ، پلاک ۴۵',
      en: 'Isfahan, Chahar Bagh St, No. 45',
      it: 'Isfahan, Via Chahar Bagh, N. 45',
    },
    lat: 32.6539, lng: 51.6660,
    phone: '031-32111234',
    instagram: 'arya_sports_isf',
    features: { shower: true, pool: true, aerobics: true, sauna: true, parking: true, locker: true, personalTrainer: true, yoga: false, spinning: false, boxing: true, supplements: true, wifi: true, cafe: true, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 900000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 2400000, currency: 'IRR' },
      { name: { fa: 'یک ساله', en: 'Annual', it: 'Annuale' }, duration: 12, price: 8000000, currency: 'IRR' },
    ],
    averageRating: 4.5, totalReviews: 203,
    isVerified: true,
    workingHours: { weekdays: '06:30 - 22:00', weekends: '08:00 - 20:00' },
  },
  {
    name: { fa: 'باشگاه پاور', en: 'Power Gym', it: 'Power Gym' },
    description: {
      fa: 'باشگاه بدنسازی حرفه‌ای با تجهیزات پیشرفته و مربیان با سابقه مسابقاتی.',
      en: 'Professional bodybuilding gym with advanced equipment and trainers with competitive experience.',
      it: 'Palestra di body building professionale con attrezzature avanzate.',
    },
    city: { fa: 'مشهد', en: 'Mashhad', it: 'Mashhad' },
    address: {
      fa: 'مشهد، خیابان احمدآباد، بلوار پیروزی',
      en: 'Mashhad, Ahmad Abad, Piroozi Blvd',
      it: 'Mashhad, Ahmad Abad, Blvd Piroozi',
    },
    lat: 36.2972, lng: 59.6067,
    phone: '051-38771234',
    telegram: 'power_mashhad',
    features: { shower: true, pool: false, aerobics: false, sauna: true, parking: false, locker: true, personalTrainer: true, yoga: false, spinning: false, boxing: true, supplements: true, wifi: false, cafe: false, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 800000, currency: 'IRR' },
      { name: { fa: 'دو ماهه', en: '2 Months', it: '2 Mesi' }, duration: 2, price: 1500000, currency: 'IRR' },
    ],
    averageRating: 4.3, totalReviews: 156,
    isVerified: false,
    workingHours: { weekdays: '07:00 - 22:00', weekends: '09:00 - 18:00' },
  },
  {
    name: { fa: 'باشگاه نشاط', en: 'Neshat Club', it: 'Club Neshat' },
    description: {
      fa: 'فضایی دوستانه برای تمام سطوح با کلاس‌های متنوع از یوگا تا بوکس.',
      en: 'Friendly environment for all levels with diverse classes from yoga to boxing.',
      it: 'Ambiente amichevole per tutti i livelli con classi diverse da yoga a boxe.',
    },
    city: { fa: 'شیراز', en: 'Shiraz', it: 'Shiraz' },
    address: {
      fa: 'شیراز، خیابان زند، نرسیده به میدان ارسنجان',
      en: 'Shiraz, Zand St, near Arsanjan Square',
      it: 'Shiraz, Via Zand, vicino Piazza Arsanjan',
    },
    lat: 29.6100, lng: 52.5311,
    phone: '071-36441234',
    instagram: 'neshat_shiraz',
    features: { shower: true, pool: false, aerobics: true, sauna: false, parking: true, locker: true, personalTrainer: true, yoga: true, spinning: false, boxing: true, supplements: false, wifi: true, cafe: true, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 700000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 1900000, currency: 'IRR' },
    ],
    averageRating: 4.6, totalReviews: 78,
    isVerified: true,
    workingHours: { weekdays: '07:00 - 21:30', weekends: '09:00 - 18:30' },
  },
  {
    name: { fa: 'باشگاه اطلس', en: 'Atlas Fitness', it: 'Atlas Fitness' },
    description: {
      fa: 'مدرن‌ترین باشگاه تبریز با تجهیزات اروپایی و سیستم هوشمند پیگیری پیشرفت.',
      en: 'The most modern gym in Tabriz with European equipment and smart progress tracking.',
      it: 'La palestra più moderna di Tabriz con attrezzature europee.',
    },
    city: { fa: 'تبریز', en: 'Tabriz', it: 'Tabriz' },
    address: {
      fa: 'تبریز، خیابان ارتش، مرکز خرید الماس',
      en: 'Tabriz, Artesh St, Almas Mall',
      it: 'Tabriz, Via Artesh, Centro Commerciale Almas',
    },
    lat: 38.0800, lng: 46.2919,
    phone: '041-33441234',
    email: 'info@atlasfitness.ir',
    instagram: 'atlas_tabriz',
    telegram: 'atlas_fitness_tbz',
    features: { shower: true, pool: true, aerobics: true, sauna: true, parking: true, locker: true, personalTrainer: true, yoga: true, spinning: true, boxing: false, supplements: true, wifi: true, cafe: true, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 1100000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 3000000, currency: 'IRR' },
      { name: { fa: 'شش ماهه', en: '6 Months', it: '6 Mesi' }, duration: 6, price: 5500000, currency: 'IRR' },
    ],
    averageRating: 4.8, totalReviews: 312,
    isVerified: true,
    workingHours: { weekdays: '06:00 - 23:00', weekends: '08:00 - 22:00' },
  },
  {
    name: { fa: 'باشگاه ستاره', en: 'Star Gym', it: 'Star Gym' },
    description: {
      fa: 'باشگاه ۲۴ ساعته با قیمت مناسب و دسترسی آسان در مرکز تهران.',
      en: '24-hour gym with affordable prices and easy access in central Tehran.',
      it: 'Palestra aperta 24 ore con prezzi accessibili nel centro di Tehran.',
    },
    city: { fa: 'تهران', en: 'Tehran', it: 'Tehran' },
    address: {
      fa: 'تهران، خیابان انقلاب، نزدیک دانشگاه',
      en: 'Tehran, Enghelab St, near University',
      it: 'Tehran, Via Enghelab, vicino all\'università',
    },
    lat: 35.7006, lng: 51.3921,
    phone: '021-66661234',
    instagram: 'star_gym24',
    features: { shower: true, pool: false, aerobics: true, sauna: false, parking: false, locker: true, personalTrainer: false, yoga: false, spinning: false, boxing: false, supplements: true, wifi: true, cafe: false, womenOnly: false, open24h: true },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 600000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 1600000, currency: 'IRR' },
    ],
    averageRating: 4.1, totalReviews: 445,
    isVerified: false,
    workingHours: { weekdays: '24 ساعته', weekends: '24 ساعته' },
  },
  {
    name: { fa: 'باشگاه نوین', en: 'Navin Sports Center', it: 'Centro Sportivo Navin' },
    description: {
      fa: 'مجموعه ورزشی کامل با استخر، زمین‌های ورزشی و باشگاه بدنسازی.',
      en: 'Complete sports complex with pool, sports courts and gym.',
      it: 'Complesso sportivo completo con piscina, campi sportivi e palestra.',
    },
    city: { fa: 'کرج', en: 'Karaj', it: 'Karaj' },
    address: {
      fa: 'کرج، شهرک مهندسین، خیابان گلستان',
      en: 'Karaj, Mohandsin Town, Golestan St',
      it: 'Karaj, Città degli Ingegneri, Via Golestan',
    },
    lat: 35.8400, lng: 50.9391,
    phone: '026-34771234',
    instagram: 'navin_karaj',
    features: { shower: true, pool: true, aerobics: true, sauna: true, parking: true, locker: true, personalTrainer: true, yoga: true, spinning: true, boxing: true, supplements: false, wifi: true, cafe: true, womenOnly: false, open24h: false },
    packages: [
      { name: { fa: 'یک ماهه', en: 'Monthly', it: 'Mensile' }, duration: 1, price: 1300000, currency: 'IRR' },
      { name: { fa: 'سه ماهه', en: '3 Months', it: '3 Mesi' }, duration: 3, price: 3500000, currency: 'IRR' },
      { name: { fa: 'یک ساله', en: 'Annual', it: 'Annuale' }, duration: 12, price: 12000000, currency: 'IRR' },
    ],
    averageRating: 4.4, totalReviews: 189,
    isVerified: true,
    workingHours: { weekdays: '06:30 - 22:30', weekends: '08:00 - 21:00' },
  },
];

async function seed() {
  console.log('🌱 Starting seed...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Gym.deleteMany({});
  await Settings.deleteMany({});
  console.log('🗑️ Cleared existing data');

  await Settings.create({ defaultLanguage: 'fa' });
  console.log('⚙️ Settings created');

  // Create admin user
  const adminPass = await bcrypt.hash('Admin@1234', 12);
  const admin = await User.create({
    name: 'مدیر سیستم',
    email: 'admin@gymfinder.ir',
    password: adminPass,
    role: 'admin',
  });
  console.log('👤 Admin created: admin@gymfinder.ir / Admin@1234');

  // Create gym owners
  const ownerPass = await bcrypt.hash('Owner@1234', 12);
  const owners = await User.insertMany(
    Array.from({ length: 4 }, (_, i) => ({
      name: `صاحب باشگاه ${i + 1}`,
      email: `owner${i + 1}@gymfinder.ir`,
      password: ownerPass,
      role: 'gym_owner',
    }))
  );
  console.log('👥 Gym owners created: owner1-4@gymfinder.ir / Owner@1234');

  // Create regular users
  const userPass = await bcrypt.hash('User@1234', 12);
  const regularUsers = await User.insertMany([
    { name: 'علی محمدی', email: 'ali@test.ir', password: userPass, role: 'user' },
    { name: 'سارا احمدی', email: 'sara@test.ir', password: userPass, role: 'user' },
    { name: 'محمد رضایی', email: 'mohammad@test.ir', password: userPass, role: 'user' },
    { name: 'فاطمه حسینی', email: 'fatemeh@test.ir', password: userPass, role: 'user' },
  ]);
  console.log('👥 Regular users created');

  // Create gyms
  for (let i = 0; i < GYMS_DATA.length; i++) {
    const g = GYMS_DATA[i];
    const ownerId = owners[i % owners.length]._id;
    const imgIndex = i % GYM_IMAGES.length;

    const reviews = [
      {
        userId: regularUsers[0]._id,
        userName: regularUsers[0].name,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: 'باشگاه عالی و مربی‌ها خوب هستند. پیشنهاد می‌کنم.',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: regularUsers[1]._id,
        userName: regularUsers[1].name,
        rating: Math.floor(Math.random() * 2) + 3,
        comment: 'امکانات خوبی دارد. فضا تمیز و مرتب است.',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    ];

    const gym = await Gym.create({
      name: g.name,
      description: g.description,
      ownerId,
      coverImage: GYM_IMAGES[imgIndex],
      images: [
        GYM_IMAGES[imgIndex],
        GYM_IMAGES[(imgIndex + 1) % GYM_IMAGES.length],
        GYM_IMAGES[(imgIndex + 2) % GYM_IMAGES.length],
      ],
      location: {
        address: g.address,
        city: g.city,
        coordinates: { lat: g.lat, lng: g.lng },
      },
      contact: {
        phone: g.phone,
        email: (g as { email?: string }).email || '',
        instagram: (g as { instagram?: string }).instagram || '',
        telegram: (g as { telegram?: string }).telegram || '',
      },
      features: g.features,
      workingHours: g.workingHours,
      packages: g.packages,
      reviews,
      averageRating: g.averageRating,
      totalReviews: g.totalReviews,
      isActive: true,
      isVerified: g.isVerified,
    });

    // Link gym to owner
    await User.findByIdAndUpdate(ownerId, { gymId: gym._id });
    console.log(`🏋️ Created gym: ${g.name.fa}`);
  }

  console.log('\n✅ Seed completed!');
  console.log('================');
  console.log('🔑 Admin: admin@gymfinder.ir / Admin@1234');
  console.log('🔑 Owner: owner1@gymfinder.ir / Owner@1234');
  console.log('🔑 User:  ali@test.ir / User@1234');

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  if (error instanceof Error && /whitelist|ReplicaSetNoPrimary|ServerSelectionError/i.test(error.message)) {
    console.error('Hint: allow your current IP in MongoDB Atlas Network Access.');
  }
  process.exit(1);
});
