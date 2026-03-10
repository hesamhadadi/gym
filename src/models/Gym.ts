import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGymPackage {
  name: { fa: string; en: string; it: string };
  duration: number; // months
  price: number;
  currency: string;
  description?: { fa: string; en: string; it: string };
  features?: string[];
}

export interface IGymReview {
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IGym extends Document {
  name: { fa: string; en: string; it: string };
  description: { fa: string; en: string; it: string };
  ownerId: mongoose.Types.ObjectId;
  images: string[];
  coverImage: string;
  location: {
    address: { fa: string; en: string; it: string };
    city: { fa: string; en: string; it: string };
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
    instagram?: string;
    telegram?: string;
  };
  features: {
    shower: boolean;
    pool: boolean;
    aerobics: boolean;
    sauna: boolean;
    parking: boolean;
    locker: boolean;
    personalTrainer: boolean;
    yoga: boolean;
    spinning: boolean;
    boxing: boolean;
    supplements: boolean;
    wifi: boolean;
    cafe: boolean;
    womenOnly: boolean;
    open24h: boolean;
  };
  workingHours: {
    weekdays: string;
    weekends: string;
    holidays?: string;
  };
  packages: IGymPackage[];
  reviews: IGymReview[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IGymPackage>({
  name: {
    fa: { type: String, required: true },
    en: { type: String, required: true },
    it: { type: String, required: true },
  },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'IRR' },
  description: {
    fa: String,
    en: String,
    it: String,
  },
  features: [String],
});

const ReviewSchema = new Schema<IGymReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GymSchema = new Schema<IGym>(
  {
    name: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
      it: { type: String, required: true },
    },
    description: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
      it: { type: String, required: true },
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [String],
    coverImage: { type: String },
    location: {
      address: {
        fa: { type: String, required: true },
        en: { type: String, required: true },
        it: { type: String, required: true },
      },
      city: {
        fa: { type: String, required: true },
        en: { type: String, required: true },
        it: { type: String, required: true },
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: String,
      website: String,
      instagram: String,
      telegram: String,
    },
    features: {
      shower: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      aerobics: { type: Boolean, default: false },
      sauna: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      locker: { type: Boolean, default: false },
      personalTrainer: { type: Boolean, default: false },
      yoga: { type: Boolean, default: false },
      spinning: { type: Boolean, default: false },
      boxing: { type: Boolean, default: false },
      supplements: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      cafe: { type: Boolean, default: false },
      womenOnly: { type: Boolean, default: false },
      open24h: { type: Boolean, default: false },
    },
    workingHours: {
      weekdays: { type: String, default: '06:00 - 22:00' },
      weekends: { type: String, default: '08:00 - 20:00' },
      holidays: String,
    },
    packages: [PackageSchema],
    reviews: [ReviewSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

GymSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
GymSchema.index({ 'location.city.fa': 1 });
GymSchema.index({ averageRating: -1 });

const Gym: Model<IGym> = mongoose.models.Gym || mongoose.model<IGym>('Gym', GymSchema);
export default Gym;
